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
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { KPICard } from '@/components/ui/KPICard';

export default function BrochureManagement() {
  const { brochures, brochureShares, addBrochure, logBrochureShare, layouts } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedBrochure, setSelectedBrochure] = useState<Brochure | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [view, setView] = useState<'management' | 'history'>('management');

  // Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [newBrochure, setNewBrochure] = useState({ name: '', project: layouts[0]?.name || 'Scheme A', category: 'Residential' });
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [shareData, setShareData] = useState({ customerName: '', phone: '' });
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const filteredBrochures = brochures.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
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
    { label: 'Total Brochures', value: brochures.length, color: 'gold', trend: { value: 'Digital Assets', type: 'neutral' as const } },
    { label: 'Asset Reach', value: brochureShares.length, color: 'green', trend: { value: 'Active Transmissions', type: 'up' as const } },
    { label: 'Shared Today', value: brochureShares.filter(s => s.date === new Date().toLocaleDateString()).length, color: 'blue', trend: { value: 'Daily Outreach', type: 'neutral' as const } },
    { label: 'Storage Node', value: '4.2 GB', color: 'red', trend: { value: 'Cloud Sync', type: 'neutral' as const } },
  ];

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {view === 'management' ? (
          <>
            {/* V2 Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="text-left">
                <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Brochure Management</h1>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider leading-none">
                    <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                    LIVE OPERATIONAL STREAM
                  </span>
                  <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50 underline decoration-dotted">Digital presentations and distribution tracking registry</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button v2={true} size="default" onClick={() => setIsUploadModalOpen(true)} className="px-8 shadow-lg shadow-black/10 rounded-lg">
                  <PlusIcon className="w-4 h-4 mr-2" /> Upload Brochure
                </Button>
              </div>
            </div>

            {/* KPI Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
              {kpis.map((k, i) => (
                <KPICard key={i} label={k.label} value={k.value.toString()} color={k.color} trend={k.trend} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
              {/* Brochure Ledger */}
              <Card className="bg-white border-[var(--border)] shadow-sm overflow-hidden text-left">
                <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-[16px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-none">Digital Portfolio</h2>
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)] z-10" />
                    <Input type="text" placeholder="FILTER ASSETS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10 border-[var(--border)] text-[11px] uppercase tracking-wide font-black shadow-sm" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                        <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Asset Identity</th>
                        <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Project Cluster</th>
                        <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Version</th>
                        <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Data Load</th>
                        <th className="p-[12px_24px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredBrochures.map((brochure) => (
                        <tr key={brochure.id} className="hover:bg-[#F8F7F4] transition-all group">
                          <td className="p-[12px_24px]">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-all shadow-sm">
                                <DocumentIcon className="w-4.5 h-4.5" />
                              </div>
                              <div className="text-left">
                                <span className="text-[13px] font-bold text-[var(--text)] font-serif uppercase tracking-tight group-hover:text-[var(--gold)] transition-colors block mb-1.5">{brochure.title}</span>
                                <span className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[1px] opacity-40 block leading-none">Verified Asset Node</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-[12px_15px] text-[12px] font-black text-[var(--text2)] uppercase tracking-tight tabular-nums">V2 CLUSTER</td>
                          <td className="p-[12px_15px]">
                            <Badge variant="outline" className="text-[9px] font-black border-[var(--border)] text-[var(--text3)] px-1.5 py-0.5 leading-none shadow-sm uppercase">V{brochure.version}</Badge>
                          </td>
                          <td className="p-[12px_15px] text-[11px] font-black text-[var(--text3)] uppercase tabular-nums tracking-wider opacity-60 leading-none">{brochure.size}</td>
                          <td className="p-[12px_24px] text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openPreview(brochure)} className="hover:bg-[var(--gold-lt)] border-none h-8 w-8 text-[var(--text3)] hover:text-[var(--gold)] transition-all">
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button v2={true} size="sm" onClick={() => { setSelectedBrochure(brochure); setIsShareModalOpen(true); }} className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                DISPATCH
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Sidebar: Share History */}
              <div className="space-y-[var(--section-gap)]">
                <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[18px] font-serif text-[var(--text)] leading-none mb-2 uppercase tracking-tight">Journal</h3>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text3)] opacity-40 leading-none">Recent Dispatches</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {brochureShares.slice(0, 5).map((log: BrochureShare) => (
                      <div key={log.id} className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)] group hover:border-[var(--gold)]/30 transition-all text-left shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[14px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-tight">{log.customerName}</span>
                          <span className="text-[8px] font-black text-[var(--text3)] uppercase tracking-widest opacity-40 leading-none">NODE</span>
                        </div>
                        <p className="text-[11px] text-[var(--text3)] font-bold mb-4 opacity-70 leading-tight uppercase tracking-tight">{log.brochureTitle} (V{log.version})</p>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] uppercase text-[9px] font-black tracking-widest tabular-nums leading-none">
                          <span className="opacity-40">{log.date}</span>
                          <div className="flex items-center gap-1.5 text-[var(--gold)]">
                            <CheckBadgeIcon className="w-4 h-4" />
                            AUTHENTICATED
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" v2={true} onClick={() => setView('history')} className="w-full mt-2 border-[var(--border)] text-[var(--text2)] text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg shadow-sm bg-white">
                      FULL REGISTRY JOURNAL
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-in slide-in-from-right-10 duration-500 text-left">
            <Card variant="premium" className="overflow-hidden border-[var(--border)] shadow-sm">
              <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)]/10 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-none mb-2">Registry Warehouse</h2>
                  <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[3.5px] mt-1 opacity-80 leading-none underline decoration-dotted decoration-[var(--gold)]/30">Complete audit trail of shared digital assets</p>
                </div>
                <Button variant="secondary" v2={true} onClick={() => setView('management')} className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-[2px] gap-2 shadow-sm bg-white border-[var(--border)]">
                  <ChevronRightIcon className="w-4 h-4 rotate-180" /> RETURN TO LEDGER
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                      <th className="p-[15px_30px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Identified Recipient</th>
                      <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Asset Identifier</th>
                      <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Protocol V</th>
                      <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Dispatch Pulse</th>
                      <th className="p-[15px_30px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {brochureShares.map((log: BrochureShare) => (
                      <tr key={log.id} className="hover:bg-[#F8F7F4] transition-all">
                        <td className="p-[15px_30px]">
                          <div className="text-[14px] font-extrabold text-[var(--text)] font-serif uppercase tracking-tight leading-none">{log.customerName}</div>
                        </td>
                        <td className="p-[15px_15px]">
                          <span className="text-[12px] font-black text-[var(--text2)] uppercase tracking-tight tabular-nums opacity-80">{log.brochureTitle}</span>
                        </td>
                        <td className="p-[15px_15px]">
                          <Badge variant="outline" className="text-[9px] font-black border-[var(--border)] text-[var(--text3)] px-1 py-0.5 shadow-sm">V{log.version}</Badge>
                        </td>
                        <td className="p-[15px_15px]">
                           <span className="text-[12px] font-black text-[var(--text)] tabular-nums uppercase opacity-60 leading-none">{log.date}</span>
                        </td>
                        <td className="p-[15px_30px] text-right">
                          <div className="flex items-center justify-end gap-2 text-[10px] font-black text-[var(--gold)] italic tracking-widest uppercase">
                            <CheckBadgeIcon className="w-4.5 h-4.5" />
                            WHATSAPP DISPATCHED
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Fixed elements outside the animated container */}
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                    <DocumentArrowUpIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Asset Onboarding</h2>
                    <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Initialize new digital presentation node</p>
                 </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsUploadModalOpen(false)}>✕</Button>
            </div>

            <form className="p-8 grid grid-cols-2 gap-8 text-left" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
              <div className="col-span-2 space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Identity Tag</label>
                <Input required v2={true} value={newBrochure.name} onChange={(e) => setNewBrochure({ ...newBrochure, name: e.target.value })} placeholder="ENTER MANIFEST IDENTITY..." className="h-12 shadow-sm font-black uppercase tracking-widest italic" />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Project Cluster</label>
                <Select v2={true} value={newBrochure.project} onChange={(e) => setNewBrochure({ ...newBrochure, project: e.target.value })} className="h-12 shadow-sm font-black uppercase tracking-widest">
                  {layouts.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                  {layouts.length === 0 && <option value="Default">DEFAULT NODE</option>}
                </Select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Asset Spectrum</label>
                <Select v2={true} value={newBrochure.category} onChange={(e) => setNewBrochure({ ...newBrochure, category: e.target.value })} className="h-12 shadow-sm font-black uppercase tracking-widest">
                  <option>RESIDENTIAL</option>
                  <option>COMMERCIAL</option>
                  <option>LUXURY</option>
                </Select>
              </div>

              <div className="col-span-2">
                <div onClick={() => uploadFileInputRef.current?.click()} className="p-12 border-2 border-dashed border-[var(--border)] rounded-2xl text-center hover:bg-[var(--bg)]/50 cursor-pointer transition-all group bg-[var(--bg)]/10 shadow-inner relative overflow-hidden">
                  <input type="file" hidden ref={uploadFileInputRef} onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)} />
                  {selectedUploadFile ? (
                    <div className="text-[var(--gold)] font-black text-sm uppercase tracking-[2px] truncate px-4">{selectedUploadFile.name}</div>
                  ) : (
                    <div className="space-y-4">
                      <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-[var(--text3)] opacity-30 group-hover:text-[var(--gold)] transition-colors" />
                      <div className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[4px] opacity-40">Load Asset Payload (.PDF)</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2 pt-4 flex gap-4">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl border-[var(--border)] font-black uppercase tracking-[2.5px] text-[10px] bg-white shadow-sm" onClick={() => setIsUploadModalOpen(false)}>Abort Protocol</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl shadow-xl shadow-gold-500/20 font-black uppercase tracking-[3px] text-[10px]">Execute Boarding</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100 shadow-sm leading-none">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Asset Dispatch</h2>
                    <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Source: {selectedBrochure?.title}</p>
                 </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsShareModalOpen(false)}>✕</Button>
            </div>

            <form className="p-8 space-y-8 text-left" onSubmit={(e) => { e.preventDefault(); handleShare(); }}>
              <div className="space-y-4">
                 <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Recipient Identity</label>
                    <Input required v2={true} value={shareData.customerName} onChange={e => setShareData({ ...shareData, customerName: e.target.value })} type="text" placeholder="FULL LEGAL NAME..." className="h-12 shadow-sm font-black uppercase tracking-widest italic" />
                 </div>

                 <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Node Protocol (Phone)</label>
                    <Input required v2={true} value={shareData.phone} onChange={e => setShareData({ ...shareData, phone: e.target.value })} type="tel" placeholder="+91 XXXX XXXX" className="h-12 shadow-sm font-price" />
                 </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-green-50/50 rounded-xl border border-dashed border-green-100 italic font-bold text-[10px] text-green-700/70 tracking-[1px] leading-relaxed uppercase">
                 <CheckBadgeIcon className="w-5 h-5 opacity-40 shrink-0" />
                 Transmission will be logged to history ledger upon successful dispatch authentication.
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl border-[var(--border)] font-black uppercase tracking-[2px] text-[10px] bg-white shadow-sm" onClick={() => setIsShareModalOpen(false)}>Abort</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 text-[10px] font-black uppercase tracking-[3px]">Execute PULSE</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && selectedBrochure && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-6xl h-[92vh] shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden flex flex-col text-left">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                  <DocumentIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-[22px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">{selectedBrochure.title}</h3>
                  <p className="text-[10px] text-[var(--gold)] font-black uppercase tracking-[2.5px] opacity-80 leading-none underline decoration-dotted decoration-[var(--gold)]/30">Asset Spectrum Node V{selectedBrochure.version}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] shadow-sm h-10 w-10 bg-white" onClick={closePreview}>
                <XMarkIcon className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 bg-gray-100/30 p-12 overflow-hidden">
              <div className="w-full h-full rounded-2xl border border-[var(--border)] bg-white shadow-inner overflow-hidden relative">
                {previewUrl ? (
                  <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full border-none animate-in fade-in duration-1000" title="Brochure Preview" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text3)] font-serif italic uppercase tracking-[4px] text-[13px] opacity-40 animate-pulse">
                    <DocumentArrowUpIcon className="w-16 h-16 mb-4 opacity-10" />
                    Initializing high-fidelity stream...
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[var(--bg)] shadow-sm"></div>)}
                 </div>
                 <span className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] opacity-60 italic">Node integrity verified by Spectrum Engine</span>
              </div>
              <div className="flex gap-6">
                <Button variant="secondary" v2={true} className="h-14 px-12 rounded-xl border-[var(--border)] text-[11px] font-black uppercase tracking-[3px] bg-white hover:bg-[var(--bg)] transition-all shadow-sm" onClick={closePreview}>DISMISS</Button>
                <Button v2={true} className="h-14 px-12 rounded-xl shadow-xl shadow-gold-500/20 text-[11px] font-black uppercase tracking-[4px] bg-[var(--gold)] text-white hover:scale-[1.02] transition-all" onClick={() => window.open(previewUrl || '', '_blank')}>EXTERNAL LINK ↗</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Icons
function ChatBubbleLeftRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  );
}
