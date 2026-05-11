"use client";
import React, { useState, useMemo } from 'react';
import { useStore, InterestLevel } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  IdentificationIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
  InformationCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function SiteVisit() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'visits' | 'leads'>('visits');

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
    brokers,
    constructionPhases
  } = useStore();

  const uniqueSites = useMemo(() => {
    const sites = new Set(constructionPhases.map(p => p.siteName));
    return Array.from(sites).filter(Boolean);
  }, [constructionPhases]);

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
  const [budget, setBudget] = useState('');
  const [preference, setPreference] = useState(layouts[0]?.name || 'Plot 150sqyd');
  const [interest, setInterest] = useState<InterestLevel>('Warm');
  const [notes, setNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const entryTimestamp = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    });

    addSiteVisit({
      customerName,
      phone,
      source,
      budget,
      preference,
      interest,
      followUpDue: 'Tomorrow',
      visitDate: entryTimestamp,
      notes: notes || 'No notes.'
    });

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
    setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget(''); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
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
    setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget(''); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
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
      alert("Visitor list exported.");
    }, 2000);
  };

  // Numbers
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

  // Leads section data
  const filteredLeads = queries.filter(q => {
    return q.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
           q.phone.includes(filterSearch);
  });

  const [mounted, setMounted] = React.useState(false); 
  React.useEffect(() => { setMounted(true); }, []); 
  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="text-left">
            <h1 className="text-[var(--h1-fs)] font-bold text-[var(--text)] tracking-tight leading-tight mb-2">Site Visits</h1>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Live</Badge>
              <span className="text-[14px] text-[var(--text3)] font-bold tracking-tight opacity-80 uppercase">List of people who visited</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              size="default"
              className="px-10 h-[56px] flex items-center gap-3 shadow-lg rounded-xl"
              onClick={() => {
                setSelectedVisitIdForEdit(null);
                setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget(''); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
                setIsModalOpen(true);
              }}
            >
              <PlusIcon className="w-5 h-5" />
              Add visitor
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            label="Total Visits"
            value={totalVisits}
            trend={{ value: "All visitors", type: "neutral" }}
          />
          <KPICard
            label="Interested"
            value={hotLeads}
            trend={{ value: "Hot", type: "up" }}
          />
          <KPICard
            label="Total Projects"
            value={uniqueSites.length}
            trend={{ value: "Working sites", type: "neutral" }}
          />
          <KPICard
            label="Pending Work"
            value={pendingFollowups}
            trend={{ value: "Follow-ups", type: "neutral" }}
          />
          <KPICard
            label="Success Rate"
            value={`${conversionRate}%`}
            trend={{ value: "Visit result", type: "up" }}
          />
        </div>

        {/* Project List / Site Selector */}
        <Card title="Projects List" subtitle="Sites where work is going on" className="p-6">
          <div className="flex flex-wrap gap-3 text-left">
            {uniqueSites.map(site => (
              <Badge key={site} variant="info" className="px-4 py-2 text-[12px] font-bold shadow-md uppercase tracking-wider bg-[#002B49] text-white">
                {site}
              </Badge>
            ))}
            {uniqueSites.length === 0 && (
              <p className="text-[12px] text-gray-400 font-bold uppercase italic">No active projects detected in construction phases.</p>
            )}
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b-2 border-[var(--border)] pb-0">
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-8 py-4 text-[13px] font-bold uppercase tracking-[2px] transition-all border-b-4 ${
              activeTab === 'visits' 
                ? 'border-[var(--gold)] text-gray-900 bg-gray-50/50' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Site Visits
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-8 py-4 text-[13px] font-bold uppercase tracking-[2px] transition-all border-b-4 ${
              activeTab === 'leads' 
                ? 'border-[var(--gold)] text-gray-900 bg-gray-50/50' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Leads
          </button>
        </div>

        {activeTab === 'visits' ? (
          <Card title="Visitor list" subtitle="Site visit records" actions={
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                className="h-[44px] px-5 gap-2 border-2 rounded-xl shadow-sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-[44px] px-5 gap-2 border-2 rounded-xl shadow-sm"
                onClick={() => setIsFilterOpen(true)}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                Filter
              </Button>
            </div>
          } className="p-0 overflow-hidden shadow-lg border-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                  <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Visitor</th>
                  <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Source</th>
                  <th className="p-[16px_20px] text-center text-[11px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                  <th className="p-[16px_20px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Interest</th>
                  <th className="p-[16px_20px] text-center text-[11px] font-bold text-gray-500 tracking-widest uppercase">Actions</th>
                  <th className="p-[16px_32px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Visit Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border)]">
                {filteredVisits.map(visit => (
                  <tr
                    key={visit.id}
                    onClick={() => setSelectedVisitId(visit.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-none"
                  >
                    <td className="p-[16px_32px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-none group-hover:text-amber-600">{visit.customerName}</span>
                        <span className="text-[12px] text-gray-400 font-bold mt-2 uppercase tracking-wider opacity-80 tabular-nums">{visit.phone}</span>
                      </div>
                    </td>
                    <td className="p-[16px_20px]">
                      <Badge variant="neutral" className="px-3 py-1 text-[10px] font-bold shadow-sm uppercase">{visit.source}</Badge>
                    </td>
                    <td className="p-[16px_20px] text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <Select
                          v2={true}
                          value={visit.status || 'Visited'}
                          onChange={(e) => updateSiteVisitStatus(visit.id, e.target.value as any)}
                          className="w-[140px] h-[44px] text-[11px] font-bold uppercase tracking-widest shadow-sm rounded-xl"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Visited">Visited</option>
                          <option value="No Show">No Show</option>
                        </Select>
                      </div>
                    </td>
                    <td className="p-[16px_20px] text-right">
                      <div className="flex flex-col items-end">
                        <Badge variant={
                          visit.interest === 'Hot' ? 'danger' :
                            visit.interest === 'Warm' ? 'warning' : 'neutral'
                        } className="px-3 py-1 text-[10px] font-bold shadow-sm uppercase">
                          {visit.interest}
                        </Badge>
                        <span className="text-[13px] font-bold text-gray-700 mt-2 uppercase tracking-tight">{visit.preference}</span>
                      </div>
                    </td>
                    <td className="p-[16px_20px] text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 border-2"
                          onClick={() => {
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
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                          onClick={() => {
                            if (confirm("Delete this record?")) {
                              deleteSiteVisit(visit.id);
                            }
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-[16px_32px] text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[14px] font-bold text-gray-500 tracking-tight tabular-nums opacity-80">{visit.visitDate}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        ) : (
          <Card title="Leads Overview" subtitle="System-wide captured leads" className="p-0 overflow-hidden shadow-lg border-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                    <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Lead Name</th>
                    <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Phone</th>
                    <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Source</th>
                    <th className="p-[16px_20px] text-center text-[11px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                    <th className="p-[16px_32px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[var(--border)]">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="p-[16px_32px] font-bold text-gray-900">{lead.name}</td>
                      <td className="p-[16px_20px] tabular-nums font-medium text-gray-500">{lead.phone}</td>
                      <td className="p-[16px_20px]">
                        <Badge variant="neutral" className="uppercase text-[10px]">{lead.source}</Badge>
                      </td>
                      <td className="p-[16px_20px] text-center">
                        <Badge variant={lead.status === 'Converted' ? 'success' : 'warning'} className="uppercase text-[10px]">
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-[16px_32px] text-right font-medium text-gray-700">{lead.interest}</td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase italic">
                        No leads found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-[var(--border)] shadow-md text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight uppercase">
                    {selectedVisitIdForEdit ? 'Update visit' : 'Add site visitor'}
                  </h2>
                  <p className="text-[12px] text-gray-500 font-bold tracking-widest mt-1 uppercase opacity-70">
                    {selectedVisitIdForEdit ? 'Modify existing entry' : 'New walk-in / scheduled visit'}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12" onClick={() => {
                setIsModalOpen(false);
                setSelectedVisitIdForEdit(null);
                setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget(''); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
              }}>✕</Button>
            </div>

            <form onSubmit={selectedVisitIdForEdit ? handleUpdateSubmit : handleAddSubmit} className="modal-body space-y-10 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Visitor name</Label>
                  <Input required v2={true} value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" placeholder="Full name" className="shadow-md rounded-2xl h-[56px]" />
                </div>
                <div className="space-y-4">
                  <Label required>Phone number</Label>
                  <Input required v2={true} value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+91 XXXX XXX XXX" className="shadow-md rounded-2xl h-[56px] tabular-nums" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Lead source</Label>
                  <Select v2={true} value={source} onChange={e => setSource(e.target.value)} className="shadow-md rounded-2xl h-[56px]">
                    <option value="Walk-in">Direct walk-in</option>
                    <option value="Broker Ref">Broker referral</option>
                    {brokers.filter(b => b.status === 'Active').map(b => (
                      <option key={b.id} value={`Broker: ${b.name}`}>{b.name}</option>
                    ))}
                    <option value="Meta Ad">Social media campaign</option>
                    <option value="Website">Direct website query</option>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label required>Interest level</Label>
                  <Select v2={true} value={interest} onChange={e => setInterest(e.target.value as InterestLevel)} className="shadow-md rounded-2xl h-[56px]">
                    <option value="Hot">Hot (Ready to book)</option>
                    <option value="Warm (Considering)">Warm</option>
                    <option value="Cold (Browsing)">Cold</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Property preference</Label>
                  <Select v2={true} value={preference} onChange={e => setPreference(e.target.value)} className="shadow-md rounded-2xl h-[56px]">
                    {layouts.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                    {layouts.length === 0 && <option value="Plot 150sqyd">Plot 150sqyd</option>}
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label required>Estimated budget (₹)</Label>
                  <Input required v2={true} value={budget} onChange={e => setBudget(e.target.value)} type="text" placeholder="e.g. 25,00,000" className="shadow-md rounded-2xl h-[56px] text-amber-600 font-price" />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Visit notes / Remarks</Label>
                <textarea
                  className="w-full p-6 h-32 rounded-2xl border-2 border-[var(--border)] bg-white focus:border-gray-900 outline-none transition-none font-bold text-[15px] shadow-md uppercase tracking-tight placeholder:text-gray-300"
                  placeholder="Enter details about the visit..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <InformationCircleIcon className="w-10 h-10 text-amber-500 shrink-0" />
                <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                  Adding a visit will create a follow-up for tomorrow.
                </p>
              </div>

              <div className="pt-6 flex gap-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedVisitIdForEdit(null);
                    setCustomerName(''); setPhone(''); setSource('Walk-in'); setBudget(''); setPreference(layouts[0]?.name || 'Plot 150sqyd'); setInterest('Warm'); setNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] h-[56px] rounded-2xl shadow-xl font-bold uppercase tracking-widest"
                >
                  {selectedVisitIdForEdit ? 'Update visit' : 'Add visit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Panel - Side drawer */}
      <div className={`fixed top-0 right-0 h-screen w-[520px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedVisitId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedVisit ? (
          <div className="flex-1 flex flex-col p-10 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-amber-600 border-2 border-[var(--border)] shadow-md">
                  <IdentificationIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-2">{selectedVisit.customerName}</h2>
                  <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest opacity-80">{selectedVisit.source}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12" onClick={() => setSelectedVisitId(null)}>✕</Button>
            </div>

            <div className="space-y-12">
              {/* Status Banner */}
              <div className="p-8 bg-gray-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BoltIcon className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-center mb-8 relative">
                  <span className="text-[11px] font-bold text-white/40 tracking-[3px] uppercase">Visitor interest</span>
                  <Badge variant={selectedVisit.interest === 'Hot' ? 'danger' : 'info'} className="px-3 py-1 text-[10px] font-bold uppercase shadow-sm">{selectedVisit.interest}</Badge>
                </div>
                <div className="relative">
                  <p className="text-3xl font-bold tracking-tight text-amber-500 mb-2">{selectedVisit.preference}</p>
                  <p className="text-[14px] font-bold text-white/60 uppercase tracking-[2px]">Budget: {selectedVisit.budget}</p>
                </div>
              </div>

              {/* Details Info */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-bold text-gray-900 tracking-[3px] uppercase border-b-2 border-[var(--border)] pb-4 flex items-center gap-3">
                  Visit documentation
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Source', value: selectedVisit.source, icon: <IdentificationIcon className="w-5 h-5" /> },
                    { label: 'Phone', value: selectedVisit.phone, icon: <DevicePhoneMobileIcon className="w-5 h-5" /> },
                    { label: 'Visit date', value: selectedVisit.visitDate, icon: <ClockIcon className="w-5 h-5" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-[var(--border)] shadow-sm hover:bg-gray-50 transition-none">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-amber-600 border-2 border-white shadow-sm">
                          {item.icon}
                        </div>
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                      </div>
                      <span className="text-[15px] font-bold text-gray-900 tracking-tight uppercase">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-gray-900 tracking-[3px] uppercase flex items-center gap-3">
                  Observation notes
                </h3>
                <div className="p-8 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-sm text-[15px] text-amber-900 leading-relaxed font-medium italic border-l-[8px] !border-l-amber-500 uppercase">
                  &quot;{selectedVisit.notes || 'No specific remarks recorded.'}&quot;
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 border-t-2 border-[var(--border)] flex gap-6">
              <Button
                variant="secondary" className="flex-1 h-[56px] font-bold uppercase tracking-widest shadow-md rounded-xl"
                onClick={() => setSelectedVisitId(null)}
              >
                Close
              </Button>
              <Button
                variant="primary" className="flex-[2] h-[56px] font-bold uppercase tracking-widest shadow-xl rounded-xl gap-3"
                onClick={() => { updateSiteVisitStatus(selectedVisit.id, 'Visited'); setSelectedVisitId(null); }}
              >
                Confirm visit <CheckCircleIcon className="w-6 h-6" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-[var(--border)] shadow-md text-amber-600">
                  <AdjustmentsHorizontalIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight uppercase">Search and Filter</h2>
                  <p className="text-[11px] text-gray-500 font-bold tracking-widest mt-1 uppercase opacity-70">Filter visitor list</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12" onClick={() => setIsFilterOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10 text-left">
              <div className="space-y-4">
                <Label>Search records</Label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name or phone..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full pl-14 pr-6 h-[60px] rounded-2xl border-2 border-[var(--border)] bg-white focus:border-gray-900 outline-none font-bold text-[15px] shadow-md uppercase tracking-tight"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Filter by visit status</Label>
                <div className="grid grid-cols-1 gap-3">
                  {['All', 'Visited', 'Scheduled', 'No Show'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex items-center justify-between px-6 h-[56px] rounded-2xl border-2 transition-none shadow-sm ${filterStatus === status
                        ? 'border-gray-900 bg-gray-50 text-gray-900'
                        : 'border-[var(--border)] bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                        }`}
                    >
                      <span className="text-[12px] font-bold tracking-widest uppercase">{status}</span>
                      {filterStatus === status && <CheckCircleIcon className="w-6 h-6 text-gray-900" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer flex gap-6 p-8">
              <Button
                variant="secondary"
                className="flex-1 h-[56px] font-bold uppercase tracking-widest shadow-md rounded-xl"
                onClick={() => {
                  setFilterStatus('All');
                  setFilterSearch('');
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                className="flex-1 h-[56px] font-bold uppercase tracking-widest shadow-xl rounded-xl"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
