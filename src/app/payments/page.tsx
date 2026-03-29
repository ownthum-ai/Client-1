"use client";
import React, { useState, useMemo } from 'react';
import { useStore, Payment } from '@/store/useStore';
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
  CubeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { ProfessionalReceipt } from '@/components/ProfessionalReceipt';

export default function PaymentsPage() {
  const { payments, propertyHolders, addPayment, layouts, isPinUnlocked, setPinUnlocked } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
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
      installmentName: newInstallment,
      amount: Number(newAmount),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      mode: newMode,
      status: 'Complete' as const,
      receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      installmentRatio: '0/0',
      balanceDue: 0
    };

    addPayment(paymentData);
    setIsAddModalOpen(false);
    showToast(`Payment Recorded: ${formatCurrency(Number(newAmount))}`, newMode === 'Cash' ? 'warning' : 'success');
    resetForm();
  };

  const resetForm = () => {
    setNewCustomer('');
    setNewPlot('');
    setNewInstallment('');
    setNewAmount('');
    setNewMode('Bank Transfer');
  };

  const handlePinClick = (val: string | number) => {
    if (val === 'X') {
      setPinInput("");
    } else if (val === 'OK') {
      if (pinInput === '1234') {
        setPinUnlocked(true);
        setIsPinModalOpen(false);
        setPinInput("");
        showToast("Security Vault Decrypted");
      } else {
        setPinInput("");
        alert("Invalid Authorization Key");
      }
    } else {
      const newPin = pinInput + val;
      if (newPin.length <= 4) {
        setPinInput(newPin);
        if (newPin.length === 4) {
          setTimeout(() => {
            if (newPin === '1234') {
              setPinUnlocked(true);
              setIsPinModalOpen(false);
              setPinInput("");
              showToast("Security Vault Decrypted");
            } else {
              setPinInput("");
              alert("Invalid Authorization Key");
            }
          }, 100);
        }
      }
    }
  };

  const selectedPayment = payments.find(p => p.id === selectedPaymentId);
  const totalWhite = payments.filter(p => p.mode !== 'Cash').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBlack = payments.filter(p => p.mode === 'Cash').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutstanding = 12500000; // Mock target
  const receiptsCount = payments.length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Filter Logic
  const searchedPayments = payments.filter(p =>
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.plotId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 ${toast.type === 'warning' ? 'bg-[var(--sb)]' : 'bg-[var(--sb)]'}`}>
            <div className={`w-2 h-2 rounded-full ${toast.type === 'warning' ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--gold)]'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[2.5px] whitespace-nowrap">{toast.message}</span>
          </div>
        )}

        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Customer Payments</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Private ledger vault and institutional transaction registry</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              variant={isPinUnlocked ? "secondary" : "secondary"}
              size="default"
              onClick={isPinUnlocked ? () => setPinUnlocked(false) : () => setIsPinModalOpen(true)}
              className="min-w-[140px]"
            >
              {isPinUnlocked ? <LockOpenIcon className="w-4 h-4 mr-2" /> : <LockClosedIcon className="w-4 h-4 mr-2" />}
              {isPinUnlocked ? 'LOCK VAULT' : 'ACCESS VAULT'}
            </Button>
            <Button
              v2={true}
              size="default"
              className="px-8"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Analytics Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          <KPICard
            label="WHITE TOTAL"
            value={formatCurrency(totalWhite)}
            color="gold"
            trend={{ value: "Confirmed Bank", type: "up" }}
          />
          <KPICard
            label="OUTSTANDING"
            value={formatCurrency(totalOutstanding)}
            color="red"
            trend={{ value: "Requires Audit", type: "down" }}
          />
          <KPICard
            label="RECEIPTS"
            value={receiptsCount.toString()}
            color="gold"
            trend={{ value: "Protocol Logs", type: "neutral" }}
          />
          <KPICard
            label="PRIVATE FLOW"
            color={isPinUnlocked ? "green" : "gold"}
            value={
              <div className={`transition-all duration-700 font-price ${isPinUnlocked ? 'blur-0 opacity-100' : 'blur-md opacity-20'}`}>
                {formatCurrency(totalBlack)}
              </div>
            }
            trend={isPinUnlocked ? { value: "Decrypted", type: "up" } : "Locked Entity"}
          />
        </div>

        {/* Institutional Audit Ledger (White Money) */}
        <Card className="p-0 overflow-hidden border-[var(--gold)]/20 shadow-[0_15px_40px_rgba(200,151,58,0.08)] relative">
          <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--gold)]/5 to-transparent">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl border border-[var(--gold)] shadow-sm flex items-center justify-center text-[var(--gold)]">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[2px]">Institutional Audit Ledger</h2>
                  <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] mt-0.5 opacity-60">Audit-ready documentation and bank-verified records (White Money)</p>
                </div>
              </div>
              <div className="relative group w-full lg:w-80">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10" />
                <Input
                  placeholder="Search institutional archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <th className="p-[15px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Client Registry</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Plot node</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Timestamp</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Financial mode</th>
                  <th className="p-[15px_15px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Monetary Value</th>
                  <th className="p-[15px_24px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {searchedPayments.filter(p => p.mode !== 'Cash').map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPaymentId(p.id)}
                    className="group transition-all hover:bg-[var(--bg)] cursor-pointer"
                  >
                    <td className="p-[15px_24px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text3)] group-hover:bg-[var(--gold)] group-hover:text-white group-hover:border-[var(--gold)] transition-all">
                          {p.customerName.charAt(0)}
                        </div>
                        <span className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight group-hover:text-[var(--gold)] transition-colors">{p.customerName}</span>
                      </div>
                    </td>
                    <td className="p-[15px_15px]">
                      <Badge variant="neutral" className="border-[var(--border)] text-[9px] font-black uppercase tracking-wider">{p.plotId}</Badge>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[11.5px] font-bold text-[var(--text)] uppercase tracking-[0.5px]">{p.date}</span>
                    </td>
                    <td className="p-[15px_15px]">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-[0.5px]">{p.mode}</span>
                        {p.receiptNumber && (
                          <span className="text-[8px] font-bold text-[var(--gold)] uppercase mt-0.5 tracking-wider">Ref: {p.receiptNumber}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-[15px_15px] text-right">
                      <span className="text-[14px] font-bold text-[var(--text)] font-price tracking-tight">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="p-[15px_24px] text-center">
                      <Button
                        variant="secondary" size="inline"
                        onClick={(e) => { e.stopPropagation(); setViewingReceipt(p); }}
                        className="group-hover:bg-[var(--gold)] group-hover:text-white group-hover:border-[var(--gold)] gap-2 py-1.5"
                      >
                        <DocumentTextIcon className="w-3.5 h-3.5" /> Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
                {searchedPayments.filter(p => p.mode !== 'Cash').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30 grayscale">
                        <BanknotesIcon className="w-12 h-12 mb-4 text-[var(--text)]" />
                        <p className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-[2px]">No Institutional Records Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Private Security Ledger (Black Money) */}
        <Card className={`p-0 overflow-hidden border-[var(--sb)]/20 shadow-[0_15px_40px_rgba(17,17,16,0.08)] transition-all duration-700 ${!isPinUnlocked ? 'opacity-60 grayscale-[0.5]' : 'opacity-100 grayscale-0'}`}>
          <div className={`p-6 border-b border-[var(--border)] bg-gradient-to-r ${!isPinUnlocked ? 'from-[var(--sb)]/5' : 'from-[var(--green)]/5'} to-transparent transition-all duration-700`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-white rounded-xl border flex items-center justify-center transition-all duration-700 shadow-sm
                          ${!isPinUnlocked ? 'border-[var(--sb)] text-[var(--sb)]' : 'border-[var(--green)] text-[var(--green)]'}`}>
                  {isPinUnlocked ? <LockOpenIcon className="w-6 h-6" /> : <LockClosedIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[2px]">Private Security Ledger</h2>
                  <p className={`text-[10px] font-bold uppercase tracking-[1px] mt-0.5 transition-all duration-700
                            ${!isPinUnlocked ? 'text-[var(--text3)] opacity-60' : 'text-[var(--green)]'}`}>
                    {isPinUnlocked ? 'Secure Cash Flow Registry De-blanked' : 'Locked Private Flow Records (Black Money)'}
                  </p>
                </div>
              </div>
              {!isPinUnlocked && (
                <Button
                  v2={true}
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPinModalOpen(true)}
                  className="bg-[var(--sb)] text-white hover:bg-[var(--sb)]/90 border-transparent h-10 px-6"
                >
                  Unlock Private Ledger
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto relative min-h-[300px]">
            {!isPinUnlocked && (
              <div className="absolute inset-0 z-10 backdrop-blur-[12px] bg-white/40 flex flex-col items-center justify-center p-12 text-center select-none"
                onClick={() => setIsPinModalOpen(true)}>
                <div className="w-16 h-16 bg-white rounded-[24px] shadow-2xl flex items-center justify-center text-[var(--sb)] mb-6 border border-gray-100 group-hover:scale-110 transition-transform">
                  <LockClosedIcon className="w-8 h-8" />
                </div>
                <h3 className="text-[16px] font-black text-[var(--text)] uppercase tracking-[4px] mb-2">Vault Locked</h3>
                <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] max-w-xs leading-loose">Internal monetary registry is currently encrypted. Authorization node required to decrypt visual data.</p>
                <div className="mt-8 px-8 py-3 bg-[var(--sb)] text-white text-[10px] font-black uppercase tracking-[3px] rounded-2xl shadow-xl shadow-slate-900/10 cursor-pointer hover:bg-black transition-all">
                  Enter Protocol PIN
                </div>
              </div>
            )}

            <table className={`w-full text-left border-collapse transition-all duration-1000 ${!isPinUnlocked ? 'blur-2xl opacity-10 select-none' : 'blur-0 opacity-100'}`}>
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <th className="p-[15px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Client Registry</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Plot node</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Timestamp</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Financial mode</th>
                  <th className="p-[15px_15px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Private Value</th>
                  <th className="p-[15px_24px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {searchedPayments.filter(p => p.mode === 'Cash').map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPaymentId(p.id)}
                    className="group transition-all hover:bg-[var(--bg)] cursor-pointer"
                  >
                    <td className="p-[15px_24px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text3)] group-hover:bg-[var(--sb)] group-hover:text-white group-hover:border-[var(--sb)] transition-all">
                          {p.customerName.charAt(0)}
                        </div>
                        <span className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight group-hover:text-[var(--sb)] transition-colors">{p.customerName}</span>
                      </div>
                    </td>
                    <td className="p-[15px_15px]">
                      <Badge variant="neutral" className="border-[var(--border)] text-[9px] font-black uppercase tracking-wider">{p.plotId}</Badge>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[11.5px] font-bold text-[var(--text)] uppercase tracking-[0.5px]">{p.date}</span>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-[0.5px]">{p.mode}</span>
                    </td>
                    <td className="p-[15px_15px] text-right">
                      <span className="text-[14px] font-bold text-[var(--text)] font-price tracking-tight">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="p-[15px_24px] text-center">
                      <span className="text-[9px] font-black text-[var(--sb)] uppercase tracking-wider bg-[var(--bg)] px-3 py-1.5 rounded-lg border border-[var(--border)] group-hover:border-[var(--sb)] transition-all">Protected</span>
                    </td>
                  </tr>
                ))}
                {searchedPayments.filter(p => p.mode === 'Cash').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30 grayscale">
                        <LockOpenIcon className="w-12 h-12 mb-4 text-[var(--text)]" />
                        <p className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-[2px]">No Private Flow Records Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modals outside the animated container avoid the 'containing block' trap */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 text-center">
            <h2 className="text-[20px] font-black text-gray-900 tracking-tight leading-tight uppercase mb-1">Vault Registry</h2>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-8">Authorization required for private ledger</p>

            <div className="flex justify-center gap-3 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-300
                    ${pinInput.length > i ? 'bg-[var(--gold)] border-[var(--gold)] text-white shadow-[0_10px_20px_rgba(200,151,58,0.2)]' : 'bg-gray-50 border-gray-100 text-gray-300'}`}
                >
                  {pinInput.length > i ? '•' : ''}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'X', '0', 'OK'].map((k, i) => (
                <div
                  key={i}
                  onClick={() => handlePinClick(k)}
                  className={`flex items-center justify-center p-4 rounded-2xl border border-gray-100 bg-gray-50/50 cursor-pointer text-[18px] font-bold transition-all hover:bg-[var(--gold)] hover:text-white hover:border-[var(--gold)] active:scale-90 select-none
                    ${k === 'X' || k === 'OK' ? 'text-[12px] text-[var(--gold)] bg-white' : 'text-gray-900 bg-white'}`}
                >
                  {k === 'X' ? 'Clear' : k === 'OK' ? 'Enter' : k}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setIsPinModalOpen(false); setPinInput(""); }}
              className="mt-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              Abort Protocol
            </button>
          </div>
        </div>
      )}

      {viewingReceipt && (
        <div className="fixed inset-0 z-[400] bg-[rgba(17,17,16,0.5)] backdrop-blur-[6px] flex items-center justify-center p-4">
          <Card
            className="w-full max-w-2xl !mb-0 shadow-[var(--sh-lg)] overflow-hidden print:shadow-none print:border-none"
            title="Official Transaction Receipt"
            subtitle={`Node Identifier: #${viewingReceipt.receiptNumber || 'N/A'}`}
            actions={<Button variant="secondary" size="inline" onClick={() => setViewingReceipt(null)}>✕</Button>}
          >
            <div className="p-8 space-y-8 bg-white relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-15deg] pointer-events-none select-none">
                <h1 className="text-[120px] font-bold text-[var(--text)]">OFFICIAL</h1>
              </div>

              <div className="grid grid-cols-2 gap-12 relative z-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px] block mb-1">Received From</label>
                    <p className="text-[15px] font-bold text-[var(--text)] uppercase border-b border-[var(--border)] pb-2">{viewingReceipt.customerName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px] block mb-1">Monetary Sum</label>
                    <p className="text-[20px] font-bold text-[var(--text)] uppercase border-b border-[var(--border)] pb-2 leading-none font-price">{formatCurrency(viewingReceipt.amount)}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px] block mb-1">Plot Identification</label>
                    <p className="text-[15px] font-bold text-[var(--text)] uppercase border-b border-[var(--border)] pb-2">{viewingReceipt.plotId}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px] block mb-1">Timestamp</label>
                    <p className="text-[13px] font-bold text-[var(--text2)] uppercase border-b border-[var(--border)] pb-2">{viewingReceipt.date}</p>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex justify-between items-end gap-10">
                <div className="w-20 h-20 bg-[var(--bg)] border border-[var(--border)] rounded-2xl flex items-center justify-center p-2">
                  <div className="text-[7px] font-bold text-[var(--text3)] uppercase text-center leading-tight tracking-[1px] opacity-40">SYSTEM<br />VALIDATED<br />STAMP</div>
                </div>
                <div className="text-right flex flex-col items-end gap-2 shrink-0 pb-1">
                  <div className="w-32 border-b-2 border-[var(--text)] opacity-10"></div>
                  <p className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[2px]">Authorized Ledger</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between gap-3 print:hidden">
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => window.print()}>Print Receipt</Button>
                <Button variant="secondary" size="sm" onClick={() => alert('Secure cloud backup initiated.')}>Archive PDF</Button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setViewingReceipt(null)}>Dismiss</Button>
            </div>
          </Card>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[400] bg-[rgba(17,17,16,0.5)] backdrop-blur-[8px] flex items-center justify-center p-4">
          <Card className="w-full max-w-xl !mb-0 shadow-[var(--sh-lg)] overflow-hidden rounded-[32px] border-none">
            <div className="p-8 border-b border-[var(--border)]/50 relative">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-8 right-8 w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text3)] hover:text-[var(--text)] transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
              <h2 className="text-[26px] font-serif text-[var(--text)] uppercase tracking-tight leading-none mb-2">Monetary Entry Registry</h2>
              <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2.5px] opacity-70">RECORD DUAL-MODE CUSTOMER INSTALLMENT</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label required>Customer Identification</Label>
                  <Input
                    required placeholder="SEARCH ENTITY NAME"
                    v2={true}
                    value={newCustomer} onChange={e => setNewCustomer(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label required>Plot Identifier</Label>
                    <Input
                      required placeholder="e.g. A-12"
                      v2={true}
                      value={newPlot} onChange={e => setNewPlot(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Installment Node</Label>
                    <Input
                      required placeholder="e.g. 2nd of 5"
                      v2={true}
                      value={newInstallment} onChange={e => setNewInstallment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label required>Value (₹)</Label>
                    <Input
                      required type="number" placeholder="00,00,000"
                      v2={true}
                      value={newAmount} onChange={e => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Transaction Mode</Label>
                    <Select
                      v2={true}
                      value={newMode}
                      onChange={e => setNewMode(e.target.value as any)}
                      required
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque Instrument</option>
                      <option value="Cash">Cash Flow</option>
                      <option value="DD">Demand Draft</option>
                    </Select>
                  </div>
                </div>

                {newMode === 'Cash' && (
                  <div className="p-5 bg-[var(--sb)] text-white rounded-2xl flex gap-4 animate-in slide-in-from-top-2 duration-300">
                    <LockClosedIcon className="w-5 h-5 text-[var(--gold)] shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[1px]">Fast Private Entry Node</p>
                      <p className="text-[9px] font-bold text-white/60 uppercase mt-1 leading-tight tracking-[0.5px]">Cash flow is recorded into the Private Security Ledger and remains encrypted until authorized.</p>
                    </div>
                  </div>
                )}

                <div className="pt-6 flex gap-4">
                  <Button type="button" variant="secondary" className="flex-1 h-12" onClick={() => setIsAddModalOpen(false)}>Discard Registry</Button>
                  <Button type="submit" variant="primary" className="flex-[1.5] h-12 shadow-lg shadow-[var(--gold)]/20">Commit Registry</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* History Detail Panel */}
      <div className={`fixed top-0 right-0 h-screen w-[480px] bg-white shadow-[var(--sh-lg)] z-[250] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-[var(--border)] flex flex-col ${selectedPaymentId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedPayment ? (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--sb)] rounded-xl flex items-center justify-center text-white shadow-lg">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[var(--text)] uppercase tracking-[1px]">{selectedPayment.customerName}</h2>
                  <p className="text-[10.5px] text-[var(--text3)] font-medium uppercase tracking-[1px] mt-0.5">Plot Registry Node: {selectedPayment.plotId}</p>
                </div>
              </div>
              <Button variant="secondary" size="inline" onClick={() => setSelectedPaymentId(null)}>✕ Close</Button>
            </div>

            <div className="space-y-10">
              {/* Financial Progression */}
              <div className="space-y-4 p-6 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                <div className="flex justify-between text-[11px] font-bold text-[var(--text)] uppercase tracking-[1px]">
                  <span>Monetary Deployment</span>
                  <span className="text-[var(--gold)]">75%</span>
                </div>
                <div className="h-2.5 bg-white border border-[var(--border)] rounded-full overflow-hidden leading-none relative">
                  <div className="h-full bg-[var(--gold)] rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-[var(--text3)] uppercase mb-1 opacity-60">Allocated</p>
                    <p className="text-[15px] font-bold text-[var(--text)] uppercase font-price">{formatCurrency(payments.filter(p => p.customerName === selectedPayment.customerName).reduce((a, b) => a + b.amount, 0))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-[var(--text3)] uppercase mb-1 opacity-60">Last Deposit</p>
                    <p className="text-[15px] font-bold text-[var(--text2)] uppercase font-price">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Overview */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <h3 className="text-[11px] font-bold text-[var(--text)] uppercase tracking-[1px]">Installment Timeline</h3>
                  <ChartBarIcon className="w-5 h-5 text-[var(--text3)]" />
                </div>

                <div className="relative space-y-6 pl-5 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-0 before:w-[2px] before:bg-[var(--border)]">
                  {payments
                    .filter(p => p.customerName === selectedPayment.customerName && p.plotId === selectedPayment.plotId)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center
                                ${item.mode === 'Cash' ? 'bg-[var(--sb)]' : 'bg-[var(--gold)]'}`}>
                        </div>
                        <div className={`p-5 rounded-2xl border transition-all group-hover:shadow-[var(--sh-md)]
                              ${item.mode === 'Cash' && !isPinUnlocked ? 'blur-sm bg-[var(--bg)] border-transparent opacity-60' : 'bg-white border-[var(--border)]'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-[0.5px]">{item.date}</span>
                            <span className="text-[13px] font-bold text-[var(--text)] font-price">{formatCurrency(item.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[1px] text-[var(--text3)] opacity-60">
                            <span className="flex items-center gap-1.5">
                              {item.mode === 'Cash' ? '🔒 PRIVATE SOURCE' : '🏦 LEDGER SYNC'}
                            </span>
                            {item.receiptNumber && <span className="text-[var(--gold)] underline">{item.receiptNumber}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-[var(--border)] flex gap-3">
              <Button
                variant="primary" size="default" className="flex-1 !py-4 shadow-xl"
                onClick={() => { alert('Sharing payment summary via WhatsApp Secure API...'); }}
              >
                Share Protocol
              </Button>
              <Button
                variant="secondary" className="w-14 !p-0 flex items-center justify-center"
                onClick={() => window.print()}
              >
                🖨️
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 grayscale">
            <BanknotesIcon className="w-24 h-24 mb-6 text-[var(--text)]" />
            <h3 className="text-[15px] font-bold text-[var(--text)] uppercase tracking-[3px]">Financial Audit</h3>
            <p className="text-[12px] text-[var(--text3)] mt-3 leading-relaxed font-medium">Select a transaction entry to visualize installment trajectory and progression metrics.</p>
          </div>
        )}
      </div>
    </>
  );
}
