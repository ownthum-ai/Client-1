"use client";
import React, { useState, useMemo } from 'react';
import { useStore, Payment, Plot } from '@/store/useStore';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  DocumentTextIcon,
  BanknotesIcon,
  UserIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

export default function PaymentsPage() {
  const {
    payments,
    addPayment,
    plots
  } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type?: 'success' | 'warning' } | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);

  // New Payment Form State
  const [newCustomer, setNewCustomer] = useState('');
  const [newPlot, setNewPlot] = useState('');
  const [newInstallment, setNewInstallment] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newMode, setNewMode] = useState<'Bank Transfer' | 'Cheque' | 'Cash' | 'DD'>('Bank Transfer');

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentData = {
      customerName: newCustomer,
      plotId: newPlot,
      amount: Number(newAmount),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      mode: newMode,
      status: 'Complete' as const,
      receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      installmentRatio: newInstallment || 'General',
      installmentName: newInstallment || 'General',
      balanceDue: 0
    };

    addPayment(paymentData);
    setIsAddModalOpen(false);
    showToast(`Payment saved: ${formatCurrency(Number(newAmount))}`, newMode === 'Cash' ? 'warning' : 'success');
    resetForm();
  };

  const resetForm = () => {
    setNewCustomer('');
    setNewPlot('');
    setNewInstallment('');
    setNewAmount('');
    setNewMode('Bank Transfer');
  };

  const selectedPayment = payments.find(p => p.id === selectedPaymentId);
  const totalWhite = payments.filter(p => p.mode !== 'Cash').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBlack = payments.filter(p => p.mode === 'Cash').reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpectedRevenue = useMemo(() => {
    return plots
      .filter((p: Plot) => p.status === 'Booked' || p.status === 'Sold')
      .reduce((acc: number, curr: Plot) => acc + ((curr.size || 0) * (curr.rate || 0)), 0);
  }, [plots]);
  const totalOutstanding = Math.max(0, totalExpectedRevenue - (totalWhite + totalBlack));

  const receiptsCount = payments.length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Filter Logic
  const searchedPayments = payments.filter(p =>
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.plotId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
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
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Customer Payments</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5"></span>
                Live status
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tracking-tight opacity-50">Payment history and receipts</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-sm rounded-lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add payment
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            label="Bank Total"
            value={formatCurrency(totalWhite)}
            color="gold"
            trend={{ value: "Confirmed", type: "up" }}
          />
          <KPICard
            label="Pending Amount"
            value={formatCurrency(totalOutstanding)}
            color="red"
            trend={{ value: "Remaining", type: "down" }}
          />
          <KPICard
            label="Total Receipts"
            value={receiptsCount.toString()}
            color="gold"
            trend={{ value: "Total", type: "neutral" }}
          />
          <KPICard
            label="Cash Total"
            color="green"
            value={
              <div className="font-price">
                {formatCurrency(totalBlack)}
              </div>
            }
            trend={{ value: "Allowed", type: "up" }}
          />
        </div>

        {/* Bank History */}
        <Card className="p-0 overflow-hidden border-[var(--border)] shadow-sm relative text-left">
          <div className="p-6 border-b border-[var(--border)] bg-gray-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-white rounded-xl border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--gold)]">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[12px] font-bold text-[var(--text)] tracking-[1px] uppercase">Bank Payments</h2>
                  <p className="text-[10px] font-medium text-[var(--text3)] mt-0.5 opacity-60 uppercase">Payment list</p>
                </div>
              </div>
              <div className="relative w-full lg:w-80">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10" />
                <Input
                  placeholder="Search bank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11 shadow-sm rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[var(--border)]">
                  <th className="p-[15px_24px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Customer</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Plot</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Date</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Mode</th>
                  <th className="p-[15px_15px] text-right text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Amount</th>
                  <th className="p-[15px_24px] text-center text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {searchedPayments.filter(p => p.mode !== 'Cash').map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPaymentId(p.id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-[15px_24px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text3)] shadow-sm">
                          {p.customerName.charAt(0)}
                        </div>
                        <span className="text-[13px] font-bold text-[var(--text)] tracking-tight">{p.customerName}</span>
                      </div>
                    </td>
                    <td className="p-[15px_15px]">
                      <Badge variant="neutral" className="border-[var(--border)] text-[9px] font-bold tracking-wider uppercase">{p.plotId}</Badge>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[11.5px] font-bold text-[var(--text)]">{p.date}</span>
                    </td>
                    <td className="p-[15px_15px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold text-[var(--text)]">{p.mode}</span>
                        {p.receiptNumber && (
                          <span className="text-[8px] font-bold text-[var(--gold)] mt-0.5 tracking-wider uppercase">Ref: {p.receiptNumber}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-[15px_15px] text-right">
                      <span className="text-[14px] font-bold text-[var(--text)] tracking-tight">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="p-[15px_24px] text-center">
                      <Button
                        variant="secondary" size="inline"
                        onClick={(e) => { e.stopPropagation(); setViewingReceipt(p); }}
                        className="gap-2 py-1.5 shadow-sm rounded-lg bg-white border-[var(--border)] text-[9px] font-bold uppercase"
                      >
                        <DocumentTextIcon className="w-3.5 h-3.5" /> Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
                {searchedPayments.filter(p => p.mode !== 'Cash').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <BanknotesIcon className="w-12 h-12 mb-4 text-[var(--text)]" />
                        <p className="text-[11px] font-bold text-[var(--text3)] tracking-[1px] uppercase">No records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cash History */}
        <Card className="p-0 overflow-hidden border-[var(--border)] shadow-sm text-left">
          <div className="p-6 border-b border-[var(--border)] bg-gray-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-white rounded-xl border border-[var(--border)] text-green-600 flex items-center justify-center shadow-sm">
                  <LockClosedIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[12px] font-bold text-[var(--text)] tracking-[1px] uppercase">Cash Payments</h2>
                  <p className="text-[10px] font-bold text-green-600 mt-0.5 uppercase">Secure records</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto relative min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[var(--border)]">
                  <th className="p-[15px_24px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Customer</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Plot</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Date</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Mode</th>
                  <th className="p-[15px_15px] text-right text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Amount</th>
                  <th className="p-[15px_24px] text-center text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {searchedPayments.filter(p => p.mode === 'Cash').map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPaymentId(p.id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-[15px_24px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text3)] shadow-sm">
                          {p.customerName.charAt(0)}
                        </div>
                        <span className="text-[13px] font-bold text-[var(--text)] tracking-tight">{p.customerName}</span>
                      </div>
                    </td>
                    <td className="p-[15px_15px]">
                      <Badge variant="neutral" className="border-[var(--border)] text-[9px] font-bold tracking-wider uppercase">{p.plotId}</Badge>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[11.5px] font-bold text-[var(--text)]">{p.date}</span>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[11px] font-bold text-[var(--text)]">{p.mode}</span>
                    </td>
                    <td className="p-[15px_15px] text-right">
                      <span className="text-[14px] font-bold text-[var(--text)] tracking-tight">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="p-[15px_24px] text-center">
                      <span className="text-[9px] font-bold text-green-600 tracking-wider bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 uppercase">Verified</span>
                    </td>
                  </tr>
                ))}
                {searchedPayments.filter(p => p.mode === 'Cash').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <LockClosedIcon className="w-12 h-12 mb-4 text-[var(--text)]" />
                        <p className="text-[11px] font-bold text-[var(--text3)] tracking-[1px] uppercase">No records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Receipt Modal */}
      {viewingReceipt && (
        <div className="modal-overlay">
          <div className="modal-container max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="modal-header flex-shrink-0">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <DocumentTextIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Payment Record</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none truncate max-w-[200px]">ID: {viewingReceipt.receiptNumber || 'TXN-ALPHA'}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setViewingReceipt(null)}>✕</Button>
            </div>

            <div className="modal-body overflow-hidden relative bg-white space-y-10 flex-1 flex flex-col p-10">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] rotate-[-15deg] pointer-events-none select-none">
                <h1 className="text-[140px] font-bold text-gray-900">VERIFIED</h1>
              </div>

              <div className="grid grid-cols-2 gap-12 relative z-10 text-left">
                <div className="space-y-8">
                  <div className="space-y-3">
                  <Label className="text-[10px] font-bold tracking-[3px] uppercase opacity-40">Customer Name</Label>
                    <p className="text-[20px] font-bold text-gray-900 border-b-2 border-gray-50 pb-4 uppercase leading-tight">{viewingReceipt.customerName}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold tracking-[3px] uppercase opacity-40">Amount Paid</Label>
                    <p className="text-[28px] font-bold text-amber-600 border-b-2 border-gray-50 pb-4 leading-none">{formatCurrency(viewingReceipt.amount)}</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold tracking-[3px] uppercase opacity-40">Plot reference</Label>
                    <p className="text-[20px] font-bold text-gray-900 border-b-2 border-gray-50 pb-4 uppercase leading-tight">Plot {viewingReceipt.plotId}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold tracking-[3px] uppercase opacity-40">Date</Label>
                    <p className="text-[20px] font-bold text-gray-700 border-b-2 border-gray-50 pb-4 tabular-nums">{viewingReceipt.date}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-left relative z-10">
                <Label className="text-[10px] font-bold tracking-[3px] uppercase opacity-40">Installment / Type</Label>
                <p className="text-[20px] font-bold text-gray-900 border-b-2 border-gray-50 pb-4 uppercase leading-tight">
                  {viewingReceipt.installmentName || viewingReceipt.installmentRatio || 'Standard Payment'}
                </p>
              </div>

              <div className="p-8 bg-amber-50 rounded-[16px] border-2 border-dashed border-amber-100 mt-auto relative z-10">
                 <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-lg border border-amber-50">
                          <ShieldCheckIcon className="w-7 h-7" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-amber-900 uppercase tracking-[1px]">Payment verified</span>
                          <span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Checked by main payment list</span>
                       </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3 pb-2 opacity-30">
                       <div className="w-32 h-px bg-amber-900"></div>
                       <p className="text-[9px] font-bold text-amber-900 tracking-[4px] uppercase italic">Authorized signature</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="modal-footer bg-gray-50/50 border-t-2 border-gray-100 p-10 flex-shrink-0">
              <div className="flex items-center justify-between w-full gap-8">
                <div className="flex gap-6 flex-1">
                  <Button variant="primary" className="flex-1 h-[64px] rounded-[12px] shadow-xl font-bold uppercase tracking-widest bg-gray-900 text-white hover:bg-black transition-all" onClick={() => window.print()}>Approve & Print</Button>
                  <Button variant="secondary" className="flex-1 h-[64px] rounded-[12px] border-2 font-bold uppercase tracking-widest shadow-md bg-white hover:bg-gray-50 transition-all" onClick={() => showToast('Online record exported.')}>Digital Export</Button>
                </div>
                <Button variant="secondary" className="h-[64px] px-12 rounded-[12px] border-2 font-bold uppercase tracking-widest shadow-md bg-white" onClick={() => setViewingReceipt(null)}>Close Record</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Payment</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Add new payment details</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
              <form onSubmit={handleAddSubmit} className="space-y-10 text-left">
                <div className="space-y-4">
                  <Label required>Customer Name</Label>
                  <Input
                    required placeholder="Enter full name for record"
                    v2={true}
                    value={newCustomer} onChange={e => setNewCustomer(e.target.value)}
                    className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Plot ID</Label>
                    <Input
                      required placeholder="e.g. A-112"
                      v2={true}
                      value={newPlot} onChange={e => setNewPlot(e.target.value)}
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label required>Payment For</Label>
                    <Input
                      required placeholder="e.g. Booking Advancement"
                      v2={true}
                      value={newInstallment} onChange={e => setNewInstallment(e.target.value)}
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Amount (INR)</Label>
                    <Input
                      required type="number" placeholder="0.00"
                      v2={true}
                      value={newAmount} onChange={e => setNewAmount(e.target.value)}
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[18px] text-amber-600"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label required>Payment Mode</Label>
                    <Select
                      v2={true}
                      value={newMode}
                      onChange={e => setNewMode(e.target.value as any)}
                      required
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="DD">Demand Draft</option>
                    </Select>
                  </div>
                </div>

                {newMode === 'Cash' ? (
                  <div className="flex items-center gap-6 p-10 bg-gray-900 text-white rounded-[20px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                       <LockClosedIcon className="w-24 h-24" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-amber-500 border border-white/10 shadow-lg shrink-0">
                       <LockClosedIcon className="w-7 h-7" />
                    </div>
                    <div className="text-left relative">
                      <p className="text-[11px] font-bold tracking-[4px] uppercase text-amber-500 mb-2">Cash Note</p>
                      <p className="text-[14px] font-medium text-white/60 leading-relaxed uppercase tracking-wide">Cash payment will be saved for manual checking.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 p-8 bg-amber-50 rounded-[16px] border-2 border-amber-100 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-md">
                      <BanknotesIcon className="w-6 h-6" />
                    </div>
                    <p className="text-[13px] text-amber-800 font-bold leading-relaxed uppercase tracking-wide opacity-80">
                      Payments are saved to the project account.
                    </p>
                  </div>
                )}

                <div className="pt-6 flex gap-6">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 h-[60px] rounded-[12px] font-bold uppercase tracking-widest shadow-md bg-white border-2 hover:bg-gray-50 transition-all duration-300" 
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-[2] h-[60px] rounded-[12px] font-bold uppercase tracking-widest shadow-xl transition-all duration-300"
                  >
                    Approve & Save
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="modal-header flex-shrink-0">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedPayment.customerName}</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Payment Details · Plot {selectedPayment.plotId}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setSelectedPaymentId(null)}>✕</Button>
            </div>

            <div className="modal-body space-y-10 flex-1 flex flex-col p-10 overflow-y-auto">
              <div className="space-y-8 p-10 bg-gray-900 rounded-[20px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ChartBarIcon className="w-32 h-32" />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-white/40 tracking-[4px] uppercase relative">
                  <span>Payment Progress</span>
                  <span className="text-amber-500">Done: 75%</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
                  <div className="h-full bg-amber-500 rounded-full shadow-[0_0_25px_rgba(245,158,11,0.6)]" style={{ width: '75%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-12 pt-6 relative">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-[3px]">Total Paid</p>
                    <p className="text-[28px] font-bold text-white leading-none">{formatCurrency(payments.filter(p => p.customerName === selectedPayment.customerName).reduce((a, b) => a + b.amount, 0))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-[3px]">Current Payment</p>
                    <p className="text-[28px] font-bold text-amber-500 leading-none">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8 text-left">
                <h3 className="text-[12px] font-bold text-gray-900 tracking-[4px] uppercase border-b-2 border-gray-50 pb-5">Payment History</h3>

                <div className="grid grid-cols-1 gap-5">
                  {payments
                    .filter(p => p.customerName === selectedPayment.customerName && p.plotId === selectedPayment.plotId)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, idx) => (
                      <div key={idx} className="p-8 rounded-[16px] border-2 border-gray-50 bg-white shadow-sm hover:border-amber-100 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors shadow-inner">
                                <BanknotesIcon className="w-6 h-6" />
                             </div>
                             <span className="text-[15px] font-bold text-gray-400 tabular-nums uppercase tracking-[1px]">{item.date}</span>
                          </div>
                          <span className="text-[22px] font-bold text-gray-900 leading-none">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold tracking-[2px] text-gray-400 uppercase opacity-60">
                          <span className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                             {item.mode} channel
                          </span>
                          {item.receiptNumber && <span className="text-amber-600 font-bold border-b border-amber-200">Ref: REC-{item.receiptNumber}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="modal-footer bg-white border-t-2 border-gray-50 p-10 flex-shrink-0 flex gap-8">
              <Button
                variant="primary" className="flex-[2] h-[64px] rounded-[12px] shadow-xl font-bold uppercase tracking-widest bg-gray-900 text-white hover:bg-black transition-all"
                onClick={() => showToast('Payment list shared with contact.')}
              >
                Share record
              </Button>
              <Button
                variant="secondary" className="flex-1 h-[64px] rounded-[12px] border-2 font-bold uppercase tracking-widest shadow-md bg-white hover:bg-gray-50 transition-all"
                onClick={() => window.print()}
              >
                Hardcopy Print
              </Button>
              <Button
                variant="secondary" className="h-[64px] px-10 rounded-[12px] border-2 font-bold uppercase tracking-widest shadow-md bg-white"
                onClick={() => setSelectedPaymentId(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
