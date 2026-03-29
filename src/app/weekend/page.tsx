"use client";
import React, { useState, useRef } from 'react';
import { useStore, WeekendPost, TransmissionLog, UploadedCsv, ActivityFeedItem } from '@/store/useStore';
import {
    PlusIcon,
    CalendarDaysIcon,
    MegaphoneIcon,
    ChatBubbleLeftRightIcon,
    CheckBadgeIcon,
    XMarkIcon,
    ArrowUpTrayIcon,
    ChartBarIcon,
    InboxStackIcon,
    ClockIcon,
    AdjustmentsVerticalIcon,
    ShieldCheckIcon,
    CommandLineIcon,
    UserGroupIcon,
    SparklesIcon,
    ArrowPathIcon,
    PaperAirplaneIcon,
    ArrowDownTrayIcon,
    ClipboardDocumentListIcon,
    ArrowUpRightIcon,
    EyeIcon,
    TrashIcon
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
        weekendRules, 
        updateWeekendRule, 
        sendWeekendPostToCsvContacts,
        sendWeekendPostNow,
        uploadedCsvs,
        addUploadedCsv,
        deleteUploadedCsv,
        brochures,
        followUps,
        activityFeed
    } = useStore();

   const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
   const [editingPost, setEditingPost] = useState<WeekendPost | null>(null);
   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
   const [isRulesOpen, setIsRulesOpen] = useState(false);
   const [confirmSendPost, setConfirmSendPost] = useState<WeekendPost | null>(null);
   const [sendToast, setSendToast] = useState<string | null>(null);

    // New Post State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // CSV Upload State
    const [isCsvUploadModalOpen, setIsCsvUploadModalOpen] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [tempCsvData, setTempCsvData] = useState<any[]>([]);
    const [isCsvUploading, setIsCsvUploading] = useState(false);

    // UI State for Registry
    const [expandedCsvId, setExpandedCsvId] = useState<string | null>(null);

    // Pending Rules State (for Apply functionality)
    const [pendingRules, setPendingRules] = useState<Record<string, boolean>>({});

   React.useEffect(() => {
      if (isRulesOpen) {
         const initial: Record<string, boolean> = {};
         weekendRules.forEach(r => initial[r.id] = r.enabled);
         setPendingRules(initial);
      }
   }, [isRulesOpen, weekendRules]);

    const handleApplyRules = () => {
       Object.entries(pendingRules).forEach(([id, enabled]) => {
          const current = weekendRules.find(r => r.id === id);
          if (current && current.enabled !== enabled) {
             updateWeekendRule(id, enabled);
          }
       });
       setIsRulesOpen(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
          setSelectedFile(file);
          setIsUploading(true);
          setTimeout(() => setIsUploading(false), 800);
       }
    };

    const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
          setCsvFile(file);
          setIsCsvUploading(true);
          
          // Parse CSV file
          const reader = new FileReader();
          reader.onload = (event) => {
             const text = event.target?.result as string;
             const rows = text.split('\n').map(row => row.split(','));
             
             // Assume first row contains headers
             if (rows.length > 1) {
                const headers = rows[0].map((header: string) => header.trim());
                const data = rows.slice(1).map((row: string[]) => {
                   const obj: any = {};
                   row.forEach((cell, index) => {
                      if (headers[index]) {
                         obj[headers[index]] = cell ? cell.trim() : '';
                      }
                   });
                   return obj;
                });
                setTempCsvData(data);
             } else {
                setTempCsvData([]);
             }
             setIsCsvUploading(false);
          };
          reader.readAsText(file);
       }
    };

    const handleAddCsvToRegistry = () => {
       if (csvFile && tempCsvData.length > 0) {
          addUploadedCsv({
             name: csvFile.name,
             data: tempCsvData
          });
          setIsCsvUploadModalOpen(false);
          setCsvFile(null);
          setTempCsvData([]);
       }
    };

    const handleSendToCsv = (csv: UploadedCsv) => {
       if (!newPostTitle) {
          alert("Please enter a Campaign Title first.");
          return;
       }
       
       const contacts = csv.data.map(row => {
          return Object.values(row)[0] || '';
       }).filter(contact => contact !== '');
       
       if (contacts.length > 0) {
         sendWeekendPostToCsvContacts(newPostTitle, contacts);
         alert(`Sent "${newPostTitle}" to ${contacts.length} contacts from ${csv.name}`);
       }
    };

   const handleDeploy = () => {
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
      setIsDeployModalOpen(false);
      setEditingPost(null);
      setNewPostTitle('');
      setSelectedFile(null);
   };

   const openEditModal = (post: WeekendPost) => {
      setEditingPost(post);
      setNewPostTitle(post.title);
      setIsDeployModalOpen(true);
   };

   const kpis = [
      { label: 'Total Audience', value: transmissionLogs.length > 0 ? Array.from(new Set(transmissionLogs.map(l => l.postTitle))).length.toString() : '0', color: 'gold', trend: { value: 'Nodes', type: 'neutral' as const } },
      { label: 'Campaign Reach', value: transmissionLogs.reduce((acc, curr) => acc + curr.delivered, 0).toLocaleString(), color: 'green', trend: { value: 'Delivered', type: 'up' as const } },
      { label: 'Engagement Yield', value: transmissionLogs.length > 0 ? (transmissionLogs.reduce((acc, curr) => acc + curr.read, 0) / transmissionLogs.reduce((acc, curr) => acc + curr.delivered, 0) * 100).toFixed(1) + '%' : '0%', color: 'blue', trend: { value: 'Read Rate', type: 'neutral' as const } },
      { label: 'Avg Read Rate', value: transmissionLogs.length > 0 ? (transmissionLogs.reduce((acc, curr) => acc + curr.read, 0) / transmissionLogs.reduce((acc, curr) => acc + (curr.delivered || 1), 0) * 100).toFixed(1) + '%' : '0%', color: 'red', trend: { value: 'Intent Pulse', type: 'up' as const } },
   ];

   return (
      <>
         <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
         {/* V2 Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
               <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Weekend Transmission</h1>
               <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                     <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                     LIVE OPERATIONAL STREAM
                  </span>
                  <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Auto-scheduled Saturday/Sunday WhatsApp dispatch registry</span>
               </div>
            </div>
             <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                   v2={true}
                   size="default"
                   onClick={() => setIsDeployModalOpen(true)}
                   className="flex-1 md:flex-none px-8"
                >
                   <PlusIcon className="w-4 h-4 mr-2" />
                   Deploy Post
                </Button>
                 <Button
                    v2={true}
                    size="default"
                    onClick={() => setIsCsvUploadModalOpen(true)}
                    className="flex-1 md:flex-none px-8"
                 >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                    Upload CSV
                 </Button>
             </div>
         </div>

         {/* KPI Matrix */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
            {kpis.map((k, i) => (
               <KPICard
                  key={i}
                  label={k.label}
                  value={k.value.toString()}
                  color={k.color}
                  trend={k.trend}
               />
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
            {/* Main Content Area */}
            <div className="space-y-[var(--section-gap)]">
               
               {/* Scheduled Posts Ledger */}
               <Card className="bg-white border-[var(--border)] shadow-sm overflow-hidden text-left">
                  <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]/30">
                     <h2 className="text-[16px] font-bold text-[var(--text)] font-serif">Scheduled Portfolio</h2>
                     <Button
                        variant="ghost"
                        size="icon"
                        icon={<AdjustmentsVerticalIcon className="w-5 h-5" />}
                        onClick={() => setIsRulesOpen(true)}
                        className="text-[var(--text3)] hover:text-[var(--gold)] border-none bg-transparent hover:bg-[var(--bg)]"
                     />
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                              <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Asset</th>
                              <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Type</th>
                              <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Trigger Pulse</th>
                              <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                           {weekendPosts.map((post) => (
                              <tr key={post.id} className="hover:bg-[#F8F7F4] transition-all group">
                                 <td className="p-[12px_24px]">
                                    <div className="flex items-center gap-4">
                                       <div className="w-9 h-9 rounded-lg bg-[var(--bg)] border border-[var(--border)] overflow-hidden">
                                          <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                       </div>
                                        <div>
                                           <div className="text-[13px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-none group-hover:text-[var(--gold)] transition-colors mb-2">{post.title}</div>
                                           <div className="flex items-center gap-2">
                                              <div className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[1px] opacity-40 leading-none">V2.4 Node</div>
                                              {post.attachedBrochureId && (() => {
                                                 const attachedBrochure = brochures.find(b => b.id === post.attachedBrochureId);
                                                 return attachedBrochure ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-[var(--gold-lt)] text-[var(--gold)] border border-[var(--gold)]/20 uppercase tracking-wider">
                                                       BROCHURE V{attachedBrochure.version}
                                                    </span>
                                                 ) : null;
                                              })()}
                                           </div>
                                        </div>
                                    </div>
                                 </td>
                                 <td className="p-[12px_15px]">
                                    <Badge variant="outline" className="text-[10px] font-bold border-[var(--border)] text-[var(--text3)]">{post.type.toUpperCase()}</Badge>
                                 </td>
                                 <td className="p-[12px_15px]">
                                    <div className="flex flex-col">
                                       <span className="text-[12px] font-bold text-[var(--text2)] leading-none">SAT 09:00 AM</span>
                                       <span className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[1px] mt-1.5 opacity-40 leading-none">Broadcast</span>
                                    </div>
                                 </td>
                                  <td className="p-[12px_24px] text-right">
                                     <div className="flex items-center justify-end gap-2">
                                        <Badge variant="info" className="uppercase tracking-widest text-[9px] font-bold mr-2">{post.status}</Badge>
                                        <Button
                                           v2={true}
                                           size="sm"
                                           onClick={() => setConfirmSendPost(post)}
                                           className="text-[9px] font-bold uppercase tracking-[1px] px-4 h-8 rounded-lg"
                                        >
                                           <PaperAirplaneIcon className="w-3.5 h-3.5 mr-1.5" />
                                           Send Now
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          icon={<AdjustmentsVerticalIcon className="w-4 h-4" />}
                                          onClick={() => openEditModal(post)}
                                          className="text-[var(--text2)] hover:text-[var(--gold)] border-none bg-transparent hover:bg-[var(--bg)]"
                                       />
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          icon={<XMarkIcon className="w-4 h-4" />}
                                          onClick={() => deleteWeekendPost(post.id)}
                                          className="text-[var(--text2)] hover:text-[var(--red)] border-none bg-transparent hover:bg-[var(--bg)]"
                                       />
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </Card>

               {/* CSV Registry Ledger */}
               <Card className="bg-white border-[var(--border)] shadow-sm overflow-hidden text-left">
                  <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/30 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--gold-lt)] rounded-lg flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                           <UserGroupIcon className="w-4 h-4" />
                        </div>
                        <h2 className="text-[16px] font-bold text-[var(--text)] font-serif">CSV Registry</h2>
                     </div>
                     <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] opacity-40">{uploadedCsvs.length} LISTS LOADED</p>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                              <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Contact Source</th>
                              <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Audit Date</th>
                              <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Records</th>
                              <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                           {uploadedCsvs.length > 0 ? uploadedCsvs.map((csv) => (
                              <React.Fragment key={csv.id}>
                                 <tr className="hover:bg-[#F8F7F4] transition-all group">
                                    <td className="p-[12px_24px]">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text3)] group-hover:text-[var(--gold)] transition-colors">
                                             <ClipboardDocumentListIcon className="w-4 h-4" />
                                          </div>
                                          <div>
                                             <div className="text-[13px] font-bold text-[var(--text)] font-serif tracking-tight uppercase leading-none mb-1.5">{csv.name}</div>
                                             <div className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[1px] opacity-40 leading-none">External Dataset</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="p-[12px_15px]">
                                       <span className="text-[12px] font-bold text-[var(--text2)] leading-none">{csv.date}</span>
                                    </td>
                                    <td className="p-[12px_15px]">
                                       <Badge variant="outline" className="text-[10px] font-bold border-none bg-blue-50 text-blue-600 px-2 py-0.5">{csv.data.length} NODES</Badge>
                                    </td>
                                    <td className="p-[12px_24px] text-right">
                                       <div className="flex items-center justify-end gap-2">
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             icon={<EyeIcon className={expandedCsvId === csv.id ? "w-4 h-4 text-[var(--gold)]" : "w-4 h-4 text-[var(--text3)]"} />}
                                             onClick={() => setExpandedCsvId(expandedCsvId === csv.id ? null : csv.id)}
                                             className="hover:bg-[var(--gold-lt)] border-none"
                                             title="View Data Nodes"
                                          />
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             icon={<PaperAirplaneIcon className="w-4 h-4 text-[var(--green)]" />}
                                             onClick={() => handleSendToCsv(csv)}
                                             className="hover:bg-green-50 border-none"
                                             title="Dispatch to Spectrum"
                                          />
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             icon={<TrashIcon className="w-4 h-4 text-[var(--red)]" />}
                                             onClick={() => deleteUploadedCsv(csv.id)}
                                             className="hover:bg-red-50 border-none"
                                             title="Remove Dataset"
                                          />
                                       </div>
                                    </td>
                                 </tr>
                                 {/* Expanded Data Table */}
                                 {expandedCsvId === csv.id && (
                                    <tr>
                                       <td colSpan={4} className="p-0 bg-[var(--bg)]/30 border-b border-[var(--border)]">
                                          <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                                             <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden shadow-sm">
                                                <div className="max-h-[300px] overflow-auto custom-scrollbar">
                                                   <table className="w-full text-left border-collapse">
                                                      <thead className="sticky top-0 z-10">
                                                         <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                                                            {csv.data.length > 0 && Object.keys(csv.data[0]).map((key, i) => (
                                                               <th key={i} className="p-[10px_16px] text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px]">{key.toUpperCase()}</th>
                                                            ))}
                                                         </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-[var(--border)]">
                                                         {csv.data.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className="hover:bg-[#F8F7F4] transition-all">
                                                               {Object.values(row).map((val: any, colIndex) => (
                                                                  <td key={colIndex} className="p-[10px_16px] text-[12px] text-[var(--text)] font-serif tracking-tight">{String(val)}</td>
                                                               ))}
                                                            </tr>
                                                         ))}
                                                      </tbody>
                                                   </table>
                                                </div>
                                             </div>
                                          </div>
                                       </td>
                                    </tr>
                                 )}
                              </React.Fragment>
                           )) : (
                              <tr>
                                 <td colSpan={4} className="p-20 text-center opacity-40">
                                    <CommandLineIcon className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Registry is empty. Link a dataset to begin dispatch.</p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </Card>

               {/* Dormant Lead Spectrum (Auto-Filtered > 3 Weeks) */}
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
                     <Card className="bg-white border-[var(--border)] shadow-sm overflow-hidden text-left border-l-4 border-l-[var(--amber)]">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--amber-lt)]/10 flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[var(--amber-lt)] rounded-lg flex items-center justify-center border border-[var(--amber)]/20 shadow-sm text-[var(--amber-dk)]">
                                 <ClockIcon className="w-4 h-4" />
                              </div>
                              <div>
                                 <h2 className="text-[16px] font-bold text-[var(--text)] font-serif uppercase tracking-tight">Dormant Lead Spectrum</h2>
                                 <p className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-[1px] opacity-60 mt-0.5">Automated re-engagement catchment (Age: 21 Days+)</p>
                              </div>
                           </div>
                           <Badge variant="warning" className="text-[9px] font-black tracking-widest px-2 py-0.5">{dormantLeads.length} DORMANT NODES</Badge>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                                    <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Identity Node</th>
                                    <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Last Contact</th>
                                    <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Lead Age</th>
                                    <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] text-right">Dispatch</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border)]">
                                 {dormantLeads.map((lead) => {
                                    const created = new Date(lead.createdAt);
                                    const age = Math.ceil(Math.abs(new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                       <tr key={lead.id} className="hover:bg-[#F8F7F4] transition-all group">
                                          <td className="p-[12px_24px]">
                                             <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text3)]">
                                                   {lead.customerName.charAt(0)}
                                                </div>
                                                <div>
                                                   <div className="text-[13px] font-bold text-[var(--text)] font-serif uppercase leading-none mb-1 group-hover:text-[var(--gold)] transition-colors">{lead.customerName}</div>
                                                   <div className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[0.5px] opacity-40">{lead.phone}</div>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="p-[12px_15px]">
                                             <span className="text-[12px] font-bold text-[var(--text2)] leading-none uppercase">{lead.lastContact}</span>
                                          </td>
                                          <td className="p-[12px_15px]">
                                             <Badge variant="outline" className="text-[9px] font-black bg-[var(--bg)] border-[var(--border)] px-1.5 py-0">{age} D. OLD</Badge>
                                          </td>
                                          <td className="p-[12px_24px] text-right">
                                             <Button
                                                v2={true}
                                                size="sm"
                                                onClick={() => {
                                                   if (!newPostTitle) { alert("Select a Campaign Manifesto first."); return; }
                                                   sendWeekendPostNow(newPostTitle, 1);
                                                   alert(`Dispatched "${newPostTitle}" to ${lead.customerName}`);
                                                }}
                                                className="text-[9px] font-black uppercase tracking-[1.5px] h-7 px-3 rounded-md bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white border border-[var(--gold)]/20 shadow-none"
                                             >
                                                <PaperAirplaneIcon className="w-3 h-3 mr-1.5" />
                                                PULSE
                                             </Button>
                                          </td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                        <div className="p-4 bg-[var(--bg)]/50 border-t border-[var(--border)]">
                           <Button
                              v2={true}
                              className="w-full text-[10px] font-black uppercase tracking-[3px] h-10 rounded-lg shadow-sm"
                              onClick={() => {
                                 if (!newPostTitle) { alert("Select a Campaign Manifesto for global broadcast."); return; }
                                 sendWeekendPostNow(newPostTitle, dormantLeads.length);
                                 alert(`Sent "${newPostTitle}" to all ${dormantLeads.length} dormant nodes.`);
                              }}
                           >
                              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                              Global Broadcast to Spectrum
                           </Button>
                        </div>
                     </Card>
                  );
               })()}

               {/* Spectrum Intelligence */}
               <Card className="bg-white border-none p-10 shadow-[0_20px_50px_rgba(201,150,59,0.1)] text-left relative overflow-hidden group hover:shadow-[0_25px_60px_rgba(201,150,59,0.15)] transition-all duration-700 rounded-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/5 rounded-bl-full blur-2xl group-hover:bg-[var(--gold)]/10 transition-all duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-1 h-2/3 bg-gradient-to-t from-[var(--gold)]/40 to-transparent"></div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 text-[var(--gold)] shadow-sm">
                           <SparklesIcon className="w-7 h-7 animate-pulse" />
                        </div>
                        <div>
                           <h3 className="text-[22px] font-serif text-[var(--text)] leading-none mb-2 tracking-tight italic">Spectrum Intelligence</h3>
                           <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse"></span>
                              <p className="text-[10px] font-black uppercase tracking-[4px] text-[var(--gold)]">AI Protocol Integrated</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-6 bg-[var(--bg)]/50 rounded-xl border border-[var(--gold)]/10 mb-8 backdrop-blur-sm relative">
                        <div className="absolute top-0 left-0 w-8 h-8 opacity-10">
                           <ChatBubbleLeftRightIcon className="w-full h-full text-[var(--gold)]" />
                        </div>
                        <p className="text-[15px] text-[var(--text2)] leading-relaxed font-medium italic pl-4">
                           {transmissionLogs.length > 0 
                             ? `"Based on recent transmissions, the protocol is stabilizing. Historical yield indicates optimal frequency peaks."`
                             : `"Spectrum Intelligence waiting for initial transmission logs to begin engagement modeling."`}
                        </p>
                     </div>

                     <Button 
                        v2={true}
                        className="w-full h-16 rounded-lg font-black text-[11px] uppercase tracking-[4px] shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => setIsRulesOpen(true)}
                     >
                        Sync Logic Node <ArrowUpRightIcon className="w-4 h-4 ml-2" />
                     </Button>
                  </div>
               </Card>
            </div>

            {/* Sidebar: Transmission Journal */}
            <div className="space-y-[var(--section-gap)]">
               <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                        <PaperAirplaneIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-[18px] font-serif text-[var(--text)] leading-none mb-1">Transmission Journal</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text3)]">Recent Dispatches</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     {transmissionLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-[14px] font-bold text-[var(--text)] font-serif uppercase leading-none">{log.postTitle}</span>
                              <Badge variant="outline" className="text-[8px] font-bold border-none bg-green-50 text-green-600">SENT</Badge>
                           </div>
                           <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)] text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider">
                              <span>{log.read} READS</span>
                              <span className="flex items-center gap-1.5 text-[var(--gold)]">
                                 <CommandLineIcon className="w-3.5 h-3.5" />
                                 {log.channel}
                              </span>
                           </div>
                        </div>
                     ))}
                     <Button 
                        v2={true}
                        variant="secondary" 
                        size="sm" 
                        className="w-full mt-2 border-[var(--border)] text-[var(--text2)] text-[11px] font-bold uppercase tracking-wider rounded-lg"
                        onClick={() => setIsHistoryOpen(true)}
                     >
                        Full Protocol Ledger
                     </Button>
                  </div>
               </Card>

                {/* Activity Feed */}
                <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-[var(--green-lt)] rounded-xl flex items-center justify-center border border-[var(--green)]/20 shadow-sm text-[var(--green)]">
                         <ClipboardDocumentListIcon className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-[16px] font-serif text-[var(--text)] leading-none mb-1">Activity Feed</h3>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text3)]">Live Operations</p>
                      </div>
                   </div>
                   <div className="space-y-3">
                      {activityFeed.length > 0 ? activityFeed.slice(0, 8).map((item) => (
                         <div key={item.id} className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)] flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                               item.type === 'weekend_post' ? 'bg-[var(--gold)]' :
                               item.type === 'booking' ? 'bg-[var(--green)]' :
                               item.type === 'payment' ? 'bg-blue-500' :
                               'bg-[var(--text3)]'
                            }`}></div>
                            <div>
                               <p className="text-[11px] font-bold text-[var(--text)] leading-snug">{item.message}</p>
                               <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-wider mt-1 opacity-50">{item.timestamp}</p>
                            </div>
                         </div>
                      )) : (
                         <div className="text-center py-8 opacity-30">
                            <ClipboardDocumentListIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-[9px] font-bold uppercase tracking-widest">No activity yet</p>
                         </div>
                      )}
                   </div>
                </Card>

                {/* Campaign Yield */}
                <Card className="bg-white border-none p-10 shadow-[0_20px_50px_rgba(26,95,168,0.08)] text-left relative overflow-hidden group hover:shadow-[0_25px_60px_rgba(26,95,168,0.12)] transition-all duration-700 rounded-xl">
                   <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50/30 rounded-full blur-3xl transition-all duration-1000 group-hover:bg-blue-100/40"></div>
                   <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#1A5FA8]/30 to-transparent"></div>
                   
                   <div className="relative z-10">
                      <div className="w-14 h-14 bg-blue-50/50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm mb-8">
                         <MegaphoneIcon className="w-7 h-7 text-[#1A5FA8]" />
                      </div>
                      <h3 className="text-[24px] font-serif text-[var(--text)] mb-3 tracking-tighter">Campaign Yield</h3>
                       <p className="text-[15px] text-[var(--text2)] mb-10 leading-relaxed font-medium">
                          {transmissionLogs.length > 0 
                             ? `Engagement remains stable. Analysis suggests rescheduling nodes for higher intent pulses during Saturday mornings.`
                             : `No campaign yield data detected. Deploy your first weekend post to activate analytics engine.`}
                       </p>
                       <Button 
                          v2={true}
                          variant="secondary"
                          className="w-full text-[#1A5FA8] font-black uppercase tracking-[4px] text-[11px] h-16 border-blue-100 rounded-lg hover:bg-[#1A5FA8] hover:text-white hover:border-[#1A5FA8] transition-all duration-500 shadow-sm flex items-center justify-center gap-2"
                          onClick={() => {
                             alert("Optimization protocol initiated. Spectrum frequency adjusting...");
                          }}
                       >
                          Optimize Schedule <ArrowUpRightIcon className="w-4 h-4" />
                       </Button>
                   </div>
                </Card>
            </div>
         </div>
         </div>

         {/* Fixed elements outside the animated container to avoid the 'contained' trap */}
          {isDeployModalOpen && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                   <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm">
                            <SparklesIcon className="w-6 h-6 text-[var(--gold)]" />
                         </div>
                         <div>
                            <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                               Content Dispatch
                            </h2>
                            <p className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Weekend Transmission Protocol</p>
                         </div>
                      </div>
                      <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] w-8 h-8" onClick={() => { setIsDeployModalOpen(false); setEditingPost(null); setNewPostTitle(''); }}>✕</Button>
                   </div>

                   <form className="p-6 space-y-4 text-left" onSubmit={(e) => { e.preventDefault(); handleDeploy(); }}>
                      <div
                         onClick={() => fileInputRef.current?.click()}
                         className="h-32 bg-[var(--bg)]/30 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center hover:bg-[var(--bg)] cursor-pointer transition-all overflow-hidden relative group"
                      >
                         <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
                         {selectedFile || (editingPost && editingPost.image) ? (
                            <div className="w-full h-full relative">
                               <img
                                  src={selectedFile ? URL.createObjectURL(selectedFile) : editingPost?.image}
                                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                  alt="Asset Preview"
                               />
                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlusIcon className="w-10 h-10 text-white drop-shadow-lg" />
                                  <div className="text-[11px] font-bold text-white uppercase tracking-[2px] mt-2">Replace Asset</div>
                               </div>
                            </div>
                         ) : (
                            <div className="text-center">
                               <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-[var(--text3)] opacity-40 mb-3 group-hover:text-[var(--gold)] transition-colors" />
                               <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] opacity-60">Select Asset Payload</div>
                            </div>
                         )}
                      </div>

                      <div className="space-y-4">
                         <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2">Campaign Title</label>
                            <Input
                               v2={true}
                               value={newPostTitle}
                               onChange={e => setNewPostTitle(e.target.value)}
                               placeholder="ENTER MANIFEST IDENTITY..."
                               required
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2">Format Matrix</label>
                               <Select v2={true}>
                                  <option>STATIC IMAGE</option>
                                  <option>REEL (VIDEO)</option>
                                  <option>CAROUSEL</option>
                               </Select>
                            </div>
                            <div>
                               <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[var(--text3)] mb-2">Trigger Pulse</label>
                               <Input type="time" defaultValue="09:00" v2={true} />
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 flex flex-col gap-3">
                         <Button
                            type="submit"
                            v2={true}
                            disabled={!newPostTitle || isUploading}
                            className="w-full h-14 rounded-xl shadow-lg shadow-[var(--gold)]/10 text-[11px] font-bold uppercase tracking-[3px]"
                         >
                            {editingPost ? 'Update Transmission Node' : 'Deploy Node to Spectrum'} <ArrowUpRightIcon className="w-4 h-4 ml-2" />
                         </Button>
                         <Button 
                            variant="secondary" 
                            v2={true} 
                            onClick={() => { setIsDeployModalOpen(false); setEditingPost(null); setNewPostTitle(''); }} 
                            className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px]"
                         >
                            Discard Draft
                         </Button>
                      </div>
                   </form>
                </div>
             </div>
          )}

          {/* History Modal */}
          {isHistoryOpen && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl p-0 w-full max-w-lg h-[80vh] shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden flex flex-col">
                   <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                            <ClipboardDocumentListIcon className="w-5 h-5" />
                         </div>
                         <div>
                            <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                               Transmission Ledger
                            </h2>
                            <p className="text-[9px] text-[var(--gold)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Full history of weekend logs</p>
                         </div>
                      </div>
                      <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] w-8 h-8" onClick={() => setIsHistoryOpen(false)}>✕</Button>
                   </div>

                   <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {transmissionLogs.length > 0 ? (
                         transmissionLogs.map((log) => (
                            <div key={log.id} className="p-4 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all text-left">
                               <div className="flex justify-between items-start mb-2">
                                  <span className="text-[14px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-none">{log.postTitle}</span>
                                  <Badge variant="outline" className="text-[8px] font-bold border-none bg-green-50 text-green-600 px-2 py-0.5 uppercase tracking-widest">SENT</Badge>
                               </div>
                               <div className="grid grid-cols-2 gap-4 pb-2 border-b border-[var(--border)]/50 mt-2">
                                  <div className="flex flex-col">
                                     <span className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-wider mb-0.5 opacity-50">Delivered</span>
                                     <span className="text-[12px] font-bold text-[var(--text2)] tracking-tight">{log.delivered} Nodes</span>
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-wider mb-0.5 opacity-50">Read Rate</span>
                                     <span className="text-[12px] font-bold text-[var(--text2)] tracking-tight">{log.delivered > 0 ? ((log.read / log.delivered) * 100).toFixed(1) : '0.0'}%</span>
                                  </div>
                               </div>
                               <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest opacity-60">
                                  <span>{log.date}</span>
                                  <span className="flex items-center gap-1.5 text-[var(--gold)]">
                                     <CommandLineIcon className="w-3.5 h-3.5" />
                                     {log.channel}
                                  </span>
                               </div>
                            </div>
                         ))
                      ) : (
                         <div className="text-center py-20 opacity-40">
                            <CommandLineIcon className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No transmissions recorded</p>
                         </div>
                      )}
                   </div>

                   <div className="p-6 border-t border-[var(--border)] bg-[var(--bg)]">
                      <Button
                         variant="secondary"
                         v2={true}
                         className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px]"
                         onClick={() => setIsHistoryOpen(false)}
                      >
                         Close Ledger Protocol
                      </Button>
                   </div>
                </div>
             </div>
          )}

          {/* CSV Upload Modal */}
          {isCsvUploadModalOpen && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                   <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm">
                            <ArrowUpTrayIcon className="w-6 h-6 text-[var(--gold)]" />
                         </div>
                         <div>
                            <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                               Linked Asset Link
                            </h2>
                            <p className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Link contact dataset to registry</p>
                         </div>
                      </div>
                      <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] w-8 h-8" onClick={() => setIsCsvUploadModalOpen(false)}>✕</Button>
                   </div>

                   <form className="p-6 space-y-4 text-left">
                      <div
                         onClick={() => document.getElementById('csv-file-input')?.click()}
                         className="h-32 bg-[var(--bg)]/30 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center hover:bg-[var(--bg)] cursor-pointer transition-all overflow-hidden relative group"
                      >
                         <input type="file" id="csv-file-input" hidden accept=".csv" onChange={handleCsvFileUpload} />
                         {csvFile ? (
                            <div className="w-full h-full relative flex items-center justify-center bg-[var(--gold-lt)]/30">
                               <div className="text-center">
                                  <CheckBadgeIcon className="w-8 h-8 mx-auto text-[var(--gold)] mb-2" />
                                  <div className="text-[11px] font-bold text-[var(--gold-dk)] uppercase tracking-[2px]">{csvFile.name}</div>
                               </div>
                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowUpTrayIcon className="w-8 h-8 text-white drop-shadow-lg" />
                                  <div className="text-[10px] font-bold text-white uppercase tracking-[2px] mt-2">Replace File</div>
                               </div>
                            </div>
                         ) : (
                            <div className="text-center">
                               <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-[var(--text3)] opacity-40 mb-3 group-hover:text-[var(--gold)] transition-colors" />
                               <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] opacity-60">Select CSV Dataset</div>
                            </div>
                         )}
                      </div>

                      {isCsvUploading && (
                         <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--gold)]"></div>
                         </div>
                      )}

                      <div className="pt-4 flex flex-col gap-3">
                         <Button
                            type="button"
                            v2={true}
                            disabled={isCsvUploading || !csvFile}
                            onClick={handleAddCsvToRegistry}
                            className="w-full h-14 rounded-xl shadow-lg shadow-[var(--gold)]/10 text-[11px] font-bold uppercase tracking-[3px]"
                         >
                            Add to Registry <ArrowPathIcon className="w-4 h-4 ml-2" />
                         </Button>
                         <Button 
                            variant="secondary" 
                            v2={true} 
                            onClick={() => setIsCsvUploadModalOpen(false)} 
                            className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px]"
                         >
                            Cancel
                         </Button>
                      </div>
                   </form>
                </div>
             </div>
          )}

          {/* Rules Modal */}
          {isRulesOpen && (
             <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                   <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm">
                            <AdjustmentsVerticalIcon className="w-6 h-6 text-[var(--gold)]" />
                         </div>
                         <div>
                            <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                               Engagement Logic
                            </h2>
                            <p className="text-[9px] text-[var(--gold)] font-bold uppercase tracking-[2px] mt-1 opacity-60">System rule configuration</p>
                         </div>
                      </div>
                      <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] w-8 h-8" onClick={() => setIsRulesOpen(false)}>✕</Button>
                   </div>

                  <div className="p-6 space-y-4">
                     {weekendRules.map((rule) => {
                        const isEnabled = pendingRules[rule.id] ?? rule.enabled;
                        return (
                           <div
                              key={rule.id}
                              className="flex items-center justify-between p-4 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all cursor-pointer"
                              onClick={() => setPendingRules(prev => ({ ...prev, [rule.id]: !isEnabled }))}
                           >
                              <div className="flex items-center gap-4 text-left">
                                 <div className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-[var(--gold)] animate-pulse' : 'bg-slate-300'} shadow-sm`}></div>
                                 <span className="text-[12px] font-bold text-[var(--text2)] uppercase tracking-widest">{rule.label}</span>
                              </div>
                              <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${isEnabled ? 'bg-[var(--gold)]' : 'bg-slate-200'}`}>
                                 <div className={`h-full aspect-square bg-white rounded-full shadow-sm transition-all duration-300 ${isEnabled ? 'ml-6' : 'ml-0'}`}></div>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  <div className="p-6 border-t border-[var(--border)] bg-[var(--bg)] space-y-4">
                     <Button
                        v2={true}
                        onClick={handleApplyRules}
                        className="w-full h-14 rounded-xl shadow-lg shadow-[var(--gold)]/10 text-[11px] font-bold uppercase tracking-[3px]"
                     >
                        Apply System Changes <ArrowUpRightIcon className="w-4 h-4 ml-2" />
                     </Button>
                     <Button
                        variant="secondary"
                        v2={true}
                        className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px]"
                        onClick={() => setIsRulesOpen(false)}
                      >
                        Discard Pending
                      </Button>
                    </div>
                 </div>
              </div>
           )}

           {/* Send Now Confirmation Modal */}
           {confirmSendPost && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
                 <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                    <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[var(--green-lt)] rounded-xl flex items-center justify-center border border-[var(--green)]/20 shadow-sm">
                             <PaperAirplaneIcon className="w-5 h-5 text-[var(--green)]" />
                          </div>
                          <div>
                             <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                                Confirm Dispatch
                             </h2>
                             <p className="text-[9px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Weekend Transmission Protocol</p>
                          </div>
                       </div>
                       <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] w-8 h-8" onClick={() => setConfirmSendPost(null)}>✕</Button>
                    </div>

                    <div className="p-6 space-y-5 text-left">
                       <div className="p-5 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)]">
                          <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] mb-2 opacity-50">Campaign</p>
                          <p className="text-[14px] font-bold text-[var(--text)] font-serif uppercase tracking-tight">{confirmSendPost.title}</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)]">
                             <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] mb-1 opacity-50">Recipients</p>
                             <p className="text-[18px] font-black text-[var(--gold)]">{followUps.filter(f => f.status !== 'Lost').length} contacts</p>
                          </div>
                          <div className="p-4 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)]">
                             <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] mb-1 opacity-50">Channel</p>
                             <p className="text-[18px] font-black text-[var(--green)]">WhatsApp</p>
                          </div>
                       </div>

                       {weekendRules.find(r => r.id === 'r4')?.enabled ? (
                          <div className="p-4 bg-[var(--green-lt)]/30 rounded-xl border border-[var(--green)]/20 flex items-start gap-3">
                             <CheckBadgeIcon className="w-5 h-5 text-[var(--green)] mt-0.5 flex-shrink-0" />
                             <div>
                                <p className="text-[11px] font-bold text-[var(--text)]">Customers Group: ON</p>
                                <p className="text-[10px] text-[var(--text3)] mt-1">Follow-up interactions will be auto-logged for each customer.</p>
                             </div>
                          </div>
                       ) : (
                          <div className="p-4 bg-[var(--amber-lt)]/30 rounded-xl border border-[var(--amber)]/20 flex items-start gap-3">
                             <XMarkIcon className="w-5 h-5 text-[var(--amber)] mt-0.5 flex-shrink-0" />
                             <div>
                                <p className="text-[11px] font-bold text-[var(--text)]">Customers Group: OFF</p>
                                <p className="text-[10px] text-[var(--text3)] mt-1">No interactions will be auto-logged. Toggle ON in Rules to enable.</p>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="p-6 border-t border-[var(--border)] bg-[var(--bg)] flex flex-col gap-3">
                       <Button
                          v2={true}
                          className="w-full h-14 rounded-xl shadow-lg shadow-[var(--green)]/10 text-[11px] font-bold uppercase tracking-[3px]"
                          onClick={() => {
                             const contactCount = followUps.filter(f => f.status !== 'Lost').length;
                             sendWeekendPostNow(confirmSendPost.title, contactCount);
                             setConfirmSendPost(null);
                             setSendToast(`"${confirmSendPost.title}" sent to ${contactCount} contacts`);
                             setTimeout(() => setSendToast(null), 4000);
                          }}
                       >
                          <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                          Confirm & Send Now
                       </Button>
                       <Button
                          variant="secondary"
                          v2={true}
                          className="w-full h-12 rounded-xl border-[var(--border)] text-[10px] font-bold uppercase tracking-[2px]"
                          onClick={() => setConfirmSendPost(null)}
                       >
                          Cancel
                       </Button>
                    </div>
                 </div>
              </div>
           )}

           {/* Send Toast */}
           {sendToast && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[700] bg-[var(--sb)] text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
                 <div className="w-2 h-2 rounded-full bg-[var(--green)]"></div>
                 <span className="text-[10px] font-bold uppercase tracking-[2.5px] whitespace-nowrap">{sendToast}</span>
              </div>
           )}
      </>
   );
}
