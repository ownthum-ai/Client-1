"use client";
import React, { useState, useRef } from 'react';
import { useStore, Brochure, BrochureShare } from '@/store/useStore';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { KPICard } from '@/components/ui/KPICard';

export default function BrochureManagement() {
  const { brochures, brochureShares, addBrochure, logBrochureShare, layouts } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedBrochure, setSelectedBrochure] = useState<Brochure | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [view, setView] = useState<'management' | 'history'>('management');
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [newBrochure, setNewBrochure] = useState({ name: '', project: layouts[0]?.name || 'Scheme A', category: 'Residential' });
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [shareData, setShareData] = useState({ customerName: '', phone: '' });
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const filteredBrochures = brochures.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = brochureShares.filter(s =>
    s.customerName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    s.brochureTitle.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const handleUpload = () => {
    if (!newBrochure.name) return;
    const fileUrl = selectedUploadFile ? URL.createObjectURL(selectedUploadFile) : undefined;
    addBrochure({
      title: newBrochure.name,
      version: "1.0",
      date: new Date().toISOString().split('T')[0],
      type: selectedUploadFile?.type || 'application/pdf',
      size: selectedUploadFile ? `${(selectedUploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.5 MB',
      icon: '📄',
      url: fileUrl,
      colorGradient: 'linear-gradient(135deg, #C9963B 0%, #8E6A29 100%)'
    });
    setIsUploadModalOpen(false);
    setNewBrochure({ name: '', project: 'Scheme A', category: 'Residential' });
    setSelectedUploadFile(null);
  };

  const handleShare = () => {
    if (!shareData.customerName || !selectedBrochure) return;
    logBrochureShare({
      customerName: shareData.customerName,
      brochureTitle: selectedBrochure.title,
      version: selectedBrochure.version,
      channel: 'WhatsApp'
    });
    setIsShareModalOpen(false);
    setShareData({ customerName: '', phone: '' });
  };

  const openPreview = (brochure: Brochure) => {
    setSelectedBrochure(brochure);
    setPreviewUrl(brochure.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setIsPreviewModalOpen(true);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setIsPreviewModalOpen(false);
  };

  const kpis = [
    { label: 'Brochures', value: brochures.length, color: 'gold', trend: { value: 'Total files', type: 'neutral' as const } },
    { label: 'Shares', value: brochureShares.length, color: 'green', trend: { value: 'Total sent', type: 'up' as const } },
    { label: 'Today', value: brochureShares.filter(s => s.date === new Date().toLocaleDateString()).length, color: 'blue', trend: { value: 'Sent today', type: 'neutral' as const } },
    { label: 'Storage', value: '0 GB', color: 'blue', trend: { value: 'Available', type: 'neutral' as const } },
  ];

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {view === 'management' ? (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="text-left">
                <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Brochures</h1>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 tracking-wider leading-none">
                    <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5"></span>
                    Live status
                  </span>
                  <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums tracking-tight opacity-50">Digital brochures and share tracking</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button v2={true} size="default" onClick={() => setIsUploadModalOpen(true)} className="px-8 shadow-sm rounded-lg">
                  <PlusIcon className="w-4 h-4 mr-2" /> Upload brochure
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
              {kpis.map((k, i) => (
                <KPICard key={i} label={k.label} value={k.value.toString()} color={k.color} trend={k.trend} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
              {/* List */}
              <Card className="bg-white border-2 shadow-lg overflow-hidden text-left">
                <div className="p-6 border-b border-[var(--border)] bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-[16px] font-bold text-[var(--text)]">List</h2>
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)] z-10" />
                    <Input type="text" placeholder="Search brochures..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10 border-[var(--border)] text-[11px] shadow-sm" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                        <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Name</th>
                        <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Project</th>
                        <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Version</th>
                        <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Size</th>
                        <th className="p-[16px_32px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[var(--border)]">
                      {filteredBrochures.map((brochure) => (
                        <tr key={brochure.id} className="hover:bg-gray-50">
                          <td className="p-[16px_32px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-[var(--border)] flex items-center justify-center text-[var(--gold)] shadow-sm">
                                <DocumentIcon className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[15px] font-bold text-gray-900 leading-none">{brochure.title}</span>
                                <span className="text-[12px] text-gray-400 font-bold mt-2 uppercase tracking-wider opacity-80 leading-none">PDF file</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-[16px_20px] text-[14px] font-bold text-gray-900">Scheme A</td>
                          <td className="p-[16px_20px]">
                            <Badge variant="outline" className="text-[10px] font-bold border-[var(--border)] text-gray-500 px-2 py-1 shadow-sm uppercase tracking-wider">v{brochure.version}</Badge>
                          </td>
                          <td className="p-[16px_20px] text-[12px] font-bold text-gray-400 opacity-80">{brochure.size}</td>
                          <td className="p-[16px_32px] text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openPreview(brochure)} className="hover:bg-gray-100 border-none h-8 w-8 text-[var(--text3)]">
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button v2={true} size="sm" onClick={() => { setSelectedBrochure(brochure); setIsShareModalOpen(true); }} className="h-8 px-4 text-[9px] font-bold shadow-sm rounded-lg">
                                Send
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Sidebar: History */}
              <div className="space-y-[var(--section-gap)]">
                <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[18px] font-bold text-[var(--text)] leading-none mb-2">History</h3>
                      <p className="text-[11px] font-bold tracking-widest text-[var(--text3)] opacity-40 uppercase">Recent shares</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {brochureShares.slice(0, 5).map((log: BrochureShare) => (
                      <div key={log.id} className="p-4 bg-gray-50 rounded-xl border border-[var(--border)] text-left shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[14px] font-bold text-[var(--text)] leading-tight">{log.customerName}</span>
                          <span className="text-[8px] font-bold text-[var(--text3)] uppercase tracking-widest opacity-40">Sent</span>
                        </div>
                        <p className="text-[11px] text-[var(--text3)] font-bold mb-4 opacity-70 leading-tight uppercase">{log.brochureTitle} (v{log.version})</p>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-[9px] font-bold tracking-widest tabular-nums">
                          <span className="opacity-40">{log.date}</span>
                          <div className="flex items-center gap-1.5 text-[var(--gold)]">
                            <CheckBadgeIcon className="w-4 h-4" />
                            Done
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" v2={true} onClick={() => setView('history')} className="w-full mt-2 border-[var(--border)] text-[var(--text2)] text-[10px] font-bold rounded-lg shadow-sm bg-white">
                      Full history
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* History Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-left">
                <h2 className="text-[22px] font-bold text-[var(--text)] tracking-tight leading-tight mb-1 uppercase">Share History</h2>
                <p className="text-[11px] text-[var(--text3)] font-bold uppercase tracking-[2px] opacity-40">List of all shared brochures</p>
              </div>
              <Button variant="secondary" v2={true} onClick={() => setView('management')} className="h-10 px-6 rounded-xl text-[10px] font-bold gap-2 shadow-sm bg-white border border-gray-200 hover:border-[var(--gold)] transition-all duration-300 group">
                <ChevronRightIcon className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back
              </Button>
            </div>

            {/* History KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Sent', value: brochureShares.length, icon: PaperAirplaneIcon, color: 'blue' },
                { label: 'Total People', value: new Set(brochureShares.map(s => s.customerName)).size, icon: UserGroupIcon, color: 'gold' },
                { label: 'Interest Level', value: 'High', icon: ShieldCheckIcon, color: 'green' },
              ].map((k, i) => (
                <div key={i} className="p-5 bg-white border border-[var(--border)] rounded-2xl shadow-sm flex items-center gap-4">
                  <div className={`w-11 h-11 bg-[var(--${k.color}-lt)] rounded-xl flex items-center justify-center text-[var(--${k.color})] shadow-sm border border-[var(--${k.color})]/10`}>
                    <k.icon className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{k.label}</p>
                    <p className="text-[20px] font-bold text-gray-900 leading-none tabular-nums tracking-tighter">{k.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* History Table */}
            <Card className="overflow-hidden border border-[var(--border)] shadow-xl rounded-2xl">
              <div className="p-6 border-b border-[var(--border)] bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text)] leading-none mb-1.5 uppercase tracking-tight">Sent list</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[2px] opacity-60">Sent list</p>
                </div>
                <div className="relative flex-1 max-w-md">
                   <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                   <Input 
                     v2={true} 
                     placeholder="Search by name or brochure..." 
                     value={historySearchTerm}
                     onChange={(e) => setHistorySearchTerm(e.target.value)}
                     className="h-10 pl-11 rounded-lg border-gray-200 bg-white/50 focus:bg-white transition-all text-[11px] font-medium shadow-sm" 
                   />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/50 border-b border-[var(--border)]">
                      <th className="p-[12px_24px] text-[9px] font-bold text-gray-400 uppercase tracking-[2px]">Customer</th>
                      <th className="p-[12px_16px] text-[9px] font-bold text-gray-400 uppercase tracking-[2px]">Brochure</th>
                      <th className="p-[12px_16px] text-[9px] font-bold text-gray-400 uppercase tracking-[2px]">Shared via</th>
                      <th className="p-[12px_16px] text-[9px] font-bold text-gray-400 uppercase tracking-[2px]">Date</th>
                      <th className="p-[12px_24px] text-right text-[9px] font-bold text-gray-400 uppercase tracking-[2px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-16 text-center">
                           <div className="flex flex-col items-center gap-3 opacity-20">
                              <ClockIcon className="w-12 h-12" />
                              <p className="text-[11px] font-bold uppercase tracking-widest">No matching history found</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((log: BrochureShare) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-[14px_24px]">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-[var(--gold)] shrink-0 border-2 border-white shadow-sm">
                                {log.customerName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-gray-900 group-hover:text-[var(--gold)] transition-colors leading-none">{log.customerName}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60">ID: {log.id.split('-')[1]}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-[14px_16px]">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-gray-700 leading-none">{log.brochureTitle}</span>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded-[4px] text-[8px] font-bold text-gray-500 uppercase">v{log.version}</span>
                                <span className="text-[9px] text-gray-300 font-bold italic opacity-60">Digital Copy</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-[14px_16px]">
                             <div className="flex items-center gap-2">
                               <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                                </div>
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">WhatsApp</span>
                             </div>
                          </td>
                          <td className="p-[14px_16px]">
                            <span className="text-[12px] font-bold text-gray-900 tabular-nums opacity-60">{log.date}</span>
                          </td>
                          <td className="p-[14px_24px] text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full text-[9px] font-bold text-green-700 border border-green-100 shadow-sm uppercase tracking-wide">
                              <CheckBadgeIcon className="w-3.5 h-3.5" />
                              Sent
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <DocumentArrowUpIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Brochure</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Incorporate new digital collateral into library</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsUploadModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
              <form className="space-y-10 text-left" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
                <div className="space-y-4">
                  <Label required>Brochure Name</Label>
                  <Input 
                    required 
                    v2={true} 
                    value={newBrochure.name} 
                    onChange={(e) => setNewBrochure({ ...newBrochure, name: e.target.value })} 
                    placeholder="e.g. Sunrise Greens Phase II Masterplan" 
                    className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Linked project</Label>
                    <Select 
                      v2={true} 
                      value={newBrochure.project} 
                      onChange={(e) => setNewBrochure({ ...newBrochure, project: e.target.value })} 
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase"
                    >
                      {layouts.map(l => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                      ))}
                      {layouts.length === 0 && <option value="Default">Default project</option>}
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label required>File type</Label>
                    <Select 
                      v2={true} 
                      value={newBrochure.category} 
                      onChange={(e) => setNewBrochure({ ...newBrochure, category: e.target.value })} 
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase"
                    >
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Luxury</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label required>Source document (PDF)</Label>
                  <div 
                    onClick={() => uploadFileInputRef.current?.click()} 
                    className="p-16 border-2 border-dashed border-gray-200 rounded-[16px] text-center hover:bg-gray-100 cursor-pointer bg-gray-50 shadow-inner relative overflow-hidden transition-all group"
                  >
                    <input type="file" hidden ref={uploadFileInputRef} onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)} />
                    {selectedUploadFile ? (
                      <div className="flex flex-col items-center gap-5">
                        <div className="w-20 h-20 bg-white rounded-[12px] flex items-center justify-center text-amber-600 border-2 border-amber-100 shadow-xl">
                          <DocumentIcon className="w-10 h-10" />
                        </div>
                        <div className="text-amber-900 font-bold text-[14px] uppercase tracking-[2px] truncate max-w-xs px-6">{selectedUploadFile.name}</div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest tabular-nums">{(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} megabytes</div>
                      </div>
                    ) : (
                      <div className="space-y-5 py-6">
                        <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-300 group-hover:text-amber-500 transition-colors" />
                        <div className="space-y-2">
                           <div className="text-[12px] font-bold text-gray-400 uppercase tracking-[3px]">Drop files to sync</div>
                           <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest opacity-60">Maximum payload: 50MB per file</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 p-8 bg-amber-50 rounded-[16px] border-2 border-amber-100 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-md">
                    <CheckBadgeIcon className="w-6 h-6" />
                  </div>
                  <p className="text-[13px] text-amber-800 font-bold leading-relaxed uppercase tracking-wide opacity-80">
                    Document will be optimized for mobile transmission and web rendering.
                  </p>
                </div>

                <div className="pt-6 flex gap-6">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2 hover:bg-gray-50 transition-all duration-300" 
                    onClick={() => setIsUploadModalOpen(false)}
                  >
                    Discard
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl"
                  >
                    Add file
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-green-600 border-green-100 bg-green-50 shadow-green-500/5">
                  <PaperAirplaneIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Send Brochure</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none truncate max-w-[300px]">Selected: {selectedBrochure?.title}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsShareModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10 text-left">
              <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); handleShare(); }}>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Name</Label>
                    <Input 
                      required 
                      v2={true} 
                      value={shareData.customerName} 
                      onChange={e => setShareData({ ...shareData, customerName: e.target.value })} 
                      type="text" 
                      placeholder="Enter name" 
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" 
                    />
                  </div>

                  <div className="space-y-4">
                    <Label required>Phone No.</Label>
                    <Input 
                      required 
                      v2={true} 
                      value={shareData.phone} 
                      onChange={e => setShareData({ ...shareData, phone: e.target.value })} 
                      type="tel" 
                      placeholder="+91 XXXX XXX XXX" 
                      className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] tabular-nums" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 p-8 bg-green-50 rounded-[16px] border-2 border-dashed border-green-100 text-[13px] text-green-800 font-bold leading-relaxed uppercase tracking-wide shadow-inner">
                  <CheckBadgeIcon className="w-12 h-12 text-green-600 shrink-0" />
                  This share will be saved in CRM.
                </div>

                <div className="pt-6 flex gap-6">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" 
                    onClick={() => setIsShareModalOpen(false)}
                  >
                    Discard
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2] h-[56px] rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-xl font-bold uppercase tracking-widest transition-all duration-300"
                  >
                    Approve & Send
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && selectedBrochure && (
        <div className="modal-overlay">
          <div className="modal-container max-w-6xl h-[94vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="modal-header flex-shrink-0">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <DocumentIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedBrochure.title}</h3>
                  <p className="text-[12px] text-amber-600 font-bold uppercase tracking-[2px] opacity-80 leading-none tabular-nums">Version v{selectedBrochure.version} · Active security check</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={closePreview}>
                <XMarkIcon className="w-7 h-7" />
              </Button>
            </div>

            <div className="flex-1 p-8 bg-gray-100/50 overflow-hidden">
               <div className="w-full h-full rounded-[20px] border-4 border-white bg-white shadow-2xl overflow-hidden relative group">
                  {previewUrl ? (
                    <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full border-none" title="Brochure Preview" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 font-bold uppercase tracking-[4px] text-[13px]">
                      <ArrowPathIcon className="w-12 h-12 mb-6 animate-spin text-amber-600 opacity-30" />
                      Opening document...
                    </div>
                  )}
                  {/* Subtle glass overlay for aesthetics */}
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-[36px]"></div>
               </div>
            </div>

            <div className="modal-footer bg-white border-t-2 border-gray-50 p-10 flex-shrink-0">
              <div className="flex items-center justify-between w-full gap-10">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-amber-50 flex items-center justify-center text-amber-600 shadow-md">
                         <ShieldCheckIcon className="w-6 h-6" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[12px] font-bold text-gray-900 uppercase tracking-[2px]">Secure preview</span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Checked by marketing team</span>
                  </div>
                </div>
                <div className="flex gap-6">
                  <Button 
                    variant="secondary" 
                    className="h-[64px] px-12 rounded-[12px] border-2 font-bold uppercase tracking-widest shadow-md bg-white hover:bg-gray-50 transition-all duration-300" 
                    onClick={closePreview}
                  >
                    Close record
                  </Button>
                  <Button 
                    className="h-[64px] px-14 rounded-[12px] shadow-xl font-bold uppercase tracking-widest bg-gray-900 text-amber-500 hover:bg-gray-800 transition-all duration-300" 
                    onClick={() => window.open(previewUrl || '', '_blank')}
                  >
                    Open file
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChatBubbleLeftRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  );
}
