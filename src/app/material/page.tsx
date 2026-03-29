"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CubeIcon,
  TruckIcon,
  IdentificationIcon,
  SignalIcon,
  UserCircleIcon,
  ArrowRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function RunningMaterialPage() {
  const { materialStock, materialTxns, addMaterialTxn, addMaterial, deleteMaterial, updateMaterialThreshold } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'CATEGORICAL'>('TIMELINE');
  const [activeMaterialFilter, setActiveMaterialFilter] = useState<string>('ALL');
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState<number>(0);

  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [inwardForm, setInwardForm] = useState({ materialName: '', qty: 0, vendor: '', invoice: '', rate: 0 });
  const [outwardForm, setOutwardForm] = useState({ materialName: '', qty: 0, project: '', supervisor: '' });
  const [newMaterialForm, setNewMaterialForm] = useState({ name: '', unit: '', threshold: 0, capacity: 0, colorVar: '--blue' });

  // --- Calculations ---
  const totalInwardValue = useMemo(() =>
    materialTxns.filter(t => t.type === 'Inward').reduce((acc, t) => acc + (t.totalCost || 0), 0)
    , [materialTxns]);

  const criticalItemsCount = useMemo(() =>
    materialStock.filter(m => m.current < m.threshold).length
    , [materialStock]);

  const filteredTxns = useMemo(() =>
    materialTxns.filter(t => {
      const matchesSearch = t.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.supervisorName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = activeMaterialFilter === 'ALL' || t.materialName === activeMaterialFilter;

      return matchesSearch && matchesFilter;
    })
    , [materialTxns, searchTerm, activeMaterialFilter]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Handlers ---
  const handleInward = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materialStock.find(m => m.name === inwardForm.materialName);
    addMaterialTxn({
      materialName: inwardForm.materialName,
      type: 'Inward',
      qty: inwardForm.qty,
      unit: material?.unit || 'units',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      vendorName: inwardForm.vendor,
      invoiceNumber: inwardForm.invoice,
      ratePerUnit: inwardForm.rate,
      totalCost: inwardForm.qty * inwardForm.rate
    });
    setIsInwardModalOpen(false);
    setInwardForm({ materialName: '', qty: 0, vendor: '', invoice: '', rate: 0 });
    showToast(`${inwardForm.materialName} inward recorded successfully.`);
  };

  const handleOutward = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materialStock.find(m => m.name === outwardForm.materialName);
    const projectedStock = (material?.current || 0) - outwardForm.qty;
    const willBeLow = material && projectedStock < material.threshold;

    addMaterialTxn({
      materialName: outwardForm.materialName,
      type: 'Outward',
      qty: outwardForm.qty,
      unit: material?.unit || 'units',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      projectBlock: outwardForm.project,
      supervisorName: outwardForm.supervisor
    });
    setIsOutwardModalOpen(false);
    setOutwardForm({ materialName: '', qty: 0, project: '', supervisor: '' });

    if (willBeLow) {
      showToast(`${outwardForm.materialName} stock critical — ${projectedStock} ${material!.unit} remaining!`, 'warning');
    } else {
      showToast(`${outwardForm.materialName} issued to ${outwardForm.project}.`);
    }
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    addMaterial(newMaterialForm);
    setIsAddMaterialModalOpen(false);
    setNewMaterialForm({ name: '', unit: '', threshold: 0, capacity: 0, colorVar: '--blue' });
    showToast(`${newMaterialForm.name} registered as new node.`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvData = materialTxns.map(t => ({
        Date: t.date,
        Material: t.materialName,
        Type: t.type,
        Quantity: t.qty,
        Unit: t.unit,
        Status: t.type === 'Inward' ? `Inward from ${t.vendorName}` : `Issued to ${t.projectBlock}`,
        Invoice_Supervisor: t.invoiceNumber || t.supervisorName,
        Value: t.totalCost ? `₹${t.totalCost}` : '-'
      }));

      const { exportToCSV } = await import('@/utils/export');
      exportToCSV(csvData, `Material_Ledger_${new Date().toISOString().split('T')[0]}`);
      showToast("Material ledger exported successfully.");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left" onClick={() => setActiveMenuId(null)}>

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 ${toast.type === 'warning' ? 'bg-[var(--red)]' : 'bg-[var(--sb)]'}`}>
            <div className={`w-2 h-2 rounded-full ${toast.type === 'warning' ? 'bg-white animate-pulse' : 'bg-[var(--gold)]'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[2.5px] whitespace-nowrap">{toast.message}</span>
          </div>
        )}

        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Running Material</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight">LOGISTICS NODE • AUDIT VERIFIED</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--bg)] border border-[var(--border)] p-1 rounded-xl mr-4">
              <button
                onClick={() => setViewMode('TIMELINE')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[1px] transition-all
                  ${viewMode === 'TIMELINE' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('CATEGORICAL')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[1px] transition-all
                  ${viewMode === 'CATEGORICAL' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
              >
                Categories
              </button>
            </div>
            <Button
              v2={true}
              variant="secondary"
              size="default"
              onClick={handleExport}
              className="px-6"
              disabled={isExporting}
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <div className="h-8 w-[1px] bg-[var(--border)] mx-2"></div>
            <Button
              v2={true}
              variant="secondary"
              size="default"
              onClick={() => setIsInwardModalOpen(true)}
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Inward
            </Button>
            <Button
              v2={true}
              variant="secondary"
              size="default"
              onClick={() => setIsOutwardModalOpen(true)}
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Outward
            </Button>
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-xl shadow-black/10 transition-all hover:scale-[1.02]"
              onClick={() => setIsAddMaterialModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            label="INVENTORY VALUE"
            value={formatCurrency(totalInwardValue)}
            trend={{ value: "+8.2%", type: "up" }}
          />
          <KPICard
            label="CRITICAL ALERTS"
            value={`${criticalItemsCount} Items`}
            trend={{ value: criticalItemsCount > 0 ? "ATTENTION" : "STABLE", type: criticalItemsCount > 0 ? "down" : "up" }}
          />
          <KPICard
            label="DISBURSEMENT LOGS"
            value={`${materialTxns.filter(t => t.type === 'Outward').length} Entries`}
            trend={{ value: "Manual Trace", type: "neutral" }}
          />
          <KPICard
            label="PROCUREMENT FLOW"
            value={formatCurrency(materialTxns.filter(t => t.type === 'Inward').reduce((acc, t) => acc + (t.totalCost || 0), 0) / 10)}
            trend={{ value: "Active", type: "up" }}
          />
        </div>

        {viewMode === 'TIMELINE' ? (
          <div className="grid grid-cols-12 gap-[var(--section-gap)] items-start animate-in fade-in duration-500">
            {/* Left: Transaction Log */}
            <Card variant="premium" className="col-span-12 lg:col-span-8 p-0 overflow-hidden min-h-[600px]">
              <div className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[12px] font-bold text-[var(--text)] uppercase tracking-[2px]">Transaction Heritage Log</h2>
                    <p className="text-[10px] font-medium text-[var(--text3)] uppercase tracking-[1px] mt-1 opacity-60">Real-time procurement & site disbursement</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Material Filter */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
                      <FunnelIcon className="w-3.5 h-3.5 text-[var(--gold)]" />
                      <select
                        value={activeMaterialFilter}
                        onChange={(e) => setActiveMaterialFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-[1px] text-[var(--text)] cursor-pointer"
                      >
                        <option value="ALL">ALL CATEGORIES</option>
                        {materialStock.map(m => (
                          <option key={m.id} value={m.name}>{m.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative group w-64">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10" />
                      <Input
                        placeholder="FILTER LOGS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Timeline Node</th>
                      <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Material Node</th>
                      <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Flow state</th>
                      <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Volume</th>
                      <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Stakeholder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredTxns.length > 0 ? filteredTxns.map(t => (
                      <tr key={t.id} className="group hover:bg-[var(--bg)] transition-all">
                        <td className="p-[12px_24px] text-[12px] font-bold text-[var(--text2)] uppercase tracking-tight leading-none">{t.date}</td>
                        <td className="p-[12px_15px]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[18px] group-hover:border-[var(--gold)]/30 transition-all">
                              📦
                            </div>
                            <span className="text-[13px] font-bold text-[var(--text)] tracking-tight uppercase leading-none group-hover:text-[var(--gold)] transition-colors">{t.materialName}</span>
                          </div>
                        </td>
                        <td className="p-[12px_15px]">
                          <Badge variant={t.type === 'Inward' ? 'success' : 'warning'} className="text-[10px] font-bold uppercase">
                            {t.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-[12px_15px]">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-[var(--text)] tracking-tight">{t.qty}</span>
                            <span className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-[1px] opacity-40 mt-1">{t.unit}</span>
                          </div>
                        </td>
                        <td className="p-[12px_24px]">
                          <div className="flex flex-col">
                            <span className="text-[12px] text-[var(--text2)] font-bold uppercase tracking-[0.5px] leading-none">{t.vendorName || t.projectBlock}</span>
                            <span className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[1px] mt-1.5 opacity-40 leading-none">{t.invoiceNumber || t.supervisorName}</span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-20 text-center opacity-20 grayscale italic text-[12px] uppercase tracking-[3px]">
                          No transactional trace detected for these nodes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Right: Stock Levels Summary */}
            <Card variant="premium" className="col-span-12 lg:col-span-4 p-8">
              <div className="mb-10">
                <h2 className="text-[16px] font-bold text-[var(--text)] tracking-tight leading-none uppercase">Stock Equilibrium</h2>
                <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[3px] mt-2 leading-none opacity-60">Volumetric availability logs</p>
              </div>

              <div className="space-y-10">
                {materialStock.map((m, i) => {
                  const percentage = Math.min((m.current / m.capacity) * 100, 100);
                  const isCritical = m.current < m.threshold;
                  return (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight leading-none">{m.name}</span>
                            {isCritical && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-bold bg-[var(--red-lt)] text-[var(--red)] border border-[var(--red)]/20 uppercase tracking-wider animate-pulse">
                                LOW
                              </span>
                            )}
                            <button
                              onClick={() => { if (confirm(`Delete ${m.name} category?`)) deleteMaterial(m.id); }}
                              className="p-1 rounded-md text-[var(--text3)] hover:text-[var(--red)] hover:bg-[var(--red-lt)] opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-[1px] opacity-40 leading-none">{m.unit.toUpperCase()} UNIT</span>
                            <span className="text-[9px] text-[var(--text3)] font-bold opacity-30">|</span>
                            {editingThresholdId === m.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  autoFocus
                                  className="w-12 h-4 text-[9px] font-bold text-[var(--gold)] bg-white border border-[var(--gold)]/30 rounded px-1 outline-none"
                                  value={thresholdValue}
                                  onChange={e => setThresholdValue(Number(e.target.value))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      updateMaterialThreshold(m.id, thresholdValue);
                                      setEditingThresholdId(null);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => { updateMaterialThreshold(m.id, thresholdValue); setEditingThresholdId(null); }}
                                  className="text-[8px] font-bold text-[var(--green)] uppercase"
                                >OK</button>
                                <button
                                  onClick={() => setEditingThresholdId(null)}
                                  className="text-[8px] font-bold text-[var(--text3)] uppercase"
                                >✕</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingThresholdId(m.id); setThresholdValue(m.threshold); }}
                                className="text-[9px] text-[var(--gold)] font-bold opacity-60 hover:opacity-100 transition-opacity"
                              >
                                Min: {m.threshold} {m.unit}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-[14px] font-bold tracking-tight ${isCritical ? 'text-[var(--red)]' : 'text-[var(--text)]'}`}>{m.current.toLocaleString()}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-[1.5px] mt-1 ${isCritical ? 'text-[var(--red)] animate-pulse' : 'text-[var(--gold)]'}`}>{percentage.toFixed(0)}% FILL</span>
                        </div>
                      </div>
                      <div className="relative h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)] p-0.5">
                        {m.threshold > 0 && m.capacity > 0 && (
                          <div
                            className="absolute top-0 bottom-0 w-[1px] bg-[var(--red)] z-10 opacity-60"
                            style={{ left: `${Math.min((m.threshold / m.capacity) * 100, 100)}%` }}
                          ></div>
                        )}
                        <div
                          className={`h-full ${isCritical ? 'bg-[var(--red)]' : 'bg-[var(--gold)]'} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-16 pt-10 border-t border-[var(--border)] text-center">
                <div className="relative w-40 h-40 mx-auto opacity-40 grayscale group-hover:grayscale-0 transition-all">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[40px] mb-2">📊</span>
                    <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-widest">Global Fill</p>
                    <p className="text-[20px] font-bold text-[var(--text)]">
                      {materialStock.length > 0
                        ? Math.round(materialStock.reduce((acc, m) => acc + (Math.min((m.current / m.capacity) * 100, 100)), 0) / materialStock.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
            {materialStock.map((material) => {
              const txns = materialTxns.filter(t => t.materialName === material.name);
              const isCritical = material.current < material.threshold;

              return (
                <Card key={material.id} variant="premium" className="p-0 overflow-hidden border-t-2">
                  <div style={{ borderColor: isCritical ? 'var(--red)' : 'var(--gold)' }} className="absolute top-0 left-0 right-0 h-0.5 border-t-2" />
                  <div className="p-5 border-b border-[var(--border)] bg-[var(--bg)]">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-[22px] border border-[var(--border)] shadow-sm">
                          {material.name.toLowerCase().includes('steel') ? '🏗️' :
                            material.name.toLowerCase().includes('cement') ? '🧱' :
                              material.name.toLowerCase().includes('sand') ? '⏳' : '📦'}
                        </div>
                        <div>
                          <h2 className="text-[15px] font-bold text-[var(--text)] uppercase tracking-tight">{material.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={isCritical ? 'warning' : 'success'} className="text-[8px] font-black tracking-widest px-2 py-0">
                              {isCritical ? 'CRITICAL' : 'STABLE'}
                            </Badge>
                            <span className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-[1px] opacity-40">
                              Nodes: {txns.length}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1.5px] mb-0.5 opacity-60">Equilibrium</p>
                          <p className={`text-[18px] font-black tracking-tighter tabular-nums ${isCritical ? 'text-[var(--red)]' : 'text-[var(--text)]'}`}>
                            {material.current.toLocaleString()} <span className="text-[11px] font-bold text-[var(--text3)] opacity-40">{material.unit.toUpperCase()}</span>
                          </p>
                        </div>
                        <div className="w-32 h-1.5 bg-[var(--border)] rounded-full overflow-hidden p-[1px]">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-[var(--red)]' : 'bg-[var(--gold)]'}`}
                            style={{ width: `${Math.min((material.current / material.capacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Compact Category Insight Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-[var(--border)] shadow-sm">
                      {(() => {
                        const inwards = txns.filter(t => t.type === 'Inward');
                        const outwards = txns.filter(t => t.type === 'Outward');
                        const totalInQty = inwards.reduce((acc, t) => acc + t.qty, 0);
                        const totalOutQty = outwards.reduce((acc, t) => acc + t.qty, 0);
                        const totalInCost = inwards.reduce((acc, t) => acc + (t.totalCost || 0), 0);
                        const avgRate = totalInQty > 0 ? totalInCost / totalInQty : 0;

                        const vendorCounts = inwards.reduce((acc: any, t) => {
                          acc[t.vendorName || 'Unknown'] = (acc[t.vendorName || 'Unknown'] || 0) + 1;
                          return acc;
                        }, {});
                        const primaryVendor = Object.entries(vendorCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

                        const projectCounts = outwards.reduce((acc: any, t) => {
                          acc[t.projectBlock || 'Site'] = (acc[t.projectBlock || 'Site'] || 0) + t.qty;
                          return acc;
                        }, {});
                        const topProject = Object.entries(projectCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';
                        const lastPrice = inwards[0]?.ratePerUnit || 0;

                        return (
                          <>
                            <div>
                              <p className="text-[8px] font-black text-[var(--text3)] uppercase tracking-[1.5px] opacity-40 mb-0.5">Lifetime In</p>
                              <p className="text-[12px] font-bold text-[var(--text)] tabular-nums">{totalInQty.toLocaleString()} <small className="opacity-40">{material.unit}</small></p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-[var(--text3)] uppercase tracking-[1.5px] opacity-40 mb-0.5">Consumption</p>
                              <p className="text-[12px] font-bold text-[var(--amber-dk)] tabular-nums">{totalOutQty.toLocaleString()} <small className="opacity-40">{material.unit}</small></p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-[var(--text3)] uppercase tracking-[1.5px] opacity-40 mb-0.5">Rates (Avg/Last)</p>
                              <p className="text-[12px] font-bold text-[var(--text)] tabular-nums">
                                ₹{avgRate.toFixed(0)} <span className="text-[9px] opacity-30 font-medium">/ ₹{lastPrice.toFixed(0)}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-[var(--text3)] uppercase tracking-[1px] opacity-40 mb-0.5">Usage/Source</p>
                              <p className="text-[11px] font-bold text-[var(--gold)] truncate uppercase">
                                {topProject} <span className="text-[8px] opacity-40 lowercase font-medium">via</span> {primaryVendor}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)]">
                          <th className="p-[8px_20px] text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Timestamp</th>
                          <th className="p-[8px_15px] text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Node</th>
                          <th className="p-[8px_15px] text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Vendor / Project</th>
                          <th className="p-[8px_15px] text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Qty</th>
                          <th className="p-[8px_20px] text-right text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Node Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {txns.length > 0 ? txns.map(t => (
                          <tr key={t.id} className="group hover:bg-[var(--bg)]/30 transition-all">
                            <td className="p-[8px_20px] text-[11px] font-bold text-[var(--text2)] uppercase">{t.date}</td>
                            <td className="p-[8px_15px]">
                              <Badge variant={t.type === 'Inward' ? 'success' : 'warning'} className="text-[8px] font-black px-1.5 py-0">
                                {t.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-[8px_15px]">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-tight">{t.vendorName || t.projectBlock}</span>
                                <span className="text-[8px] text-[var(--text3)] font-bold uppercase tracking-[0.5px] opacity-30">{t.invoiceNumber || t.supervisorName}</span>
                              </div>
                            </td>
                            <td className="p-[8px_15px]">
                              <span className="text-[12px] font-black text-[var(--text)] font-price">{t.qty} <small className="text-[9px] font-bold opacity-30 ml-0.5">{t.unit}</small></span>
                            </td>
                            <td className="p-[8px_20px] text-right">
                              <span className="text-[12px] font-black text-[var(--text)] font-price">{t.totalCost ? formatCurrency(t.totalCost) : '--'}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="p-10 text-center opacity-20 grayscale italic text-[11px] uppercase tracking-[3px]">
                              Zero transactional trace detected.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Register Inward Node (Outside animated container) */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                  <ArrowDownTrayIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">Inward Node</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] mt-1 opacity-60">Acquisition of construction capital assets</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsInwardModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleInward} className="p-8 space-y-8 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Material Node</label>
                <Select
                  v2={true}
                  required
                  value={inwardForm.materialName}
                  onChange={e => setInwardForm({ ...inwardForm, materialName: e.target.value })}
                >
                  <option value="">SELECT MATERIAL SOURCE</option>
                  {materialStock.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Volume Quantity</label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    placeholder="0"
                    value={inwardForm.qty || ''}
                    onChange={e => setInwardForm({ ...inwardForm, qty: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Rate Per Unit (₹)</label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    placeholder="0.00"
                    value={inwardForm.rate || ''}
                    onChange={e => setInwardForm({ ...inwardForm, rate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Vendor Moniker</label>
                  <Input
                    required
                    v2={true}
                    type="text"
                    placeholder="SOURCE IDENTITY"
                    value={inwardForm.vendor}
                    onChange={e => setInwardForm({ ...inwardForm, vendor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Invoice Registry</label>
                  <Input
                    required
                    v2={true}
                    type="text"
                    placeholder="INV-000"
                    value={inwardForm.invoice}
                    onChange={e => setInwardForm({ ...inwardForm, invoice: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  v2={true}
                  className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px]"
                  onClick={() => setIsInwardModalOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button
                  type="submit"
                  v2={true}
                  className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px]"
                >
                  Confirm Inward Node
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Outward Node (Outside animated container) */}
      {isOutwardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                  <ArrowUpTrayIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">Outward Node</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] mt-1 opacity-60">Disbursement of material to site execution</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsOutwardModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleOutward} className="p-8 space-y-8 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Material Node</label>
                <Select
                  v2={true}
                  required
                  value={outwardForm.materialName}
                  onChange={e => setOutwardForm({ ...outwardForm, materialName: e.target.value })}
                >
                  <option value="">SELECT MATERIAL DESTINATION</option>
                  {materialStock.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Volume Quantity</label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    placeholder="0"
                    value={outwardForm.qty || ''}
                    onChange={e => setOutwardForm({ ...outwardForm, qty: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Supervisor Identity</label>
                  <Input
                    required
                    v2={true}
                    type="text"
                    placeholder="AUTH NAME"
                    value={outwardForm.supervisor}
                    onChange={e => setOutwardForm({ ...outwardForm, supervisor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Disbursement Destination</label>
                <Input
                  required
                  v2={true}
                  type="text"
                  placeholder="PROJECT / BLOCK / SECTOR"
                  value={outwardForm.project}
                  onChange={e => setOutwardForm({ ...outwardForm, project: e.target.value })}
                />
              </div>

              {outwardForm.materialName && (() => {
                const material = materialStock.find(m => m.name === outwardForm.materialName);
                if (!material) return null;
                const projectedStock = material.current - (outwardForm.qty || 0);
                const isAlreadyLow = material.current < material.threshold;
                const willBeLow = projectedStock < material.threshold;
                return (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${willBeLow ? 'bg-[var(--red-lt)] border-[var(--red)]/20' : isAlreadyLow ? 'bg-[var(--amber-lt)] border-[var(--amber)]/20' : 'bg-[var(--green-lt)] border-[var(--green)]/20'}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${willBeLow ? 'bg-[var(--red)] animate-pulse' : isAlreadyLow ? 'bg-[var(--amber)]' : 'bg-[var(--green)]'}`}></div>
                    <div>
                      <p className={`text-[11px] font-bold ${willBeLow ? 'text-[var(--red)]' : isAlreadyLow ? 'text-[var(--amber-dk)]' : 'text-[var(--green)]'}`}>
                        {willBeLow ? `⚠ CRITICAL: Stock will drop to ${projectedStock} ${material.unit} (threshold: ${material.threshold})` :
                          isAlreadyLow ? `⚠ WARNING: Current stock ${material.current} ${material.unit} already below threshold ${material.threshold}` :
                            `✓ Stock OK: ${material.current} ${material.unit} available`}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  v2={true}
                  className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px]"
                  onClick={() => setIsOutwardModalOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button
                  type="submit"
                  v2={true}
                  className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px]"
                >
                  Confirm Outward Node
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Material Category Protocol (Outside animated container) */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                  <PlusIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">Category Protocol</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] mt-1 opacity-60">Define new capital asset category</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsAddMaterialModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleAddMaterial} className="p-8 space-y-6 text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Material Moniker</label>
                <Input
                  required
                  v2={true}
                  type="text"
                  placeholder="e.g. PREMIUM GLASS SHIELDS"
                  value={newMaterialForm.name}
                  onChange={e => setNewMaterialForm({ ...newMaterialForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Unit of Measure</label>
                  <Input
                    required
                    v2={true}
                    type="text"
                    placeholder="e.g. SFT / KGS"
                    value={newMaterialForm.unit}
                    onChange={e => setNewMaterialForm({ ...newMaterialForm, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Visual Theme</label>
                  <Select
                    v2={true}
                    value={newMaterialForm.colorVar}
                    onChange={e => setNewMaterialForm({ ...newMaterialForm, colorVar: e.target.value })}
                  >
                    <option value="--blue">CYAN SHIELD</option>
                    <option value="--gold">GOLD TRACE</option>
                    <option value="--amber">AMBER ALERT</option>
                    <option value="--green">GREEN PASS</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Crisis Threshold</label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    placeholder="ALARM LEVEL"
                    value={newMaterialForm.threshold || ''}
                    onChange={e => setNewMaterialForm({ ...newMaterialForm, threshold: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Projected Capacity</label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    placeholder="MAX STORAGE"
                    value={newMaterialForm.capacity || ''}
                    onChange={e => setNewMaterialForm({ ...newMaterialForm, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-[var(--bg)]/50 rounded-xl border border-dashed border-[var(--border)]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--gold)] border border-[var(--border)] shadow-sm">
                  <ArrowRightIcon className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-[var(--text3)] font-bold italic leading-relaxed uppercase tracking-[1px] opacity-60">
                  Registering this protocol will initialize tracking for this material category across all site operations.
                </p>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  v2={true}
                  className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px]"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                >
                  Abort
                </Button>
                <Button
                  type="submit"
                  v2={true}
                  className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px]"
                >
                  Initialize Node
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
