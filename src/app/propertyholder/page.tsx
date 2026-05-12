"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useStore, PropertyHolder } from '@/store/useStore';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

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
  <div className="flex bg-gray-100 border border-[var(--border)] p-1 rounded-xl">
    <button
      onClick={() => onChange('all')}
      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-[1px] transition-none
        ${value === 'all' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
    >
      All owners
    </button>
    {holders.map(h => (
      <button
        key={h.id}
        onClick={() => onChange(h.id)}
        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-[1px] transition-none
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
    uploadInstallmentReceipt
  } = useStore();

  const [filterHolderId, setFilterHolderId] = useState<string | 'all'>('all');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddSchedModalOpen, setIsAddSchedModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGlobalPinModalOpen, setIsGlobalPinModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ hId: string, iId: string } | null>(null);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [toast, setToast] = useState<{ message: string, type?: 'success' | 'warning' } | null>(null);

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
    let totalValue = 0;
    let whitePaid = 0;
    let cashPaid = 0;
    let totalUnits = 0;

    activeHolders.forEach(h => {
      totalValue += h.totalAmount;
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
      totalValue,
      whitePaid,
      cashPaid,
      totalUnits,
      balance: totalValue - (whitePaid + cashPaid)
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

  const institutionalPayments = useMemo(() => allPayments.filter(p => p.mode === 'White'), [allPayments]);
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
    showToast(`Payment saved: ${formatCurrency(Number(txAmount))}`, txMode === 'Cash' ? 'warning' : 'success');
  };

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${toast.type === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-bold tracking-[1px] whitespace-nowrap uppercase">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Owner payments</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5"></span>
                Live status
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums tracking-tight opacity-70">Settlement and valuation records</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HolderFilter holders={propertyHolders} value={filterHolderId} onChange={setFilterHolderId} />
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-sm rounded-lg"
              onClick={() => setIsAddTxModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New payment
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <KPICard
            label="Value"
            value={formatCurrency(stats.totalValue)}
            color="gold"
            trend={{ value: "Items", type: "neutral" }}
          />
          <KPICard
            label="Units"
            value={stats.totalUnits.toString()}
            color="gold"
            trend={{ value: "Plots", type: "neutral" }}
          />
          <KPICard
            label="Paid (Bank)"
            value={`+ ${formatCurrency(stats.whitePaid)}`}
            color="green"
            trend={{ value: "Verified", type: "up" }}
          />
          <KPICard
            label="Paid (Cash)"
            color={isPinUnlocked ? "green" : "gold"}
            value={
              <div className={`font-price ${isPinUnlocked ? 'opacity-100 text-[var(--green)]' : 'opacity-20 blur-sm'}`}>
                + {formatCurrency(stats.cashPaid)}
              </div>
            }
            trend={isPinUnlocked ? { value: "Visible", type: "up" } : "Locked"}
          />
          <KPICard
            label="Balance"
            value={`- ${formatCurrency(stats.balance)}`}
            color="red"
            trend={{ value: "Due", type: "down" }}
          />
        </div>

        {/* Payment Schedule */}
        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--border)] flex justify-between items-center text-left">
            <div className="text-left">
              <h2 className="text-[12px] font-bold text-[var(--text)] tracking-[1px] uppercase">Payment schedule</h2>
              <p className="text-[10px] font-medium text-[var(--text3)] mt-1 opacity-70">Steps and obligations</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsAddSchedModalOpen(true)} v2={true} className="bg-white border-[var(--border)] shadow-sm">
              <CalendarDaysIcon className="w-4 h-4 mr-2" /> Add step
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[var(--border)]">
                  <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Owner</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Step</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Due date</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Amount</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Status</th>
                  <th className="p-[12px_24px] text-center text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {allInstallments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-[12px_24px]">
                      <span className="text-[13px] font-bold text-[var(--text)]">{item.holderName}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <span className="text-[11px] font-bold text-[var(--text3)]">{item.installmentName}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <span className="text-[12px] font-bold text-[var(--text)]">{item.dueDate}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <span className="text-[14px] font-bold text-[var(--text)]">{formatCurrency(item.amount)}</span>
                    </td>
                    <td className="p-[12px_15px]">
                      <Badge variant={item.status === 'Paid' ? 'success' : item.status === 'Overdue' ? 'danger' : 'warning'} className="shadow-sm uppercase text-[9px] font-bold">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-[12px_24px] text-center flex items-center justify-center gap-2">
                      {item.status !== 'Paid' && (
                        <Button variant="primary" size="inline" onClick={() => markInstallmentPaid(item.holderId, item.id, new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))} className="shadow-sm text-[9px] font-bold uppercase">
                          Approve
                        </Button>
                      )}
                      {item.status === 'Paid' && !item.receiptUrl && (
                        <Button variant="secondary" size="inline" onClick={() => { setUploadTarget({ hId: item.holderId, iId: item.id }); setIsUploadModalOpen(true); }} className="shadow-sm text-[9px] font-bold uppercase bg-white border-[var(--border)]">
                          Upload receipt
                        </Button>
                      )}
                      {item.receiptUrl && (
                        <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-[var(--gold)] rounded-lg border border-[var(--border)] shadow-sm">
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

        {/* Payment History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bank Payments */}
          <Card className="p-0 overflow-hidden shadow-sm text-left">
            <div className="p-6 border-b border-[var(--border)] bg-gray-50/30">
              <h2 className="text-[12px] font-bold text-[var(--text)] tracking-[1px] uppercase">Bank payments</h2>
              <p className="text-[9px] font-bold text-[var(--text3)] opacity-70 uppercase">Verified records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[var(--border)]">
                    <th className="p-[12px_24px] text-[9px] font-bold text-[var(--text3)] uppercase">Owner</th>
                    <th className="p-[12px_15px] text-[9px] font-bold text-[var(--text3)] uppercase">Date</th>
                    <th className="p-[12px_15px] text-right text-[9px] font-bold text-[var(--text3)] uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {institutionalPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-[12px_24px] text-[12px] font-bold text-[var(--text)]">{p.holderName}</td>
                      <td className="p-[12px_15px] text-[11px] font-bold text-[var(--text3)]">{p.date}</td>
                      <td className="p-[12px_15px] text-right text-[13px] font-bold text-[var(--text)]">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                  {institutionalPayments.length === 0 && (
                    <tr><td colSpan={3} className="p-10 text-center text-[10px] font-bold text-[var(--text3)] opacity-40 uppercase">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Cash Payments */}
          <Card className={`p-0 overflow-hidden shadow-sm text-left ${!isPinUnlocked ? 'opacity-60' : 'opacity-100'}`}>
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/30">
              <div className="text-left">
                <h2 className="text-[12px] font-bold text-[var(--text)] tracking-[1px] uppercase">Cash payments</h2>
                <p className="text-[9px] font-bold text-[var(--text3)] opacity-70 uppercase">Secure records</p>
              </div>
              {!isPinUnlocked && (
                <Button size="sm" onClick={() => setIsGlobalPinModalOpen(true)} className="bg-gray-900 text-white text-[9px] px-4 font-bold shadow-sm uppercase">Unlock</Button>
              )}
            </div>
            <div className="overflow-x-auto relative min-h-[200px]">
              {!isPinUnlocked && (
                <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
                  <LockClosedIcon className="w-8 h-8 text-gray-400 opacity-40" />
                </div>
              )}
              <table className={`w-full text-left border-collapse ${!isPinUnlocked ? 'opacity-5 blur-sm' : ''}`}>
                <thead>
                  <tr className="bg-gray-50 border-b border-[var(--border)]">
                    <th className="p-[12px_24px] text-[9px] font-bold text-[var(--text3)] uppercase">Owner</th>
                    <th className="p-[12px_15px] text-[9px] font-bold text-[var(--text3)] uppercase">Date</th>
                    <th className="p-[12px_15px] text-right text-[9px] font-bold text-[var(--text3)] uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {privatePayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-[12px_24px] text-[12px] font-bold text-[var(--text)]">{p.holderName}</td>
                      <td className="p-[12px_15px] text-[11px] font-bold text-[var(--text3)]">{p.date}</td>
                      <td className="p-[12px_15px] text-right text-[13px] font-bold text-[var(--text)]">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                  {privatePayments.length === 0 && (
                    <tr><td colSpan={3} className="p-10 text-center text-[10px] font-bold text-[var(--text3)] opacity-40 uppercase">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* New Payment Modal */}
      {isAddTxModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Payment</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">New owner settlement entry</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddTxModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
              <form onSubmit={handleTxSubmit} className="space-y-10 text-left">
                <div className="space-y-4">
                  <Label required>Property owner</Label>
                  <Select
                    v2={true}
                    required
                    value={txHolder} onChange={e => setTxHolder(e.target.value)}
                    className="h-[56px] shadow-md rounded-2xl font-bold text-[15px]"
                  >
                    <option value="">Select owner profile</option>
                    {propertyHolders.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Settlement amount (₹)</Label>
                    <Input required v2={true} type="number" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="h-[56px] shadow-md rounded-2xl font-bold text-[18px] text-amber-600 font-price" />
                  </div>
                  <div className="space-y-4">
                    <Label required>Transaction date</Label>
                    <Input required v2={true} type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] tabular-nums" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label required>Settlement channel</Label>
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => setTxMode('White')}
                      className={`h-[60px] flex items-center justify-center rounded-2xl border-2 font-bold text-[12px] tracking-widest uppercase transition-none
                        ${txMode === 'White' ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-md' : 'border-[var(--border)] bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                      Bank Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxMode('Cash')}
                      className={`h-[60px] flex items-center justify-center rounded-2xl border-2 font-bold text-[12px] tracking-widest uppercase transition-none
                        ${txMode === 'Cash' ? 'border-gray-900 bg-gray-900 text-white shadow-xl' : 'border-[var(--border)] bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                      Physical Cash
                    </button>
                  </div>
                </div>

                {txMode === 'Cash' ? (
                  <div className="flex items-center gap-5 p-8 bg-gray-900 text-white rounded-[32px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                       <LockClosedIcon className="w-16 h-16" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-500 border border-white/10 shadow-sm shrink-0">
                       <LockClosedIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left relative">
                      <p className="text-[11px] font-bold tracking-[3px] uppercase text-amber-500 mb-1">Secure cash protocol</p>
                      <p className="text-[13px] font-medium text-white/60 tracking-wide uppercase">This transaction will be recorded in the authorized internal ledger.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 border border-gray-100 shadow-sm">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                      Payments are automatically matched with the main project balance.
                    </p>
                  </div>
                )}

                <div className="pt-6 flex gap-6">
                  <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsAddTxModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Commit payment</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isAddSchedModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <CalendarDaysIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Schedule step</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">New future payment obligation</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddSchedModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
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
                setIsAddSchedModalOpen(false); showToast("Payment step added");
              }} className="space-y-10 text-left">
                <div className="space-y-4">
                  <Label required>Property owner</Label>
                  <Select name="hId" required v2={true} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px]">
                    <option value="">Select owner</option>
                    {propertyHolders.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Step name</Label>
                    <Input name="name" v2={true} required placeholder="e.g. Possession Payment" className="h-[56px] shadow-md rounded-2xl font-bold text-[15px]" />
                  </div>
                  <div className="space-y-4">
                    <Label required>Projected amount (₹)</Label>
                    <Input name="amt" v2={true} required type="number" placeholder="0.00" className="h-[56px] shadow-md rounded-2xl font-bold text-[18px] text-amber-600 font-price" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Due date</Label>
                    <Input name="date" v2={true} required type="date" className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] tabular-nums" />
                  </div>
                  <div className="space-y-4">
                    <Label required>Release condition</Label>
                    <Input name="cond" v2={true} required placeholder="e.g. On Boundary Completion" className="h-[56px] shadow-md rounded-2xl font-bold text-[15px]" />
                  </div>
                </div>

                <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 border border-gray-100 shadow-sm">
                    <CalendarDaysIcon className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                    Payment steps are automatically tracked in the owner payment list.
                  </p>
                </div>

                <div className="pt-6 flex gap-6">
                  <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsAddSchedModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Save step</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <DocumentTextIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Attach receipt</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Outside document list</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsUploadModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (uploadTarget) {
                  uploadInstallmentReceipt(uploadTarget.hId, uploadTarget.iId, "#");
                  setIsUploadModalOpen(false);
                  showToast("Digital receipt successfully archived.");
                }
              }} className="space-y-10 text-left">
                <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 flex flex-col items-center justify-center bg-gray-50 shadow-inner group cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center mb-6 shadow-md border border-gray-100 text-gray-400 group-hover:text-amber-500 transition-colors">
                    <DocumentTextIcon className="w-8 h-8" />
                  </div>
                  <p className="text-[12px] font-bold text-gray-600 tracking-[2px] uppercase mb-1">Click to browse files</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase opacity-60">Max size 10MB · PDF, PNG, JPG</p>
                </div>

                <div className="pt-6 flex gap-6">
                  <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Sync document</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pin Modal */}
      {isGlobalPinModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-sm shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-gray-900 border-gray-200 bg-gray-50">
                  <LockClosedIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Security gate</h2>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Internal record verification</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsGlobalPinModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body p-10 space-y-8">
              <div className="space-y-4 text-left">
                <Label className="text-[10px] font-bold uppercase tracking-[3px] text-center block">Enter authentication pin</Label>
                <Input
                  type="password"
                  v2={true}
                  autoFocus
                  placeholder="••••"
                  maxLength={4}
                  className="h-[80px] text-center text-[32px] tracking-[24px] font-bold shadow-xl rounded-2xl border-2 border-gray-900/10 focus:border-gray-900 outline-none tabular-nums"
                  onChange={(e) => {
                    if (e.target.value === '1234') { // Mock pin
                      setIsPinUnlocked(true);
                      setIsGlobalPinModalOpen(false);
                      showToast("Access granted. Ledger unlocked.");
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-center gap-3 py-4 border-t-2 border-dashed border-gray-100">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[3px]">Allowed Personnel Only</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
