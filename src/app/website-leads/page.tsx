"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
   MagnifyingGlassIcon,
   ArrowPathIcon,
   DevicePhoneMobileIcon,
   CalendarDaysIcon,
   PaperAirplaneIcon,
   PencilIcon,
   TrashIcon,
   AdjustmentsHorizontalIcon,
   DocumentChartBarIcon,
   CheckCircleIcon,
   IdentificationIcon,
   EnvelopeIcon,
   ChatBubbleLeftRightIcon,
   GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function WebsiteLeads() {
   const { queries, updateQueryStatus, deleteQuery, updateQuery } = useStore();
   const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
   const [isSyncing, setIsSyncing] = useState(false);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [isExporting, setIsExporting] = useState(false);
   const [filterStatus, setFilterStatus] = useState<string>('All');
   const [filterSearch, setFilterSearch] = useState<string>('');

   const websiteLeads = queries.filter(q => q.source === 'Website');
   const selectedQuery = websiteLeads.find(q => q.id === selectedQueryId);

   // Numbers
   const totalLeads = websiteLeads.length;
   const newLeads = websiteLeads.filter(q => q.status === 'New').length;
   const inProgress = websiteLeads.filter(q => q.status === 'In Progress').length;
   const convertedCount = websiteLeads.filter(q => q.status === 'Converted').length;

   // Filtering Logic
   const filteredLeads = websiteLeads.filter(q => {
      const matchesStatus = filterStatus === 'All' || q.status === filterStatus;
      const matchesSearch = q.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
         q.phone.includes(filterSearch) ||
         (q.email && q.email.toLowerCase().includes(filterSearch.toLowerCase()));
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
      }, 2000);
   };

   const [mounted, setMounted] = React.useState(false); 
   React.useEffect(() => { setMounted(true); }, []); 
   if (!mounted) return null;

   return (
      <>
         <div className="space-y-[var(--section-gap)] pb-20 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="text-left">
                  <h1 className="text-[var(--h1-fs)] font-bold text-[var(--text)] tracking-tight leading-tight mb-2">Website Leads</h1>
                  <div className="flex items-center gap-3">
                     <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm border border-green-200">Online Channel</Badge>
                     <span className="text-[14px] text-[var(--text3)] font-bold tabular-nums tracking-tight opacity-80 uppercase">Leads captured from the official portal</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Button
                     variant="secondary"
                     size="default"
                     className="px-8 h-[56px] flex items-center gap-3 shadow-md rounded-xl border-2"
                     onClick={handleSync}
                     disabled={isSyncing}
                  >
                     <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                     Refresh Portal
                  </Button>
               </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <KPICard
                  label="Total Web Leads"
                  value={totalLeads}
                  trend={{ value: "Portal Source", type: "neutral" }}
               />
               <KPICard
                  label="Unprocessed"
                  value={newLeads}
                  trend={{ value: "Awaiting Action", type: "neutral" }}
               />
               <KPICard
                  label="Active"
                  value={inProgress}
                  trend={{ value: "In Pipeline", type: "up" }}
               />
               <KPICard
                  label="Converted"
                  value={convertedCount}
                  trend={{ value: "Success", type: "up" }}
               />
            </div>

            {/* Lead List */}
            <Card title="Portal Submissions" subtitle="Direct website enquiries" actions={
               <div className="flex items-center gap-4">
                  <Button
                     variant="secondary"
                     size="sm"
                     className="h-[44px] px-5 gap-2 border-2 rounded-xl shadow-sm"
                     onClick={() => setIsFilterOpen(true)}
                  >
                     <AdjustmentsHorizontalIcon className="w-4 h-4" />
                     Filters
                  </Button>
                  <Button
                     variant="secondary"
                     size="sm"
                     className="h-[44px] px-5 gap-2 border-2 rounded-xl shadow-sm"
                     disabled={isExporting}
                     onClick={handleExport}
                  >
                     <DocumentChartBarIcon className="w-4 h-4" />
                     Export CSV
                  </Button>
               </div>
            } className="p-0 overflow-hidden shadow-lg border-2">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                           <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Customer</th>
                           <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Contact</th>
                           <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Interest</th>
                           <th className="p-[16px_20px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                           <th className="p-[16px_32px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Date</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-[var(--border)]">
                        {filteredLeads.map(lead => (
                           <tr
                              key={lead.id}
                              onClick={() => setSelectedQueryId(lead.id)}
                              className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                           >
                              <td className="p-[16px_32px]">
                                 <div className="flex flex-col text-left">
                                    <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-none">{lead.name}</span>
                                    <span className="text-[12px] text-gray-400 font-bold mt-2 uppercase tracking-wider opacity-80">{lead.email || 'NO EMAIL'}</span>
                                 </div>
                              </td>
                              <td className="p-[16px_20px]">
                                 <div className="flex flex-col text-left">
                                    <span className="text-[14px] font-bold text-gray-700 tracking-tight tabular-nums">{lead.phone}</span>
                                    <Badge variant="neutral" className="mt-2 w-fit px-2 py-0.5 text-[9px] font-bold shadow-sm uppercase tracking-tighter">Direct Web</Badge>
                                 </div>
                              </td>
                              <td className="p-[16px_20px]">
                                 <div className="flex flex-col text-left">
                                    <span className="text-[14px] font-bold text-gray-700 tracking-tight leading-none uppercase">{lead.interest}</span>
                                    <span className="text-[12px] font-bold text-amber-600 mt-2 font-price">{lead.budget}</span>
                                 </div>
                              </td>
                              <td className="p-[16px_20px] text-right">
                                 <Badge variant={
                                    lead.status === 'Converted' ? 'success' :
                                       lead.status === 'New' ? 'info' :
                                          lead.status === 'Lost' ? 'danger' : 'warning'
                                 } className="px-3 py-1 text-[10px] font-bold shadow-sm uppercase">
                                    {lead.status}
                                 </Badge>
                              </td>
                              <td className="p-[16px_32px] text-right">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[14px] font-bold text-gray-500 tracking-tight tabular-nums opacity-80">{lead.date}</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                           <tr>
                              <td colSpan={5} className="p-20 text-center opacity-40">
                                 <GlobeAltIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                 <p className="text-[13px] font-bold uppercase tracking-widest">No website leads found</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>

         {/* Detail Panel */}
         <div className={`fixed top-0 right-0 h-screen w-[460px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ease-in-out ${selectedQueryId ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedQuery ? (
               <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm shrink-0">
                           <IdentificationIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedQuery.name}</h2>
                           <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="success" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">Verified Web Lead</Badge>
                              <p className="text-[11px] text-amber-600 font-bold uppercase tracking-wider opacity-80 tabular-nums">ID: {selectedQuery.id.slice(-6)}</p>
                           </div>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm flex items-center justify-center hover:bg-gray-100 transition-all" onClick={() => setSelectedQueryId(null)}>✕</Button>
                  </div>

                  <div className="space-y-6">
                     {/* Web Content / Message */}
                     <div className="space-y-3">
                        <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase flex items-center gap-1.5">
                           Portal Content
                        </h3>
                        <div className="p-5 bg-gray-900 rounded text-white shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                              <ChatBubbleLeftRightIcon className="w-16 h-16" />
                           </div>
                           <div className="relative">
                              <p className="text-[11px] font-bold text-amber-400/60 uppercase tracking-[2px] mb-2.5">Submission Message:</p>
                              <p className="text-[14px] font-medium leading-relaxed italic text-white/90">
                                 &quot;{selectedQuery.message || "No content provided by the customer."}&quot;
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Lead Info Grid */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-amber-50 rounded border border-amber-100 text-left">
                           <p className="text-[11px] font-bold text-amber-800/50 uppercase tracking-[1.5px] mb-1.5">Requirement</p>
                           <p className="text-[15px] font-bold text-amber-900 uppercase tracking-tight">{selectedQuery.interest}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded border border-amber-100 text-left">
                           <p className="text-[11px] font-bold text-amber-800/50 uppercase tracking-[1.5px] mb-1.5">Budget Cap</p>
                           <p className="text-[15px] font-bold text-amber-900 tabular-nums">{selectedQuery.budget}</p>
                        </div>
                     </div>

                     {/* Contact Details */}
                     <div className="space-y-3">
                        <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-[var(--border)] pb-2 flex items-center gap-1.5">
                           Contact metadata
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                           {[
                              { label: 'Phone Line', value: selectedQuery.phone, icon: <DevicePhoneMobileIcon className="w-4 h-4" /> },
                              { label: 'Email ID', value: selectedQuery.email || 'N/A', icon: <EnvelopeIcon className="w-4 h-4" /> },
                              { label: 'Capture Date', value: selectedQuery.date, icon: <CalendarDaysIcon className="w-4 h-4" /> },
                           ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded border border-[var(--border)] shadow-sm hover:bg-gray-50 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded bg-gray-50 flex items-center justify-center text-amber-600 border border-white shadow-sm shrink-0">
                                       {item.icon}
                                    </div>
                                    <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                                 </div>
                                 <span className="text-[13.5px] font-bold text-gray-900 tracking-tight">{item.value}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                  </div>

                  <div className="mt-auto pt-6 border-t border-[var(--border)] flex gap-4">
                     <Button
                        variant="secondary" className="flex-1 h-[46px] font-bold uppercase tracking-wider shadow-sm rounded border text-[12px]"
                        onClick={() => setSelectedQueryId(null)}
                     >
                        Archive View
                     </Button>
                     <Button
                        variant="primary" className="flex-[2] h-[46px] font-bold uppercase tracking-wider shadow-md rounded gap-2 flex items-center justify-center text-[12px]"
                        onClick={() => { updateQueryStatus(selectedQuery.id, 'In Progress'); setSelectedQueryId(null); }}
                     >
                        Process Entry <PaperAirplaneIcon className="w-4 h-4" />
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
                     <div className="flex items-center gap-6">
                        <div className="modal-header-icon text-amber-600">
                           <AdjustmentsHorizontalIcon className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[22px] font-bold text-gray-900 tracking-tight uppercase leading-none mb-1.5">Portal Filters</h2>
                           <p className="text-[12px] text-gray-500 font-bold tracking-[2px] uppercase opacity-70 leading-none">Refine website leads matrix</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsFilterOpen(false)}>✕</Button>
                  </div>

                  <div className="modal-body space-y-10 text-left">
                     <div className="space-y-4">
                        <Label>Search records</Label>
                        <div className="relative">
                           <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                           <input
                              type="text"
                              placeholder="Name, phone or email..."
                              value={filterSearch}
                              onChange={(e) => setFilterSearch(e.target.value)}
                              className="w-full pl-16 pr-8 h-[64px] rounded-[24px] border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-amber-500 outline-none font-bold text-[16px] shadow-inner transition-all uppercase tracking-tight"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Label>Status classification</Label>
                        <div className="grid grid-cols-1 gap-4">
                           {['All', 'New', 'In Progress', 'Converted', 'Lost'].map((status) => (
                              <button
                                 key={status}
                                 onClick={() => setFilterStatus(status)}
                                 className={`flex items-center justify-between px-8 h-[60px] rounded-[20px] border-2 transition-all duration-300 shadow-sm ${filterStatus === status
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-100 bg-white text-gray-400 hover:border-amber-200 hover:bg-amber-50/30 hover:text-amber-600'
                                    }`}
                              >
                                 <span className="text-[13px] font-bold tracking-[2px] uppercase">{status} submissions</span>
                                 {filterStatus === status && <CheckCircleIcon className="w-6 h-6 text-amber-500" />}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="modal-footer flex gap-6 p-10 bg-gray-50/50 border-t-2 border-gray-100">
                     <Button
                        variant="secondary"
                        className="flex-1 h-[60px] font-bold uppercase tracking-widest shadow-md rounded-[20px] bg-white border-2"
                        onClick={() => {
                           setFilterStatus('All');
                           setFilterSearch('');
                        }}
                     >
                        Reset
                     </Button>
                     <Button
                        variant="primary"
                        className="flex-1 h-[60px] font-bold uppercase tracking-widest shadow-xl rounded-[20px]"
                        onClick={() => setIsFilterOpen(false)}
                     >
                        Apply Filter
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
