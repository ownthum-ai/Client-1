"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useStore, PropertyHolder } from '@/store/useStore';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  LockOpenIcon,
  DocumentTextIcon,
  BanknotesIcon,
  UserIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BellIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { ProfessionalReceipt } from '@/components/ProfessionalReceipt';

const formatCurrency = (amt: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amt);
};

// --- Custom Components ---
const HolderFilter = ({
  holders,
  value,
  onChange
}: {
  holders: PropertyHolder[],
  value: string | 'all',
  onChange: (val: string | 'all') => void
}) => (
  <div className="flex bg-[var(--bg)] border border-[var(--border)] p-1 rounded-xl">
    <button
      onClick={() => onChange('all')}
      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[1px] transition-all
        ${value === 'all' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
    >
      All Assets
    </button>
    {holders.map(h => (
      <button
        key={h.id}
        onClick={() => onChange(h.id)}
        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[1px] transition-all
          ${value === h.id ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
      >
        {h.name.split(' ')[0]}
      </button>
    ))}
  </div>
);

export default function PropertyHolderPage() {
  const {
    propertyHolders,
    lands,
    layouts,
    addLandPayment,
    markInstallmentPaid,
    addPropertyHolderInstallment,
    constructionPhases,
    uploadInstallmentReceipt,
    isPinUnlocked
  } = useStore();

  const [filterHolderId, setFilterHolderId] = useState<string | 'all'>('all');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddSchedModalOpen, setIsAddSchedModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{hId: string, iId: string} | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isGlobalPinModalOpen, setIsGlobalPinModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type?: 'success' | 'warning' } | null>(null);
  const [printingData, setPrintingData] = useState<{ holder: any; installment: any } | null>(null);

  // New Transaction State
  const [txHolder, setTxHolder] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txMode, setTxMode] = useState<'White' | 'Cash'>('White');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Calculations ---
  const activeHolders = useMemo(() => 
    filterHolderId === 'all' ? propertyHolders : propertyHolders.filter(h => h.id === filterHolderId)
  , [propertyHolders, filterHolderId]);

  const stats = useMemo(() => {
    let totalValuation = 0;
    let whitePaid = 0;
    let cashPaid = 0;
    let totalUnits = 0;

    activeHolders.forEach(h => {
      totalValuation += h.totalAmount;
      const land = lands.find(l => l.surveyNo === h.parcelId);
      if (land) {
        land.payments?.forEach(p => {
          if (p.mode === 'Cash') cashPaid += p.amount;
          else whitePaid += p.amount;
        });
        const layout = layouts.find(lo => lo.landId === land.id);
        if (layout) totalUnits += layout.totalPlots;
      }
    });

    return { 
      totalValuation, 
      whitePaid, 
      cashPaid, 
      totalUnits, 
      balance: totalValuation - (whitePaid + cashPaid) 
    };
  }, [activeHolders, lands, layouts]);

  const allInstallments = useMemo(() => activeHolders.flatMap(h =>
    h.installments.map(i => ({ ...i, holderName: h.name, holderId: h.id, parcelId: h.parcelId }))
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    , [activeHolders]);

  const allPayments = useMemo(() => {
    const list: any[] = [];
    activeHolders.forEach(h => {
      const land = lands.find(l => l.surveyNo === h.parcelId);
      if (land?.payments) {
        land.payments.forEach(p => {
          list.push({ ...p, holderName: h.name, parcelId: h.parcelId, landId: land.id });
        });
      }
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeHolders, lands]);

  const institutionalPayments = useMemo(() => allPayments.filter(p => p.mode !== 'Cash'), [allPayments]);
  const privatePayments = useMemo(() => allPayments.filter(p => p.mode === 'Cash'), [allPayments]);


  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const holder = propertyHolders.find(h => h.id === txHolder);
    const land = lands.find(l => l.surveyNo === holder?.parcelId);
    
    if (!land) return;

    addLandPayment(land.id, {
      date: new Date(txDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: Number(txAmount),
      mode: txMode as any,
      balance: stats.balance - Number(txAmount)
    });

    setIsAddTxModalOpen(false);
    showToast(`Settlement Recorded: ${formatCurrency(Number(txAmount))}`, txMode === 'Cash' ? 'warning' : 'success');
  };

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 bg-[var(--sb)]">
            <div className={`w-2 h-2 rounded-full ${toast.type === 'warning' ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--gold)]'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[2.5px] whitespace-nowrap">{toast.message}</span>
          </div>
        )}

        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Property Holder Financials</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE ARITHMETIC SYNC
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Operational land settlement and project valuation registry</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HolderFilter holders={propertyHolders} value={filterHolderId} onChange={setFilterHolderId} />
            <Button 
              v2={true}
              size="default"
              className="px-8"
              onClick={() => setIsAddTxModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <KPICard
            label="PROJECT VALUATION"
            value={formatCurrency(stats.totalValuation)}
            color="gold"
            trend={{ value: "Global Assets", type: "neutral" }}
          />
          <KPICard
            label="UNIT INVENTORY"
            value={stats.totalUnits.toString()}
            color="gold"
            trend={{ value: "Yield Node", type: "neutral" }}
          />
          <KPICard
            label="INSTITUTIONAL SETTLED"
            value={`+ ${formatCurrency(stats.whitePaid)}`}
            color="green"
            trend={{ value: "Authorized", type: "up" }}
          />
          <KPICard
            label="PRIVATE SETTLED"
            color={isPinUnlocked ? "green" : "gold"}
            value={
              <div className={`transition-all duration-700 font-price ${isPinUnlocked ? 'blur-0 opacity-100 text-[var(--green)]' : 'blur-md opacity-20'}`}>
                + {formatCurrency(stats.cashPaid)}
              </div>
            }
            trend={isPinUnlocked ? { value: "Decrypted", type: "up" } : "Locked Vault"}
          />
          <KPICard
            label="IN-TRANSIT BAL."
            value={`- ${formatCurrency(stats.balance)}`}
            color="red"
            trend={{ value: "Net Due", type: "down" }}
          />
        </div>

        {/* Main Settlement Schedule Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
            <div>
              <h2 className="text-[12px] font-bold text-[var(--text)] uppercase tracking-[2px]">Settlement Timeline Matrix</h2>
              <p className="text-[10px] font-medium text-[var(--text3)] uppercase tracking-[1px] mt-1 opacity-60">Planned milestones and contractual obligations</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsAddSchedModalOpen(true)} v2={true}>
              <CalendarDaysIcon className="w-4 h-4 mr-2" /> Schedule Milestone
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Landowner Entity</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Milestone</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Due Date</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Value</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">State</th>
                  <th className="p-[12px_24px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {allInstallments.map((item) => (
                  <tr key={item.id} className="group hover:bg-[var(--bg)] transition-all">
                    <td className="p-[12px_24px]">
                      <span className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight">{item.holderName}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <span className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-[1px]">{item.installmentName}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <span className="text-[12px] font-bold text-[var(--text)] uppercase">{item.dueDate}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <span className="text-[14px] font-bold text-[var(--text)] font-price">{formatCurrency(item.amount)}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <Badge variant={item.status === 'Paid' ? 'success' : item.status === 'Overdue' ? 'danger' : 'warning'}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-[12px_24px] text-center flex items-center justify-center gap-2">
                      {item.status !== 'Paid' && (
                        <Button variant="primary" size="inline" onClick={() => markInstallmentPaid(item.holderId, item.id, new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))}>
                          Authorize
                        </Button>
                      )}
                      {item.status === 'Paid' && !item.receiptUrl && (
                        <Button variant="secondary" size="inline" onClick={() => { setUploadTarget({hId: item.holderId, iId: item.id}); setIsUploadModalOpen(true); }}>
                          Upload Receipt
                        </Button>
                      )}
                      {item.receiptUrl && (
                        <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-[var(--gold)] rounded-lg hover:bg-gray-100 transition-colors">
                          <DocumentTextIcon className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Dual Table Section: Institutional vs Private */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Institutional Ledger */}
          <Card className="p-0 overflow-hidden border-[var(--gold)]/20">
            <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--gold)]/5 to-transparent">
              <h2 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[2px]">Institutional Audit Ledger</h2>
              <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] opacity-60">Bank-verified transactions (White Money)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                    <th className="p-[12px_24px] text-[9px] font-bold text-[var(--text3)] uppercase">Entity</th>
                    <th className="p-[12px_15px] text-[9px] font-bold text-[var(--text3)] uppercase">Date</th>
                    <th className="p-[12px_15px] text-right text-[9px] font-bold text-[var(--text3)] uppercase">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {institutionalPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--bg)] transition-all">
                      <td className="p-[12px_24px] text-[12px] font-bold uppercase">{p.holderName}</td>
                      <td className="p-[12px_15px] text-[11px] font-medium">{p.date}</td>
                      <td className="p-[12px_15px] text-right text-[13px] font-bold font-price">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                  {institutionalPayments.length === 0 && (
                    <tr><td colSpan={3} className="p-10 text-center text-[10px] font-bold text-[var(--text3)] opacity-40 uppercase">No Institutional records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Private Ledger */}
          <Card className={`p-0 overflow-hidden border-[var(--sb)]/20 transition-all duration-700 ${!isPinUnlocked ? 'opacity-60' : 'opacity-100'}`}>
            <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--sb)]/5 to-transparent flex justify-between items-center">
              <div>
                <h2 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[2px]">Private Security Ledger</h2>
                <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] opacity-60">Locked registry (Black Money)</p>
              </div>
              {!isPinUnlocked && (
                <Button size="sm" onClick={() => setIsGlobalPinModalOpen(true)} className="bg-[var(--sb)] text-white text-[9px] px-4">Unlock Vault</Button>
              )}
            </div>
            <div className="overflow-x-auto relative min-h-[200px]">
              {!isPinUnlocked && (
                <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 flex items-center justify-center">
                  <LockClosedIcon className="w-8 h-8 text-[var(--sb)] opacity-40" />
                </div>
              )}
              <table className={`w-full text-left border-collapse transition-all duration-700 ${!isPinUnlocked ? 'blur-xl opacity-10' : 'blur-0'}`}>
                <thead>
                  <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                    <th className="p-[12px_24px] text-[9px] font-bold text-[var(--text3)] uppercase">Entity</th>
                    <th className="p-[12px_15px] text-[9px] font-bold text-[var(--text3)] uppercase">Date</th>
                    <th className="p-[12px_15px] text-right text-[9px] font-bold text-[var(--text3)] uppercase">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {privatePayments.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--bg)] transition-all">
                      <td className="p-[12px_24px] text-[12px] font-bold uppercase">{p.holderName}</td>
                      <td className="p-[12px_15px] text-[11px] font-medium">{p.date}</td>
                      <td className="p-[12px_15px] text-right text-[13px] font-bold font-price">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                  {privatePayments.length === 0 && (
                    <tr><td colSpan={3} className="p-10 text-center text-[10px] font-bold text-[var(--text3)] opacity-40 uppercase">No Private records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals outside the animated container avoid the 'containing block' trap */}
      {isAddTxModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-xl">
            <div className="modal-header">
              <div className="text-left">
                <h2 className="text-[26px] font-bold text-[var(--text)] uppercase tracking-tight leading-none mb-2">Monetary Entry Registry</h2>
                <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2.5px] opacity-70">RECORD DUAL-MODE LAND SETTLEMENT</p>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsAddTxModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-6">
              <form onSubmit={handleTxSubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <Label required>Property Holder</Label>
                  <Select 
                    v2={true}
                    required 
                    value={txHolder} onChange={e => setTxHolder(e.target.value)}
                  >
                    <option value="">SELECT ENTITY</option>
                    {propertyHolders.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <Label required>Value (₹)</Label>
                    <Input required v2={true} type="number" placeholder="00,00,000" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label required>Date</Label>
                    <Input required v2={true} type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <Label required>Transaction Mode</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setTxMode('White')} 
                      className={`h-14 flex items-center justify-center rounded-2xl border-2 font-bold text-[11px] uppercase tracking-wider transition-all
                        ${txMode === 'White' ? 'border-[var(--gold)] bg-[var(--gold-lt)]/10 text-[var(--gold)]' : 'border-[var(--border)] bg-gray-50/50 text-[var(--text3)] hover:border-[var(--gold)]/30'}`}
                    >
                      Institutional
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTxMode('Cash')} 
                      className={`h-14 flex items-center justify-center rounded-2xl border-2 font-bold text-[11px] uppercase tracking-wider transition-all
                        ${txMode === 'Cash' ? 'border-[var(--sb)] bg-[var(--sb)] text-white shadow-lg' : 'border-[var(--border)] bg-gray-50/50 text-[var(--text3)] hover:border-[var(--sb)]/30'}`}
                    >
                      Private (Cash)
                    </button>
                  </div>
                </div>

                <div className="modal-footer px-0 border-none bg-transparent pt-6 flex gap-4">
                  <Button type="button" variant="secondary" className="flex-1 h-12" onClick={() => setIsAddTxModalOpen(false)}>Discard Registry</Button>
                  <Button type="submit" variant="primary" className="flex-[1.5] h-12 shadow-lg shadow-[var(--gold)]/20">Commit Registry</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Global PIN Modal Handles This Now */}

      {isAddSchedModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-xl">
            <div className="modal-header">
              <div className="text-left">
                <h2 className="text-[26px] font-bold text-[var(--text)] uppercase tracking-tight leading-none mb-2">Schedule Protocol</h2>
                <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2.5px] opacity-70">DEFINE NEW SETTLEMENT MILESTONE</p>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsAddSchedModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                addPropertyHolderInstallment(d.get('hId') as string, {
                  installmentName: d.get('name') as string,
                  amount: Number(d.get('amt')),
                  dueDate: new Date(d.get('date') as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  condition: d.get('cond') as string,
                  status: 'Upcoming'
                });
                setIsAddSchedModalOpen(false); showToast("Milestone Scheduled");
              }} className="space-y-6 text-left">
                <div className="space-y-2">
                  <Label required>Landowner Entity</Label>
                  <Select name="hId" required v2={true}>
                    {propertyHolders.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><Label required>Node Name</Label><Input name="name" v2={true} required placeholder="e.g. Agreement" /></div>
                  <div className="space-y-2"><Label required>Value (₹)</Label><Input name="amt" v2={true} required type="number" /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><Label required>Due Date</Label><Input name="date" v2={true} required type="date" /></div>
                  <div className="space-y-2"><Label required>Condition Node</Label><Input name="cond" v2={true} required placeholder="On registration..." /></div>
                </div>
                <div className="modal-footer px-0 border-none bg-transparent pt-6 flex gap-4">
                  <Button type="button" variant="secondary" className="flex-1 h-12" onClick={() => setIsAddSchedModalOpen(false)}>Discard Schedule</Button>
                  <Button type="submit" variant="primary" className="flex-[1.5] h-12 shadow-lg shadow-[var(--gold)]/20">Enforce Schedule</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <div className="text-left">
                <h2 className="text-[26px] font-bold text-[var(--text)] uppercase tracking-tight leading-none mb-2">DocuSync Registry</h2>
                <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2.5px] opacity-70 italic">ATTACH PHYSICAL RECEIPT</p>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsUploadModalOpen(false)}>✕</Button>
            </div>
            <div className="modal-body space-y-8">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (uploadTarget) {
                  uploadInstallmentReceipt(uploadTarget.hId, uploadTarget.iId, "#"); // Simulating upload
                  setIsUploadModalOpen(false);
                  showToast("DOCUMENT SYNCHRONIZED TO REGISTRY");
                }
              }} className="space-y-6 text-left">
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 group hover:border-[var(--gold)]/30 hover:bg-white transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <DocumentTextIcon className="w-6 h-6 text-gray-300 group-hover:text-[var(--gold)]" />
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-900">Select receipt or drag here</p>
                  <p className="text-[9px] font-medium text-gray-300 mt-1 uppercase">PDF, PNG or JPG supported</p>
                </div>

                <div className="modal-footer px-0 border-none bg-transparent pt-6 flex gap-4">
                  <Button type="button" variant="secondary" className="flex-1 h-12" onClick={() => setIsUploadModalOpen(false)}>Discard</Button>
                  <Button type="submit" variant="primary" className="flex-[1.5] h-12 shadow-lg shadow-[var(--gold)]/20">Sync to Registry</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
