"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import {
   MagnifyingGlassIcon,
   ArrowDownTrayIcon,
   PlusIcon,
   XMarkIcon,
   ChartBarIcon,
   ArrowPathIcon,
   HomeIcon,
   CurrencyRupeeIcon,
   DevicePhoneMobileIcon,
   CalendarDaysIcon,
   PaperAirplaneIcon,
   UserIcon,
   QueueListIcon,
   MagnifyingGlassCircleIcon,
   PencilIcon,
   TrashIcon,
   AdjustmentsHorizontalIcon,
   DocumentChartBarIcon,
   CheckCircleIcon,
   ClockIcon,
   SignalIcon,
   BoltIcon,
   IdentificationIcon,
   ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

export default function NewQueries() {
   const { queries, updateQueryStatus, addQuery, deleteQuery, updateQuery, brokers } = useStore();
   const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [selectedQueryIdForEdit, setSelectedQueryIdForEdit] = useState<string | null>(null);
   const [isSyncing, setIsSyncing] = useState(false);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [isExporting, setIsExporting] = useState(false);
   const [filterStatus, setFilterStatus] = useState<string>('All');
   const [filterSearch, setFilterSearch] = useState<string>('');

   const selectedQuery = queries.find(q => q.id === selectedQueryId);

   // Metrics
   const totalQueries = queries.length;
   const newQueries = queries.filter(q => q.status === 'New').length;
   const inProgress = queries.filter(q => q.status === 'In Progress').length;
   const convertedCount = queries.filter(q => q.status === 'Converted').length;
   const conversionRate = totalQueries > 0 ? Math.round((convertedCount / totalQueries) * 100) : 0;

   // Filtering Logic
   const filteredQueries = queries.filter(q => {
      const matchesStatus = filterStatus === 'All' || q.status === filterStatus;
      const matchesSearch = q.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
         q.phone.includes(filterSearch);
      return matchesStatus && matchesSearch;
   });

   const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 1500);
   };

   const handleExport = () => {
      setIsExporting(true);
      setTimeout(() => {
         setIsExporting(false);
         alert("Query Ledger exported successfully to CSV.");
      }, 2000);
   };

   const [mounted, setMounted] = React.useState(false); React.useEffect(() => { setMounted(true); }, []); if (!mounted) return null;

   return (
      <>
         <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
            {/* V2 Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="text-left">
                  <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Inbound Queries Ledger</h1>
                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                        LIVE OPERATIONAL STREAM
                     </span>
                     <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Discovery leads — captured across multi-channel ingestion nodes</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Button
                     v2={true}
                     size="default"
                     className="px-8 flex items-center gap-2 shadow-lg shadow-black/10 rounded-lg"
                     onClick={() => { setSelectedQueryIdForEdit(null); setIsAddModalOpen(true); }}
                  >
                     <PlusIcon className="w-4 h-4" />
                     Add Lead Registry
                  </Button>
               </div>
            </div>

            {/* KPI Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
               <KPICard
                  label="TOTAL INGESTION"
                  value={totalQueries}
                  trend={{ value: "Global Lead Inbound", type: "neutral" }}
               />
               <KPICard
                  label="UNPROCESSED"
                  value={newQueries}
                  trend={{ value: "Awaiting Action", type: "neutral" }}
               />
               <KPICard
                  label="IN NEGOTIATION"
                  value={inProgress}
                  trend={{ value: "Active Discovery", type: "up" }}
               />
               <KPICard
                  label="CONVERSION INDEX"
                  value={`${conversionRate}%`}
                  trend={{ value: "Yield Optimization", type: "up" }}
               />
            </div>

            {/* Main Registry Ledger */}
            <Card className="p-0 overflow-hidden min-h-[600px]">
               <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                  <div>
                     <h2 className="text-[12px] font-bold text-[var(--text)] uppercase tracking-[2px]">Inbound Discovery Ledger</h2>
                     <p className="text-[10px] font-medium text-[var(--text3)] uppercase tracking-[1px] mt-1 opacity-60">Zonal cross-channel lead management</p>
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
                           <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Discovery Source</th>
                           <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Project Interest</th>
                           <th className="p-[12px_15px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Protocol State</th>
                           <th className="p-[12px_15px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Actions</th>
                           <th className="p-[12px_24px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Commitment Target</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--border)]">
                        {filteredQueries.map(query => (
                           <tr
                              key={query.id}
                              onClick={() => setSelectedQueryId(query.id)}
                              className="group hover:bg-[var(--bg)] transition-all cursor-pointer"
                           >
                              <td className="p-[12px_24px]">
                                 <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-[var(--text)] tracking-tight leading-none uppercase group-hover:text-[var(--gold)] transition-colors">{query.name}</span>
                                    <span className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[1px] mt-2 opacity-40 leading-none">{query.phone}</span>
                                 </div>
                              </td>
                              <td className="p-[12px_15px]">
                                 <Badge variant="neutral">{query.source.toUpperCase()}</Badge>
                              </td>
                              <td className="p-[12px_15px]">
                                 <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-[var(--text2)] uppercase tracking-tight leading-none">{query.interest}</span>
                                    <span className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[1px] mt-2 opacity-60 leading-none font-price">{query.budget}</span>
                                 </div>
                              </td>
                              <td className="p-[12px_15px] text-right">
                                 <Badge variant={
                                    query.status === 'Converted' ? 'success' :
                                       query.status === 'New' ? 'info' :
                                          query.status === 'Lost' ? 'danger' : 'warning'
                                 }>
                                    {query.status.toUpperCase()}
                                 </Badge>
                              </td>
                              <td className="p-[12px_15px] text-center" onClick={(e) => e.stopPropagation()}>
                                 <div className="flex items-center justify-center gap-2">
                                    <Button
                                       variant="secondary"
                                       size="icon"
                                       className="hover:text-[var(--gold)] border-none bg-transparent"
                                       onClick={() => {
                                          setSelectedQueryIdForEdit(query.id);
                                          setIsAddModalOpen(true);
                                       }}
                                    >
                                       <PencilIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                       variant="secondary"
                                       size="icon"
                                       className="hover:text-red-600 border-none bg-transparent"
                                       onClick={() => {
                                          if (confirm("Confirm removal of this discovery lead from the primary registry?")) {
                                             deleteQuery(query.id);
                                          }
                                       }}
                                    >
                                       <TrashIcon className="w-4 h-4" />
                                    </Button>
                                 </div>
                              </td>
                              <td className="p-[12px_24px] text-right">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[12px] font-bold text-[var(--text)] tracking-tight leading-none uppercase tabular-nums opacity-60">{query.date}</span>
                                    <Button
                                       variant="secondary" size="inline"
                                       className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity !px-4 text-[10px] font-black uppercase tracking-widest border-[var(--border)] rounded-lg"
                                    >
                                       Snapshot Analysis
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

         {/* Fixed elements outside the animated container to avoid the 'contained' trap */}
         {/* Detail Side Panel */}
         <div className={`fixed top-0 right-0 h-screen w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-[250] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-[var(--border)] flex flex-col ${selectedQueryId ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedQuery ? (
               <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--sb)] to-[var(--gold)] rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                           <IdentificationIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[18px] font-black text-[var(--text)] uppercase tracking-[1px] font-serif">{selectedQuery.name}</h2>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/10 uppercase tracking-widest">
                                 AUTHENTICATED
                              </span>
                              <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[2px] opacity-80">Node: {selectedQuery.source}</p>
                           </div>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setSelectedQueryId(null)}>✕</Button>
                  </div>

                  <div className="space-y-8 text-left">
                     {/* Lead Engagement Blueprint */}
                     <div className="p-8 bg-gradient-to-b from-[var(--bg)] to-white rounded-2xl border border-[var(--border)] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                           <BoltIcon className="w-20 h-20 text-[var(--gold)]" />
                        </div>
                        <div className="flex justify-between items-center mb-6 relative">
                           <span className="text-[10px] font-bold text-[var(--text2)] uppercase tracking-[3px]">Engagement Blueprint</span>
                           <Badge variant={selectedQuery.status === 'Converted' ? 'success' : 'info'} className="rounded-md">
                              {selectedQuery.status.toUpperCase()} PROTOCOL
                           </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-8 relative">
                           <div className="text-left">
                              <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] mb-2 opacity-50">Target Portfolio</p>
                              <p className="text-[16px] font-black text-[var(--text)] tracking-tight uppercase leading-none font-serif">{selectedQuery.interest}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] mb-2 opacity-50">Yield Expectation</p>
                              <p className="text-[18px] font-black text-[var(--gold)] tracking-tight font-price leading-none">{selectedQuery.budget}</p>
                           </div>
                        </div>
                     </div>

                     {/* Discovery Credentials */}
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[2px] border-b border-[var(--border)] pb-3 flex items-center gap-2">
                           <SignalIcon className="w-3 h-3 text-[var(--gold)]" />
                           Discovery Credentials
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                           {[
                              { label: 'Authorized Contact', value: selectedQuery.phone, icon: <DevicePhoneMobileIcon className="w-4 h-4" /> },
                              { label: 'Ingestion Source', value: selectedQuery.source, icon: <ChartBarIcon className="w-4 h-4" /> },
                              { label: 'Ingestion Registry', value: selectedQuery.date, icon: <CalendarDaysIcon className="w-4 h-4" /> },
                           ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[var(--border)] group hover:bg-[var(--bg)] transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg)] flex items-center justify-center text-[var(--gold)] group-hover:bg-white transition-colors">
                                       {item.icon}
                                    </div>
                                    <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">{item.label}</span>
                                 </div>
                                 <span className="text-[12px] font-bold text-[var(--text)] uppercase tracking-tight">{item.value}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Intelligence Audit */}
                     <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[2px] flex items-center gap-2">
                           <ClipboardDocumentIcon className="w-3 h-3 text-[var(--gold)]" />
                           Intelligence Audit
                        </h3>
                        <div className="p-6 bg-white border border-[var(--border)] rounded-xl shadow-sm relative overflow-hidden group/card text-[13px] text-[var(--text2)] leading-relaxed italic font-serif border-l-[4px] !border-l-[var(--gold)]">
                           &quot;Subject expressing high interest in Phase 2 development. Immediate follow-up protocol recommended based on yield optimization targets. Lead demonstrates high intent profile.&quot;
                        </div>
                     </div>

                     {/* Synchronized Network Node */}
                     <div className="flex items-center gap-4 p-6 bg-slate-900 rounded-2xl text-white overflow-hidden relative shadow-xl mt-4">
                        <div className="p-3 bg-white/10 rounded-xl text-[var(--gold)]">
                           <ArrowPathIcon className="w-5 h-5" />
                        </div>
                        <div className="relative z-10 text-left">
                           <p className="text-[9px] font-bold text-white/30 uppercase tracking-[2px] leading-none mb-1.5">Lead Sync Protocol</p>
                           <p className="text-[11px] font-medium text-white/90 uppercase tracking-[0.5px] leading-relaxed">
                              Lead ingestion synchronized with <span className="font-black text-[var(--gold)] underline decoration-dotted">Central CRM Node</span>.
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-[var(--border)] flex gap-3">
                     <Button
                        variant="secondary" className="flex-1 font-bold text-[11px] uppercase tracking-wider !py-4 rounded-lg border-[var(--border)]"
                        onClick={() => setSelectedQueryId(null)}
                     >
                        Abort Audit
                     </Button>
                     <Button
                        variant="primary" className="flex-[2] font-bold text-[11px] uppercase tracking-wider !py-4 rounded-lg shadow-lg gap-2"
                        onClick={() => { updateQueryStatus(selectedQuery.id, 'In Progress'); setSelectedQueryId(null); }}
                     >
                        Execute Follow-up <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                     </Button>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 grayscale">
                  <div className="w-20 h-20 rounded-full bg-[var(--bg)] flex items-center justify-center mb-6">
                     <MagnifyingGlassIcon className="w-10 h-10 text-[var(--gold)]" />
                  </div>
                  <h3 className="text-[14px] font-bold text-[var(--text)] uppercase tracking-[3px]">Discovery Audit</h3>
                  <p className="text-[11px] text-[var(--text3)] mt-3 leading-relaxed font-medium uppercase tracking-tight">Select a lead record to visualize the acquisition trajectory and interaction intelligence.</p>
               </div>
            )}
         </div>

         {/* Query Entry Modal (Add/Edit) */}
         {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
               <div className="bg-white rounded-xl p-0 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center">
                     <div>
                        <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                           {selectedQueryIdForEdit ? 'Re-Authorize Discovery Lead' : 'Initialize Discovery Protocol'}
                        </h2>
                        <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Lead Registry Node Management</p>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsAddModalOpen(false)}>✕</Button>
                  </div>

                  <form onSubmit={(e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     const data = {
                        name: formData.get('name') as string,
                        phone: formData.get('phone') as string,
                        interest: formData.get('interest') as string,
                        budget: formData.get('budget') as string,
                        source: formData.get('source') as any,
                        status: (selectedQueryIdForEdit ? queries.find(q => q.id === selectedQueryIdForEdit)?.status : 'New') as any
                     };

                     if (selectedQueryIdForEdit) {
                        updateQuery(selectedQueryIdForEdit, data);
                     } else {
                        addQuery(data);
                     }
                     setIsAddModalOpen(false);
                     setSelectedQueryIdForEdit(null);
                  }} className="p-8">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Lead Identity</label>
                              <input
                                 required name="name" type="text"
                                 defaultValue={selectedQueryIdForEdit ? queries.find(q => q.id === selectedQueryIdForEdit)?.name : ''}
                                 placeholder="e.g. Rahul Sharma"
                                 className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/5 outline-none transition-all placeholder:text-[var(--text3)]/30 font-bold text-[13px] text-[var(--text)] uppercase tracking-tight"
                              />
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Discovery Node Source</label>
                              <select
                                 name="source"
                                 defaultValue={selectedQueryIdForEdit ? queries.find(q => q.id === selectedQueryIdForEdit)?.source : 'WhatsApp'}
                                 className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:border-[var(--gold)] outline-none transition-all font-bold text-[13px] text-[var(--text)] uppercase tracking-tight"
                              >
                                 <option value="WhatsApp">WhatsApp Inbound</option>
                                 <option value="Website">Website Form</option>
                                 <option value="Broker">Broker Reference</option>
                                 {brokers.filter(b => b.status === 'Active').map(b => (
                                    <option key={b.id} value={`Broker: ${b.name}`}>{b.name} (Broker)</option>
                                 ))}
                                 <option value="Meta Ad">Meta Advertising</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Authorized Phone</label>
                              <input
                                 required name="phone" type="tel"
                                 defaultValue={selectedQueryIdForEdit ? queries.find(q => q.id === selectedQueryIdForEdit)?.phone : ''}
                                 placeholder="+91 98765 43210"
                                 className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/5 outline-none transition-all placeholder:text-[var(--text3)]/30 font-bold text-[13px] text-[var(--text)] tabular-nums"
                              />
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Portfolio Interest</label>
                              <input
                                 required name="interest" type="text"
                                 defaultValue={selectedQueryIdForEdit ? queries.find(q => q.id === selectedQueryIdForEdit)?.interest : ''}
                                 placeholder="e.g. 2BHK Plot"
                                 className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/5 outline-none transition-all placeholder:text-[var(--text3)]/30 font-bold text-[13px] text-[var(--text)] uppercase tracking-tight"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-6">
                        <div>
                           <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2 px-1">Yield Bracket (Expected Budget)</label>
                           <input
                              required name="budget" type="text"
                              defaultValue={selectedQueryIdForEdit ? queries.find(q => q.id === selectedQueryIdForEdit)?.budget : ''}
                              placeholder="e.g. ₹45L - ₹60L"
                              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/5 outline-none transition-all placeholder:text-[var(--text3)]/30 font-bold text-[15px] text-[var(--gold)] uppercase tracking-tight font-price"
                           />
                        </div>

                        <div className="flex gap-4">
                           <Button type="button" variant="secondary" className="flex-1 !py-4 rounded-lg font-bold text-[11px] uppercase tracking-wider border-[var(--border)]" onClick={() => setIsAddModalOpen(false)}>Discard Registry</Button>
                           <Button type="submit" className="flex-[2] !py-4 rounded-lg font-bold text-[11px] uppercase tracking-[2px] shadow-lg shadow-[var(--gold)]/10">
                              {selectedQueryIdForEdit ? 'Update Lead Authority' : 'Commit Lead to Registry'}
                           </Button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Filter Protocol Side Panel */}
         <div className={`fixed top-0 right-0 h-screen w-[400px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-[300] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-[var(--border)] flex flex-col ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center">
               <div>
                  <h2 className="text-[18px] font-black text-[var(--text)] uppercase tracking-[1px] font-serif">Filter Protocol</h2>
                  <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Discovery Ledger Refinement</p>
               </div>
               <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsFilterOpen(false)}>✕</Button>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[2px] flex items-center gap-2">
                     <MagnifyingGlassIcon className="w-3 h-3 text-[var(--gold)]" />
                     Lead Identity Search
                  </h3>
                  <div className="relative">
                     <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)]" />
                     <input
                        type="text"
                        placeholder="SEARCH BY NAME OR PHONE..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--border)] bg-white focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/5 outline-none transition-all font-bold text-[12px] uppercase tracking-wider"
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[2px] flex items-center gap-2">
                     <SignalIcon className="w-3 h-3 text-[var(--gold)]" />
                     Protocol State (Status)
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                     {['All', 'New', 'In Progress', 'Converted', 'Lost'].map((status) => (
                        <button
                           key={status}
                           onClick={() => setFilterStatus(status)}
                           className={`flex items-center justify-between p-4 rounded-xl border transition-all ${filterStatus === status
                              ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-[var(--gold)] shadow-sm'
                              : 'border-[var(--border)] bg-white text-[var(--text3)] hover:bg-[var(--bg)] hover:border-[var(--text3)]/30'
                              }`}
                        >
                           <span className="text-[11px] font-bold uppercase tracking-wider">{status} Leads</span>
                           {filterStatus === status && <CheckCircleIcon className="w-5 h-5" />}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="p-6 bg-slate-900 rounded-2xl text-white overflow-hidden relative shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <DocumentChartBarIcon className="w-16 h-16" />
                  </div>
                  <div className="relative z-10 text-left">
                     <p className="text-[9px] font-bold text-white/30 uppercase tracking-[2px] mb-2 leading-none">Filtering Intelligence</p>
                     <p className="text-[11px] font-medium text-white/90 uppercase tracking-[0.5px] leading-relaxed">
                        Applying filters refines high-intent acquisition data across all ingestion nodes.
                     </p>
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-[var(--border)] bg-[var(--bg)] flex gap-3">
               <Button
                  variant="secondary"
                  className="flex-1 font-bold text-[11px] uppercase tracking-wider !py-4 rounded-lg border-[var(--border)]"
                  onClick={() => {
                     setFilterStatus('All');
                     setFilterSearch('');
                  }}
               >
                  Reset Protocol
               </Button>
               <Button
                  variant="primary"
                  className="flex-1 font-bold text-[11px] uppercase tracking-wider !py-4 rounded-lg shadow-lg"
                  onClick={() => setIsFilterOpen(false)}
               >
                  Apply Filters
               </Button>
            </div>
         </div>
      </>
   );
}
