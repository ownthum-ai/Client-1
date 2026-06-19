"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
   MagnifyingGlassIcon,
   ArrowPathIcon,
   PlusIcon,
   DevicePhoneMobileIcon,
   CalendarDaysIcon,
   PaperAirplaneIcon,
   PencilIcon,
   TrashIcon,
   AdjustmentsHorizontalIcon,
   DocumentChartBarIcon,
   CheckCircleIcon,
   SignalIcon,
   BoltIcon,
   IdentificationIcon,
   ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

export default function NewQueries() {
   const { queries, updateQueryStatus, addQuery, deleteQuery, updateQuery, brokers, followUps } = useStore();
   const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [selectedQueryIdForEdit, setSelectedQueryIdForEdit] = useState<string | null>(null);
   const [isSyncing, setIsSyncing] = useState(false);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [isExporting, setIsExporting] = useState(false);
   const [filterStatus, setFilterStatus] = useState<string>('All');
   const [filterSearch, setFilterSearch] = useState<string>('');

   const selectedQuery = queries.find(q => q.id === selectedQueryId);

   // Numbers
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
         alert("Queries exported.");
      }, 2000);
   };

   const [mounted, setMounted] = React.useState(false); React.useEffect(() => { setMounted(true); }, []); if (!mounted) return null;

   return (
      <>
         <div className="space-y-[var(--section-gap)] pb-20 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="text-left">
                  <h1 className="text-[var(--h1-fs)] font-bold text-[var(--text)] tracking-tight leading-tight mb-2">Customer Enquiries</h1>
                  <div className="flex items-center gap-3">
                     <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Live</Badge>
                     <span className="text-[14px] text-[var(--text3)] font-bold tracking-tight opacity-80 uppercase">People who contacted us</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Button
                     onClick={() => setIsAddModalOpen(true)}
                     className="h-[44px] px-6 gap-2 rounded-xl shadow-md font-bold text-[12px] uppercase"
                  >
                     <PlusIcon className="w-4 h-4" />
                     Add Enquiry
                  </Button>
               </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <KPICard
                  label="Total Enquiries"
                  value={totalQueries}
                  trend={{ value: "All customers", type: "neutral" }}
               />
               <KPICard
                  label="New Enquiries"
                  value={newQueries}
                  trend={{ value: "Waiting", type: "neutral" }}
               />
               <KPICard
                  label="In progress"
                  value={inProgress}
                  trend={{ value: "Active", type: "up" }}
               />
               <KPICard
                  label="Conversion"
                  value={`${conversionRate}%`}
                  trend={{ value: "Lead success", type: "up" }}
               />
            </div>

            {/* Query List */}
            <Card title="Query list" subtitle="Manage leads and status" actions={
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
                     Export
                  </Button>
               </div>
            } className="p-0 overflow-hidden shadow-lg border-2">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                           <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Customer</th>
                           <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Source</th>
                           <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Interest</th>
                           <th className="p-[16px_20px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                           <th className="p-[16px_20px] text-center text-[11px] font-bold text-gray-500 tracking-widest uppercase">Actions</th>
                           <th className="p-[16px_32px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Date</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-[var(--border)]">
                        {filteredQueries.map(query => (
                           <tr
                              key={query.id}
                              onClick={() => setSelectedQueryId(query.id)}
                              className="hover:bg-gray-50 cursor-pointer"
                           >
                              <td className="p-[16px_32px]">
                                 <div className="flex flex-col text-left">
                                    <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-none">{query.name}</span>
                                    <span className="text-[12px] text-gray-400 font-bold mt-2 uppercase tracking-wider opacity-80 tabular-nums">{query.phone}</span>
                                 </div>
                              </td>
                              <td className="p-[16px_20px]">
                                 <Badge variant="neutral" className="px-3 py-1 text-[10px] font-bold shadow-sm uppercase">{query.source}</Badge>
                              </td>
                              <td className="p-[16px_20px]">
                                 <div className="flex flex-col text-left">
                                    <span className="text-[14px] font-bold text-gray-700 tracking-tight leading-none">{query.interest}</span>
                                    <span className="text-[12px] font-bold text-amber-600 mt-2 font-price">{query.budget}</span>
                                 </div>
                              </td>
                              <td className="p-[16px_20px] text-right">
                                 <Badge variant={
                                    query.status === 'Converted' ? 'success' :
                                       query.status === 'New' ? 'info' :
                                          query.status === 'Lost' ? 'danger' : 'warning'
                                 } className="px-3 py-1 text-[10px] font-bold shadow-sm uppercase">
                                    {query.status}
                                 </Badge>
                              </td>
                              <td className="p-[16px_20px] text-center" onClick={(e) => e.stopPropagation()}>
                                 <div className="flex items-center justify-center gap-3">
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-10 w-10 border-2 hover:bg-gray-100 hover:text-gray-900 border-gray-100"
                                       onClick={() => setSelectedQueryIdForEdit(query.id)}
                                    >
                                       <PencilIcon className="w-4 h-4 text-gray-500" />
                                    </Button>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-10 w-10 border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border-gray-100"
                                       onClick={() => {
                                          if (confirm("Delete this lead?")) {
                                             deleteQuery(query.id);
                                          }
                                       }}
                                    >
                                       <TrashIcon className="w-4 h-4" />
                                    </Button>
                                 </div>
                              </td>
                              <td className="p-[16px_32px] text-right">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[14px] font-bold text-gray-500 tracking-tight tabular-nums opacity-80">{query.date}</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>

         {/* Detail Panel */}
         <div className={`fixed top-0 right-0 h-screen w-[460px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedQueryId ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedQuery ? (
               <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-sm font-bold shrink-0">
                           <IdentificationIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedQuery.name}</h2>
                           <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="success" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Verified</Badge>
                              <p className="text-[11px] text-amber-600 font-bold uppercase tracking-wider opacity-85">{selectedQuery.source}</p>
                           </div>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm flex items-center justify-center" onClick={() => setSelectedQueryId(null)}>✕</Button>
                  </div>

                  <div className="space-y-6">
                     {/* Lead Details */}
                     <div className="p-5 bg-gray-900 rounded text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                           <BoltIcon className="w-16 h-16" />
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                           <span className="text-[11px] font-bold text-white/45 tracking-[1.5px] uppercase">Requirement</span>
                           <Badge variant={selectedQuery.status === 'Converted' ? 'success' : 'info'} className="px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm">
                              {selectedQuery.status}
                           </Badge>
                        </div>
                        <div className="relative z-10">
                           <p className="text-xl font-bold tracking-tight text-amber-500 mb-1 uppercase leading-tight">{selectedQuery.interest}</p>
                           <p className="text-[13.5px] font-bold text-white/60 uppercase tracking-[1px]">Budget: {selectedQuery.budget}</p>
                        </div>
                     </div>

                     {/* Contact Info */}
                     <div className="space-y-3">
                        <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-[var(--border)] pb-2 flex items-center gap-2">
                           Contact information
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                           {[
                              { label: 'Phone No.', value: selectedQuery.phone, icon: <DevicePhoneMobileIcon className="w-4 h-4" /> },
                              { label: 'Source', value: selectedQuery.source, icon: <CalendarDaysIcon className="w-4 h-4" /> },
                              { label: 'Date', value: selectedQuery.date, icon: <CalendarDaysIcon className="w-4 h-4" /> },
                           ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded border border-[var(--border)] shadow-sm hover:bg-gray-50 transition-none">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded bg-gray-50 flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-inner shrink-0">
                                       {item.icon}
                                    </div>
                                    <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</span>
                                 </div>
                                 <span className="text-[14.5px] font-bold text-gray-900 tracking-tight uppercase">{item.value}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Notes */}
                     <div className="space-y-3">
                        <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase flex items-center gap-2">
                           Notes / Message
                        </h3>
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded shadow-sm text-[14px] text-amber-900 leading-relaxed font-semibold italic border-l-4 !border-l-amber-500 uppercase">
                           &quot;{selectedQuery.message || 'No additional message or notes provided for this enquiry.'}&quot;
                        </div>
                     </div>

                     {/* Timeline */}
                     {(() => {
                        const matchingFollowUp = followUps.find(f => f.phone === selectedQuery.phone || f.customerName.toLowerCase() === selectedQuery.name.toLowerCase());
                        if (!matchingFollowUp || !matchingFollowUp.interactions || matchingFollowUp.interactions.length === 0) return null;
                        return (
                           <div className="space-y-3">
                              <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                 Lead Timeline
                              </h3>
                              <div className="space-y-3 mt-3">
                                 {matchingFollowUp.interactions.map((interaction) => (
                                    <div key={interaction.id} className="p-4 bg-gray-50 rounded border border-gray-100 flex items-start gap-3 shadow-sm text-left">
                                       <div className="w-7 h-7 rounded bg-amber-100 flex items-center justify-center text-[11px] font-bold text-amber-700 shrink-0">
                                          {interaction.type.charAt(0)}
                                       </div>
                                       <div className="text-left flex-1">
                                          <div className="flex justify-between items-baseline mb-1">
                                             <span className="text-[12.5px] font-bold text-gray-900">{interaction.type} ({interaction.outcome})</span>
                                             <span className="text-[10.5px] text-gray-400 font-bold">{interaction.date}</span>
                                          </div>
                                          <p className="text-[13px] text-gray-600 font-medium">{interaction.notes}</p>
                                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Logged by: {interaction.loggedBy}</span>
                                       </div>
                                    </div>
                                 ))}
                               </div>
                           </div>
                        );
                     })()}
                  </div>

                  <div className="mt-auto pt-6 border-t border-[var(--border)] flex gap-4">
                     <Button
                        variant="secondary" className="h-[46px] px-4 font-bold uppercase tracking-wider shadow-sm rounded text-[12px] bg-white border flex items-center justify-center"
                        onClick={() => setSelectedQueryId(null)}
                     >
                        ✕
                     </Button>
                     <Button
                        variant="secondary" className="flex-1 h-[46px] font-bold uppercase tracking-wider shadow-sm rounded text-[12px] bg-white border"
                        onClick={() => setSelectedQueryIdForEdit(selectedQuery.id)}
                     >
                        Edit
                     </Button>
                     <Button
                        variant="primary" className="flex-[2] h-[46px] font-bold uppercase tracking-wider shadow-md rounded gap-2 text-[12px] flex items-center justify-center"
                        onClick={() => { updateQueryStatus(selectedQuery.id, 'In Progress'); setSelectedQueryId(null); }}
                     >
                        Process lead <PaperAirplaneIcon className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-16 text-center opacity-40">
                  <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-8 border-2 border-[var(--border)] shadow-md">
                     <MagnifyingGlassIcon className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 tracking-[4px] uppercase">No selection</h3>
                  <p className="text-[12px] text-gray-400 mt-4 leading-relaxed font-bold uppercase tracking-widest">Select a lead from the list to view profile.</p>
               </div>
            )}
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
                           <h2 className="text-[22px] font-bold text-gray-900 tracking-tight uppercase leading-none mb-1.5">Search Filters</h2>
                           <p className="text-[12px] text-gray-500 font-bold tracking-[2px] uppercase opacity-70 leading-none">Refine lead distribution matrix</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsFilterOpen(false)}>✕</Button>
                  </div>

                  <div className="modal-body space-y-10 text-left">
                     <div className="space-y-4">
                        <Label>Search customer record</Label>
                        <div className="relative">
                           <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                           <input
                              type="text"
                              placeholder="Name or phone..."
                              value={filterSearch}
                              onChange={(e) => setFilterSearch(e.target.value)}
                              className="w-full pl-16 pr-8 h-[64px] rounded-[24px] border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-amber-500 outline-none font-bold text-[16px] shadow-inner transition-all uppercase tracking-tight"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Label>Lifecycle classification</Label>
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
                                 <span className="text-[13px] font-bold tracking-[2px] uppercase">{status} leads</span>
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
                        Apply matrix
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {/* Add Enquiry Modal */}
         {isAddModalOpen && (
            <div className="modal-overlay">
               <div className="modal-container max-w-xl shadow-2xl rounded-[32px]">
                  <div className="modal-header p-5">
                     <div className="flex items-center gap-4 text-left">
                        <div className="modal-header-icon text-amber-600 w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                           <PlusIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                              Add New Enquiry
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1px] opacity-60 leading-none">Create a new customer profile</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-2 h-10 w-10 shadow-sm" onClick={() => setIsAddModalOpen(false)}>✕</Button>
                  </div>

                  <form className="modal-body space-y-6 text-left p-6" onSubmit={(e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     addQuery({
                        name: formData.get('name') as string,
                        phone: formData.get('phone') as string,
                        email: formData.get('email') as string || undefined,
                        source: formData.get('source') as any,
                        interest: formData.get('interest') as string,
                        budget: formData.get('budget') as string,
                        message: formData.get('message') as string || undefined,
                        status: formData.get('status') as any || 'New'
                     });
                     setIsAddModalOpen(false);
                  }}>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <Label required>Customer Name</Label>
                           <Input name="name" required placeholder="e.g. Arjun Mehta" className="h-[48px] rounded-xl" />
                        </div>
                        <div className="space-y-3">
                           <Label required>Phone Number</Label>
                           <Input name="phone" required placeholder="e.g. 9876543210" className="h-[48px] rounded-xl" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <Label>Email Address</Label>
                           <Input type="email" name="email" placeholder="e.g. arjun@example.com" className="h-[48px] rounded-xl" />
                        </div>
                        <div className="space-y-3">
                           <Label required>Lead Source</Label>
                           <Select name="source" required className="h-[48px] rounded-xl">
                              <option value="Website">Website</option>
                              <option value="Meta Ad">Meta Ad</option>
                              <option value="Walk-in">Walk-in</option>
                              <option value="Broker">Broker</option>
                              <option value="Referral">Referral</option>
                           </Select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <Label required>Property Interest</Label>
                           <Input name="interest" required placeholder="e.g. 3 BHK Apartment" className="h-[48px] rounded-xl" />
                        </div>
                        <div className="space-y-3">
                           <Label required>Budget Segment</Label>
                           <Input name="budget" required placeholder="e.g. ₹1.5 cr" className="h-[48px] rounded-xl" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <Label required>Initial Lifecycle Status</Label>
                           <Select name="status" required className="h-[48px] rounded-xl">
                              <option value="New">New</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Converted">Converted</option>
                              <option value="Lost">Lost</option>
                           </Select>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <Label>Additional Message / Notes</Label>
                        <textarea
                           name="message"
                           rows={3}
                           placeholder="Type customer requirements or specific interest..."
                           className="w-full p-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-amber-500 outline-none font-medium text-[13.5px] shadow-inner transition-all"
                        />
                     </div>

                     <div className="pt-2 flex gap-4">
                        <Button type="submit" className="flex-[2] h-[52px] rounded-xl shadow-lg font-bold text-[11px] uppercase">
                           Create lead profile
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-[52px] rounded-xl border-2 font-bold text-[11px] bg-white shadow-md uppercase hover:bg-gray-50">
                           Cancel
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Edit Enquiry Modal */}
         {selectedQueryIdForEdit && (() => {
            const queryToEdit = queries.find(q => q.id === selectedQueryIdForEdit);
            if (!queryToEdit) return null;
            return (
               <div className="modal-overlay">
                  <div className="modal-container max-w-xl shadow-2xl rounded-[32px]">
                     <div className="modal-header p-5">
                        <div className="flex items-center gap-4 text-left">
                           <div className="modal-header-icon text-amber-600 w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                              <PencilIcon className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                                 Edit Enquiry Profile
                              </h2>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1px] opacity-60 leading-none">Update customer information</p>
                           </div>
                        </div>
                        <Button variant="secondary" size="icon" className="rounded-lg border-2 h-10 w-10 shadow-sm" onClick={() => setSelectedQueryIdForEdit(null)}>✕</Button>
                     </div>

                     <form className="modal-body space-y-6 text-left p-6" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateQuery(queryToEdit.id, {
                           name: formData.get('name') as string,
                           phone: formData.get('phone') as string,
                           email: formData.get('email') as string || undefined,
                           source: formData.get('source') as any,
                           interest: formData.get('interest') as string,
                           budget: formData.get('budget') as string,
                           message: formData.get('message') as string || undefined,
                           status: formData.get('status') as any
                        });
                        setSelectedQueryIdForEdit(null);
                     }}>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label required>Customer Name</Label>
                              <Input name="name" required defaultValue={queryToEdit.name} className="h-[48px] rounded-xl" />
                           </div>
                           <div className="space-y-3">
                              <Label required>Phone Number</Label>
                              <Input name="phone" required defaultValue={queryToEdit.phone} className="h-[48px] rounded-xl" />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label>Email Address</Label>
                              <Input type="email" name="email" defaultValue={queryToEdit.email || ''} placeholder="e.g. arjun@example.com" className="h-[48px] rounded-xl" />
                           </div>
                           <div className="space-y-3">
                              <Label required>Lead Source</Label>
                              <Select name="source" required defaultValue={queryToEdit.source} className="h-[48px] rounded-xl">
                                 <option value="Website">Website</option>
                                 <option value="Meta Ad">Meta Ad</option>
                                 <option value="Walk-in">Walk-in</option>
                                 <option value="Broker">Broker</option>
                                 <option value="Referral">Referral</option>
                              </Select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label required>Property Interest</Label>
                              <Input name="interest" required defaultValue={queryToEdit.interest} className="h-[48px] rounded-xl" />
                           </div>
                           <div className="space-y-3">
                              <Label required>Budget Segment</Label>
                              <Input name="budget" required defaultValue={queryToEdit.budget} className="h-[48px] rounded-xl" />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label required>Lifecycle Status</Label>
                              <Select name="status" required defaultValue={queryToEdit.status} className="h-[48px] rounded-xl">
                                 <option value="New">New</option>
                                 <option value="In Progress">In Progress</option>
                                 <option value="Converted">Converted</option>
                                 <option value="Lost">Lost</option>
                              </Select>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Label>Additional Message / Notes</Label>
                           <textarea
                              name="message"
                              rows={3}
                              defaultValue={queryToEdit.message || ''}
                              placeholder="Type customer requirements or specific interest..."
                              className="w-full p-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-amber-500 outline-none font-medium text-[13.5px] shadow-inner transition-all"
                           />
                        </div>

                        <div className="pt-2 flex gap-4">
                           <Button type="submit" className="flex-[2] h-[52px] rounded-xl shadow-lg font-bold text-[11px] uppercase">
                              Save changes
                           </Button>
                           <Button type="button" variant="secondary" onClick={() => setSelectedQueryIdForEdit(null)} className="flex-1 h-[52px] rounded-xl border-2 font-bold text-[11px] bg-white shadow-md uppercase hover:bg-gray-50">
                              Cancel
                           </Button>
                        </div>
                     </form>
                  </div>
               </div>
            );
         })()}
      </>
   );
}
