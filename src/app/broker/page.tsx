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
import {
  MegaphoneIcon,
  PlusIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  UserIcon,
  SignalIcon,
  IdentificationIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClipboardDocumentIcon
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
    showToast("Partner added.");
  };

  const handleSendWeekendPost = () => {
    logWeekendPost({
      title: 'Partner Exclusive: Sunrise Greens Update',
      type: 'Static',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800'
    });
    setIsPostModalOpen(false);
    showToast("Message sent.");
  };

  const initiateCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const initiateWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}`, '_blank');
  };

  // Numbers
  const activeCount = brokers.filter(b => b.status === 'Active').length;
  const totalLeads = brokers.reduce((acc, curr) => acc + curr.leadsSent, 0);
  const totalEarned = brokers.reduce((acc, curr) => acc + curr.totalCommissionEarned, 0);
  const totalPending = brokers.reduce((acc, curr) => acc + curr.pendingCommission, 0);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Partners</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5"></span>
                Live status
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums tracking-tight opacity-70">Partners and earnings tracking</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-sm rounded-lg"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add partner
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            label="Active partners"
            value={activeCount}
            trend={{ value: "Current", type: "neutral" }}
          />
          <KPICard
            label="Leads"
            value={totalLeads}
            trend={{ value: "Total", type: "up" }}
          />
          <KPICard
            label="Total earnings"
            value={formatCurrency(totalEarned)}
            trend={{ value: "Paid out", type: "up" }}
          />
          <KPICard
            label="Pending payout"
            value={formatCurrency(totalPending)}
            trend={{ value: "Awaiting pay", type: totalPending > 0 ? "down" : "up" }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--section-gap)]">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-0 overflow-hidden min-h-[600px] shadow-sm">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-gray-50/30">
                <div className="text-left">
                  <h2 className="text-[12px] font-bold text-[var(--text)] tracking-[1px]">Partner list</h2>
                  <p className="text-[10px] font-medium text-[var(--text3)] mt-1 opacity-70">Active channel partners</p>
                </div>
                <Badge variant="neutral" className="shadow-sm">Live</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[var(--border)]">
                      <th className="p-[12px_24px] text-[10px] font-semibold text-[var(--text3)] tracking-[1px]">Partner</th>
                      <th className="p-[12px_15px] text-[10px] font-semibold text-[var(--text3)] tracking-[1px]">Area</th>
                      <th className="p-[12px_15px] text-center text-[10px] font-semibold text-[var(--text3)] tracking-[1px]">Leads</th>
                      <th className="p-[12px_15px] text-right text-[10px] font-semibold text-[var(--text3)] tracking-[1px]">Earnings</th>
                      <th className="p-[12px_24px] text-right text-[10px] font-semibold text-[var(--text3)] tracking-[1px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {brokers.map(b => (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBrokerId(b.id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="p-[12px_24px]">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-[var(--border)] text-[var(--gold)] flex items-center justify-center text-[13px] font-semibold shadow-sm">
                              {b.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-semibold text-[var(--text)] tracking-tight leading-none mb-1">{b.name}</span>
                              <span className="text-[10px] text-[var(--text3)] font-medium tracking-[0.5px] opacity-70 leading-none">{b.firm}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-[12px_15px]">
                          <div className="flex flex-col text-left">
                            <span className="text-[12px] font-semibold text-[var(--text2)] tracking-tight leading-none">{b.area}</span>
                            <span className="text-[9px] font-medium text-[var(--gold)] tracking-widest mt-1 opacity-70">{b.commissionRate} rate</span>
                          </div>
                        </td>
                        <td className="p-[12px_15px] text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[13px] font-semibold text-[var(--text)] tracking-tight">{b.conversions} / {b.leadsSent}</span>
                            <span className="text-[9px] font-medium text-[var(--text3)] tracking-[0.5px] mt-1 opacity-70">Conv.</span>
                          </div>
                        </td>
                        <td className="p-[12px_15px] text-right">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-[14px] font-bold text-[var(--green)] tracking-tight leading-none tabular-nums">{formatCurrency(b.totalCommissionEarned)}</span>
                            <span className="text-[9px] font-medium text-[var(--red)] tracking-tight mt-1 opacity-70 tabular-nums">Due: {formatCurrency(b.pendingCommission)}</span>
                          </div>
                        </td>
                        <td className="p-[12px_24px] text-right">
                          <Badge variant={b.status === 'Active' ? 'success' : 'neutral'} className="shadow-sm">
                            {b.status}
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
            {/* Summary Widget */}
            <Card className="p-10 text-left shadow-sm border border-[var(--border)]">
              <h3 className="text-[10px] font-bold text-[var(--text3)] tracking-[2px] mb-10 leading-none opacity-50 uppercase">Summary</h3>
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold tracking-[1px] leading-none uppercase">
                    <span className="text-[var(--text2)]">Quality</span>
                    <span className="text-[var(--gold)]">
                      {totalLeads > 0 ? (totalEarned > 0 ? 'High' : 'Normal') : 'Idle'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full border border-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--gold)]"
                      style={{ width: `${totalLeads > 0 ? Math.min(100, Math.round((brokers.reduce((acc, b) => acc + b.conversions, 0) / totalLeads) * 100 * 5)) : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold tracking-[1px] leading-none uppercase">
                    <span className="text-[var(--text2)]">Active rate</span>
                    <span className="text-[var(--green)]">
                      {brokers.length > 0 ? Math.round((activeCount / brokers.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full border border-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--green)]"
                      style={{ width: `${brokers.length > 0 ? (activeCount / brokers.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--gold)]"></div>
          <span className="text-[10px] font-bold tracking-[2.5px] whitespace-nowrap uppercase">{toast.message}</span>
        </div>
      )}

      {/* Details Modal */}
      {selectedBroker && (
        <div className="modal-overlay">
          <div className="modal-container max-w-lg shadow-2xl rounded-md">
            <div className="modal-header p-6 border-b border-gray-150">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center text-amber-600 border border-gray-200">
                  <IdentificationIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedBroker.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={selectedBroker.status === 'Active' ? 'success' : 'neutral'} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest leading-none shadow-sm">
                      {selectedBroker.status}
                    </Badge>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80 tabular-nums">ID: {selectedBroker.id.substring(0, 6).toUpperCase()}</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm flex items-center justify-center" onClick={() => setSelectedBrokerId(null)}>✕</Button>
            </div>

            <div className="modal-body space-y-6 text-left p-6">
              {/* Communication Layer */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  v2={true}
                  variant="secondary"
                  className="h-[44px] rounded-md border-2 text-[12px] font-bold tracking-wider gap-2 bg-gray-50 shadow-sm uppercase hover:bg-gray-100"
                  onClick={() => initiateCall(selectedBroker.phone)}
                >
                  <PhoneIcon className="w-4 h-4 text-amber-600" /> Call Now
                </Button>
                <Button
                  v2={true}
                  variant="secondary"
                  className="h-[44px] rounded-md border-2 text-[12px] font-bold tracking-wider gap-2 bg-green-50 text-green-700 shadow-sm border-green-155 uppercase hover:bg-green-100"
                  onClick={() => initiateWhatsApp(selectedBroker.phone)}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" /> WhatsApp Now
                </Button>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Success Rate', value: `${selectedBroker.leadsSent > 0 ? Math.round((selectedBroker.conversions / selectedBroker.leadsSent) * 100) : 0}%`, sub: 'Result index' },
                  { label: 'Total Leads', value: selectedBroker.leadsSent, sub: 'Traffic' },
                  { label: 'Commission Rate', value: selectedBroker.commissionRate, sub: 'Broker share' },
                ].map((stat, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-50 rounded border border-[var(--border)] text-center shadow-inner">
                    <p className="text-[11px] font-bold text-gray-450 tracking-wider mb-2 opacity-80 uppercase">{stat.label}</p>
                    <p className="text-[16px] font-bold text-gray-900 tracking-tight tabular-nums leading-none mb-2">{stat.value}</p>
                    <p className="text-[10px] font-bold text-amber-650 tracking-wide uppercase">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Ledger Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                   <h3 className="text-[11px] font-bold text-gray-900 tracking-[1.5px] uppercase">
                      Payments History
                   </h3>
                   <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Balance due:</span>
                      <span className="text-[15px] font-bold text-amber-600 tabular-nums">{formatCurrency(selectedBroker.pendingCommission)}</span>
                   </div>
                </div>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedBroker.commissions.length > 0 ? (
                    selectedBroker.commissions.map((c) => (
                      <div key={c.id} className="bg-white p-3.5 rounded border border-gray-150 shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="text-left space-y-1.5">
                            <span className="text-[13.5px] font-bold text-gray-900 tracking-tight block uppercase">{c.plotNumber} — {c.customerName}</span>
                            <span className="text-[11px] font-bold text-gray-405 tracking-wider block uppercase tabular-nums opacity-85">{c.date}</span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-[14.5px] font-bold tracking-tight tabular-nums ${c.status === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>{formatCurrency(c.amount)}</span>
                            {c.status === 'Due' && (
                              <Button
                                v2={true}
                                className="h-8 px-4 rounded text-[10px] font-bold tracking-wider shadow-sm uppercase"
                                onClick={() => { markCommissionPaid(selectedBroker.id, c.id); showToast("Payment approved."); }}
                              >
                                Approve Payment
                              </Button>
                            )}
                            {c.status === 'Paid' && (
                              <Badge variant="success" className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-widest shadow-sm">settled</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center border border-dashed border-gray-250 rounded">
                      <ClipboardDocumentIcon className="w-6 h-6 text-gray-250 mx-auto mb-1.5" />
                      <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">No historical records found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Identity */}
               <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-gray-50 rounded border border-[var(--border)] shadow-inner text-left">
                   <Label className="mb-1.5 block text-[11px]">Phone Number</Label>
                   <span className="text-[14.5px] font-bold text-gray-900 tabular-nums block">{selectedBroker.phone}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded border border-[var(--border)] shadow-inner text-left">
                   <Label className="mb-1.5 block text-[11px]">Working Area</Label>
                   <span className="text-[14.5px] font-bold text-gray-900 uppercase tracking-tight block truncate">{selectedBroker.area}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-4 border-t border-gray-150">
                <Button
                  v2={true}
                  className="flex-[2] h-[44px] rounded-md shadow-md font-bold tracking-wider text-[11px] uppercase gap-2 flex items-center justify-center"
                  onClick={() => window.print()}
                >
                  Download report <ArrowDownTrayIcon className="w-4 h-4" />
                </Button>
                <Button
                  v2={true}
                  variant="secondary"
                  className="flex-1 h-[44px] rounded-md border-2 font-bold tracking-wider text-[11px] bg-white shadow-sm uppercase hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                  onClick={() => { updateBrokerStatus(selectedBroker.id, selectedBroker.status === 'Active' ? 'Inactive' : 'Active'); setSelectedBrokerId(null); showToast("Status modified."); }}
                >
                  {selectedBroker.status === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Broker Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Partner</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Add new broker details</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-body space-y-10 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Broker Name</Label>
                  <Input 
                    required 
                    v2={true} 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    type="text" 
                    placeholder="Enter name" 
                    className="h-[56px] text-[15px] shadow-md rounded-2xl font-bold uppercase" 
                  />
                </div>
                <div className="space-y-4">
                  <Label required>Phone Number</Label>
                  <Input 
                    required 
                    v2={true} 
                    value={newPhone} 
                    onChange={e => setNewPhone(e.target.value)} 
                    type="tel" 
                    placeholder="+91 XXXX XXX XXX" 
                    className="h-[56px] text-[15px] shadow-md rounded-2xl font-bold tabular-nums" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label>Firm Name</Label>
                  <Input 
                    v2={true} 
                    value={newFirm} 
                    onChange={e => setNewFirm(e.target.value)} 
                    type="text" 
                    placeholder="e.g. Skyline Realty" 
                    className="h-[56px] text-[15px] shadow-md rounded-2xl font-bold uppercase" 
                  />
                </div>
                <div className="space-y-4">
                  <Label required>Commission Rate (%)</Label>
                  <Input 
                    required 
                    v2={true} 
                    value={newRate} 
                    onChange={e => setNewRate(e.target.value)} 
                    type="text" 
                    placeholder="e.g. 2.0%" 
                    className="h-[56px] text-[15px] shadow-md rounded-2xl font-bold tabular-nums" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label required>Working Area</Label>
                <Input 
                  required 
                  v2={true} 
                  value={newArea} 
                  onChange={e => setNewArea(e.target.value)} 
                  type="text" 
                  placeholder="Primary location" 
                  className="h-[56px] text-[15px] shadow-md rounded-2xl font-bold uppercase" 
                />
              </div>

              <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <ShieldCheckIcon className="w-10 h-10 text-amber-500 shrink-0" />
                <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                  Broker details are saved in the marketing list.
                </p>
              </div>

              <div className="pt-6 flex gap-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 h-[56px] rounded-2xl border-2 font-bold tracking-[2px] text-[12px] bg-white shadow-md uppercase hover:bg-gray-50 transition-all duration-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] h-[56px] rounded-2xl shadow-xl font-bold tracking-[2px] text-[12px] uppercase"
                >
                  Confirm registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Modal Removed */}
    </>
  );
}
