"use client";
import React, { useState } from 'react';
import { useStore, InterestLevel, InteractionType, InteractionOutcome } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  IdentificationIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  SignalIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { KPICard } from '@/components/ui/KPICard';


export default function FollowUp() {
  const { followUps, addFollowUpInteraction, updateFollowUpStatus, addFollowUp } = useStore();
  const [filter, setFilter] = useState<InterestLevel | 'All'>('All');
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);

  // Interaction Form State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logTargetId, setLogTargetId] = useState('');
  const [logType, setLogType] = useState<InteractionType>('Call');
  const [logOutcome, setLogOutcome] = useState<InteractionOutcome>('Interested');
  const [logNotes, setLogNotes] = useState('');

  // New Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newStatus, setNewStatus] = useState<InterestLevel>('Warm');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const selectedFollowUp = followUps.find(f => f.id === selectedFollowUpId);

  // 3 Week Age Filter Logic
  const isWithin3Weeks = (createdAt: string | undefined) => {
    if (!createdAt) return true;
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 21;
  };

  const currentFollowUps = followUps.filter(f => isWithin3Weeks(f.createdAt));
  const activeFollowUps = filter === 'All' ? currentFollowUps : currentFollowUps.filter(f => f.status === filter);

  const searchedFollowUps = activeFollowUps.filter(f =>
    f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.phone.includes(searchTerm)
  );

  // Sorting: Overdue first
  const sortedFollowUps = [...searchedFollowUps].sort((a, b) => {
    const aIsOverdue = a.nextDue.includes('Today') || a.nextDue.includes('⚡');
    const bIsOverdue = b.nextDue.includes('Today') || b.nextDue.includes('⚡');
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
    return 0;
  });

  const overdueFollowUps = followUps.filter(f => f.nextDue.includes('Today') || f.nextDue.includes('⚡') || f.nextDue.includes('Delayed'));

  const handleOpenLogModal = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLogTargetId(id);
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUpInteraction(logTargetId, {
      type: logType,
      outcome: logOutcome,
      notes: logNotes
    });
    setIsLogModalOpen(false);
    setLogNotes('');
    showToast("Interaction logged.");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUp({
      customerName: newName,
      phone: newPhone,
      interest: newInterest,
      status: newStatus,
      lastContact: 'Just now',
      nextDue: 'Tomorrow',
      createdAt: new Date().toISOString()
    });
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewInterest('');
    showToast("New lead added.");
  };

  const initiateCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const initiateWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}`, '_blank');
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left relative">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-10 py-5 rounded-2xl shadow-2xl border-2 border-white/10 flex items-center gap-5">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-[14px] font-bold tracking-tight uppercase">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="text-left">
            <h1 className="text-[var(--h1-fs)] font-bold text-gray-900 tracking-tight leading-tight mb-2 uppercase">Follow-up List</h1>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm uppercase">Current Customers</Badge>
              <span className="text-[14px] text-gray-400 font-bold tabular-nums tracking-tight uppercase opacity-80">{overdueFollowUps.length} waiting</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>

        {/* Lead Groups Notice */}
        {(() => {
          const dormantCount = followUps.filter(f => !isWithin3Weeks(f.createdAt)).length;
          if (dormantCount === 0) return null;

          return (
            <div className="p-8 bg-gray-50 border-2 border-[var(--border)] rounded-[32px] flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white flex items-center justify-center text-amber-600 shadow-xl">
                  <ClockIcon className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="text-[16px] font-bold text-gray-900 uppercase tracking-tight mb-2">
                    Lead Update: <span className="text-amber-600">{dormantCount} Old Leads</span>
                  </p>
                  <p className="text-[12px] text-gray-400 font-bold uppercase tracking-[2px] opacity-70">
                    Leads older than 21 days can be sent weekend messages.
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="h-[56px] px-8 rounded-xl border-2 font-bold uppercase tracking-widest text-[11px] gap-4">
                Check Leads <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </div>
          );
        })()}

        {/* Needs Attention */}
        {overdueFollowUps.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
              <div className="w-3 h-8 bg-red-600 rounded-full"></div>
              <h2 className="text-[14px] font-bold text-red-600 uppercase tracking-[4px]">Delayed ({overdueFollowUps.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overdueFollowUps.map(f => (
                <Card key={f.id} onClick={() => setSelectedFollowUpId(f.id)} className={`p-10 border-l-8 cursor-pointer transition-none shadow-xl relative overflow-hidden group
                        ${f.status === 'Hot' ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-red-600 bg-red-50/30'}`}>
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-white text-gray-900 flex items-center justify-center text-[22px] font-bold shadow-xl border-2 border-white">
                        {f.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <h3 className="text-[18px] font-bold text-gray-900 uppercase tracking-tight mb-2">{f.customerName}</h3>
                        <p className="text-[13px] font-bold text-gray-400 tabular-nums uppercase">{f.phone}</p>
                      </div>
                    </div>
                    <Badge variant={f.status === 'Hot' ? 'warning' : 'destructive'} className="px-3 py-1 text-[10px] font-bold uppercase shadow-md">Urgent</Badge>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mb-2 opacity-60">Follow-up Date</span>
                      <span className="text-[14px] font-bold text-red-600 uppercase tracking-widest">{f.nextDue}</span>
                    </div>
                    <Button variant="secondary" onClick={(e) => handleOpenLogModal(f.id, e)} className="h-12 px-6 border-2 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md">
                      Add Log
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main List */}
        <Card title="Active Leads" subtitle="Lead follow-up list" actions={<Badge variant="success" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">Live</Badge>} className="p-0 overflow-hidden shadow-2xl border-2">
          <div className="p-5 border-b border-[var(--border)] bg-gray-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1">
              {['All', 'Hot', 'Warm', 'Cold', 'Negotiating', 'Booked'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`relative pb-2.5 text-[10px] font-bold tracking-[1.6px] uppercase transition-none whitespace-nowrap
                    ${filter === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                  {filter === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500 rounded-full shadow-[0_-4px_12px_rgba(245,158,11,0.4)]"></div>}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-[360px]">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input type="text" placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} v2={true} className="pl-11 h-10 border rounded-xl shadow-sm text-[12px] uppercase" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                  <th className="p-[10px_18px] text-[9.5px] font-bold text-gray-500 tracking-[1.4px] uppercase">Lead Name</th>
                  <th className="p-[10px_14px] text-[9.5px] font-bold text-gray-500 tracking-[1.4px] uppercase">Interested In</th>
                  <th className="p-[10px_8px] text-center text-[9.5px] font-bold text-gray-500 tracking-[1.4px] uppercase">Logs</th>
                  <th className="p-[10px_14px] text-[9.5px] font-bold text-gray-500 tracking-[1.4px] uppercase">Last Contact</th>
                  <th className="p-[10px_14px] text-[9.5px] font-bold text-gray-500 tracking-[1.4px] uppercase">Follow-up Date</th>
                  <th className="p-[10px_18px] text-right text-[9.5px] font-bold text-gray-500 tracking-[1.4px] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sortedFollowUps.map(f => (
                  <tr key={f.id} onClick={() => setSelectedFollowUpId(f.id)} className={`hover:bg-gray-50 cursor-pointer transition-none ${selectedFollowUpId === f.id ? 'bg-gray-50' : ''}`}>
                    <td className="p-[10px_18px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 text-amber-600 flex items-center justify-center border border-white shadow-sm font-bold text-[13px]">
                          {f.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[12.5px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">{f.customerName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.8px] opacity-80 tabular-nums">{f.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-[10px_14px]">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-[11.5px] font-bold text-gray-700 uppercase tracking-tight">{f.interest}</span>
                        <Badge variant={f.status === 'Hot' ? 'destructive' : f.status === 'Negotiating' ? 'success' : f.status === 'Warm' ? 'warning' : 'neutral'} className="w-fit px-1.5 py-0 text-[8px] font-bold uppercase tracking-[1px]">
                          {f.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-[10px_8px] text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-[11px] font-bold text-gray-900 border border-white shadow-sm">
                        {f.interactions.length}
                      </span>
                    </td>
                    <td className="p-[10px_14px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[11.5px] font-bold text-gray-700 uppercase tracking-tight">{f.lastContact}</span>
                        <span className="text-[8.5px] font-bold text-amber-600 mt-0.5 uppercase tracking-[1px] opacity-80">Via {f.interactions[0]?.type || 'System'}</span>
                      </div>
                    </td>
                    <td className="p-[10px_14px]">
                      <span className={`text-[11.5px] font-bold uppercase tracking-[1.2px] ${f.nextDue.includes('Today') || f.nextDue.includes('⚡') ? 'text-red-600' : 'text-gray-500'}`}>
                        {f.nextDue}
                      </span>
                    </td>
                    <td className="p-[10px_18px] text-right">
                      <Button variant="secondary" onClick={(e) => handleOpenLogModal(f.id, e)} className="h-8 px-4 border rounded-lg text-[9px] font-bold uppercase tracking-[1.2px] shadow-sm">
                        Log
                      </Button>
                    </td>
                  </tr>
                ))}
                {sortedFollowUps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-32 text-center">
                      <div className="flex flex-col items-center opacity-10">
                        <SignalIcon className="w-24 h-24 mb-6" />
                        <p className="text-2xl font-bold tracking-[8px] uppercase">No Leads</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Log Modal */}
      {isLogModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-[var(--border)] shadow-md text-amber-600">
                  <SignalIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight uppercase">Interaction Log</h2>
                  <p className="text-[12px] text-gray-500 font-bold tracking-widest mt-1 uppercase opacity-70">Client: {followUps.find(f => f.id === logTargetId)?.customerName}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsLogModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleLogSubmit} className="modal-body space-y-10 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Contact Type</Label>
                  <Select v2={true} value={logType} onChange={e => setLogType(e.target.value as InteractionType)} className="h-[56px] font-bold uppercase tracking-widest">
                    <option value="Call">Call</option>
                    <option value="Visit">Site Visit</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label required>Call Result</Label>
                  <Select v2={true} value={logOutcome} onChange={e => setLogOutcome(e.target.value as InteractionOutcome)} className="h-[56px] font-bold uppercase tracking-widest">
                    <option value="Interested">Interested</option>
                    <option value="Not Answering">DND / No Response</option>
                    <option value="Callback">Scheduled Callback</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label required>Field Observations</Label>
                <textarea required value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="Detail interaction findings..." className="w-full px-8 py-6 rounded-[32px] border-2 border-gray-100 bg-gray-50 focus:border-amber-500/30 outline-none text-[15px] min-h-[160px] font-bold uppercase tracking-tight shadow-inner" />
              </div>

              <div className="pt-6 flex gap-6">
                <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Commit Log</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-[560px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedFollowUpId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedFollowUp ? (
          <div className="flex-1 flex flex-col p-12 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-amber-600 border-2 border-[var(--border)] shadow-md font-bold text-[32px]">
                  {selectedFollowUp.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-none mb-3 uppercase">{selectedFollowUp.customerName}</h2>
                  <div className="flex items-center gap-4">
                    <Badge variant={selectedFollowUp.status === 'Hot' ? 'destructive' : 'neutral'} className="px-4 py-1 text-[11px] font-bold uppercase shadow-sm">{selectedFollowUp.status} LEVEL</Badge>
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest opacity-60">ID: {selectedFollowUp.id.slice(-8)}</span>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12" onClick={() => setSelectedFollowUpId(null)}>✕</Button>
            </div>

            <div className="space-y-12">
              {/* Action Panel */}
              <div className="grid grid-cols-2 gap-6">
                <Button variant="secondary" className="h-[64px] rounded-2xl border-2 font-bold uppercase tracking-[2px] text-[12px] gap-4" onClick={() => initiateCall(selectedFollowUp.phone)}>
                  <PhoneIcon className="w-5 h-5" /> Call Now
                </Button>
                <Button variant="secondary" className="h-[64px] rounded-2xl border-2 bg-green-50 text-green-700 font-bold uppercase tracking-[2px] text-[12px] gap-4" onClick={() => initiateWhatsApp(selectedFollowUp.phone)}>
                  <ChatBubbleLeftRightIcon className="w-5 h-5" /> WhatsApp
                </Button>
              </div>

              {/* Matrix Dashboard */}
              <div className="p-10 bg-gray-900 rounded-[40px] shadow-2xl relative overflow-hidden text-left border-none">
                <div className="flex justify-between items-center mb-10 border-b-2 border-white/5 pb-8">
                  <span className="text-[11px] font-bold text-white/40 tracking-[4px] uppercase">Lead Details</span>
                  <Badge variant="success" className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 text-[11px] font-bold uppercase">PROBABILITY 92%</Badge>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[3px] mb-4">Core Interest</p>
                    <p className="text-[20px] font-bold text-white uppercase tracking-tight">{selectedFollowUp.interest}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[3px] mb-4">Lead Score</p>
                    <p className="text-4xl font-bold text-amber-500 tabular-nums">9.8</p>
                  </div>
                </div>
              </div>

              {/* In Use Coordinates */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b-2 border-gray-50 pb-6">
                  <ClipboardDocumentIcon className="w-6 h-6 text-amber-600" />
                  <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-[4px]">Contact Details</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Phone Number', value: selectedFollowUp.phone, icon: <DevicePhoneMobileIcon className="w-5 h-5" /> },
                    { label: 'Last Contact', value: selectedFollowUp.lastContact, icon: <ClockIcon className="w-5 h-5" /> },
                    { label: 'Next Follow-up', value: selectedFollowUp.nextDue, icon: <CalendarDaysIcon className="w-5 h-5" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl border-2 border-white shadow-inner">
                      <div className="flex items-center gap-5">
                        <span className="text-amber-600">{item.icon}</span>
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-[16px] font-bold text-gray-900 tabular-nums uppercase">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Timeline */}
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
                  <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-[4px] flex items-center gap-4">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-amber-600" />
                    Historical Ledger
                  </h3>
                  <Button variant="secondary" size="icon" className="h-10 w-10 border-2 rounded-xl" onClick={() => handleOpenLogModal(selectedFollowUp.id)}>
                    <PlusIcon className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {selectedFollowUp.interactions.length > 0 ? (
                    selectedFollowUp.interactions.map((interaction) => (
                      <div key={interaction.id} className="bg-white p-8 rounded-3xl border-2 border-[var(--border)] shadow-sm group transition-none">
                        <div className="flex justify-between items-start mb-6">
                          <div className="text-left">
                            <span className="text-[16px] font-bold text-gray-900 uppercase tracking-tight block mb-2">{interaction.type}</span>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block opacity-70 tabular-nums">{interaction.date}</span>
                          </div>
                          <Badge variant={interaction.outcome === 'Interested' ? 'success' : 'destructive'} className="px-3 py-1 text-[10px] font-bold uppercase shadow-sm">
                            {interaction.outcome}
                          </Badge>
                        </div>
                        <p className="text-[14px] font-bold text-gray-500 leading-relaxed border-l-4 border-amber-500/30 pl-6 py-1 italic uppercase tracking-tight">
                          &quot;{interaction.notes}&quot;
                        </p>
                        <div className="mt-8 flex items-center gap-4 border-t-2 border-gray-50 pt-6">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-amber-600 border-2 border-white shadow-md font-bold">
                            {interaction.loggedBy.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Checkor: {interaction.loggedBy}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-16 text-center border-2 border-dashed border-gray-100 rounded-[32px] opacity-20 italic">
                      <p className="text-[12px] font-bold uppercase tracking-[3px]">Awaiting First Interaction</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-12 border-t-2 border-[var(--border)] flex flex-col gap-4">
              <Button
                className="w-full h-[64px] rounded-2xl shadow-xl text-[12px] font-bold tracking-[4px] uppercase flex items-center justify-center gap-4"
                onClick={() => { updateFollowUpStatus(selectedFollowUp.id, 'Booked'); setSelectedFollowUpId(null); showToast("Success! Lead converted."); }}
              >
                Convert to Customer <CheckCircleIcon className="w-6 h-6" />
              </Button>
              <Button
                variant="secondary"
                className="w-full h-[56px] rounded-2xl border-2 font-bold uppercase tracking-[2px] text-[11px] shadow-md bg-white"
                onClick={() => { updateFollowUpStatus(selectedFollowUp.id, 'Lost'); setSelectedFollowUpId(null); showToast("Lead archived."); }}
              >
                Mark as Lost
              </Button>
            </div>
          </div>
        ) : null}
      </div>

    </>
  );
}
