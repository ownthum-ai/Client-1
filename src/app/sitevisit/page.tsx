"use client";
import React, { useState } from 'react';
import { useStore, InterestLevel } from '@/store/useStore';
import { CustomSelect } from '@/components/Select';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable } from '@/components/ui/DataTable';
import {
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  SignalIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  MapPinIcon,
  UserIcon,
  IdentificationIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
  AdjustmentsVerticalIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';

export default function SiteVisit() {
  const {
    siteVisits,
    queries,
    addSiteVisit,
    addFollowUp,
    updateSiteVisitStatus,
    deleteSiteVisit,
    updateSiteVisit,
    globalModal,
    setGlobalModal,
    layouts,
    brokers
  } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedVisitIdForEdit, setSelectedVisitIdForEdit] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedVisit = siteVisits.find(v => v.id === selectedVisitId);

  React.useEffect(() => {
    if (globalModal === 'siteVisit') {
      setIsModalOpen(true);
      setGlobalModal(null);
    }
  }, [globalModal, setGlobalModal]);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Walk-in');
  const [budget, setBudget] = useState('₹10L');
  const [preference, setPreference] = useState(layouts[0]?.name || 'Plot 150sqyd');
  const [interest, setInterest] = useState<InterestLevel>('Warm');
  const [notes, setNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Capture precise date and time
    const now = new Date();
    const entryTimestamp = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    });

    // Add the site visit
    addSiteVisit({
      customerName,
      phone,
      source,
      budget,
      preference,
      interest,
      followUpDue: 'Tomorrow',
      visitDate: entryTimestamp,
      notes: notes || 'No specific notes recorded.'
    });

    // Auto-create Follow-up based on SRS "Follow-up auto-created on entry"
    addFollowUp({
      customerName,
      phone,
      interest: preference,
      lastContact: entryTimestamp,
      nextDue: 'Tomorrow',
      status: interest,
      createdAt: entryTimestamp
    });

    setIsModalOpen(false);
    // reset form
    setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget('₹10L'); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
    setSelectedVisitIdForEdit(null);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitIdForEdit) return;

    updateSiteVisit(selectedVisitIdForEdit, {
      customerName,
      phone,
      source,
      budget,
      preference,
      interest,
      notes
    });

    setIsModalOpen(false);
    setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget('₹10L'); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
    setSelectedVisitIdForEdit(null);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Site Visit Ledger exported successfully to CSV.");
    }, 2000);
  };

  // Metrics
  const totalVisits = siteVisits.length;
  const hotLeads = siteVisits.filter(v => v.interest === 'Hot').length;
  const pendingFollowups = siteVisits.filter(v => v.followUpDue === 'Today' || v.followUpDue === 'Tomorrow').length;
  const convertedCount = queries.filter(q => q.status === 'Converted').length;
  const conversionRate = totalVisits > 0 ? Math.round((convertedCount / totalVisits) * 100) : 0;

  // Filtering Logic
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSearch, setFilterSearch] = useState<string>('');

  const filteredVisits = siteVisits.filter(v => {
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchesSearch = v.customerName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      v.phone.includes(filterSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Site visits Registry</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Walk-in customer records — captured on-site, offline-ready</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              size="default"
              className="px-8 flex items-center gap-2 shadow-lg shadow-black/10 rounded-lg"
              onClick={() => {
                setSelectedVisitIdForEdit(null);
                setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget('₹10L'); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
                setIsModalOpen(true);
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Record Visitor Entry
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            label="TOTAL VISITS"
            value={totalVisits}
            trend={{ value: "Physical Audit", type: "neutral" }}
          />
          <KPICard
            label="HOT LEADS"
            value={hotLeads}
            trend={{ value: "Decision Ready", type: "up" }}
          />
          <KPICard
            label="FOLLOW-UPS"
            value={pendingFollowups}
            trend={{ value: "Next 24h Queue", type: "neutral" }}
          />
          <KPICard
            label="CONVERSION INDEX"
            value={`${conversionRate}%`}
            trend={{ value: "Lead → Registry", type: "up" }}
          />
        </div>

        {/* Main Registry Ledger */}
        <Card className="p-0 overflow-hidden min-h-[600px]">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-[12px] font-bold text-[var(--text)] uppercase tracking-[2px]">Visitor Authentication Ledger</h2>
              <p className="text-[10px] font-medium text-[var(--text3)] uppercase tracking-[1px] mt-1 opacity-60">Zonal physical audit logs</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 font-bold text-[11px] uppercase tracking-wider border-[var(--border)] hover:bg-[var(--bg)] transition-all rounded-lg"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchronizing...' : 'Live Data Sync'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 font-bold text-[11px] uppercase tracking-wider border-[var(--border)] hover:bg-[var(--bg)] transition-all rounded-lg"
                onClick={() => setIsFilterOpen(true)}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                Filter Protocol
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 font-bold text-[11px] uppercase tracking-wider border-[var(--border)] hover:bg-[var(--bg)] transition-all rounded-lg"
                disabled={isExporting}
                onClick={handleExport}
              >
                {isExporting ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <DocumentChartBarIcon className="w-4 h-4" />
                )}
                {isExporting ? 'Exporting...' : 'Export Ledger'}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Subject Identity</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Discovery Path</th>
                  <th className="p-[12px_15px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Protocol State</th>
                  <th className="p-[12px_15px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Interest Intensity</th>
                  <th className="p-[12px_15px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Actions</th>
                  <th className="p-[12px_24px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Registry Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredVisits.map(visit => (
                  <tr
                    key={visit.id}
                    onClick={() => setSelectedVisitId(visit.id)}
                    className="group hover:bg-[var(--bg)] transition-all cursor-pointer"
                  >
                    <td className="p-[12px_24px]">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[var(--text)] tracking-tight leading-none uppercase group-hover:text-[var(--gold)] transition-colors">{visit.customerName}</span>
                        <span className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[1px] mt-2 opacity-40 leading-none">{visit.phone}</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <Badge variant="neutral">{visit.source.toUpperCase()}</Badge>
                    </td>
                    <td className="p-[12px_15px] text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <Select
                          value={visit.status || 'Visited'}
                          onChange={(e) => updateSiteVisitStatus(visit.id, e.target.value as any)}
                          className="w-[130px] h-9 text-[11px] font-bold uppercase tracking-wider"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Visited">Visited</option>
                          <option value="No Show">No Show</option>
                        </Select>
                      </div>
                    </td>
                    <td className="p-[12px_15px] text-right">
                      <div className="flex flex-col items-end">
                        <Badge variant={
                          visit.interest === 'Hot' ? 'danger' :
                            visit.interest === 'Warm' ? 'warning' : 'neutral'
                        }>
                          {visit.interest.toUpperCase()}
                        </Badge>
                        <span className="text-[11px] font-bold text-[var(--text2)] mt-2">{visit.preference}</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px] text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:text-[var(--gold)] border-none bg-transparent"
                          onClick={() => {
                            // Set form values for editing
                            setCustomerName(visit.customerName);
                            setPhone(visit.phone);
                            setSource(visit.source);
                            setBudget(visit.budget);
                            setPreference(visit.preference);
                            setInterest(visit.interest);
                            setNotes(visit.notes || '');
                            setSelectedVisitIdForEdit(visit.id);
                            setIsModalOpen(true);
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:text-red-600 border-none bg-transparent"
                          onClick={() => {
                            if (confirm("Confirm deletion of this visitor record from primary ledger?")) {
                              deleteSiteVisit(visit.id);
                            }
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-[12px_24px] text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[12px] font-bold text-[var(--text)] tracking-tight leading-none tabular-nums opacity-60 uppercase">{visit.visitDate}</span>
                        <Button
                          variant="secondary" size="inline"
                          className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity !px-4 text-[10px] font-black uppercase tracking-widest border-[var(--border)] rounded-lg"
                        >
                          Detailed Audit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Record Visit Entry Modal - Outside the animated container */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div>
                <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                  {selectedVisitIdForEdit ? 'Update Visitor Registry' : 'Visitor Authentication'}
                </h2>
                <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">
                  {selectedVisitIdForEdit ? 'Modifying existing zonal audit record' : 'Automatic next-day follow-up protocol'}
                </p>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => {
                setIsModalOpen(false);
                setSelectedVisitIdForEdit(null);
                setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget('₹10L'); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
              }}>✕</Button>
            </div>

            <form onSubmit={selectedVisitIdForEdit ? handleUpdateSubmit : handleAddSubmit} className="p-8 space-y-6 text-left">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Subject Identity</label>
                    <Input required v2={true} value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" placeholder="FULL NAME" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Discovery Source</label>
                    <Select v2={true} value={source} onChange={e => setSource(e.target.value)}>
                      <option value="Walk-in">Walk-in Inbound</option>
                      <option value="Broker Ref">Broker Reference</option>
                      {brokers.filter(b => b.status === 'Active').map(b => (
                        <option key={b.id} value={`Broker: ${b.name}`}>{b.name} (Broker)</option>
                      ))}
                      <option value="Meta Ad">Meta Advertising</option>
                      <option value="Website">Website Form</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Yield Bracket</label>
                    <Input required v2={true} value={budget} onChange={e => setBudget(e.target.value)} type="text" placeholder="₹10-15 L" className="text-[var(--gold)]" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Authorized Contact</label>
                    <Input required v2={true} value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+91 XXXX" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Interest Intensity</label>
                    <Select v2={true} value={interest} onChange={e => setInterest(e.target.value as InterestLevel)}>
                      <option value="Hot">Hot (Negotiation)</option>
                      <option value="Warm">Warm (Standard)</option>
                      <option value="Cold">Cold (Discovery)</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Operational Preference</label>
                    <Select v2={true} value={preference} onChange={e => setPreference(e.target.value)}>
                      {layouts.map(l => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                      ))}
                      {layouts.length === 0 && <option value="Plot 150sqyd">Plot 150sqyd</option>}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  v2={true}
                  className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[11px]"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedVisitIdForEdit(null);
                    setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget('₹10L'); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
                  }}
                >
                  Abort Protocol
                </Button>
                <Button
                  type="submit"
                  v2={true}
                  className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[11px]"
                >
                  {selectedVisitIdForEdit ? 'Update Protocol Record' : 'Commit Registry ENTRY'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Side Panel - Outside the animated container */}
      {selectedVisit ? (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300`}>
          <div className="bg-white rounded-xl p-0 w-full max-w-2xl h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm">
                  <IdentificationIcon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-2">{selectedVisit.customerName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/10 uppercase tracking-widest">
                      AUTHENTICATED
                    </span>
                    <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[2px] opacity-80 leading-none">Node: {selectedVisit.source}</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setSelectedVisitId(null)}>✕</Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 text-left">
              {/* Discovery Blueprint Card */}
              <div className="p-8 bg-white rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--gold)]/5 rounded-bl-full blur-xl group-hover:bg-[var(--gold)]/10 transition-all duration-500"></div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[3px]">Discovery Blueprint</span>
                  <Badge variant={selectedVisit.interest === 'Hot' ? 'danger' : selectedVisit.interest === 'Warm' ? 'warning' : 'neutral'} className="font-black px-3 py-1 text-[9px] border-none shadow-sm">
                    {selectedVisit.interest.toUpperCase()} INTENSITY
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] mb-2 opacity-50">Operational Preference</p>
                    <p className="text-[16px] font-black text-[var(--text)] tracking-tight uppercase leading-none italic font-serif">{selectedVisit.preference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] mb-2 opacity-50">Authorized Yield</p>
                    <p className="text-[18px] font-black text-[var(--gold)] tracking-tight leading-none font-serif">{selectedVisit.budget}</p>
                  </div>
                </div>
              </div>

              {/* Registry Details */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[2px] border-b border-[var(--border)] pb-3 flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-4 h-4 opacity-50" />
                  Registry Credentials
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Discovery Path', value: selectedVisit.source, icon: <SignalIcon className="w-4 h-4" /> },
                    { label: 'Reference Contact', value: selectedVisit.phone, icon: <DevicePhoneMobileIcon className="w-4 h-4" /> },
                    { label: 'Registry Timestamp', value: selectedVisit.visitDate, icon: <ClockIcon className="w-4 h-4" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-[var(--gold)] group-hover:scale-110 transition-transform opacity-60">{item.icon}</span>
                        <span className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-[1px]">{item.label}</span>
                      </div>
                      <span className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observations Ledger */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[2px] flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 opacity-50" />
                  Authorized Observations
                </h3>
                <div className="p-8 bg-white border border-[var(--border)] rounded-xl shadow-sm relative overflow-hidden group/card text-[13px] text-[var(--text2)] leading-relaxed italic border-l-[6px] !border-l-[var(--gold)] font-medium">
                  &quot;{selectedVisit.notes || 'No registry notes provided.'}&quot;
                </div>
              </div>

              {/* Automated Follow-up Node */}
              <div className="flex items-center gap-5 p-8 bg-[var(--gold)] rounded-xl text-white overflow-hidden relative shadow-lg shadow-gold-500/10">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="p-4 bg-white/15 rounded-xl border border-white/10 shadow-inner">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[3px] leading-none mb-2">Automated Execution</p>
                  <p className="text-[12px] font-medium text-white uppercase tracking-[1px] leading-relaxed">
                    Follow-up protocol initialized for <span className="font-black text-white underline decoration-white/40 underline-offset-4 decoration-2">Tomorrow</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-[var(--border)] bg-[var(--bg)] flex gap-4">
              <Button
                variant="secondary"
                v2={true}
                className="flex-1 h-12 rounded-xl border-[var(--border)] text-[11px] font-bold uppercase tracking-[2px]"
                onClick={() => setSelectedVisitId(null)}
              >
                Abort Audit
              </Button>
              <Button
                v2={true}
                className="flex-[2] h-12 rounded-xl shadow-lg shadow-gold-500/10 text-[11px] font-bold uppercase tracking-[3px] gap-3"
                onClick={() => { updateSiteVisitStatus(selectedVisit.id, 'Visited'); setSelectedVisitId(null); }}
              >
                Verify Success <CheckCircleIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Filters Protocol Modal - Outside the animated container */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                  <AdjustmentsHorizontalIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">Filter Protocol</h2>
                  <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Refine Visitor Authentication Ledger</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsFilterOpen(false)}>✕</Button>
            </div>

            <div className="p-8 space-y-8 text-left">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Subject Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] opacity-40 ml-1" />
                  <Input
                    v2={true}
                    className="pl-12"
                    placeholder="NAME OR CONTACT..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Protocol State</label>
                <div className="grid grid-cols-2 gap-4">
                  {['All', 'Visited', 'Scheduled', 'No Show'].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? 'primary' : 'secondary'}
                      v2={true}
                      onClick={() => setFilterStatus(status)}
                      className="h-12 rounded-xl text-[11px] font-bold uppercase tracking-[2px] transition-all"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-[var(--bg)]/50 rounded-xl border border-dashed border-[var(--border)]">
                <p className="text-[10px] text-[var(--text3)] font-bold italic leading-relaxed uppercase tracking-[1px] opacity-60">
                  Advanced temporal filtering and zonal segmentation analytics are available for executive users.
                </p>
              </div>
            </div>

            <div className="p-8 border-t border-[var(--border)] bg-[var(--bg)]">
              <Button
                variant="secondary"
                v2={true}
                className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px]"
                onClick={() => {
                  setFilterStatus('All');
                  setFilterSearch('');
                }}
              >
                Reset All Parameters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
