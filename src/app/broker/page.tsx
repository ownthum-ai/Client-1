"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  MegaphoneIcon,
  PlusIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  UserIcon,
  SignalIcon,
  IdentificationIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export default function BrokersPage() {
  const { brokers, addBroker, updateBrokerStatus, markCommissionPaid, weekendPosts, logWeekendPost } = useStore();
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // New Broker Form State
  const [newName, setNewName] = useState('');
  const [newFirm, setNewFirm] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newRate, setNewRate] = useState('1.5%');

  const selectedBroker = useMemo(() => brokers.find(b => b.id === selectedBrokerId), [brokers, selectedBrokerId]);
  const lastPost = weekendPosts[0];

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBroker({
      name: newName,
      firm: newFirm,
      phone: newPhone,
      area: newArea,
      commissionRate: newRate
    });
    setIsModalOpen(false);
    setNewName(''); setNewFirm(''); setNewPhone(''); setNewArea(''); setNewRate('1.5%');
    showToast("Partner authorized.");
  };

  const handleSendWeekendPost = () => {
    logWeekendPost({
      title: 'Partner Exclusive: Sunrise Greens Update',
      type: 'Static',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800'
    });
    setIsPostModalOpen(false);
    showToast("Broadcast dispatched.");
  };

  const initiateCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const initiateWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}`, '_blank');
  };

  // Metrics
  const activeCount = brokers.filter(b => b.status === 'Active').length;
  const totalLeads = brokers.reduce((acc, curr) => acc + curr.leadsSent, 0);
  const totalEarned = brokers.reduce((acc, curr) => acc + curr.totalCommissionEarned, 0);
  const totalPending = brokers.reduce((acc, curr) => acc + curr.pendingCommission, 0);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Broker Management</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Channel partner network, referrals and commission tracking</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-lg shadow-black/10 rounded-lg"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Broker Entry
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            label="ACTIVE PARTNERS"
            value={activeCount}
            trend={{ value: "Institutional", type: "neutral" }}
          />
          <KPICard
            label="LEADS RECEIVED"
            value={totalLeads}
            trend={{ value: "Total Input", type: "up" }}
          />
          <KPICard
            label="TOTAL EARNINGS"
            value={formatCurrency(totalEarned)}
            trend={{ value: "Settled", type: "up" }}
          />
          <KPICard
            label="PENDING PAYOUT"
            value={formatCurrency(totalPending)}
            trend={{ value: totalPending > 0 ? "ACTION REQ" : "CLEARED", type: totalPending > 0 ? "down" : "up" }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--section-gap)]">
          {/* Main List Container */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-0 overflow-hidden min-h-[600px]">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                  <h2 className="text-[12px] font-bold text-[var(--text)] uppercase tracking-[2px]">Institutional Partner Registry</h2>
                  <p className="text-[10px] font-medium text-[var(--text3)] uppercase tracking-[1px] mt-1 opacity-60">Ahmedabad Zonal Operations</p>
                </div>
                <Badge variant="neutral">SYNC: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Partner Identity</th>
                      <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Zonal Rate</th>
                      <th className="p-[12px_15px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Yield</th>
                      <th className="p-[12px_15px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Earnings</th>
                      <th className="p-[12px_24px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {brokers.map(b => (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBrokerId(b.id)}
                        className="group hover:bg-[var(--bg)] transition-all cursor-pointer"
                      >
                        <td className="p-[12px_24px]">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-all flex items-center justify-center text-[13px] font-black leading-none">
                              {b.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-[var(--text)] tracking-tight leading-none uppercase group-hover:text-[var(--gold)] transition-colors mb-1">{b.name}</span>
                              <span className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[1px] opacity-40 leading-none">{b.firm}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-[12px_15px]">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-[var(--text2)] uppercase tracking-tight leading-none">{b.area}</span>
                            <span className="text-[9px] font-bold text-[var(--gold)] uppercase tracking-widest mt-1 opacity-60">{b.commissionRate} Node</span>
                          </div>
                        </td>
                        <td className="p-[12px_15px] text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[13px] font-bold text-[var(--text)] tracking-tight">{b.conversions} / {b.leadsSent}</span>
                            <span className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] mt-1 opacity-40">CONV.</span>
                          </div>
                        </td>
                        <td className="p-[12px_15px] text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-[14px] font-bold text-[var(--green)] tracking-tight leading-none font-price">{formatCurrency(b.totalCommissionEarned)}</span>
                            <span className="text-[9px] font-bold text-[var(--red)] uppercase tracking-tighter mt-1 opacity-60 font-price">DUE: {formatCurrency(b.pendingCommission)}</span>
                          </div>
                        </td>
                        <td className="p-[12px_24px] text-right">
                          <Badge variant={b.status === 'Active' ? 'success' : 'neutral'}>
                            {b.status.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Action Widgets */}
          <div className="space-y-10">
            {/* Weekend Broadcast Widget */}
            <Card className="p-10 bg-[var(--sb)] relative overflow-hidden group text-left border-none shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform text-white">
                <MegaphoneIcon className="w-20 h-20" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[4px] mb-2 leading-none">Administrative Node</p>
              <h3 className="text-[20px] font-bold text-white tracking-tight uppercase leading-none mb-10">Engagement Automation</h3>

              <div className="space-y-6 mb-12 relative z-10">
                <div className="bg-white/5 p-5 rounded-[24px] border border-white/10 flex justify-between items-center group-hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[3px] mb-1.5 leading-none">Last Transmission</p>
                    <p className="text-[12px] font-bold text-white uppercase tracking-wider leading-none">{lastPost?.date || 'SYS-IDLE'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[3px] mb-1.5 leading-none">Status</p>
                    <p className="text-[12px] font-bold text-[var(--gold)] uppercase tracking-wider leading-none">{lastPost?.status || 'READY'}</p>
                  </div>
                </div>
                <div className="p-6 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-[28px]">
                  <p className="text-[11px] font-medium text-[var(--gold)] leading-relaxed uppercase tracking-widest opacity-80">
                    &quot;Partner Exclusive: Sunrise Greens site update. New yields approaching.&quot;
                  </p>
                </div>
              </div>

              <Button
                variant="primary" className="w-full !py-6 !rounded-[24px] tracking-[3px] gap-2 shadow-lg shadow-black/20"
                onClick={() => setIsPostModalOpen(true)}
              >
                Finalize Dispatch <PaperAirplaneIcon className="w-5 h-5 shadow-sm" />
              </Button>
            </Card>

            {/* Network Health Widget */}
            <Card className="p-10 text-left">
              <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[4px] mb-10 leading-none opacity-50">Network Health Node</h3>
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-[2px] leading-none">
                    <span className="text-[var(--text2)]">Referral Priority</span>
                    <span className="text-[var(--gold)]">
                      {totalLeads > 0 ? (totalEarned > 0 ? 'High Node' : 'Emerging') : 'SYS-IDLE'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg)] rounded-full border border-[var(--border)] overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[var(--gold)] rounded-full transition-all duration-1000"
                      style={{ width: `${totalLeads > 0 ? Math.min(100, Math.round((brokers.reduce((acc, b) => acc + b.conversions, 0) / totalLeads) * 100 * 5)) : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-[2px] leading-none">
                    <span className="text-[var(--text2)]">Global Engagement</span>
                    <span className="text-[var(--green)]">
                      {brokers.length > 0 ? Math.round((activeCount / brokers.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg)] rounded-full border border-[var(--border)] overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[var(--green)] rounded-full transition-all duration-1000"
                      style={{ width: `${brokers.length > 0 ? (activeCount / brokers.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed elements outside the animated container to avoid the 'contained' trap */}
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--sb)] text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-[var(--gold)]"></div>
          <span className="text-[10px] font-bold uppercase tracking-[2.5px] whitespace-nowrap">{toast.message}</span>
        </div>
      )}

      {/* Partner Profile Modal */}
      {selectedBroker && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                  <IdentificationIcon className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-2">{selectedBroker.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/10 uppercase tracking-widest leading-none">
                      {selectedBroker.status.toUpperCase()} NODE
                    </span>
                    <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[2px] opacity-80 leading-none">ID: {selectedBroker.id.substring(0, 8)}</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setSelectedBrokerId(null)}>✕</Button>
            </div>

            <div className="modal-body space-y-8">
              {/* Action Blueprint */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  v2={true}
                  variant="secondary"
                  className="h-14 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px] gap-3 bg-[var(--gold-lt)]/30 transition-all hover:bg-[var(--gold-lt)]/50"
                  onClick={() => initiateCall(selectedBroker.phone)}
                >
                  <PhoneIcon className="w-4 h-4" /> Initiate Voice
                </Button>
                <Button
                  v2={true}
                  variant="secondary"
                  className="h-14 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px] gap-3 bg-[#e8fbf0]/30 text-[#10b981] transition-all hover:bg-[#e8fbf0]/50"
                  onClick={() => initiateWhatsApp(selectedBroker.phone)}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" /> WhatsApp Sync
                </Button>
              </div>

              {/* Performance Analytics Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Yield Index', value: `${selectedBroker.leadsSent > 0 ? Math.round((selectedBroker.conversions / selectedBroker.leadsSent) * 100) : 0}%`, sub: 'Efficiency' },
                  { label: 'Life Leads', value: selectedBroker.leadsSent, sub: 'Total Input' },
                  { label: 'Commission', value: selectedBroker.commissionRate, sub: 'Node Rate' },
                ].map((stat, idx) => (
                  <div key={idx} className="p-6 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all text-center">
                    <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[1px] mb-2 opacity-50">{stat.label}</p>
                    <p className="text-[18px] font-black text-[var(--text)] tracking-tighter tabular-nums leading-none">{stat.value}</p>
                    <p className="text-[8px] font-bold text-[var(--gold)] uppercase tracking-[1px] mt-2 opacity-40">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Commission Settlement Timeline */}
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <h3 className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[2px] flex items-center gap-2">
                    <ClipboardDocumentIcon className="w-4 h-4 opacity-50" />
                    Settlement Ledger
                  </h3>
                  <Badge variant="neutral" className="font-black px-3 py-1 text-[9px] border-none shadow-sm text-[var(--gold)] bg-[var(--gold-lt)]/20">
                    {formatCurrency(selectedBroker.pendingCommission)} PENDING
                  </Badge>
                </div>

                <div className="space-y-4 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-[var(--border)]">
                  {selectedBroker.commissions.length > 0 ? (
                    selectedBroker.commissions.map((c, idx) => (
                      <div key={c.id} className="relative pl-10 group">
                        <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
                                              ${c.status === 'Paid' ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`}>
                          <CheckCircleIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-all shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div className="text-left">
                              <span className="text-[11px] font-black text-[var(--text)] uppercase tracking-[0.5px] block">{c.plotNumber} · {c.customerName}</span>
                              <span className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] opacity-40 mt-1 block">{c.date}</span>
                            </div>
                            <span className={`text-[14px] font-black tracking-tight font-price ${c.status === 'Paid' ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{formatCurrency(c.amount)}</span>
                          </div>

                          {c.status === 'Due' && (
                            <Button
                              v2={true}
                              className="w-full h-10 rounded-lg text-[9px] font-bold uppercase tracking-[2px] shadow-[var(--gold)]/10"
                              onClick={() => { markCommissionPaid(selectedBroker.id, c.id); showToast("Brokerage settled."); }}
                            >
                              Authorize Settlement
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center opacity-30 select-none">
                      <p className="text-[10px] font-bold uppercase tracking-[2px]">No active commission records found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Registry Details */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[2px] border-b border-[var(--border)] pb-3 flex items-center gap-2 opacity-60">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Security Matrix
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all">
                    <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] mb-2 opacity-50">Authorized Comm.</p>
                    <p className="text-[13px] font-bold text-[var(--text)] tabular-nums">{selectedBroker.phone}</p>
                  </div>
                  <div className="p-5 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all">
                    <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] mb-2 opacity-50">Zonal Territory</p>
                    <p className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight">{selectedBroker.area}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer flex flex-col gap-3">
              <Button
                v2={true}
                className="w-full h-14 rounded-xl shadow-lg shadow-gold-500/10 text-[10px] font-bold uppercase tracking-[3px] gap-3"
                onClick={() => window.print()}
              >
                Export Registry Audit <ArrowDownTrayIcon className="w-5 h-5" />
              </Button>
              <Button
                v2={true}
                variant="secondary"
                className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px]"
                onClick={() => { updateBrokerStatus(selectedBroker.id, selectedBroker.status === 'Active' ? 'Inactive' : 'Active'); setSelectedBrokerId(null); showToast("Status overridden."); }}
              >
                {selectedBroker.status === 'Active' ? 'Terminate Node' : 'Initialize Node'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Onboarding Protocol */}
      {isModalOpen && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Partner Onboarding</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Authorize new channel partner node</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-body space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Entity Name</label>
                    <Input required v2={true} value={newName} onChange={e => setNewName(e.target.value)} type="text" placeholder="IDENTITY KEY" className="h-12 text-[12px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Firm / Agency</label>
                    <Input v2={true} value={newFirm} onChange={e => setNewFirm(e.target.value)} type="text" placeholder="INSTITUTIONAL NAME" className="h-12 text-[12px]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Authorized WhatsApp</label>
                    <Input required v2={true} value={newPhone} onChange={e => setNewPhone(e.target.value)} type="tel" placeholder="+91 XXXX XXXX" className="h-12 text-[12px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Yield Rate</label>
                    <Input required v2={true} value={newRate} onChange={e => setNewRate(e.target.value)} type="text" placeholder="E.G. 1.5%" className="h-12 text-[12px]" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Zonal Operations</label>
                <Input required v2={true} value={newArea} onChange={e => setNewArea(e.target.value)} type="text" placeholder="GEO-ZONING DATA" className="h-12 text-[12px]" />
              </div>

              <div className="flex items-center gap-4 p-5 bg-[var(--bg)]/50 rounded-xl border border-dashed border-[var(--border)]">
                <div className="w-9 h-9 shrink-0 rounded-full bg-white flex items-center justify-center text-[var(--gold)] border border-[var(--border)] shadow-sm">
                  <ShieldCheckIcon className="w-4.5 h-4.5" />
                </div>
                <p className="text-[10px] text-[var(--text3)] font-bold italic leading-relaxed uppercase tracking-[1.5px] opacity-60">
                  Partner authorization requires valid institutional credentials and zonal territory clearance before node initialization.
                </p>
              </div>

              <div className="pt-2 flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  v2={true}
                  className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px] bg-white shadow-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button
                  type="submit"
                  v2={true}
                  className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px]"
                >
                  Commit Registry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Confirmation Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                  <MegaphoneIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">Initialize Broadcast</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] mt-1 opacity-60">Mass communication protocol node</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsPostModalOpen(false)}>✕</Button>
            </div>

            <div className="p-8 space-y-8 text-left">
              <div className="p-8 bg-[var(--gold)]/5 rounded-xl border border-[var(--border)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--gold)]/10 rounded-bl-full blur-xl"></div>
                <p className="text-[9px] font-black text-[var(--gold)] uppercase tracking-[3px] mb-6 flex items-center gap-2">
                  <SignalIcon className="w-4 h-4" /> Finalized Transmission
                </p>
                <p className="text-[14px] font-bold text-[var(--text)] leading-relaxed uppercase italic opacity-80 border-l-2 border-[var(--gold)]/30 pl-4">
                  &quot;Partner Exclusive: Sunrise Greens site update. New yields approaching. Access authorized.&quot;
                </p>
              </div>

              <div className="flex items-center justify-between p-5 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)]">
                <span className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px]">Target Nodes:</span>
                <span className="text-[12px] font-black text-[var(--gold)] uppercase tracking-wider tabular-nums">{activeCount} AUTHORIZED PARTNERS</span>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  variant="secondary"
                  v2={true}
                  className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px]"
                  onClick={() => setIsPostModalOpen(false)}
                >
                  Abort
                </Button>
                <Button
                  v2={true}
                  className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px] gap-2"
                  onClick={handleSendWeekendPost}
                >
                  Submit Dispatch <PaperAirplaneIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
