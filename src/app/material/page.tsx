"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowRightIcon,
  FunnelIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';

export default function RunningMaterialPage() {
  const { materialStock, materialTxns, addMaterialTxn, addMaterial, deleteMaterial, updateMaterialThreshold } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'CATEGORICAL'>('TIMELINE');
  const [activeMaterialFilter, setActiveMaterialFilter] = useState<string>('ALL');
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState<number>(0);

  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [inwardForm, setInwardForm] = useState({ materialName: '', qty: 0, supplier: '', invoice: '', rate: 0 });
  const [outwardForm, setOutwardForm] = useState({ materialName: '', qty: 0, project: '', supervisor: '' });
  const [newMaterialForm, setNewMaterialForm] = useState({ name: '', customName: '', unit: '', threshold: 0, capacity: 0, colorVar: '--blue' });

  const STANDARD_MATERIALS = [
    { name: "Steel TMT Bars", unit: "kg", defaultThreshold: 5000, defaultCapacity: 25000 },
    { name: "Cement (OPC/PPC)", unit: "bags", defaultThreshold: 600, defaultCapacity: 2000 },
    { name: "River Sand", unit: "cft", defaultThreshold: 1000, defaultCapacity: 5000 },
    { name: "Red Bricks", unit: "nos", defaultThreshold: 15000, defaultCapacity: 100000 },
    { name: "Crushed Stone 20mm", unit: "cft", defaultThreshold: 1000, defaultCapacity: 5000 },
    { name: "Ready Mix Concrete", unit: "cum", defaultThreshold: 100, defaultCapacity: 500 },
    { name: "Vitrified Tiles", unit: "sqft", defaultThreshold: 500, defaultCapacity: 2000 },
    { name: "Plumbing Pipes", unit: "meters", defaultThreshold: 200, defaultCapacity: 1000 },
    { name: "Electrical Wiring", unit: "coils", defaultThreshold: 50, defaultCapacity: 300 }
  ];

  const totalInwardValue = useMemo(() =>
    materialTxns.filter(t => t.type === 'Inward').reduce((acc, t) => acc + (t.totalCost || 0), 0)
    , [materialTxns]);

  const urgentItemsCount = useMemo(() =>
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

  const handleInward = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materialStock.find(m => m.name === inwardForm.materialName);
    addMaterialTxn({
      materialName: inwardForm.materialName,
      type: 'Inward',
      qty: inwardForm.qty,
      unit: material?.unit || 'units',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      vendorName: inwardForm.supplier,
      invoiceNumber: inwardForm.invoice,
      ratePerUnit: inwardForm.rate,
      totalCost: inwardForm.qty * inwardForm.rate
    });
    setIsInwardModalOpen(false);
    setInwardForm({ materialName: '', qty: 0, supplier: '', invoice: '', rate: 0 });
    showToast(`${inwardForm.materialName} stock added.`);
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
      showToast(`${outwardForm.materialName} stock is low — ${projectedStock} ${material!.unit} left.`, 'warning');
    } else {
      showToast(`${outwardForm.materialName} issued to site.`);
    }
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newMaterialForm.name === 'Custom/Other' ? newMaterialForm.customName : newMaterialForm.name;
    const materialData = {
      name: finalName,
      unit: newMaterialForm.unit,
      threshold: newMaterialForm.threshold,
      capacity: newMaterialForm.capacity,
      colorVar: newMaterialForm.colorVar,
    };
    addMaterial(materialData as any);
    setIsAddMaterialModalOpen(false);
    setNewMaterialForm({ name: '', customName: '', unit: '', threshold: 0, capacity: 0, colorVar: '--blue' });
    showToast(`${finalName} added to inventory.`);
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
      exportToCSV(csvData, `Stock_Log_${new Date().toISOString().split('T')[0]}`);
      showToast("Stock log exported.");
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
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white px-10 py-5 rounded-2xl shadow-2xl border-2 border-white/10 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${toast.type === 'warning' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
            <span className="text-[14px] font-bold tracking-tight whitespace-nowrap uppercase">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="text-left">
            <h1 className="text-[var(--h1-fs)] font-bold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Material Stock</h1>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Live status</Badge>
              <span className="text-[14px] text-[var(--text3)] font-bold tabular-nums tracking-tight opacity-80 uppercase">Stock list</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 border-2 border-[var(--border)] p-1.5 rounded-2xl">
              <button
                onClick={() => setViewMode('TIMELINE')}
                className={`px-6 py-2.5 rounded-xl text-[12px] font-bold tracking-wider uppercase
                  ${viewMode === 'TIMELINE' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('CATEGORICAL')}
                className={`px-6 py-2.5 rounded-xl text-[12px] font-bold tracking-wider uppercase
                  ${viewMode === 'CATEGORICAL' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Categories
              </button>
            </div>
            <Button
              variant="secondary"
              size="default"
              onClick={handleExport}
              className="px-8 shadow-md rounded-xl h-[52px]"
              disabled={isExporting}
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-3" />
              {isExporting ? 'Exporting...' : 'Export log'}
            </Button>
            <div className="h-10 w-[2px] bg-[var(--border)] mx-2"></div>
            <Button
              size="default"
              className="px-10 shadow-lg rounded-xl h-[52px]"
              onClick={() => setIsAddMaterialModalOpen(true)}
            >
              <PlusIcon className="w-5 h-5 mr-3" />
              Add material
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            label="Stock value"
            value={totalInwardValue}
            trend={{ value: "Total cost", type: "neutral" }}
          />
          <KPICard
            label="Low stock"
            value={`${urgentItemsCount} items`}
            trend={{ value: urgentItemsCount > 0 ? "Urgent" : "Healthy", type: urgentItemsCount > 0 ? "down" : "up" }}
          />
          <KPICard
            label="Usage logs"
            value={`${materialTxns.filter(t => t.type === 'Outward').length} logs`}
            trend={{ value: "Tracking", type: "neutral" }}
          />
          <KPICard
            label="Avg cost"
            value={materialTxns.filter(t => t.type === 'Inward').reduce((acc, t) => acc + (t.totalCost || 0), 0) / (materialTxns.length || 1)}
            trend={{ value: "Buying", type: "up" }}
          />
        </div>

        <div className="flex gap-4">
          <Button variant="primary" className="px-8" onClick={() => setIsInwardModalOpen(true)}>
            <ArrowDownTrayIcon className="w-5 h-5 mr-3" /> Add Stock In
          </Button>
          <Button variant="secondary" className="px-8" onClick={() => setIsOutwardModalOpen(true)}>
            <ArrowUpTrayIcon className="w-5 h-5 mr-3" /> Send Stock Out
          </Button>
        </div>

        {viewMode === 'TIMELINE' ? (
          <div className="grid grid-cols-12 gap-[var(--section-gap)] items-start">
            {/* Movement Log */}
            <Card className="col-span-12 lg:col-span-8 p-0 overflow-hidden min-h-[600px] shadow-lg border-2">
              <div className="p-8 border-b-2 border-[var(--border)] bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="text-left">
                    <h2 className="text-[18px] font-bold text-gray-900 tracking-tight uppercase">Stock Log</h2>
                    <p className="text-[12px] font-bold text-gray-500 mt-1 uppercase tracking-wider opacity-70">Stock movement and site usage</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative w-72">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <Input
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 shadow-sm rounded-xl border-2"
                      />
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-[var(--border)] rounded-xl shadow-sm min-w-[200px]">
                      <FunnelIcon className="w-5 h-5 text-amber-500" />
                      <select
                        value={activeMaterialFilter}
                        onChange={(e) => setActiveMaterialFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-900 cursor-pointer w-full uppercase"
                      >
                        <option value="ALL">All categories</option>
                        {materialStock.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                      <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Date</th>
                      <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Material</th>
                      <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Type</th>
                      <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Quantity</th>
                      <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Source / Site</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[var(--border)]">
                    {filteredTxns.length > 0 ? filteredTxns.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="p-[16px_32px] text-[14px] font-bold text-gray-900 tabular-nums">{t.date}</td>
                        <td className="p-[16px_20px]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border-2 border-[var(--border)] flex items-center justify-center text-[20px] shadow-sm">
                              📦
                            </div>
                            <span className="text-[15px] font-bold text-gray-900 tracking-tight">{t.materialName}</span>
                          </div>
                        </td>
                        <td className="p-[16px_20px]">
                          <Badge variant={t.type === 'Inward' ? 'success' : 'warning'} className="text-[11px] font-bold px-3 py-1 shadow-sm">
                            {t.type}
                          </Badge>
                        </td>
                        <td className="p-[16px_20px]">
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-gray-900 tabular-nums">
                              {t.qty.toLocaleString()} <span className="text-[11px] text-gray-400 font-bold uppercase">{t.unit}</span>
                            </span>
                            {t.totalCost && <span className="text-[11px] text-amber-600 font-bold mt-1">₹{t.totalCost.toLocaleString()}</span>}
                          </div>
                        </td>
                        <td className="p-[16px_32px]">
                          <div className="flex flex-col">
                            <span className="text-[14px] text-gray-900 font-bold tracking-tight uppercase">{t.vendorName || t.projectBlock}</span>
                            <span className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider opacity-80">{t.invoiceNumber || t.supervisorName}</span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-32 text-center text-gray-400 font-bold uppercase tracking-widest text-[13px] italic opacity-50">
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Stock Status Summary */}
            <Card className="col-span-12 lg:col-span-4 p-8 shadow-lg border-2">
              <div className="mb-12 text-left">
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight uppercase">Current stock</h2>
                <p className="text-[12px] text-amber-600 font-bold tracking-widest mt-2 uppercase opacity-80">Stock levels</p>
              </div>

              <div className="space-y-12 text-left">
                {materialStock.map((m, i) => {
                  const percentage = Math.min((m.current / m.capacity) * 100, 100);
                  const isUrgent = m.current < m.threshold;
                  return (
                    <div key={i} className="space-y-5">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <span className="text-[15px] font-bold text-gray-900 tracking-tight">{m.name}</span>
                            {isUrgent && (
                              <Badge variant="danger" className="text-[9px] font-bold px-2 py-0.5">CRITICAL</Badge>
                            )}
                            <button
                              onClick={() => { if (confirm(`Delete ${m.name} category?`)) deleteMaterial(m.id); }}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-none"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{m.unit}</span>
                            <span className="text-[11px] text-gray-200 font-bold">|</span>
                            {editingThresholdId === m.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  autoFocus
                                  className="w-16 h-6 text-[11px] font-bold text-amber-600 bg-white border-2 border-amber-200 rounded-lg px-2 outline-none shadow-sm"
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
                                  className="text-[10px] font-bold text-green-600 uppercase"
                                >Save</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingThresholdId(m.id); setThresholdValue(m.threshold); }}
                                className="text-[11px] text-amber-600 font-bold hover:underline uppercase tracking-wider"
                              >
                                Limit: {m.threshold.toLocaleString()}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-[18px] font-bold tabular-nums ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>{m.current.toLocaleString()}</span>
                          <span className={`text-[11px] font-bold tracking-widest mt-1 uppercase ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>{percentage.toFixed(0)}% Fill</span>
                        </div>
                      </div>
                      <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border-2 border-gray-100 p-0.5 shadow-inner">
                        <div
                          className={`h-full ${isUrgent ? 'bg-red-600' : 'bg-amber-500'} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-20 pt-12 border-t-2 border-[var(--border)] text-center">
                <div className="relative w-48 h-48 mx-auto bg-gray-50 rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                  <span className="text-[48px] mb-3">📊</span>
                  <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Overall stock</p>
                  <p className="text-[28px] font-bold text-gray-900 tabular-nums">
                    {materialStock.length > 0
                      ? Math.round(materialStock.reduce((acc, m) => acc + (Math.min((m.current / m.capacity) * 100, 100)), 0) / materialStock.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-8 text-left">
            {materialStock.map((material) => {
              const txns = materialTxns.filter(t => t.materialName === material.name);
              const isUrgent = material.current < material.threshold;

              return (
                <Card key={material.id} className="p-0 overflow-hidden border-2 shadow-lg relative">
                  <div style={{ backgroundColor: isUrgent ? 'var(--red)' : 'var(--gold)' }} className="absolute top-0 left-0 right-0 h-1" />
                  <div className="p-8 border-b-2 border-[var(--border)] bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[28px] border-2 border-[var(--border)] shadow-md">
                          {material.name.toLowerCase().includes('steel') ? '🏗️' :
                            material.name.toLowerCase().includes('cement') ? '🧱' :
                              material.name.toLowerCase().includes('sand') ? '⏳' : '📦'}
                        </div>
                        <div>
                          <h2 className="text-[18px] font-bold text-gray-900 tracking-tight uppercase">{material.name}</h2>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant={isUrgent ? 'danger' : 'success'} className="text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                              {isUrgent ? 'Low Stock' : 'Stock is Good'}
                            </Badge>
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                              {txns.length} Total entries
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-gray-400 tracking-widest mb-1 uppercase">Available stock</p>
                          <p className={`text-[24px] font-bold tracking-tight tabular-nums ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                            {material.current.toLocaleString()} <span className="text-[13px] font-bold text-gray-400 uppercase">{material.unit}</span>
                          </p>
                        </div>
                        <div className="w-40 h-2.5 bg-gray-200 rounded-full overflow-hidden p-0.5 shadow-inner border-2 border-gray-100">
                          <div
                            className={`h-full rounded-full ${isUrgent ? 'bg-red-600' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min((material.current / material.capacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white rounded-2xl border-2 border-[var(--border)] shadow-sm mt-8">
                      {(() => {
                        const inwards = txns.filter(t => t.type === 'Inward');
                        const outwards = txns.filter(t => t.type === 'Outward');
                        const totalInQty = inwards.reduce((acc, t) => acc + t.qty, 0);
                        const totalOutQty = outwards.reduce((acc, t) => acc + t.qty, 0);
                        const totalInCost = inwards.reduce((acc, t) => acc + (t.totalCost || 0), 0);
                        const avgRate = totalInQty > 0 ? totalInCost / totalInQty : 0;

                        const supplierCounts = inwards.reduce((acc: any, t) => {
                          acc[t.vendorName || 'Unknown'] = (acc[t.vendorName || 'Unknown'] || 0) + 1;
                          return acc;
                        }, {});
                        const primarySupplier = Object.entries(supplierCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

                        const projectCounts = outwards.reduce((acc: any, t) => {
                          acc[t.projectBlock || 'Site'] = (acc[t.projectBlock || 'Site'] || 0) + t.qty;
                          return acc;
                        }, {});
                        const topProject = Object.entries(projectCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

                        return (
                          <>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Total inward</p>
                              <p className="text-[15px] font-bold text-gray-900 tabular-nums">{totalInQty.toLocaleString()} <span className="text-[11px] opacity-50">{material.unit}</span></p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Total outward</p>
                              <p className="text-[15px] font-bold text-amber-700 tabular-nums">{totalOutQty.toLocaleString()} <span className="text-[11px] opacity-50">{material.unit}</span></p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Average rate</p>
                              <p className="text-[15px] font-bold text-gray-900 tabular-nums">₹{avgRate.toFixed(0)} <span className="text-[11px] opacity-50">/ {material.unit}</span></p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Main site / supplier</p>
                              <p className="text-[13px] font-bold text-amber-600 truncate uppercase">{topProject} · {primarySupplier}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                          <th className="p-[12px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Date</th>
                          <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Type</th>
                          <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Source / Destination</th>
                          <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Quantity</th>
                          <th className="p-[12px_32px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Total value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-[var(--border)]">
                        {txns.length > 0 ? txns.map(t => (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="p-[12px_32px] text-[13px] font-bold text-gray-900 tabular-nums">{t.date}</td>
                            <td className="p-[12px_20px]">
                              <Badge variant={t.type === 'Inward' ? 'success' : 'warning'} className="text-[10px] font-bold px-2 py-0.5 uppercase shadow-sm">
                                {t.type}
                              </Badge>
                            </td>
                            <td className="p-[12px_20px]">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-900 tracking-tight uppercase">{t.vendorName || t.projectBlock}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider opacity-80">{t.invoiceNumber || t.supervisorName}</span>
                              </div>
                            </td>
                            <td className="p-[12px_20px]">
                              <span className="text-[15px] font-bold text-gray-900 tabular-nums">{t.qty.toLocaleString()} <span className="text-[11px] opacity-40 uppercase">{t.unit}</span></span>
                            </td>
                            <td className="p-[12px_32px] text-right">
                              <span className="text-[15px] font-bold text-gray-900 tabular-nums">{t.totalCost ? formatCurrency(t.totalCost) : '--'}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-300 font-bold uppercase tracking-widest text-[12px] italic">
                              No logs recorded.
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
      
      {/* Add Stock Modal */}
      {isInwardModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <ArrowDownTrayIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Stock</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Add items to stock</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsInwardModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleInward} className="modal-body space-y-10 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Material Name</Label>
                  <Select
                    v2={true}
                    required
                    value={inwardForm.materialName}
                    onChange={e => setInwardForm({ ...inwardForm, materialName: e.target.value })}
                    className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                  >
                    <option value="">Choose material...</option>
                    {materialStock.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label required>Quantity</Label>
                  <div className="relative">
                    <Input
                      required
                      v2={true}
                      type="number"
                      placeholder="0.00"
                      value={inwardForm.qty || ''}
                      onChange={e => setInwardForm({ ...inwardForm, qty: Number(e.target.value) })}
                      className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums text-[18px]"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/80 px-2 rounded-md">
                      {materialStock.find(m => m.name === inwardForm.materialName)?.unit || 'Units'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Supplier</Label>
                  <Input
                    required
                    v2={true}
                    type="text"
                    placeholder="Enter supplier name"
                    value={inwardForm.supplier}
                    onChange={e => setInwardForm({ ...inwardForm, supplier: e.target.value })}
                    className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                  />
                </div>
                <div className="space-y-4">
                  <Label required>Unit Price (₹)</Label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    placeholder="0.00"
                    value={inwardForm.rate || ''}
                    onChange={e => setInwardForm({ ...inwardForm, rate: Number(e.target.value) })}
                    className="h-[56px] shadow-md rounded-2xl font-bold text-amber-600 tabular-nums text-[18px] font-price"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label required>Bill No.</Label>
                <Input
                  required
                  v2={true}
                  type="text"
                  placeholder="INV-XXXX-2026"
                  value={inwardForm.invoice}
                  onChange={e => setInwardForm({ ...inwardForm, invoice: e.target.value })}
                  className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                />
              </div>

              <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <ShieldCheckIcon className="w-10 h-10 text-amber-500 shrink-0" />
                <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                    This item will be added to main stock list.
                </p>
              </div>

              <div className="pt-6 flex gap-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2"
                  onClick={() => setIsInwardModalOpen(false)}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl"
                >
                  Commit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Stock Modal */}
      {isOutwardModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <ArrowUpTrayIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Send Stock</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Send material to site</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsOutwardModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleOutward} className="modal-body space-y-10 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Material Name</Label>
                  <Select
                    v2={true}
                    required
                    value={outwardForm.materialName}
                    onChange={e => setOutwardForm({ ...outwardForm, materialName: e.target.value })}
                    className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                  >
                    <option value="">Select material...</option>
                    {materialStock.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label required>Quantity to Send</Label>
                  <div className="relative">
                    <Input
                      required
                      v2={true}
                      type="number"
                      placeholder="0"
                      value={outwardForm.qty || ''}
                      onChange={e => setOutwardForm({ ...outwardForm, qty: Number(e.target.value) })}
                      className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums text-[18px]"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/80 px-2 rounded-md">
                      {materialStock.find(m => m.name === outwardForm.materialName)?.unit || 'Units'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Name</Label>
                  <Input
                    required
                    v2={true}
                    type="text"
                    placeholder="Enter person name"
                    value={outwardForm.supervisor}
                    onChange={e => setOutwardForm({ ...outwardForm, supervisor: e.target.value })}
                    className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                  />
                </div>
                <div className="space-y-4">
                  <Label required>Site / Location</Label>
                  <Input
                    required
                    v2={true}
                    type="text"
                    placeholder="Enter block/site"
                    value={outwardForm.project}
                    onChange={e => setOutwardForm({ ...outwardForm, project: e.target.value })}
                    className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                  />
                </div>
              </div>

              {outwardForm.materialName && (() => {
                const material = materialStock.find(m => m.name === outwardForm.materialName);
                if (!material) return null;
                const projectedStock = material.current - (outwardForm.qty || 0);
                const isAlreadyLow = material.current < material.threshold;
                const willBeLow = projectedStock < material.threshold;
                return (
                  <div className={`p-10 rounded-[16px] border-2 flex items-start gap-6 shadow-lg ${willBeLow ? 'bg-red-50 border-red-200' : isAlreadyLow ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                    <div className={`w-4 h-4 rounded-full mt-2 shrink-0 ${willBeLow ? 'bg-red-600 animate-pulse' : isAlreadyLow ? 'bg-amber-500' : 'bg-green-600'}`}></div>
                    <div>
                      <p className={`text-[15px] font-bold uppercase tracking-tight mb-2 ${willBeLow ? 'text-red-700' : isAlreadyLow ? 'text-amber-700' : 'text-green-700'}`}>
                        {willBeLow ? 'Alert: Stock will be low' : isAlreadyLow ? 'Alert: Stock is low' : 'Stock is good'}
                      </p>
                      <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide opacity-80">
                        {willBeLow ? `Stock will drop to ${projectedStock.toLocaleString()} ${material.unit}, which is below the limit of ${material.threshold.toLocaleString()}.` :
                          isAlreadyLow ? `Current stock is only ${material.current.toLocaleString()} ${material.unit}, which is low.` :
                            `After sending, stock of ${projectedStock.toLocaleString()} ${material.unit} is still good.`}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-6 flex gap-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2"
                  onClick={() => setIsOutwardModalOpen(false)}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl"
                >
                  Approve & Send
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Category Modal */}
      {isAddMaterialModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-2xl shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add New Item</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Add new stock item</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddMaterialModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleAddMaterial} className="modal-body space-y-10 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Item Name</Label>
                  <Select
                    v2={true}
                    required
                    value={newMaterialForm.name}
                    onChange={e => {
                      const selected = STANDARD_MATERIALS.find(m => m.name === e.target.value);
                      setNewMaterialForm({
                        ...newMaterialForm,
                        name: e.target.value,
                        unit: selected?.unit || '',
                        threshold: selected?.defaultThreshold || 0,
                        capacity: selected?.defaultCapacity || 0
                      });
                    }}
                    className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                  >
                    <option value="">Select standard...</option>
                    {STANDARD_MATERIALS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    <option value="Custom/Other">Custom / Manual entry</option>
                  </Select>
                </div>
                {newMaterialForm.name === 'Custom/Other' && (
                  <div className="space-y-4">
                    <Label required>Custom Name</Label>
                    <Input
                      required
                      v2={true}
                      value={newMaterialForm.customName}
                      onChange={e => setNewMaterialForm({ ...newMaterialForm, customName: e.target.value })}
                      placeholder="Enter custom name"
                      className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  <Label required>Measurement unit</Label>
                  <Input
                    required
                    v2={true}
                    value={newMaterialForm.unit}
                    onChange={e => setNewMaterialForm({ ...newMaterialForm, unit: e.target.value })}
                    placeholder="e.g. KG, BAGS, SQFT"
                    className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Low Stock Alert Level</Label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    value={newMaterialForm.threshold || ''}
                    onChange={e => setNewMaterialForm({ ...newMaterialForm, threshold: Number(e.target.value) })}
                    placeholder="0"
                    className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums"
                  />
                </div>
                <div className="space-y-4">
                  <Label required>Maximum Storage Amount</Label>
                  <Input
                    required
                    v2={true}
                    type="number"
                    value={newMaterialForm.capacity || ''}
                    onChange={e => setNewMaterialForm({ ...newMaterialForm, capacity: Number(e.target.value) })}
                    placeholder="0"
                    className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <InformationCircleIcon className="w-10 h-10 text-amber-500 shrink-0" />
                <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                  New categories are initialized with zero stock and require an inward entry to populate inventory levels.
                </p>
              </div>

              <div className="pt-6 flex gap-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl"
                >
                  Add item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
