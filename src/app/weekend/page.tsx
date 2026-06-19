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
   ArrowUpTrayIcon,
   UserGroupIcon,
   InformationCircleIcon
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

   // CSV & CRM Targeting States
   const [targetType, setTargetType] = useState<'crm' | 'csv'>('crm');
   const [selectedCsvId, setSelectedCsvId] = useState<string>('');
   const [autoSelectLatestCsv, setAutoSelectLatestCsv] = useState(false);
   const [leadsTab, setLeadsTab] = useState<'active' | 'inactive'>('active');
   const inlineCsvInputRef = useRef<HTMLInputElement>(null);

   // Simulator State
   const [isBroadcasting, setIsBroadcasting] = useState(false);
   const [broadcastPost, setBroadcastPost] = useState<WeekendPost | null>(null);
   const [broadcastCsv, setBroadcastCsv] = useState<UploadedCsv | null>(null);
   const [broadcastProgress, setBroadcastProgress] = useState(0);
   const [broadcastCurrentIndex, setBroadcastCurrentIndex] = useState(0);
   const [broadcastStatus, setBroadcastStatus] = useState<'sending' | 'completed'>('sending');
   const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);

   // Scheduled Posts Tab Toggle (for splitting CSV vs CRM targeted posts)
   const [postsTab, setPostsTab] = useState<'csv' | 'crm'>('csv');

   // Interactive Help Explanation Modal State
   const [helpSection, setHelpSection] = useState<'general' | 'csv_lists' | 'scheduled_posts' | 'crm_contacts' | 'feed' | null>(null);

   React.useEffect(() => {
      if (autoSelectLatestCsv && uploadedCsvs.length > 0) {
         setSelectedCsvId(uploadedCsvs[0].id);
         setTargetType('csv');
         setAutoSelectLatestCsv(false);
      }
   }, [uploadedCsvs, autoSelectLatestCsv]);

   const handleInlineCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
               setAutoSelectLatestCsv(true);
            } else {
               alert("No valid records found. Please use the Template.");
            }
         },
         error: (error) => {
            console.error('CSV Parsing Error:', error);
            alert('Error parsing CSV file.');
         }
      });

      if (inlineCsvInputRef.current) inlineCsvInputRef.current.value = '';
   };

   const startBroadcast = (post: WeekendPost, contacts: any[], csvId?: string) => {
      setConfirmSendPost(null);
      setBroadcastPost(post);
      setBroadcastProgress(0);
      setBroadcastCurrentIndex(0);
      setBroadcastStatus('sending');
      setBroadcastLogs([]);
      setIsBroadcasting(true);

      if (csvId) {
         const csv = uploadedCsvs.find(c => c.id === csvId);
         setBroadcastCsv(csv || null);
      } else {
         setBroadcastCsv(null);
      }

      let currentIndex = 0;
      const total = contacts.length;
      if (total === 0) {
         setBroadcastProgress(100);
         setBroadcastStatus('completed');
         return;
      }

      const sendNext = () => {
         if (currentIndex >= total) {
            setBroadcastProgress(100);
            setBroadcastStatus('completed');
            
            // Trigger store log on completion
            const contactIdentifiers = contacts.map(c => c.Name || c.Phone);
            if (csvId) {
               const { sendWeekendPostToCsvContacts } = useStore.getState();
               sendWeekendPostToCsvContacts(post.title, contactIdentifiers);
            } else {
               const { sendWeekendPostNow } = useStore.getState();
               sendWeekendPostNow(post.title, total, contactIdentifiers);
            }
            return;
         }

         const contact = contacts[currentIndex];
         setBroadcastCurrentIndex(currentIndex);
         setBroadcastLogs(prev => [...prev, `✓ Sent: ${contact.Name || 'Customer'} (+${contact.Phone || 'N/A'})`]);
         setBroadcastProgress(Math.round(((currentIndex + 1) / total) * 100));

         currentIndex++;
         setTimeout(sendNext, 180 + Math.random() * 200);
      };

      sendNext();
   };

   const resetModal = () => {
      setIsSaveModalOpen(false);
      setEditingPost(null);
      setNewPostTitle('');
      setSelectedFile(null);
      setTargetType('crm');
      setSelectedCsvId('');
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
         image: selectedFile ? URL.createObjectURL(selectedFile) : (editingPost?.image || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800'),
         attachedCsvId: targetType === 'csv' && selectedCsvId ? selectedCsvId : undefined
      });
      resetModal();
   };

   const openEditModal = (post: WeekendPost) => {
      setEditingPost(post);
      setNewPostTitle(post.title);
      setTargetType(post.attachedCsvId ? 'csv' : 'crm');
      setSelectedCsvId(post.attachedCsvId || '');
      setIsSaveModalOpen(true);
   };

   const [mounted, setMounted] = React.useState(false); React.useEffect(() => { setMounted(true); }, []); if (!mounted) return null;

   return (
      <>
         <div className="space-y-[var(--section-gap)] pb-20 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="text-left flex items-start gap-3">
                  <div className="text-left">
                     <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight">Weekend Messages</h1>
                        <button
                           type="button"
                           onClick={() => setHelpSection('general')}
                           className="text-gray-400 hover:text-[var(--gold)] transition-colors p-1"
                           title="Show Guide"
                        >
                           <InformationCircleIcon className="w-6 h-6" />
                        </button>
                     </div>
                     <p className="text-[14px] text-gray-400 font-bold uppercase tracking-[2px] opacity-70">Send advertisements and brochures to your customer list every weekend</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                     variant="secondary"
                     onClick={() => csvInputRef.current?.click()}
                     className="flex-1 md:flex-none px-6 rounded-lg shadow-sm h-[56px] border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-bold"
                  >
                     <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-gray-400" />
                     Upload Customer List (CSV)
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
                     Create New Message
                  </Button>
               </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <KPICard label="Total Sent Messages" value={transmissionLogs.length} trend={{ value: "Sent", type: "neutral" }} />
               <KPICard label="Scheduled Messages" value={weekendPosts.length} trend={{ value: "Ready", type: "neutral" }} />
               <KPICard label="Total Customers" value={followUps.length} trend={{ value: "Total", type: "neutral" }} />
               <KPICard label="Active Rules" value={weekendRules.filter(r => r.enabled).length} trend={{ value: "Auto-Send", type: "neutral" }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_380px] gap-5 items-start">
               {/* Main Content Area */}
               <div className="space-y-[var(--section-gap)] min-w-0">

                  {/* Uploaded CSV Data */}
                  {uploadedCsvs.length > 0 && (
                     <Card className="bg-white border-2 shadow-lg overflow-hidden text-left rounded-2xl">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/30">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200 shadow-sm text-blue-600">
                                 <CommandLineIcon className="w-4 h-4" />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <h2 className="text-[16px] font-bold text-[var(--text)]">Uploaded Customer Files</h2>
                                    <button 
                                       type="button"
                                       onClick={() => setHelpSection('csv_lists')} 
                                       className="text-gray-400 hover:text-[var(--gold)] transition-colors p-1"
                                       title="Show Guide"
                                    >
                                       <InformationCircleIcon className="w-4 h-4" />
                                    </button>
                                 </div>
                                 <p className="text-[9px] text-[var(--text3)] font-bold mt-0.5 opacity-60">Excel/CSV lists of customer phone numbers</p>
                              </div>
                           </div>
                           <Badge variant="info" className="text-[9px] font-bold tracking-widest px-2 py-0.5 shadow-sm uppercase">{uploadedCsvs.length} Files</Badge>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                                    <th className="p-[12px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">File Name</th>
                                    <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Upload Date</th>
                                    <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Number of Names</th>
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
                                                <span className="text-[9px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider opacity-80 leading-none">Uploaded List</span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="p-[10px_20px]">
                                          <span className="text-[12px] font-bold text-gray-900 leading-none tabular-nums">{csv.date}</span>
                                       </td>
                                       <td className="p-[10px_20px]">
                                          <Badge variant="outline" className="text-[9px] font-bold border-[var(--border)] text-gray-500 shadow-sm uppercase px-2 py-0.5">{csv.data.length} names</Badge>
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
                     <div className="p-6 border-b border-[var(--border)] bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <h2 className="text-[16px] font-bold text-[var(--text)]">Scheduled Messages</h2>
                           <button 
                              type="button"
                              onClick={() => setHelpSection('scheduled_posts')} 
                              className="text-gray-400 hover:text-[var(--gold)] transition-colors p-1"
                              title="Show Guide"
                           >
                              <InformationCircleIcon className="w-4 h-4" />
                           </button>
                        </div>

                        {/* Tabs to separate CSV vs CRM posts */}
                        <div className="flex gap-2 bg-gray-100/80 p-1 rounded-xl border border-gray-200 self-start md:self-auto">
                           <button
                              type="button"
                              onClick={() => setPostsTab('csv')}
                              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                                 ${postsTab === 'csv' 
                                 ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                                 : 'text-gray-400 hover:text-gray-700'}`}
                           >
                              Send to Uploaded Lists ({weekendPosts.filter(p => !!p.attachedCsvId).length})
                           </button>
                           <button
                              type="button"
                              onClick={() => setPostsTab('crm')}
                              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                                 ${postsTab === 'crm' 
                                 ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                                 : 'text-gray-400 hover:text-gray-700'}`}
                           >
                              Send to CRM Leads ({weekendPosts.filter(p => !p.attachedCsvId).length})
                           </button>
                        </div>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                                 <th className="p-[12px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Message details</th>
                                 <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Media type</th>
                                 <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Sending schedule</th>
                                 <th className="p-[12px_32px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y-2 divide-[var(--border)]">
                              {(() => {
                                 const filteredPosts = weekendPosts.filter(post => 
                                    postsTab === 'csv' ? !!post.attachedCsvId : !post.attachedCsvId
                                 );

                                 if (filteredPosts.length === 0) {
                                    return (
                                       <tr>
                                          <td colSpan={4} className="p-12 text-center text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                                             No messages in this list. Create a message above.
                                          </td>
                                       </tr>
                                    );
                                 }

                                 return filteredPosts.map((post) => {
                                    const attachedCsv = post.attachedCsvId ? uploadedCsvs.find(c => c.id === post.attachedCsvId) : null;
                                    const targetText = attachedCsv ? `List: ${attachedCsv.name} (${attachedCsv.data.length} people)` : 'CSV file';
                                    const isSent = transmissionLogs.some(log => log.postTitle === post.title || log.postTitle === `${post.title} [Brokers]`);

                                    return (
                                       <tr
                                          key={post.id}
                                          className={`cursor-pointer transition-colors duration-200 ${
                                             activeCampaign?.id === post.id
                                                ? 'bg-blue-50 border-l-8 border-l-blue-600'
                                                : isSent
                                                   ? 'bg-emerald-50/20 border-l-8 border-l-emerald-500 hover:bg-emerald-50/40'
                                                   : 'hover:bg-gray-50 border-l-8 border-l-transparent'
                                          }`}
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
                                                   {post.attachedCsvId ? (
                                                      <span className="text-[10px] text-amber-600 font-bold mt-1.5 uppercase tracking-wide leading-none">
                                                         Targets Uploaded File: {targetText}
                                                      </span>
                                                   ) : (
                                                      <span className="text-[10px] text-blue-600 font-bold mt-1.5 uppercase tracking-wide leading-none">
                                                         Targets CRM Leads
                                                      </span>
                                                   )}
                                                </div>
                                             </div>
                                          </td>
                                          <td className="p-[10px_20px]">
                                             <Badge variant="outline" className="text-[10px] font-bold border-[var(--border)] text-gray-500 shadow-sm uppercase">{post.type === 'Static' ? 'Single Photo' : post.type === 'Reel' ? 'Video/Reel' : post.type}</Badge>
                                          </td>
                                          <td className="p-[10px_20px]">
                                             <div className="flex flex-col text-left">
                                                <span className="text-[12px] font-bold text-gray-900 leading-none">Sat 09:00 AM</span>
                                             </div>
                                          </td>
                                          <td className="p-[10px_32px] text-right">
                                             <div className="flex items-center justify-end gap-2">
                                                {isSent ? (
                                                   <Badge variant="success" className="tracking-widest text-[10px] font-bold mr-2 uppercase shadow-sm">Sent</Badge>
                                                ) : (
                                                   <Badge variant="info" className="tracking-widest text-[10px] font-bold mr-2 uppercase shadow-sm">Ready to Send</Badge>
                                                )}
                                                <Button
                                                   v2={true}
                                                   size="sm"
                                                   onClick={(e) => {
                                                      e.stopPropagation();
                                                      setConfirmSendPost(post);
                                                   }}
                                                   className="text-[9px] font-bold px-4 h-8 rounded-lg shadow-sm"
                                                >
                                                   <PaperAirplaneIcon className="w-3.5 h-3.5 mr-1.5" />
                                                   {isSent ? 'Resend' : 'Send Now'}
                                                </Button>
                                                <Button
                                                   variant="ghost"
                                                   size="icon"
                                                   onClick={(e) => {
                                                      e.stopPropagation();
                                                      openEditModal(post);
                                                   }}
                                                   className="text-[var(--text2)] hover:text-[var(--gold)] border-none bg-transparent"
                                                >
                                                   <AdjustmentsVerticalIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                   variant="ghost"
                                                   size="icon"
                                                   onClick={(e) => {
                                                      e.stopPropagation();
                                                      deleteWeekendPost(post.id);
                                                   }}
                                                   className="text-[var(--text2)] hover:text-[var(--red)] border-none bg-transparent"
                                                >
                                                   <XMarkIcon className="w-4 h-4" />
                                                </Button>
                                             </div>
                                          </td>
                                       </tr>
                                    );
                                 });
                              })()}
                           </tbody>
                        </table>
                     </div>
                  </Card>

                  {/* Tabbed CRM Leads database */}
                  {(() => {
                     const activeLeads = followUps.filter(f => f.status !== 'Lost' && f.status !== 'Booked');
                     const dormantLeads = followUps.filter(f => {
                        if (!f.createdAt) return false;
                        const created = new Date(f.createdAt);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - created.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays > 21;
                     });

                     const currentTabLeads = leadsTab === 'active' ? activeLeads : dormantLeads;

                     return (
                        <Card className="bg-white border-2 shadow-lg overflow-hidden text-left rounded-2xl border-gray-200">
                           {/* Card Header & Tabs */}
                           <div className="p-6 border-b border-[var(--border)] bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-3 text-left">
                                 <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200 shadow-sm text-amber-600">
                                    <UserGroupIcon className="w-4 h-4" />
                                 </div>
                                 <div className="text-left">
                                    <div className="flex items-center gap-2">
                                       <h2 className="text-[16px] font-bold text-[var(--text)]">CRM Customer List</h2>
                                       <button 
                                          type="button"
                                          onClick={() => setHelpSection('crm_contacts')} 
                                          className="text-gray-400 hover:text-[var(--gold)] transition-colors p-1"
                                          title="Show Guide"
                                       >
                                          <InformationCircleIcon className="w-4 h-4" />
                                       </button>
                                    </div>
                                    <p className="text-[9px] text-[var(--text3)] font-bold mt-0.5 opacity-60">Customers saved in your main database</p>
                                 </div>
                              </div>
                              
                              {/* Tab Buttons */}
                              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl self-start md:self-auto border border-gray-200">
                                 <button
                                    type="button"
                                    onClick={() => setLeadsTab('active')}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                                       ${leadsTab === 'active' 
                                       ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                                       : 'text-gray-400 hover:text-gray-700'}`}
                                 >
                                    Active Leads ({activeLeads.length})
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setLeadsTab('inactive')}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                                       ${leadsTab === 'inactive' 
                                       ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                                       : 'text-gray-400 hover:text-gray-700'}`}
                                 >
                                    Inactive Leads ({dormantLeads.length})
                                 </button>
                               </div>
                           </div>

                           {/* Table */}
                           <div className="overflow-x-auto">
                              {currentTabLeads.length === 0 ? (
                                 <div className="text-center py-16 opacity-30">
                                    <UserGroupIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No customers in this list</p>
                                 </div>
                              ) : (
                                 <table className="w-full text-left border-collapse">
                                    <thead>
                                       <tr className="bg-gray-100/50 border-b-2 border-[var(--border)]">
                                          <th className="p-[12px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Customer name</th>
                                          <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                                          <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Last Contacted</th>
                                          {leadsTab === 'inactive' && (
                                          <th className="p-[12px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Age of Lead</th>
                                          )}
                                          <th className="p-[12px_32px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Action</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-[var(--border)]">
                                       {currentTabLeads.map((lead) => {
                                          const created = lead.createdAt ? new Date(lead.createdAt) : new Date();
                                          const age = Math.ceil(Math.abs(new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                                          const isPostSent = activeCampaign && lead.interactions?.some(
                                             i => i.type === 'WhatsApp' && i.notes.includes(`Weekend post sent: ${activeCampaign.title}`)
                                          );
                                          
                                          return (
                                             <tr 
                                                key={lead.id} 
                                                className={`transition-colors border-l-4 ${
                                                   isPostSent 
                                                   ? 'bg-emerald-50/20 hover:bg-emerald-50/40 border-l-emerald-500' 
                                                   : 'hover:bg-gray-50/50 border-l-transparent'
                                                }`}
                                             >
                                                <td className="p-[10px_32px]">
                                                   <div className="flex items-center gap-3 text-left">
                                                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm uppercase shrink-0">
                                                         {lead.customerName.charAt(0)}
                                                      </div>
                                                      <div className="flex flex-col text-left">
                                                         <span className="text-[13px] font-bold text-gray-900 leading-none">{lead.customerName}</span>
                                                         <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider opacity-80 tabular-nums leading-none">{lead.phone}</span>
                                                      </div>
                                                   </div>
                                                </td>
                                                <td className="p-[10px_20px]">
                                                   <div className="flex flex-col items-start gap-1">
                                                      <Badge variant={
                                                         lead.status === 'Hot' ? 'danger' :
                                                         lead.status === 'Warm' || lead.status === 'Negotiating' ? 'warning' : 'neutral'
                                                      } className="px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm leading-none">
                                                         {lead.status === 'Lost' ? 'Lost' : lead.status === 'Booked' ? 'Booked' : lead.status || 'Warm'}
                                                      </Badge>
                                                      {lead.source && (
                                                         <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">
                                                            Source: {lead.source}
                                                         </span>
                                                      )}
                                                   </div>
                                                </td>
                                                <td className="p-[10px_20px]">
                                                   <span className="text-[12px] font-bold text-gray-900 leading-none tabular-nums">{lead.lastContact}</span>
                                                </td>
                                                {leadsTab === 'inactive' && (
                                                   <td className="p-[10px_20px]">
                                                      <Badge variant="outline" className="text-[9px] font-bold bg-gray-100 border-[var(--border)] px-2 py-0.5 shadow-sm uppercase">{age} days</Badge>
                                                   </td>
                                                )}
                                                <td className="p-[10px_32px] text-right">
                                                   <Button
                                                      v2={true}
                                                      size="sm"
                                                      onClick={() => {
                                                         if (!activeCampaign) { alert("Please select a message from 'Scheduled Messages' first."); return; }
                                                         startBroadcast(activeCampaign, [{ Name: lead.customerName, Phone: lead.phone }]);
                                                      }}
                                                      className="text-[9px] font-bold px-3 h-7 rounded-md bg-amber-50 text-amber-600 border border-amber-100 shadow-sm"
                                                   >
                                                      <PaperAirplaneIcon className="w-3 h-3 mr-1.5 text-amber-500" />
                                                      Send Now
                                                   </Button>
                                                </td>
                                             </tr>
                                          );
                                       })}
                                    </tbody>
                                 </table>
                              )}
                           </div>

                           {/* Broadcast Actions footer */}
                           {currentTabLeads.length > 0 && (
                              <div className="p-4 bg-gray-50/50 border-t border-[var(--border)]">
                                 <Button
                                    v2={true}
                                    className="w-full text-[10px] font-bold tracking-[3px] h-10 rounded-lg shadow-sm uppercase"
                                    onClick={() => {
                                       if (!activeCampaign) { alert("Please select a message from 'Scheduled Messages' first."); return; }
                                       
                                       if (leadsTab === 'active') {
                                          const crmContacts = activeLeads.map(f => ({ Name: f.customerName, Phone: f.phone }));
                                          startBroadcast(activeCampaign, crmContacts);
                                       } else {
                                          const crmContacts = dormantLeads.map(f => ({ Name: f.customerName, Phone: f.phone }));
                                          startBroadcast(activeCampaign, crmContacts);
                                       }
                                    }}
                                 >
                                    <PaperAirplaneIcon className="w-4 h-4 mr-2 text-amber-500" />
                                    Send message to all {leadsTab === 'active' ? 'Active' : 'Inactive'} leads ({currentTabLeads.length})
                                 </Button>
                              </div>
                           )}
                        </Card>
                     );
                  })()}
               </div>

               {/* Sidebar */}
               <div className="space-y-[var(--section-gap)] min-w-0">
                  {/* Recent Work Feed */}
                  <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left rounded-2xl">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-[var(--green-lt)] rounded-xl flex items-center justify-center border border-[var(--green)]/20 shadow-sm text-[var(--green)]">
                           <ClipboardDocumentListIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <div className="flex items-center gap-2">
                              <h3 className="text-[15px] font-bold text-[var(--text)] leading-none">Activity log</h3>
                              <button 
                                 type="button"
                                 onClick={() => setHelpSection('feed')} 
                                 className="text-gray-400 hover:text-[var(--gold)] transition-colors p-1"
                                 title="Show Guide"
                              >
                                 <InformationCircleIcon className="w-4 h-4" />
                              </button>
                           </div>
                           <p className="text-[9px] font-bold tracking-widest text-[var(--text3)] mt-1 uppercase">Recent actions</p>
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
                        <div className="modal-header-icon text-amber-600 w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                           <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                              {editingPost ? 'Change Message' : 'Create Message'}
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1px] opacity-60 leading-none">Set up message for the weekend</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-2 h-10 w-10 shadow-sm" onClick={resetModal}>✕</Button>
                  </div>

                  <form className="modal-body space-y-6 text-left p-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                     <div className="space-y-3">
                        <Label required className="text-[11px] uppercase tracking-wider">Upload photo or video</Label>
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
                           <Label required className="text-[11px] uppercase tracking-wider">Message name</Label>
                           <Input
                              v2={true}
                              value={newPostTitle}
                              onChange={e => setNewPostTitle(e.target.value)}
                              placeholder="e.g. Special Weekend Offer"
                              required
                              className="h-[48px] shadow-sm rounded-xl font-bold text-[13px] uppercase px-4"
                           />
                        </div>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <Label required className="text-[11px] uppercase tracking-wider">Media format</Label>
                               <Select v2={true} className="h-[48px] shadow-sm rounded-xl font-bold text-[13px] uppercase">
                                  <option>Single Photo</option>
                                  <option>Video / Reel</option>
                                  <option>Multiple Photos</option>
                               </Select>
                            </div>
                            <div className="space-y-3">
                               <Label required className="text-[11px] uppercase tracking-wider">Sending Time</Label>
                               <Input type="time" defaultValue="09:00" v2={true} className="h-[48px] shadow-sm rounded-xl font-bold text-[13px] tabular-nums" />
                            </div>
                         </div>

                         <div className="space-y-3">
                            <Label required className="text-[11px] uppercase tracking-wider">Who should get this message?</Label>
                            <div className="flex gap-4">
                               <button
                                  type="button"
                                  onClick={() => setTargetType('crm')}
                                  className={`flex-1 py-3 px-4 rounded-xl border font-bold text-[11px] uppercase tracking-wider transition-all duration-200
                                     ${targetType === 'crm' 
                                     ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                                     : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                               >
                                  CRM Leads
                               </button>
                               <button
                                  type="button"
                                  onClick={() => setTargetType('csv')}
                                  className={`flex-1 py-3 px-4 rounded-xl border font-bold text-[11px] uppercase tracking-wider transition-all duration-200
                                     ${targetType === 'csv' 
                                     ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                                     : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                               >
                                  Uploaded Lists (CSV)
                               </button>
                            </div>

                            {targetType === 'csv' && (
                               <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner mt-2">
                                  <div className="flex items-center gap-3">
                                     <div className="flex-1">
                                        <Select 
                                           v2={true} 
                                           value={selectedCsvId} 
                                           onChange={e => setSelectedCsvId(e.target.value)}
                                           className="h-[44px] shadow-sm rounded-xl font-bold text-[12.5px] uppercase w-full bg-white text-gray-800"
                                        >
                                           <option value="">Select an uploaded customer file...</option>
                                           {uploadedCsvs.map(csv => (
                                              <option key={csv.id} value={csv.id}>
                                                 {csv.name} ({csv.data.length} contacts)
                                              </option>
                                           ))}
                                        </Select>
                                     </div>
                                     <div>
                                        <Button
                                           v2={true}
                                           type="button"
                                           onClick={() => inlineCsvInputRef.current?.click()}
                                           className="h-[44px] px-4 rounded-xl font-bold text-[11px] uppercase text-gray-700 border-2 border-gray-200 bg-white"
                                        >
                                           Upload new file
                                        </Button>
                                        <input 
                                           type="file" 
                                           hidden 
                                           ref={inlineCsvInputRef} 
                                           onChange={handleInlineCsvUpload} 
                                           accept=".csv" 
                                        />
                                     </div>
                                  </div>
                                  {selectedCsvId && (() => {
                                     const selectedCsv = uploadedCsvs.find(c => c.id === selectedCsvId);
                                     return selectedCsv ? (
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pl-1">
                                           ✓ Ready to target {selectedCsv.data.length} customers from &quot;{selectedCsv.name}&quot;
                                        </p>
                                     ) : null;
                                  })()}
                               </div>
                            )}
                         </div>
                     </div>

                     <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
                           <CheckBadgeIcon className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-amber-800 font-bold leading-tight uppercase tracking-wide opacity-80">
                           This message will be saved for weekend sending.
                        </p>
                     </div>

                     <div className="pt-2 flex gap-4">
                        <Button
                           type="submit"
                           disabled={!newPostTitle || isUploading}
                           className="flex-[2] h-[52px] rounded-xl shadow-lg font-bold tracking-[1px] text-[11px] uppercase transition-all duration-300"
                        >
                           {editingPost ? 'Save changes' : 'Save message'}
                        </Button>
                        <Button
                           type="button"
                           variant="secondary"
                           onClick={resetModal}
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
                        <div className="modal-header-icon text-green-600 border-green-100 bg-green-50 shadow-green-500/5 w-10 h-10 flex items-center justify-center rounded-xl">
                           <PaperAirplaneIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                              Send Message Now
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1px] opacity-60 leading-none">Send to selected customers right away</p>
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
                           <p className="text-[9px] font-bold text-white/40 tracking-[2px] uppercase">Selected Message</p>
                           <p className="text-[18px] font-bold tracking-tight text-amber-500 uppercase leading-tight">{confirmSendPost.title}</p>
                           <div className="pt-2 flex items-center gap-2">
                              <Badge variant="success" className="bg-green-500/20 text-green-400 border-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">Checked</Badge>
                              <Badge variant="info" className="bg-blue-500/20 text-blue-400 border-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">Ready</Badge>
                           </div>
                        </div>
                     </div>

                     {(() => {
                        const hasCsv = !!confirmSendPost.attachedCsvId;
                        const attachedCsv = hasCsv ? uploadedCsvs.find(c => c.id === confirmSendPost.attachedCsvId) : null;
                        const targetCount = attachedCsv 
                           ? attachedCsv.data.length 
                           : followUps.filter(f => f.status !== 'Lost').length;
                        
                        return (
                           <>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm text-center group hover:bg-white hover:border-amber-200 transition-all duration-300">
                                    <p className="text-[9px] font-bold text-gray-400 tracking-[2px] mb-2 opacity-70 uppercase group-hover:text-amber-600 transition-colors">Total Customers</p>
                                    <p className="text-2xl font-bold text-gray-900 tracking-tighter tabular-nums">{targetCount}</p>
                                    <p className="text-[9px] font-bold text-gray-400 tracking-[1px] mt-2 uppercase opacity-60">
                                       {attachedCsv ? 'From Uploaded File' : 'From Database'}
                                    </p>
                                 </div>
                                 <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm text-center group hover:bg-white hover:border-green-200 transition-all duration-300">
                                    <p className="text-[9px] font-bold text-gray-400 tracking-[2px] mb-2 opacity-70 uppercase group-hover:text-green-600 transition-colors">Sending Route</p>
                                    <p className="text-2xl font-bold text-green-600 tracking-tighter uppercase">WhatsApp</p>
                                    <p className="text-[9px] font-bold text-green-700/60 tracking-[1px] mt-2 uppercase opacity-60">WhatsApp Route</p>
                                 </div>
                              </div>

                              {attachedCsv && (
                                 <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 mt-4 text-[11px] text-blue-800">
                                    <p className="font-bold uppercase tracking-wider text-[10px]">Preview of contacts: {attachedCsv.name}</p>
                                    <div className="divide-y divide-blue-200/50">
                                       {attachedCsv.data.slice(0, 3).map((item: any, idx: number) => (
                                          <div key={idx} className="py-1.5 flex justify-between font-medium">
                                             <span>{item.Name || 'Customer'}</span>
                                             <span className="font-mono">{item.Phone || 'No Phone'}</span>
                                          </div>
                                       ))}
                                    </div>
                                    {attachedCsv.data.length > 3 && (
                                       <p className="text-[9px] font-bold text-blue-500 text-right uppercase">
                                          + {attachedCsv.data.length - 3} more people
                                       </p>
                                    )}
                                 </div>
                              )}
                           </>
                        );
                     })()}

                     {weekendRules.find(r => r.id === 'r4')?.enabled ? (
                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border-2 border-dashed border-green-100 text-[11px] text-green-800 font-bold leading-relaxed uppercase tracking-wide shadow-inner">
                           <CheckBadgeIcon className="w-8 h-8 text-green-600 shrink-0" />
                           Logs turned on. Messages will be saved to customer history.
                        </div>
                     ) : (
                        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-100 text-[11px] text-amber-800 font-bold leading-relaxed uppercase tracking-wide shadow-inner">
                           <XMarkIcon className="w-8 h-8 text-amber-600 shrink-0" />
                           Logs turned off. Messages will not be saved to customer history.
                        </div>
                     )}

                      <div className="pt-2 flex gap-4">
                         <Button
                            v2={true}
                            className="flex-[2] h-[52px] rounded-xl shadow-lg font-bold tracking-[1px] text-[11px] uppercase gap-2 bg-gray-900 text-white hover:bg-black transition-all duration-300"
                            onClick={() => {
                               const hasCsv = !!confirmSendPost.attachedCsvId;
                               const attachedCsv = hasCsv ? uploadedCsvs.find(c => c.id === confirmSendPost.attachedCsvId) : null;
                               
                               if (attachedCsv) {
                                  startBroadcast(confirmSendPost, attachedCsv.data, attachedCsv.id);
                               } else {
                                  const crmContacts = followUps
                                     .filter(f => f.status !== 'Lost')
                                     .map(f => ({ Name: f.customerName, Phone: f.phone }));
                                  startBroadcast(confirmSendPost, crmContacts);
                               }
                            }}
                         >
                            <PaperAirplaneIcon className="w-4 h-4 text-amber-500" /> Confirm & Send Now
                         </Button>
                         <Button
                            variant="secondary"
                            className="flex-1 h-[52px] rounded-xl border-2 font-bold tracking-[1px] text-[11px] bg-white shadow-md uppercase hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300"
                            onClick={() => setConfirmSendPost(null)}
                         >
                            Stop / Go Back
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
                        <div className="modal-header-icon text-blue-600 w-14 h-14 bg-blue-50 border-blue-100 flex items-center justify-center rounded-xl">
                           <CommandLineIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1 uppercase">
                              {previewCsv.name}
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">
                              {previewCsv.data.length} people found in this list
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
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
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Customer ID</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Customer name</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Phone number</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Email address</th>
                                 <th className="p-[16px_24px] text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-50">Where they came from</th>
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
                                       {row.Source || 'Uploaded List'}
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
                        Ready to send to all contacts
                     </div>
                     <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        List ID: {previewCsv.id.split('-')[0]}
                     </span>
                  </div>
               </div>
            </div>
         )}

         {/* Broadcast Simulator Modal */}
         {isBroadcasting && broadcastPost && (
            <div className="modal-overlay">
               <div className="modal-container !bg-gray-900 !border-white/[0.08] !text-white shadow-2xl rounded-[32px] max-w-xl text-left">
                  <div className="modal-header !border-b !border-white/[0.08] p-6 flex justify-between items-center !bg-black/20">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                           <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
                        </div>
                        <div>
                           <h2 className="text-[17px] font-bold tracking-tight uppercase leading-none mb-1 text-white">
                              Message Sender
                           </h2>
                           <p className="text-[9px] text-white/50 font-bold uppercase tracking-[2px] leading-none">
                              {broadcastStatus === 'sending' ? 'Sending WhatsApp messages now...' : 'Sending completed'}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="modal-body p-6 space-y-6">
                     <div className="p-5 bg-black/40 rounded-2xl border border-white/[0.05]">
                        <p className="text-[9px] font-bold text-white/40 tracking-[1.5px] uppercase mb-1">Selected Message</p>
                        <h4 className="text-[15px] font-bold text-amber-500 uppercase tracking-tight leading-tight">{broadcastPost.title}</h4>
                        {broadcastCsv && (
                           <p className="text-[10px] text-white/60 font-bold uppercase mt-2 tracking-wide">
                              Target List: {broadcastCsv.name} ({broadcastCsv.data.length} contacts)
                           </p>
                        )}
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-white/60">
                           <span>Sending progress</span>
                           <span className="tabular-nums font-mono">{broadcastProgress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5 shadow-inner">
                           <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-green-500/20"
                              style={{ width: `${broadcastProgress}%` }}
                           ></div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <p className="text-[9px] font-bold text-white/40 tracking-[1.5px] uppercase">Sending status log</p>
                        <div className="bg-black/80 rounded-2xl p-4 border border-white/[0.05] h-48 overflow-y-auto font-mono text-[11px] text-green-400 space-y-1.5 custom-scrollbar-dark shadow-inner text-left">
                           {broadcastLogs.map((log, idx) => (
                              <div key={idx} className="flex gap-2">
                                 <span className="text-white/20 select-none">[{idx + 1}]</span>
                                 <span className="text-emerald-400">{log.replace('Sent:', 'Sent message to:')}</span>
                              </div>
                           ))}
                           {broadcastStatus === 'sending' && (
                              <div className="flex items-center gap-2 text-white/40 animate-pulse pt-1">
                                 <span>Sending next message...</span>
                              </div>
                           )}
                           {broadcastStatus === 'completed' && (
                              <div className="text-center text-green-500 font-bold uppercase py-4 border-t border-white/5 mt-4">
                                 ✓ All messages sent successfully!
                              </div>
                           )}
                        </div>
                     </div>

                     {broadcastStatus === 'completed' && (
                        <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                           <CheckBadgeIcon className="w-8 h-8 text-green-400 shrink-0" />
                           <p className="text-[11px] text-green-300 font-bold leading-relaxed uppercase tracking-wider">
                              All messages sent. History has been saved in the database.
                           </p>
                        </div>
                     )}

                     {broadcastStatus === 'completed' && (
                        <Button
                           variant="success"
                           onClick={() => {
                              setIsBroadcasting(false);
                              setBroadcastPost(null);
                              setBroadcastCsv(null);
                           }}
                           className="w-full h-[52px] rounded-xl shadow-lg text-white font-bold uppercase tracking-wider text-[11.5px] transition-all duration-300 !border-none"
                        >
                           Close Window
                        </Button>
                     )}
                  </div>
               </div>
            </div>
         )}


         {/* Interactive Explanation Help Modal */}
         {helpSection && (
            <div className="modal-overlay">
               <div className="modal-container shadow-2xl rounded-[32px] max-w-lg text-left bg-white border-2 border-gray-100">
                  <div className="modal-header border-b border-gray-100 p-5 bg-gray-50/50">
                     <div className="flex items-center gap-4">
                        <div className="modal-header-icon text-amber-600 border-amber-100 bg-amber-50 w-10 h-10 flex items-center justify-center rounded-xl">
                           <InformationCircleIcon className="w-5 h-5" />
                        </div>
                        <div>
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none mb-1">
                              {helpSection === 'general' && 'About Weekend Messages'}
                              {helpSection === 'csv_lists' && 'About Uploaded Files'}
                              {helpSection === 'scheduled_posts' && 'About Scheduled Messages'}
                              {helpSection === 'crm_contacts' && 'About CRM Customer List'}
                              {helpSection === 'feed' && 'About Activity Log'}
                           </h2>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1.5px] leading-none">Simple Guide</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-2 h-10 w-10 shadow-sm" onClick={() => setHelpSection(null)}>✕</Button>
                  </div>
                  <div className="modal-body p-6 space-y-6 text-[13px] text-gray-600 leading-relaxed">
                     {helpSection === 'general' && (
                        <div className="space-y-4">
                           <p className="font-semibold text-gray-900">Aa page thi tame badha customer ne weekend ma messages, photo ke brochure mokli shako cho.</p>
                           <div className="space-y-3 pl-2">
                              <div>
                                 <h4 className="font-bold text-gray-800">1. Message taiyar karo</h4>
                                 <p className="text-gray-500">Navo message banavo, photo ke video upload karo, ane mokalvano time nakki karo.</p>
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-800">2. Customer ni list upload karo</h4>
                                 <p className="text-gray-500">Jo tamari pase customer na number ni excel sheet hoy, to tene CSV banavi ne upload karo. E &quot;Uploaded Customer Files&quot; ma dekhase.</p>
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-800">3. Select karine send karo</h4>
                                 <p className="text-gray-500">Tamara schedule mathi koi message select karo, ane pachi list par ke CRM na customer ne send karo.</p>
                              </div>
                           </div>
                        </div>
                     )}
                     {helpSection === 'csv_lists' && (
                        <div className="space-y-4">
                           <p className="font-semibold text-gray-900">Aa section ma tame je customer na number ni Excel/CSV file upload kari che e dekhase.</p>
                           <div className="space-y-3 pl-2">
                              <div>
                                 <h4 className="font-bold text-gray-800">Kem use karvu:</h4>
                                 <p className="text-gray-500">Koi pan file na naam par click karo to preview khulse, jema tame customer na name ane phone number chek kari shako.</p>
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-800">File nu format:</h4>
                                 <p className="text-gray-500">Tamari excel ma columns na header &quot;Name&quot;, &quot;Phone&quot;, ane &quot;Email&quot; rakhva jaruri che, jethi system samajhi sake.</p>
                              </div>
                           </div>
                        </div>
                     )}
                     {helpSection === 'scheduled_posts' && (
                        <div className="space-y-4">
                           <p className="font-semibold text-gray-900">Aa badha messages tame taiyar karine schedule karela che.</p>
                           <div className="space-y-3 pl-2">
                              <div>
                                 <h4 className="font-bold text-gray-800">Tabs:</h4>
                                 <p className="text-gray-500">Ahiya be tab che, ek uploaded CSV lists mate ane biju CRM na leads mate, jethi tame alag alag message set kari sako.</p>
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-800">Message mokalva:</h4>
                                 <p className="text-gray-500">&quot;Send Now&quot; par click karso to confirm modal khulse. Pachi live messages mokalvanu start thase ane live update dekhase.</p>
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-800">Edit ke Delete karvu:</h4>
                                 <p className="text-gray-500">Message badalva mate gear icon click karo, ane delete karva mate &quot;X&quot; button dabavo.</p>
                              </div>
                           </div>
                        </div>
                     )}
                     {helpSection === 'crm_contacts' && (
                        <div className="space-y-4">
                           <p className="font-semibold text-gray-900">Aa list ma tamara main sales CRM database na customer dekhase.</p>
                           <div className="space-y-3 pl-2">
                              <div>
                                 <h4 className="font-bold text-gray-800">Active vs Inactive Customer:</h4>
                                 <p className="text-gray-500">&quot;Active Leads&quot; aetle je customer sathe vat chalya che. &quot;Inactive Leads&quot; aetle jene 3 week thi contact nathi thayo.</p>
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-800">Mokalvani rit:</h4>
                                 <p className="text-gray-500">Single customer ne message mokalva row na &quot;Send Now&quot; par click karo, badha ne ek sathe mokalva mate niche nu motu button use karo.</p>
                              </div>
                           </div>
                        </div>
                     )}
                     {helpSection === 'feed' && (
                        <div className="space-y-4">
                           <p className="font-semibold text-gray-900">Aa section ma tame page par je pan kam karyu e na update dekhase.</p>
                           <div className="space-y-3 pl-2">
                              <div>
                                 <h4 className="font-bold text-gray-800">Auto updates:</h4>
                                 <p className="text-gray-500">Ahiya tame kyare message moklyo, kaya new list upload karya, e badhi history show thase.</p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="modal-footer p-6 bg-gray-50/50 flex justify-end border-t border-gray-100 rounded-b-[32px]">
                     <Button 
                        v2={true} 
                        onClick={() => setHelpSection(null)}
                        className="px-6 rounded-xl font-bold uppercase text-[11px]"
                     >
                        Understand
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
