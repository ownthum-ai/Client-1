"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useStore, WeekendPost, TransmissionLog, UploadedCsv, ActivityFeedItem } from '@/store/useStore';
import {
   PlusIcon,
   MegaphoneIcon,
   CheckBadgeIcon,
   XMarkIcon,
   ClockIcon,
   AdjustmentsVerticalIcon,
   CommandLineIcon,
   SparklesIcon,
   PaperAirplaneIcon,
   ClipboardDocumentListIcon,
   ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { KPICard } from '@/components/ui/KPICard';

export default function Weekend() {
   const {
      weekendPosts,
      transmissionLogs,
      deployWeekendPost,
      deleteWeekendPost,
      sendWeekendPostNow,
      brochures,
      followUps,
      weekendRules,
      uploadedCsvs,
      activityFeed,
      addUploadedCsv,
      deleteUploadedCsv
   } = useStore();

   const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
   const [editingPost, setEditingPost] = useState<WeekendPost | null>(null);
   const [confirmSendPost, setConfirmSendPost] = useState<WeekendPost | null>(null);
   const [previewCsv, setPreviewCsv] = useState<UploadedCsv | null>(null);
   const [activeCampaign, setActiveCampaign] = useState<WeekendPost | null>(null);
   const [sendToast, setSendToast] = useState<string | null>(null);

   const fileInputRef = useRef<HTMLInputElement>(null);
   const csvInputRef = useRef<HTMLInputElement>(null);
   const [newPostTitle, setNewPostTitle] = useState('');
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [isUploading, setIsUploading] = useState(false);

   const downloadCsvTemplate = () => {
      const headers = ['CustomerID', 'FirstName', 'MiddleName', 'LastName', 'Phone', 'Email', 'Source', 'Notes'];
      const sampleData = ['CID-1001', 'John', 'M.', 'Doe', '919876543210', 'john@example.com', 'Walk-in', 'Interested in plot'];
      const csvContent = [headers, sampleData].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "advanced_customer_template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      Papa.parse(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const normalizedData = results.data.map((row: any) => {
               const phoneKey = Object.keys(row).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('contact') || k.toLowerCase().includes('number'));
               const fNameKey = Object.keys(row).find(k => k.toLowerCase().includes('first'));
               const mNameKey = Object.keys(row).find(k => k.toLowerCase().includes('middle'));
               const lNameKey = Object.keys(row).find(k => k.toLowerCase().includes('last'));
               const idKey = Object.keys(row).find(k => k.toLowerCase().includes('id'));
               const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));
               
               let phone = row[phoneKey || 'Phone'] || '';
               phone = phone.toString().replace(/\D/g, '');
               if (phone.length === 10) phone = '91' + phone;

               const fName = row[fNameKey || 'FirstName'] || '';
               const mName = row[mNameKey || 'MiddleName'] || '';
               const lName = row[lNameKey || 'LastName'] || '';
               const fullName = [fName, mName, lName].filter(Boolean).join(' ') || row['Name'] || row['Customer'] || 'Unknown Visitor';

               return {
                  ...row,
                  CustomerID: row[idKey || 'CustomerID'] || `TEMP-${Math.floor(Math.random()*10000)}`,
                  Name: fullName,
                  FirstName: fName,
                  MiddleName: mName,
                  LastName: lName,
                  Phone: phone,
                  Email: row[emailKey || 'Email'] || 'N/A',
                  Normalized: true
               };
            }).filter((row: any) => row.Phone.length >= 10);

            if (normalizedData.length > 0) {
               addUploadedCsv({
                  name: file.name,
                  data: normalizedData
               });
               alert(`Successfully extracted ${normalizedData.length} profiles.`);
            } else {
               alert("No valid records found. Please use the Template.");
            }
         },
         error: (error) => {
            console.error('CSV Parsing Error:', error);
            alert('Error parsing CSV file.');
         }
      });

      if (csvInputRef.current) csvInputRef.current.value = '';
   };

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setSelectedFile(file);
         setIsUploading(true);
         setTimeout(() => setIsUploading(false), 800);
      }
   };

   const handleSave = () => {
      if (!newPostTitle) return;

      if (editingPost) {
         deleteWeekendPost(editingPost.id);
      }

      deployWeekendPost({
         title: newPostTitle,
         type: selectedFile?.type.includes('video') ? 'Reel' : 'Static',
         status: 'Scheduled',
         image: selectedFile ? URL.createObjectURL(selectedFile) : (editingPost?.image || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800')
      });
      setIsSaveModalOpen(false);
      setEditingPost(null);
      setNewPostTitle('');
      setSelectedFile(null);
   };

   const openEditModal = (post: WeekendPost) => {
      setEditingPost(post);
      setNewPostTitle(post.title);
      setIsSaveModalOpen(true);
   };

   const kpis = [
      { label: 'Total contacts', value: transmissionLogs.length > 0 ? Array.from(new Set(transmissionLogs.map(l => l.postTitle))).length.toString() : '0', color: 'gold', trend: { value: 'Nodes', type: 'neutral' as const } },
      { label: 'Reach', value: transmissionLogs.reduce((acc, curr) => acc + curr.delivered, 0).toLocaleString(), color: 'green', trend: { value: 'Delivered', type: 'up' as const } },
      { label: 'Read rate', value: transmissionLogs.length > 0 ? (transmissionLogs.reduce((acc, curr) => acc + curr.read, 0) / transmissionLogs.reduce((acc, curr) => acc + curr.delivered, 0) * 100).toFixed(1) + '%' : '0%', color: 'blue', trend: { value: 'Read Rate', type: 'neutral' as const } },
      { label: 'Engagement', value: transmissionLogs.length > 0 ? (transmissionLogs.reduce((acc, curr) => acc + curr.read, 0) / transmissionLogs.reduce((acc, curr) => acc + (curr.delivered || 1), 0) * 100).toFixed(1) + '%' : '0%', color: 'red', trend: { value: 'Intent Pulse', type: 'up' as const } },
   ];

   const [mounted, setMounted] = React.useState(false); React.useEffect(() => { setMounted(true); }, []); if (!mounted) return null;

   return (
      <>
         <div className="space-y-[var(--section-gap)] pb-20 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="text-left">
                  <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Weekend Messages</h1>
                  <p className="text-[14px] text-gray-400 font-bold uppercase tracking-[2px] opacity-70">Send brochures to old customers every weekend</p>
               </div>
               <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                     variant="secondary"
                     onClick={() => csvInputRef.current?.click()}
                     className="flex-1 md:flex-none px-6 rounded-lg shadow-sm h-[56px] border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-bold"
                  >
                     <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-gray-400" />
                     Upload CSV
                  </Button>
                  <input
                     type="file"
                     ref={csvInputRef}
                     onChange={handleCsvFileChange}
                     accept=".csv"
                     className="hidden"
                  />
                  <Button
                     v2={true}
                     size="default"
                     onClick={() => setIsSaveModalOpen(true)}
                     className="flex-1 md:flex-none px-8 rounded-lg shadow-sm h-[56px]"
                  >
                     <PlusIcon className="w-4 h-4 mr-2" />
                     Create post
                  </Button>
               </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <KPICard label="Total Shared" value={transmissionLogs.length} trend={{ value: "Sent", type: "neutral" }} />
               <KPICard label="Upcoming" value={weekendPosts.length} trend={{ value: "Ready", type: "neutral" }} />
               <KPICard label="Customers" value={followUps.length} trend={{ value: "Total", type: "neutral" }} />
               <KPICard label="Rules Active" value={weekendRules.filter(r => r.enabled).length} trend={{ value: "Automatic", type: "neutral" }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
               {/* Main Content Area */}
               <div className="space-y-[var(--section-gap)]">

                  {/* Uploaded CSV Data */}
                  {uploadedCsvs.length > 0 && (
                     <Card className="bg-white border-2 shadow-lg overflow-hidden text-left rounded-2xl">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/30">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200 shadow-sm text-blue-600">
                                 <CommandLineIcon className="w-4 h-4" />
                              </div>
                              <div>
                                 <h2 className="text-[16px] font-bold text-[var(--text)]">Imported datasets</h2>
                                 <p className="text-[9px] text-[var(--text3)] font-bold mt-0.5 opacity-60">Raw CSV lead sources</p>
                              </div>
                           </div>
                           <Badge variant="info" className="text-[9px] font-bold tracking-widest px-2 py-0.5 shadow-sm uppercase">{uploadedCsvs.length} Files</Badge>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                                    <th className="p-[12px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">File Name</th>
                                    <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Date</th>
                                    <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Records</th>
                                    <th className="p-[12px_32px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y-2 divide-[var(--border)]">
                                 {uploadedCsvs.map((csv) => (
                                    <tr
                                       key={csv.id}
                                       className="hover:bg-gray-50 cursor-pointer transition-colors group/row"
                                       onClick={() => setPreviewCsv(csv)}
                                    >
                                       <td className="p-[10px_32px]">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-[var(--border)] flex items-center justify-center text-gray-400">
                                                <ClipboardDocumentListIcon className="w-4 h-4" />
                                             </div>
                                             <div className="flex flex-col text-left">
                                                <span className="text-[13px] font-bold text-gray-900 leading-none">{csv.name}</span>
                                                <span className="text-[9px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider opacity-80 leading-none">External Import</span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="p-[10px_20px]">
                                          <span className="text-[12px] font-bold text-gray-900 leading-none tabular-nums">{csv.date}</span>
                                       </td>
                                       <td className="p-[10px_20px]">
                                          <Badge variant="outline" className="text-[9px] font-bold border-[var(--border)] text-gray-500 shadow-sm uppercase px-2 py-0.5">{csv.data.length} records</Badge>
                                       </td>
                                       <td className="p-[10px_32px] text-right">
                                          <div className="flex items-center justify-end gap-2">
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   deleteUploadedCsv(csv.id);
                                                }}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                             >
                                                <XMarkIcon className="w-4 h-4" />
                                             </Button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </Card>
                  )}

                  {/* Scheduled Posts */}
                  <Card className="bg-white border-2 shadow-lg overflow-hidden text-left rounded-2xl">
                     <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/30">
                        <h2 className="text-[16px] font-bold text-[var(--text)]">Scheduled posts</h2>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                                 <th className="p-[12px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Post</th>
                                 <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Type</th>
                                 <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Schedule</th>
                                 <th className="p-[12px_32px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y-2 divide-[var(--border)]">
                              {weekendPosts.map((post) => (
                                 <tr
                                    key={post.id}
                                    className={`cursor-pointer transition-colors duration-200 ${activeCampaign?.id === post.id
                                       ? 'bg-blue-50 border-l-8 border-l-blue-600'
                                       : 'hover:bg-gray-50'}`}
                                    onClick={() => setActiveCampaign(activeCampaign?.id === post.id ? null : post)}
                                 >
                                    <td className="p-[10px_32px]">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-[var(--border)] overflow-hidden">
                                             <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-80" />
                                          </div>
                                          <div className="flex flex-col text-left">
                                             <div className="flex items-center gap-3">
                                                <span className={`text-[13px] font-bold tracking-tight leading-none ${activeCampaign?.id === post.id ? 'text-blue-700' : 'text-gray-900'}`}>{post.title}</span>
                                                {activeCampaign?.id === post.id && (
                                                   <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black bg-blue-100 text-blue-700 tracking-[1px] uppercase">
                                                      Selected
                                                   </span>
                                                )}
                                             </div>
                                             <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-gray-400 font-bold opacity-80 leading-none uppercase tracking-wider">v2.4</span>
                                                {post.attachedBrochureId && (() => {
                                                   const attachedBrochure = brochures.find(b => b.id === post.attachedBrochureId);
                                                   return attachedBrochure ? (
                                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-[var(--gold-lt)] text-[var(--gold)] border border-[var(--gold)]/20 tracking-wider">
                                                         Brochure v{attachedBrochure.version}
                                                      </span>
                                                   ) : null;
                                                })()}
                                             </div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="p-[10px_20px]">
                                       <Badge variant="outline" className="text-[10px] font-bold border-[var(--border)] text-gray-500 shadow-sm uppercase">{post.type}</Badge>
                                    </td>
                                    <td className="p-[10px_20px]">
                                       <div className="flex flex-col text-left">
                                          <span className="text-[12px] font-bold text-gray-900 leading-none">Sat 09:00 AM</span>
                                          <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider opacity-80 leading-none">Send</span>
                                       </div>
                                    </td>
                                    <td className="p-[10px_32px] text-right">
                                       <div className="flex items-center justify-end gap-2">
                                          <Badge variant="info" className="tracking-widest text-[10px] font-bold mr-2 uppercase shadow-sm">{post.status}</Badge>
                                          <Button
                                             v2={true}
                                             size="sm"
                                             onClick={() => setConfirmSendPost(post)}
                                             className="text-[9px] font-bold px-4 h-8 rounded-lg shadow-sm"
                                          >
                                             <PaperAirplaneIcon className="w-3.5 h-3.5 mr-1.5" />
                                             Send now
                                          </Button>
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             onClick={() => openEditModal(post)}
                                             className="text-[var(--text2)] hover:text-[var(--gold)] border-none bg-transparent"
                                          >
                                             <AdjustmentsVerticalIcon className="w-4 h-4" />
                                          </Button>
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             onClick={() => deleteWeekendPost(post.id)}
                                             className="text-[var(--text2)] hover:text-[var(--red)] border-none bg-transparent"
                                          >
                                             <XMarkIcon className="w-4 h-4" />
                                          </Button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>


                  {/* Inactive Leads */}
                  {(() => {
                     const dormantLeads = followUps.filter(f => {
                        if (!f.createdAt) return false;
                        const created = new Date(f.createdAt);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - created.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays > 21;
                     });

                     if (dormantLeads.length === 0) return null;

                     return (
                        <Card className="bg-white border-2 shadow-lg overflow-hidden text-left border-500">
                           <div className="p-6 border-b border-[var(--border)] bg-amber-50/30 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200 shadow-sm text-amber-600">
                                    <ClockIcon className="w-4 h-4" />
                                 </div>
                                 <div className="text-left">
                                    <h2 className="text-[16px] font-bold text-[var(--text)]">Inactive leads</h2>
                                    <p className="text-[9px] text-[var(--text3)] font-bold mt-0.5 opacity-60">Over 21 days old</p>
                                 </div>
                              </div>
                              <Badge variant="warning" className="text-[9px] font-bold tracking-widest px-2 py-0.5 shadow-sm">{dormantLeads.length} leads</Badge>
                           </div>
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                                       <th className="p-[12px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Lead</th>
                                       <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Last contact</th>
                                       <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Lead age</th>
                                       <th className="p-[12px_32px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Action</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y-2 divide-[var(--border)]">
                                    {dormantLeads.map((lead) => {
                                       const created = new Date(lead.createdAt);
                                       const age = Math.ceil(Math.abs(new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

                                       return (
                                          <tr key={lead.id} className="hover:bg-gray-50">
                                             <td className="p-[10px_32px]">
                                                <div className="flex items-center gap-3 text-left">
                                                   <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-sm">
                                                      {lead.customerName.charAt(0)}
                                                   </div>
                                                   <div className="flex flex-col text-left">
                                                      <span className="text-[13px] font-bold text-gray-900 leading-none">{lead.customerName}</span>
                                                      <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider opacity-80 tabular-nums">{lead.phone}</span>
                                                   </div>
                                                </div>
                                             </td>
                                             <td className="p-[10px_20px]">
                                                <span className="text-[12px] font-bold text-gray-900 leading-none">{lead.lastContact}</span>
                                             </td>
                                             <td className="p-[10px_20px]">
                                                <Badge variant="outline" className="text-[9px] font-bold bg-gray-100 border-[var(--border)] px-2 py-0.5 shadow-sm uppercase">{age} days</Badge>
                                             </td>
                                             <td className="p-[10px_32px] text-right">
                                                <Button
                                                   v2={true}
                                                   size="sm"
                                                   onClick={() => {
                                                      if (!activeCampaign) { alert("Select a campaign from 'Scheduled posts' first."); return; }
                                                      sendWeekendPostNow(activeCampaign.title, 1);
                                                      alert(`Sent to ${lead.customerName}`);
                                                   }}
                                                   className="text-[9px] font-bold px-3 h-7 rounded-md bg-amber-50 text-amber-600 border border-amber-100 shadow-sm"
                                                >
                                                   <PaperAirplaneIcon className="w-3 h-3 mr-1.5" />
                                                   Send
                                                </Button>
                                             </td>
                                          </tr>
                                       );
                                    })}
                                 </tbody>
                              </table>
                           </div>
                           <div className="p-4 bg-gray-50/50 border-t border-[var(--border)]">
                              <Button
                                 v2={true}
                                 className="w-full text-[10px] font-bold tracking-[3px] h-10 rounded-lg shadow-sm"
                                 onClick={() => {
                                    if (!activeCampaign) { alert("Select a campaign from 'Scheduled posts' first."); return; }
                                    sendWeekendPostNow(activeCampaign.title, dormantLeads.length);
                                    alert(`Sent to all ${dormantLeads.length} leads.`);
                                 }}
                              >
                                 <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                                 Send to all
                              </Button>
                           </div>
                        </Card>
                     );
                  })()}
               </div>

               {/* Sidebar */}
               <div className="space-y-[var(--section-gap)]">
                  {/* Recent Work Feed */}
                  <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left rounded-2xl">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-[var(--green-lt)] rounded-xl flex items-center justify-center border border-[var(--green)]/20 shadow-sm text-[var(--green)]">
                           <ClipboardDocumentListIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <h3 className="text-[15px] font-bold text-[var(--text)] leading-none mb-1">Feed</h3>
                           <p className="text-[9px] font-bold tracking-widest text-[var(--text3)] uppercase">Live updates</p>
                        </div>
                     </div>
                     <div className="space-y-3">
                        {activityFeed.length > 0 ? activityFeed.slice(0, 8).map((item) => (
                           <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-[var(--border)] flex items-start gap-3 shadow-sm">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === 'weekend_post' ? 'bg-[var(--gold)]' :
                                 item.type === 'booking' ? 'bg-[var(--green)]' :
                                    item.type === 'payment' ? 'bg-blue-500' :
                                       'bg-[var(--text3)]'
                                 }`}></div>
                              <div className="text-left">
                                 <p className="text-[11px] font-bold text-[var(--text)] leading-snug">{item.message}</p>
                                 <p className="text-[9px] font-bold text-[var(--text3)] mt-1 opacity-50">{item.timestamp}</p>
                              </div>
                           </div>
                        )) : (
                           <div className="text-center py-8 opacity-30">
                              <ClipboardDocumentListIcon className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-[9px] font-bold uppercase tracking-widest">No activity</p>
                           </div>
                        )}
                     </div>
                  </Card>
               </div>
            </div>
         </div>

         {/* Modals */}
         {isSaveModalOpen && (
            <div className="modal-overlay">
               <div className="modal-container shadow-2xl rounded-[32px] max-w-xl">
                  <div className="modal-header p-5">
                     <div className="flex items-center gap-4 text-left">
                        <div className="modal-header-icon text-amber-600 w-10 h-10">
                           <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                              {editingPost ? 'Update post' : 'Add post'}
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1px] opacity-60 leading-none">Weekend dispatch setup</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-2 h-10 w-10 shadow-sm" onClick={() => { setIsSaveModalOpen(false); setEditingPost(null); setNewPostTitle(''); }}>✕</Button>
                  </div>

                  <form className="modal-body space-y-6 text-left p-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                     <div className="space-y-3">
                        <Label required className="text-[11px] uppercase tracking-wider">Visual asset</Label>
                        <div
                           onClick={() => fileInputRef.current?.click()}
                           className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:bg-gray-100 cursor-pointer shadow-inner overflow-hidden relative transition-all group"
                        >
                           <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
                           {selectedFile || (editingPost && editingPost.image) ? (
                              <div className="w-full h-full relative">
                                 <img
                                    src={selectedFile ? URL.createObjectURL(selectedFile) : editingPost?.image}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                 />
                                 <div className="absolute inset-0 bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                                    <span className="text-white text-[9px] font-bold uppercase tracking-[2px] border-2 border-white/50 px-4 py-2 rounded-xl">Change media</span>
                                 </div>
                              </div>
                           ) : (
                              <div className="text-center space-y-3">
                                 <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-300 group-hover:text-amber-500 transition-colors" />
                                 <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Drop creative content</div>
                                    <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest opacity-60">MP4, JPG, OR PNG</div>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-3">
                           <Label required className="text-[11px] uppercase tracking-wider">Post title</Label>
                           <Input
                              v2={true}
                              value={newPostTitle}
                              onChange={e => setNewPostTitle(e.target.value)}
                              placeholder="e.g. Weekend Exclusive Showcase"
                              required
                              className="h-[48px] shadow-sm rounded-xl font-bold text-[13px] uppercase px-4"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label required className="text-[11px] uppercase tracking-wider">Type</Label>
                              <Select v2={true} className="h-[48px] shadow-sm rounded-xl font-bold text-[13px] uppercase">
                                 <option>Static creative</option>
                                 <option>Reel / Cinematic</option>
                                 <option>Carousel stack</option>
                              </Select>
                           </div>
                           <div className="space-y-3">
                              <Label required className="text-[11px] uppercase tracking-wider">Dispatch epoch</Label>
                              <Input type="time" defaultValue="09:00" v2={true} className="h-[48px] shadow-sm rounded-xl font-bold text-[13px] tabular-nums" />
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
                           <CheckBadgeIcon className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-amber-800 font-bold leading-tight uppercase tracking-wide opacity-80">
                           Post will be queued for weekend dispatch.
                        </p>
                     </div>

                     <div className="pt-2 flex gap-4">
                        <Button
                           type="submit"
                           disabled={!newPostTitle || isUploading}
                           className="flex-[2] h-[52px] rounded-xl shadow-lg font-bold tracking-[1px] text-[11px] uppercase transition-all duration-300"
                        >
                           {editingPost ? 'Save changes' : 'Save post'}
                        </Button>
                        <Button
                           variant="secondary"
                           onClick={() => { setIsSaveModalOpen(false); setEditingPost(null); setNewPostTitle(''); }}
                           className="flex-1 h-[52px] rounded-xl border-2 font-bold tracking-[1px] text-[11px] bg-white shadow-md uppercase hover:bg-gray-50 transition-all duration-300"
                        >
                           Cancel
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}


         {/* Send Confirmation Modal */}
         {confirmSendPost && (
            <div className="modal-overlay">
               <div className="modal-container shadow-2xl rounded-[32px] max-w-xl">
                  <div className="modal-header p-5">
                     <div className="flex items-center gap-4 text-left w-full">
                        <div className="modal-header-icon text-green-600 border-green-100 bg-green-50 shadow-green-500/5 w-10 h-10">
                           <PaperAirplaneIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                              Approve & Send
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1px] opacity-60 leading-none">Immediate mass transmission</p>
                        </div>
                        <Button variant="secondary" size="icon" className="rounded-lg border-2 h-10 w-10 shadow-sm" onClick={() => setConfirmSendPost(null)}>✕</Button>
                     </div>
                  </div>

                  <div className="modal-body space-y-6 text-left p-6">
                     <div className="p-6 bg-gray-900 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                           <MegaphoneIcon className="w-20 h-20" />
                        </div>
                        <div className="relative z-10 space-y-2">
                           <p className="text-[9px] font-bold text-white/40 tracking-[2px] uppercase">Active campaign</p>
                           <p className="text-[18px] font-bold tracking-tight text-amber-500 uppercase leading-tight">{confirmSendPost.title}</p>
                           <div className="pt-2 flex items-center gap-2">
                              <Badge variant="success" className="bg-green-500/20 text-green-400 border-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">verified</Badge>
                              <Badge variant="info" className="bg-blue-500/20 text-blue-400 border-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">ready</Badge>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm text-center group hover:bg-white hover:border-amber-200 transition-all duration-300">
                           <p className="text-[9px] font-bold text-gray-400 tracking-[2px] mb-2 opacity-70 uppercase group-hover:text-amber-600 transition-colors">Target</p>
                           <p className="text-2xl font-bold text-gray-900 tracking-tighter tabular-nums">{followUps.filter(f => f.status !== 'Lost').length}</p>
                           <p className="text-[9px] font-bold text-gray-400 tracking-[1px] mt-2 uppercase opacity-60">Leads</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm text-center group hover:bg-white hover:border-green-200 transition-all duration-300">
                           <p className="text-[9px] font-bold text-gray-400 tracking-[2px] mb-2 opacity-70 uppercase group-hover:text-green-600 transition-colors">Channel</p>
                           <p className="text-2xl font-bold text-green-600 tracking-tighter uppercase">WA-BIZ</p>
                           <p className="text-[9px] font-bold text-green-700/60 tracking-[1px] mt-2 uppercase opacity-60">API Axis</p>
                        </div>
                     </div>

                     {weekendRules.find(r => r.id === 'r4')?.enabled ? (
                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border-2 border-dashed border-green-100 text-[11px] text-green-800 font-bold leading-relaxed uppercase tracking-wide shadow-inner">
                           <CheckBadgeIcon className="w-8 h-8 text-green-600 shrink-0" />
                           Logging active. Messages recorded in CRM.
                        </div>
                     ) : (
                        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-100 text-[11px] text-amber-800 font-bold leading-relaxed uppercase tracking-wide shadow-inner">
                           <XMarkIcon className="w-8 h-8 text-amber-600 shrink-0" />
                           Logging inactive. No CRM records created.
                        </div>
                     )}

                     <div className="pt-2 flex gap-4">
                        <Button
                           v2={true}
                           className="flex-[2] h-[52px] rounded-xl shadow-lg font-bold tracking-[1px] text-[11px] uppercase gap-2 bg-gray-900 text-white hover:bg-black transition-all duration-300"
                           onClick={() => {
                              const contactCount = followUps.filter(f => f.status !== 'Lost').length;
                              sendWeekendPostNow(confirmSendPost.title, contactCount);
                              setConfirmSendPost(null);
                              setSendToast(`Sent to ${contactCount} contacts`);
                              setTimeout(() => setSendToast(null), 4000);
                           }}
                        >
                           <PaperAirplaneIcon className="w-4 h-4 text-amber-500" /> Approve & Fire
                        </Button>
                        <Button
                           variant="secondary"
                           className="flex-1 h-[52px] rounded-xl border-2 font-bold tracking-[1px] text-[11px] bg-white shadow-md uppercase hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300"
                           onClick={() => setConfirmSendPost(null)}
                        >
                           Abort
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* CSV Preview Modal */}
         {previewCsv && (
            <div className="modal-overlay">
               <div className="modal-container shadow-2xl max-w-6xl rounded-[40px]">
                  <div className="modal-header">
                     <div className="flex items-center gap-6 text-left">
                        <div className="modal-header-icon text-blue-600 w-14 h-14 bg-blue-50 border-blue-100">
                           <CommandLineIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                              {previewCsv.name}
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">
                              {previewCsv.data.length} records detected in dataset
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <Button
                           v2={true}
                           onClick={() => {
                              if (!activeCampaign) {
                                 alert("Select a campaign from 'Scheduled posts' first.");
                                 return;
                              }
                              sendWeekendPostNow(activeCampaign.title, previewCsv.data.length);
                              setPreviewCsv(null);
                              setSendToast(`Mass transmission started for ${previewCsv.data.length} recipients`);
                              setTimeout(() => setSendToast(null), 4000);
                           }}
                           className="h-12 px-8 rounded-xl shadow-lg bg-gray-900 text-white font-bold uppercase tracking-wider text-[11px]"
                        >
                           <PaperAirplaneIcon className="w-4 h-4 mr-2 text-amber-500" />
                           Send to all
                        </Button>
                        <Button
                           variant="secondary"
                           size="icon"
                           className="rounded-xl border-2 h-12 w-12 shadow-sm"
                           onClick={() => setPreviewCsv(null)}
                        >
                           ✕
                        </Button>
                     </div>
                  </div>

                  <div className="modal-body p-0">
                     <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-gray-50 border-b-2 border-[var(--border)] sticky top-0 z-10">
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">ID</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Customer Name</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Phone Number</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Email Address</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Source</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {previewCsv.data.map((row: any, idx: number) => (
                                 <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-[10px_24px] text-[12px] font-bold text-[#002B49] tabular-nums">
                                       {row.CustomerID || '-'}
                                    </td>
                                    <td className="p-[10px_24px] text-[13px] font-bold text-gray-900 uppercase">
                                       {row.Name || `${row.FirstName || ''} ${row.LastName || ''}`.trim() || '-'}
                                    </td>
                                    <td className="p-[10px_24px] text-[13px] font-bold text-[#AD841F] tabular-nums">
                                       {row.Phone || '-'}
                                    </td>
                                    <td className="p-[10px_24px] text-[12px] font-medium text-gray-500 lowercase">
                                       {row.Email || '-'}
                                    </td>
                                    <td className="p-[10px_24px] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                       {row.Source || 'External Import'}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="modal-footer bg-gray-50/50 p-6 flex justify-between items-center rounded-b-[40px]">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        Ready for bulk transmission axis
                     </div>
                     <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Dataset ID: {previewCsv.id.split('-')[0]}
                     </span>
                  </div>
               </div>
            </div>
         )}

         {/* Toast */}
         {sendToast && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[700] bg-gray-900 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <span className="text-[10px] font-bold tracking-[2.5px] whitespace-nowrap uppercase">{sendToast}</span>
            </div>
         )}
      </>
   );
}
