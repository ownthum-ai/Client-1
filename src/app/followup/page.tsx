"use client";
import React, { useState } from 'react';
import { useStore, InterestLevel, InteractionType, InteractionOutcome } from '@/store/useStore';
import { CustomSelect } from '@/components/Select';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  IdentificationIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  SignalIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function FollowUp() {
  const { followUps, addFollowUpInteraction, updateFollowUpStatus } = useStore();
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

  const { addFollowUp } = useStore();

  const selectedFollowUp = followUps.find(f => f.id === selectedFollowUpId);

  // 3 Week Age Filter Logic
  const isWithin3Weeks = (createdAt: string | undefined) => {
    if (!createdAt) return true; // Default for legacy data
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

  // Sorting: Overdue first, then by priority
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
  };

  const initiateCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const initiateWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}`, '_blank');
  };

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Customer Follow-Up</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">{followUps.filter(f => f.nextDue.includes('Today')).length} follow-ups due today — prioritised pipeline view</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-lg shadow-black/10 rounded-lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Log Interaction
            </Button>
          </div>
        </div>

        {/* Info: Dormant Leads Notice */}
        {(() => {
          const dormantCount = followUps.filter(f => !isWithin3Weeks(f.createdAt)).length;
          if (dormantCount === 0) return null;
          
          return (
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between group hover:border-[var(--gold)]/30 transition-all mb-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center text-[var(--gold)] shadow-sm">
                  <ClockIcon className="w-4 h-4 text-[var(--gold)]" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[var(--text2)] uppercase tracking-tight leading-none mb-1.5">
                    Automated Pipeline Segmentation: <span className="text-[var(--gold)]">{dormantCount} Mature Leads</span>
                  </p>
                  <p className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[1px] opacity-40 leading-none">
                    prospects older than 21 days have been reassigned to Weekend Transmission module
                  </p>
                </div>
              </div>
              <Button
                v2={true}
                variant="secondary"
                size="sm"
                className="text-[9px] font-black uppercase tracking-[2px] h-8 bg-white border-[var(--border)] shadow-sm"
              >
                Access Spectrum <ArrowRightIcon className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          );
        })()}

        {/* Red Alert: Overdue Pipeline */}
        {overdueFollowUps.length > 0 && (
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-2.5 px-1">
              <span className="text-[18px] animate-pulse">⚠️</span>
              <h2 className="text-[12px] font-bold text-[var(--red)] uppercase tracking-[2px]">Urgent Intervention Required ({overdueFollowUps.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {overdueFollowUps.map(f => (
                <Card
                  key={f.id}
                  onClick={() => setSelectedFollowUpId(f.id)}
                  className={`p-6 border-l-4 transition-all cursor-pointer group hover:translate-y-[-2px] hover:shadow-[var(--sh-md)]
                        ${f.status === 'Hot' ? 'border-l-[var(--amber)] bg-[var(--amber-lt)]' : 'border-l-[var(--red)] bg-[var(--red-lt)]'}`}
                >
                  <div className="flex items-start justify-between mb-5">
                     <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[16px] font-bold shadow-sm transition-all
                               ${f.status === 'Hot' ? 'bg-white text-[var(--amber)]' : 'bg-white text-[var(--red)]'}`}>
                        {f.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <h3 className="text-[14px] font-bold text-[var(--text)] uppercase tracking-[0.5px] leading-tight">{f.customerName}</h3>
                        <p className="text-[10.5px] font-medium text-[var(--text3)] mt-0.5">{f.phone}</p>
                      </div>
                    </div>
                    <Badge variant={f.status === 'Hot' ? 'warning' : 'danger'}>URGENT</Badge>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] opacity-60">Next Due</span>
                      <span className="text-[11.5px] font-bold text-[var(--red)] uppercase tracking-[0.5px] mt-0.5">{f.nextDue}</span>
                    </div>
                    <Button
                      variant="secondary" size="inline"
                      onClick={(e) => handleOpenLogModal(f.id, e)}
                      className="group-hover:bg-[var(--gold)] group-hover:text-white group-hover:border-[var(--gold)] transition-colors"
                    >
                      Log Action
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Pipeline Content */}
        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {['All', 'Hot', 'Warm', 'Cold', 'Negotiating', 'Booked'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab as any)}
                    className={`relative pb-4 text-[11px] font-bold uppercase tracking-[1.5px] transition-all whitespace-nowrap
                      ${filter === tab ? 'text-[var(--gold)]' : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
                  >
                    {tab}
                    {filter === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--gold)] rounded-full"></div>}
                  </button>
                ))}
              </div>
              <div className="relative group w-full lg:w-96">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10" />
                <Input
                  type="text"
                  placeholder="Search pipeline leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-10 border-[var(--border)] text-[13px] shadow-sm rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Qualified Lead</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Interest Matrix</th>
                  <th className="p-[12px_10px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] text-center">Interactions</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Last Touchpoint</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Scheduled Next</th>
                  <th className="p-[12px_24px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sortedFollowUps.map(f => (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedFollowUpId(f.id)}
                    className={`group transition-all hover:bg-[var(--bg)] cursor-pointer ${selectedFollowUpId === f.id ? 'bg-[var(--gold-lt)] hover:bg-[var(--gold-lt)]' : ''}`}
                  >
                    <td className="p-[12px_24px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text3)] group-hover:bg-[var(--gold)] group-hover:text-white group-hover:border-[var(--gold)] transition-all leading-none">
                          {f.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight leading-none group-hover:text-[var(--gold)] transition-colors">{f.customerName}</span>
                          <span className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[1px] mt-2 opacity-40 leading-none">{f.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-[0.5px] leading-none">{f.interest}</span>
                        <Badge variant={
                          f.status === 'Hot' ? 'danger' :
                            f.status === 'Negotiating' ? 'success' :
                              f.status === 'Warm' ? 'warning' :
                                f.status === 'Booked' ? 'info' : 'neutral'
                        } className="text-[10px] font-bold uppercase py-0.5">
                          {f.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-[12px_10px] text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg)] text-[11.5px] font-bold text-[var(--text2)] border border-[var(--border)] shadow-sm">
                        {f.interactions.length}
                      </span>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[12px] font-bold text-[var(--text)] tracking-[0.5px] leading-none">{f.lastContact}</span>
                        <span className="text-[9.5px] font-bold text-[var(--text3)] uppercase mt-2 opacity-60 leading-none">Via {f.interactions[0]?.type || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="flex items-center gap-2 text-left">
                        <span className={`text-[12px] font-bold uppercase tracking-[0.5px] leading-none ${f.nextDue.includes('Today') || f.nextDue.includes('⚡') ? 'text-[var(--red)]' : 'text-[var(--text2)]'}`}>
                          {f.nextDue}
                        </span>
                      </div>
                    </td>
                    <td className="p-[12px_24px] text-right">
                      <Button
                        variant="secondary" size="inline"
                        onClick={(e) => handleOpenLogModal(f.id, e)}
                        className="group-hover:bg-[var(--gold)] group-hover:text-white group-hover:border-[var(--gold)] shadow-sm font-bold uppercase tracking-widest text-[10px]"
                      >
                        Log protocol
                      </Button>
                    </td>
                  </tr>
                ))}
                {sortedFollowUps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-20 select-none">
                        <span className="text-[48px] mb-3">📋</span>
                        <p className="text-[12px] font-bold uppercase tracking-[2px] text-[var(--text3)]">No pipeline entries found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Interface Transmission Log - Outside animated container */}
      {isLogModalOpen && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)] leading-none">
                  <SignalIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Transmission Log</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Record Outcome for {followUps.find(f => f.id === logTargetId)?.customerName}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsLogModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleLogSubmit} className="modal-body space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Intervention Type</label>
                  <Select v2={true} value={logType} onChange={e => setLogType(e.target.value as InteractionType)} className="h-11 text-[12px] font-bold uppercase">
                    <option value="Call">Voice Call</option>
                    <option value="Visit">Personal Visit</option>
                    <option value="WhatsApp">Message / WA</option>
                  </Select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Registry Outcome</label>
                  <Select v2={true} value={logOutcome} onChange={e => setLogOutcome(e.target.value as InteractionOutcome)} className="h-11 text-[12px] font-bold uppercase">
                    <option value="Interested">Interested / Progress</option>
                    <option value="Not Answering">No Response / Ghost</option>
                    <option value="Callback">Callback Requested</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Registry Notes</label>
                <textarea 
                  required 
                  value={logNotes} 
                  onChange={e => setLogNotes(e.target.value)} 
                  placeholder="Detail the interaction outcome..." 
                  className="w-full px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 focus:bg-white focus:border-[var(--gold)] outline-none transition-all placeholder:text-[var(--text3)]/30 font-bold text-[13px] min-h-[120px] italic shadow-inner"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button 
                   type="button" 
                   variant="secondary" 
                   v2={true}
                   className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px] shadow-sm" 
                   onClick={() => setIsLogModalOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button 
                   type="submit" 
                   v2={true}
                   className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px]"
                >
                  Sync Log Protocol
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal - Outside animated container */}
      {selectedFollowUp && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                  <IdentificationIcon className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-2">{selectedFollowUp.customerName}</h2>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/10 uppercase tracking-widest leading-none">
                      {selectedFollowUp.status.toUpperCase()} PIPELINE
                    </span>
                    <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[2px] opacity-80 leading-none">ID: {selectedFollowUp.id.substring(0, 8)}</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setSelectedFollowUpId(null)}>✕</Button>
            </div>

            <div className="modal-body space-y-8">
              {/* Action Blueprint */}
              <div className="grid grid-cols-2 gap-4">
                 <Button
                   v2={true}
                   variant="secondary" 
                   className="h-14 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px] gap-3 bg-[var(--gold-lt)]/30 transition-all hover:bg-[var(--gold-lt)]/50 shadow-sm"
                   onClick={() => initiateCall(selectedFollowUp.phone)}
                 >
                   <PhoneIcon className="w-4 h-4" /> Initiate Call
                 </Button>
                 <Button
                   v2={true}
                   variant="secondary" 
                   className="h-14 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px] gap-3 bg-[#e8fbf0]/30 text-[#10b981] transition-all hover:bg-[#e8fbf0]/50 shadow-sm"
                   onClick={() => initiateWhatsApp(selectedFollowUp.phone)}
                 >
                   <ChatBubbleLeftRightIcon className="w-4 h-4" /> WhatsApp Sync
                 </Button>
              </div>

              {/* Trajectory Matrix Card */}
              <div className="p-8 bg-white rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--gold)]/5 rounded-bl-full blur-xl group-hover:bg-[var(--gold)]/10 transition-all duration-500"></div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[3px] opacity-60 leading-none">Trajectory Matrix</span>
                  <Badge variant={selectedFollowUp.status === 'Hot' ? 'danger' : selectedFollowUp.status === 'Warm' ? 'warning' : 'neutral'} className="font-black px-3 py-1 text-[9px] border-none shadow-sm leading-none">
                    {selectedFollowUp.status.toUpperCase()} INTENSITY
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] mb-3 opacity-40 leading-none">Operational Preference</p>
                    <p className="text-[16px] font-black text-[var(--text)] tracking-tight uppercase leading-none italic font-serif opacity-90">{selectedFollowUp.interest}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] mb-3 opacity-40 leading-none">Lead Score</p>
                    <p className="text-[18px] font-black text-[var(--gold)] tracking-tight leading-none font-serif">9.2 / 10</p>
                  </div>
                </div>
              </div>

              {/* Registry Details */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[2px] border-b border-[var(--border)] pb-3 flex items-center gap-2 opacity-60">
                   <ClipboardDocumentIcon className="w-4 h-4" />
                   Registry Credentials
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Primary Contact', value: selectedFollowUp.phone, icon: <DevicePhoneMobileIcon className="w-4 h-4" /> },
                    { label: 'Last Touchpoint', value: selectedFollowUp.lastContact, icon: <ClockIcon className="w-4 h-4" /> },
                    { label: 'Scheduled Next', value: selectedFollowUp.nextDue, icon: <CalendarDaysIcon className="w-4 h-4" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-[var(--gold)] group-hover:scale-110 transition-transform opacity-60">{item.icon}</span>
                        <span className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-[1px] leading-none">{item.label}</span>
                      </div>
                      <span className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight tabular-nums leading-none">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observations Ledger */}
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between">
                   <h3 className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[2px] flex items-center gap-2 opacity-60 leading-none">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      Interaction Timeline
                   </h3>
                   <Button variant="secondary" size="icon" className="rounded-lg h-8 w-8 bg-white border-[var(--border)] shadow-sm hover:border-[var(--gold)]/30 transition-all" onClick={() => handleOpenLogModal(selectedFollowUp.id)}>
                      <PlusIcon className="w-4 h-4 text-[var(--gold)]" />
                   </Button>
                </div>
                
                <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-[var(--border)]">
                   {selectedFollowUp.interactions.length > 0 ? (
                       selectedFollowUp.interactions.map((interaction, idx) => (
                          <div key={interaction.id} className="relative pl-10 group">
                             <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
                                       ${interaction.type === 'Call' ? 'bg-[var(--gold)]' : interaction.type === 'Visit' ? 'bg-[var(--green)]' : 'bg-[var(--text3)]'}`}>
                                       {interaction.type === 'Call' ? <PhoneIcon className="w-2.5 h-2.5 text-white" /> : <ChatBubbleLeftRightIcon className="w-2.5 h-2.5 text-white" />}
                             </div>
                             <div className="bg-white p-6 rounded-xl border border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                   <div className="text-left">
                                      <span className="text-[11px] font-black text-[var(--text)] uppercase tracking-[0.5px] block leading-none">{interaction.type} RESPONSE</span>
                                      <span className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] opacity-40 mt-2 block leading-none">{interaction.date}</span>
                                   </div>
                                   <Badge variant={interaction.outcome === 'Interested' ? 'success' : 'danger'} className="text-[8px] px-2 py-0.5 border-none font-black italic shadow-sm leading-none">
                                      {interaction.outcome.toUpperCase()}
                                   </Badge>
                                </div>
                                <p className="text-[12px] font-medium text-[var(--text2)] leading-relaxed italic border-l-2 border-[var(--gold)]/20 pl-4 py-1">
                                   &quot;{interaction.notes}&quot;
                                </p>
                                <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-3 opacity-60">
                                   <div className="w-5 h-5 rounded-full bg-[var(--bg)] flex items-center justify-center text-[10px] text-[var(--gold)] border border-[var(--border)] shadow-sm leading-none">
                                      <IdentificationIcon className="w-3 h-3" />
                                   </div>
                                   <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[1px] leading-none">OPERATOR: {interaction.loggedBy.split(' ')[0]}</span>
                                </div>
                             </div>
                          </div>
                       ))
                   ) : (
                       <div className="pl-10 text-left py-4 opacity-30 select-none">
                           <p className="text-[11px] font-bold uppercase tracking-[2px] leading-none">No interaction history registered.</p>
                       </div>
                   )}
                </div>
              </div>
            </div>

            <div className="modal-footer flex flex-col gap-3">
               <Button
                 v2={true}
                 className="w-full h-14 rounded-xl shadow-lg shadow-gold-500/10 text-[10px] font-bold uppercase tracking-[3px] gap-3"
                 onClick={() => { updateFollowUpStatus(selectedFollowUp.id, 'Booked'); setSelectedFollowUpId(null); }}
               >
                 Confirm Unit Booking <CheckCircleIcon className="w-5 h-5" />
               </Button>
               <Button
                 v2={true}
                 variant="secondary" 
                 className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px] shadow-sm bg-white"
                 onClick={() => { updateFollowUpStatus(selectedFollowUp.id, 'Lost'); setSelectedFollowUpId(null); }}
               >
                 Archive Lead Registry
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Initialization Protocol Modal - Outside animated container */}
      {isAddModalOpen && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)] leading-none">
                  <IdentificationIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Lead Initialization</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Establish new pipeline registry record</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsAddModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-body space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Customer Identity</label>
                    <Input required v2={true} value={newName} onChange={e => setNewName(e.target.value)} type="text" placeholder="FULL LEGAL NAME" className="h-11 shadow-sm rounded-lg" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Asset Preference</label>
                    <Input required v2={true} value={newInterest} onChange={e => setNewInterest(e.target.value)} type="text" placeholder="E.G. PLOT A-12" className="h-11 shadow-sm rounded-lg" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Contact Protocol</label>
                    <Input required v2={true} value={newPhone} onChange={e => setNewPhone(e.target.value)} type="tel" placeholder="+91 XXXX XXXX" className="h-11 shadow-sm rounded-lg" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Intensity Matrix</label>
                    <Select v2={true} value={newStatus} onChange={e => setNewStatus(e.target.value as InterestLevel)} className="h-11 text-[12px] font-bold uppercase shadow-sm rounded-lg">
                      <option value="Hot">Hot Lead (Negotiation)</option>
                      <option value="Warm">Warm Interest (Standard)</option>
                      <option value="Cold">Cold Discovery (Initial)</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-[var(--bg)]/50 rounded-xl border border-dashed border-[var(--border)]">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--gold)] border border-[var(--border)] shadow-sm">
                    <ArrowRightIcon className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] text-[var(--text3)] font-bold italic leading-relaxed uppercase tracking-[1px] opacity-60">
                    Initializing this record will trigger an automated next-day follow-up protocol and assign an operational node.
                 </p>
              </div>

              <div className="pt-4 flex gap-4">
                <Button 
                   type="button" 
                   variant="secondary" 
                   v2={true}
                   className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px] bg-white shadow-sm" 
                   onClick={() => setIsAddModalOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button 
                   type="submit" 
                   v2={true}
                   className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px]"
                >
                  Initialize Lead Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
