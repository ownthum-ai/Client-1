"use client";
import React, { useState, useMemo, useRef } from 'react';
import { useStore, ConstructionPhase } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { KPICard } from '@/components/ui/KPICard';

const getProgressColor = (progress: number) => {
  if (progress === 100) return 'var(--green)';
  if (progress >= 30) return 'var(--gold)';
  return 'var(--red)';
};

const getProgressStatus = (progress: number) => {
  if (progress === 100) return 'VERIFIED';
  if (progress >= 30) return 'ON-GATE';
  return 'ALERT';
};

export default function StructureLayoutPage() {
  const {
    constructionPhases,
    constructionBlocks,
    updatePhaseProgress,
    addConstructionPhase,
    deleteConstructionPhase,
    addConstructionBlock,
    deleteConstructionBlock,
    layouts,
    addConstructionCost,
    addReport,
    addPhoto,
    materialStock,
    materialTxns
  } = useStore();

  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // New Phase Form State
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDate, setNewPhaseDate] = useState('');

  // New Block Form State
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockRange, setNewBlockRange] = useState('');

  const [costPhaseId, setCostPhaseId] = useState('');
  const [costDescription, setCostDescription] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [costCategory, setCostCategory] = useState<'Labour' | 'Material' | 'Equipment' | 'Other'>('Labour');
  const [costMaterialName, setCostMaterialName] = useState('');
  const [costMaterialQty, setCostMaterialQty] = useState('');

  const [reportPhaseId, setReportPhaseId] = useState('');
  const [reportObserver, setReportObserver] = useState('');
  const [reportAction, setReportAction] = useState('');
  const [reportStatus, setReportStatus] = useState('Pending');

  const schemeTabs = layouts.map(l => l.name);
  const [activeSchemeId, setActiveSchemeId] = useState(schemeTabs[0] || 'Default');
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const filteredPhases = constructionPhases.filter(p =>
    p.name.toLowerCase().includes(activeSchemeId.toLowerCase())
  );
  const displayPhases = filteredPhases.length > 0 ? filteredPhases : constructionPhases;

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProgress = () => {
    const firstIncomplete = constructionPhases.find(p => p.progress < 100);
    if (firstIncomplete) {
      setExpandedPhaseId(firstIncomplete.id);
      setTimeout(() => {
        const element = document.getElementById(`phase-${firstIncomplete.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      showToast("Opening first active milestone...");
    } else {
      showToast("All milestones recorded in registry.");
    }
  };

  const kpis = useMemo(() => [
    { label: 'Active Phases', value: constructionPhases.filter(p => p.progress > 0 && p.progress < 100).length.toString(), icon: ArrowPathIcon, color: 'blue', subtext: 'In active construction' },
    { label: 'Overall Progress', value: constructionPhases.length > 0 ? `${Math.round(constructionPhases.reduce((acc, p) => acc + p.progress, 0) / constructionPhases.length)}%` : '0%', icon: ChartBarIcon, color: 'green', trend: { value: 'On Track', type: 'up' as const } },
    { label: 'Active Blocks', value: constructionBlocks.length.toString(), icon: Squares2X2Icon, color: 'amber', subtext: 'Structural units' },
    { label: 'Critical Alerts', value: constructionPhases.filter(p => p.progress < 20 && p.progress > 0).length.toString(), icon: InformationCircleIcon, color: 'red', subtext: 'Delayed milestones' },
  ], [constructionPhases, constructionBlocks]);

  const handlePhotoUpload = (phaseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    addPhoto(phaseId, { url, date: timestamp });
    showToast(`Visual node archived successfully in phase registry.`);
  };

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!costPhaseId || !costAmount) return;
    const phase = displayPhases.find(p => p.id === costPhaseId);
    addConstructionCost({
      phaseId: costPhaseId,
      phaseName: phase?.name || '',
      description: costDescription,
      amount: Number(costAmount),
      category: costCategory,
      materialName: costCategory === 'Material' ? costMaterialName : undefined,
      materialQty: costCategory === 'Material' ? Number(costMaterialQty) : undefined,
    });
    setIsCostModalOpen(false);
    setCostPhaseId(''); setCostDescription(''); setCostAmount(''); setCostCategory('Labour'); setCostMaterialName(''); setCostMaterialQty('');
    showToast('Construction cost recorded. P&L updated.');
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportPhaseId || !reportObserver || !reportAction) return;
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    addReport(reportPhaseId, {
      observer: reportObserver,
      action: reportAction,
      status: reportStatus,
      date: timestamp
    });
    setIsReportModalOpen(false);
    setReportPhaseId(''); setReportObserver(''); setReportAction(''); setReportStatus('Pending');
    showToast(reportStatus === 'Pending' || reportStatus === 'In Review' ? 'Inspection alert raised on dashboard.' : 'Report committed to registry.');
  };

  const handleAddPhase = (e: React.FormEvent) => {
    e.preventDefault();
    addConstructionPhase({
      name: newPhaseName,
      targetDate: newPhaseDate,
      progress: 0,
      status: 'Not Started',
      colorVar: '--gold'
    });
    setIsPhaseModalOpen(false);
    setNewPhaseName(''); setNewPhaseDate('');
    showToast("Phase initialized in registry.");
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addConstructionBlock({
      name: newBlockName,
      range: newBlockRange,
      progress: 0,
      colorVar: '--gold'
    });
    setIsBlockModalOpen(false);
    setNewBlockName(''); setNewBlockRange('');
    showToast("Block unit authorized.");
  };

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Structure Layout</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50 underline decoration-dotted">Construction phase tracking, block-wise progress and site inspection reports</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--bg)] border border-[var(--border)] p-1.5 rounded-xl mr-2 shadow-sm">
              {schemeTabs.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveSchemeId(name)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[1.5px] transition-all leading-none
                      ${activeSchemeId === name ? 'bg-white text-[var(--text)] shadow-sm ring-1 ring-black/5' : 'text-[var(--text3)] hover:text-[var(--text)] opacity-40 hover:opacity-100'}`}
                >
                  {name}
                </button>
              ))}
            </div>
            <Button v2={true} variant="secondary" onClick={() => setIsCostModalOpen(true)} className="px-6 shadow-sm rounded-lg bg-white border-[var(--border)]">
              <PlusIcon className="w-4 h-4 mr-2" /> Add Cost
            </Button>
            <Button v2={true} variant="secondary" onClick={() => setIsReportModalOpen(true)} className="px-6 shadow-sm rounded-lg bg-white border-[var(--border)]">
              <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" /> Add Report
            </Button>
            <Button v2={true} onClick={handleUpdateProgress} className="px-8 shadow-lg shadow-black/10 rounded-lg">
              <PlusIcon className="w-4 h-4 mr-2" /> Update Progress
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k, i) => (
            <KPICard key={i} label={k.label} value={k.value} icon={k.icon} color={k.color as any} trend={k.trend} subtext={k.subtext} />
          ))}
        </div>

        {/* Legend / Status Bar */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between shadow-sm group hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[var(--sb)] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[var(--sb)]/10 ring-1 ring-white/20">
              <Squares2X2Icon className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-[var(--text)] tracking-tight uppercase leading-none font-serif mb-1.5">Structural Engineering</h2>
              <p className="text-[9px] text-[var(--gold)] font-black uppercase tracking-[2.5px] leading-none opacity-80 underline decoration-dotted decoration-[var(--gold)]/30 transition-all group-hover:tracking-[3px]">Velocity assessment Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[1.5px] opacity-60 mr-6">
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-[var(--green)] shadow-[0_0_8px_var(--green)]"></div> VERIFIED</div>
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-[var(--gold)] shadow-[0_0_8px_var(--gold)]"></div> ON-GATE</div>
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-[var(--red)] shadow-[0_0_8px_var(--red)]"></div> ALERT</div>
            </div>
            <Button v2={true} variant="secondary" size="sm" onClick={() => setIsBlockModalOpen(true)} className="h-9 px-4 rounded-lg bg-white border-[var(--border)] text-[9px] font-black uppercase tracking-[1px]">
               <PlusIcon className="w-3 h-3 mr-2" /> Block Unit
            </Button>
            <Button v2={true} size="sm" onClick={() => setIsPhaseModalOpen(true)} className="h-9 px-4 rounded-lg text-[9px] font-black uppercase tracking-[1px]">
               <PlusIcon className="w-3 h-3 mr-2" /> Project Phase
            </Button>
          </div>
        </div>

        {/* Timeline Phases */}
        <div className="grid grid-cols-1 gap-4">
          {displayPhases.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center bg-white border border-dashed border-[var(--border)] rounded-[32px] group hover:border-[var(--gold)]/30 transition-all duration-500">
               <div className="w-20 h-20 bg-[var(--bg)] rounded-3xl flex items-center justify-center mb-8 border border-[var(--border)] shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <ArrowPathIcon className="w-10 h-10 text-[var(--gold)] opacity-40" />
               </div>
               <h3 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase font-serif mb-3">Project Genesis Protocol</h3>
               <p className="text-[11px] text-[var(--text3)] font-medium uppercase tracking-[2px] max-w-md leading-relaxed opacity-60 mb-10">
                  No construction milestones recorded in current node. Initialize project phases to begin visual tracking and QA auditing.
               </p>
               <Button v2={true} onClick={() => setIsPhaseModalOpen(true)} className="px-12 h-14 rounded-2xl shadow-xl shadow-[var(--gold)]/10 text-[11px] font-black tracking-[3px]">
                  Initialize First Phase
               </Button>
            </div>
          ) : displayPhases.map((phase: ConstructionPhase) => (
            <div key={phase.id} className="space-y-4">
              <div
                id={`phase-${phase.id}`}
                className={`group p-[14px_22px] rounded-2xl transition-all border flex items-center justify-between shadow-sm
                  ${expandedPhaseId === phase.id ? 'bg-[var(--bg)] border-[var(--gold)]/40 shadow-md ring-1 ring-[var(--gold)]/10' : 'bg-white border-[var(--border)] hover:border-[var(--gold)]/20 hover:bg-[#F8F7F4]'}`}
              >
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedPhaseId(expandedPhaseId === phase.id ? null : phase.id)}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-black uppercase transition-all shadow-sm
                    ${expandedPhaseId === phase.id ? 'bg-[var(--gold)] text-white rotate-6 scale-110' : 'bg-[#F8F7F4] text-[var(--text3)] border border-[var(--border)]'}`}>
                    {phase.name.charAt(0)}
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="text-[14px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-none mb-1 group-hover:text-[var(--gold)] transition-colors">{phase.name}</h4>
                    <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[1.5px] opacity-40 leading-none">TARGET SLA: {phase.targetDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[16px] font-black tracking-tighter tabular-nums leading-none" style={{ color: getProgressColor(phase.progress) }}>{phase.progress}%</span>
                    <div className="w-24 h-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_8px] shadow-current" style={{ width: `${phase.progress}%`, backgroundColor: getProgressColor(phase.progress) }}></div>
                    </div>
                  </div>
                  <button onClick={() => deleteConstructionPhase(phase.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <div 
                    onClick={() => setExpandedPhaseId(expandedPhaseId === phase.id ? null : phase.id)}
                    className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all duration-500 cursor-pointer
                    ${expandedPhaseId === phase.id ? 'bg-[var(--gold)] text-white rotate-180 shadow-md ring-4 ring-[var(--gold-lt)]' : 'bg-[#F8F7F4] text-[var(--text3)]'}`}>
                    <span className="text-[9px]">▼</span>
                  </div>
                </div>
              </div>

              {expandedPhaseId === phase.id && (
                <div className="p-8 bg-white rounded-[24px] border border-[var(--border)] animate-in slide-in-from-top-4 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-10 text-left shadow-2xl ring-1 ring-black/[0.03]">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-4 bg-[var(--gold)] rounded-full"></div>
                      <h5 className="text-[11px] font-black text-[var(--text)] uppercase tracking-[2px]">Engineering Intelligence Hub</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="p-6 bg-[#F8F7F4] rounded-2xl border border-[var(--border)] shadow-inner group/node transition-all hover:bg-white hover:border-[var(--gold)]/30 hover:shadow-md">
                        <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] mb-4 opacity-40 leading-none">Completion pulse</p>
                        <div className="flex items-baseline gap-2">
                          <input
                            type="number"
                            className="text-2xl font-black text-[var(--text)] w-20 bg-transparent border-none focus:ring-0 p-0 h-auto font-serif tabular-nums"
                            value={phase.progress}
                            onChange={(e) => updatePhaseProgress(phase.id, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          />
                          <span className="text-[12px] font-black opacity-30" style={{ color: getProgressColor(phase.progress) }}>% LOAD</span>
                        </div>
                      </div>
                      <div className="p-6 bg-[#F8F7F4] rounded-2xl border border-[var(--border)] shadow-inner flex flex-col justify-center transition-all hover:bg-white hover:border-[var(--gold)]/30 hover:shadow-md">
                        <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] mb-4 opacity-40 leading-none">Audit Protocol</p>
                        <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest w-fit shadow-sm
                          ${phase.progress === 100 ? 'bg-[var(--green-lt)] border-[var(--green)]/20 text-[var(--green)]' :
                            phase.progress < 30 ? 'bg-[var(--red-lt)] border-[var(--red)]/20 text-[var(--red)]' :
                              'bg-[var(--gold-lt)] border-[var(--gold)]/20 text-[var(--gold)]'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          {getProgressStatus(phase.progress)}
                        </div>
                      </div>
                    </div>
                    <Button v2={true} size="sm" onClick={() => showToast(`Sync for ${phase.name} authorized.`)} className="w-full !py-4 shadow-lg shadow-black/10 rounded-xl text-[11px] font-black uppercase tracking-[3px] transition-all hover:scale-[1.01] active:scale-95">
                      Authorize Lifecycle Sync
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-4 bg-[var(--green)] rounded-full"></div>
                        <h5 className="text-[11px] font-black text-[var(--text)] uppercase tracking-[2px]">Site Heritage Vault</h5>
                      </div>
                      <label className="cursor-pointer group/upload">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(phase.id, e)} />
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-[var(--green-lt)] text-[var(--green)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--green)] hover:text-white transition-all shadow-sm ring-1 ring-[var(--green)]/20">
                          <PlusIcon className="w-4 h-4" />
                          Archive Node
                        </div>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {phase.photos?.slice(0, 3).map((photo, i: number) => (
                        <div key={photo.id || i} className="aspect-square bg-[#F8F7F4] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm hover:border-[var(--gold)] hover:shadow-xl transition-all cursor-pointer group/img relative ring-1 ring-black/5">
                          <img src={photo.url} alt={`Phase Node ${i}`} className="w-full h-full object-cover group-hover/img:scale-125 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                            <span className="text-white text-[8px] font-black uppercase tracking-[3px] mb-2 bg-[var(--gold)] px-2.5 py-1 rounded-md shadow-lg">View Node</span>
                            <span className="text-white/60 text-[7px] font-bold uppercase tracking-widest">{photo.date}</span>
                          </div>
                        </div>
                      ))}
                      {(!phase.photos || phase.photos.length === 0) && (
                        <div className="col-span-3 p-10 flex flex-col items-center justify-center gap-5 bg-[#F8F7F4] rounded-2xl border border-dashed border-[var(--border)] group/empty transition-all hover:bg-white hover:border-[var(--gold)]/30 hover:shadow-2xl hover:ring-1 hover:ring-[var(--gold)]/10">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-[var(--border)] shadow-md group-hover/empty:scale-110 group-hover/empty:rotate-6 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/10 to-transparent"></div>
                            <PlusIcon className="w-7 h-7 text-[var(--gold)] opacity-40 group-hover/empty:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-[11px] font-black text-[var(--text)] uppercase tracking-[2px] opacity-60">Archive Awaiting Data</p>
                            <p className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[1px] opacity-40 leading-relaxed italic">Operational pulse required for visual registry</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Engineering Audit Journal */}
        <Card className="bg-white border-[var(--border)] p-0 overflow-hidden shadow-sm mt-12 text-left">
          <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/30">
            <div className="flex items-center gap-5 text-left">
              <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-2xl flex items-center justify-center border border-[var(--gold)]/30 shadow-sm text-[20px] transition-transform hover:rotate-12 duration-500">
                📋
              </div>
              <div className="text-left">
                <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase leading-none font-serif mb-2">Engineering Audit Journal</h2>
                <p className="text-[10px] text-[var(--gold)] font-black uppercase tracking-[3px] leading-none opacity-60 underline decoration-dotted decoration-[var(--gold)]/30">Quality Assurance Registry Warehouse</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                  <th className="p-[15px_30px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Timeline Node</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Auditor Identity</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Operation Zone</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Engineering Yields</th>
                  <th className="p-[15px_30px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Registry Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {displayPhases.flatMap(phase => (phase.reports || []).map(report => ({ ...report, phaseName: phase.name }))).map((report, idx) => (
                  <tr key={report.id || idx} className="group hover:bg-[#F8F7F4] transition-all">
                    <td className="p-[15px_30px] text-[13px] font-black text-[var(--text)] uppercase tracking-tight tabular-nums opacity-60">{report.date}</td>
                    <td className="p-[15px_15px]">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-[var(--bg)] text-[var(--gold)] flex items-center justify-center text-[11px] font-black border border-[var(--border)] shadow-sm group-hover:bg-[var(--gold)] group-hover:text-white transition-all">{report.observer[0]}</div>
                        <span className="text-[14px] font-bold text-[var(--text2)] uppercase tracking-tight group-hover:text-[var(--gold)] transition-colors leading-none">{report.observer}</span>
                      </div>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[13px] font-black text-[var(--text)] uppercase tracking-tight leading-none opacity-70 italic">{report.phaseName}</span>
                    </td>
                    <td className="p-[15px_15px] max-w-[300px]">
                      <p className="text-[12px] font-bold text-[var(--text3)] leading-relaxed group-hover:text-[var(--text2)] transition-colors uppercase tracking-tight underline decoration-dotted decoration-black/10">“{report.action}”</p>
                    </td>
                    <td className="p-[15px_30px] text-right">
                      <Badge variant={report.status === 'Cleared' ? 'success' : report.status === 'Pending' ? 'danger' : 'warning'} className="text-[9px] font-black px-3 py-1 shadow-sm uppercase tracking-widest">
                        {report.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Fixed elements outside the animated container */}
      {/* Initialize Phase Modal */}
      {isPhaseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Project Phase Node</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Authorize site construction milestone</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsPhaseModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddPhase} className="p-8 space-y-6 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Phase Identity</label>
                <Input required v2={true} value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} type="text" placeholder="E.G. PLINTH LEVEL / FOUNDATION" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Target SLA Date</label>
                <Input required v2={true} value={newPhaseDate} onChange={e => setNewPhaseDate(e.target.value)} type="text" placeholder="E.G. 25 OCT 2026" className="h-12" />
              </div>
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl text-[10px] font-black bg-white border-[var(--border)]" onClick={() => setIsPhaseModalOpen(false)}>Abort</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl text-[10px] font-black shadow-lg shadow-gold-500/10">Authorize Phase</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Initialize Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                  <Squares2X2Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Block Unit Registry</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Register structural block node</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsBlockModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddBlock} className="p-8 space-y-6 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Block Designation</label>
                <Input required v2={true} value={newBlockName} onChange={e => setNewBlockName(e.target.value)} type="text" placeholder="E.G. TOWER A / BLOCK B" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Operational Range</label>
                <Input required v2={true} value={newBlockRange} onChange={e => setNewBlockRange(e.target.value)} type="text" placeholder="E.G. PLOTS 01-50" className="h-12" />
              </div>
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl text-[10px] font-black bg-white border-[var(--border)]" onClick={() => setIsBlockModalOpen(false)}>Abort</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl text-[10px] font-black shadow-lg shadow-gold-500/10">Authorize Block</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Construction Cost Modal */}
      {isCostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Capital Outflow Node</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Register engineering expenditure payload</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsCostModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddCost} className="p-8 space-y-6 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Target Milestone Node</label>
                <select required value={costPhaseId} onChange={e => setCostPhaseId(e.target.value)} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 outline-none font-black text-[11px] uppercase tracking-widest shadow-sm">
                  <option value="">SELECT TARGET PHASE...</option>
                  {displayPhases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Expense Spectrum</label>
                  <select value={costCategory} onChange={e => setCostCategory(e.target.value as any)} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 outline-none font-black text-[11px] uppercase tracking-widest shadow-sm">
                    <option value="Labour">LABOUR</option>
                    <option value="Material">MATERIAL</option>
                    <option value="Equipment">EQUIPMENT</option>
                    <option value="Other">OTHER NODE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Monetary Load (₹)</label>
                  <Input required type="number" v2={true} className="h-12 italic font-black text-[var(--gold)] tabular-nums" value={costAmount} onChange={e => setCostAmount(e.target.value)} placeholder="000.00" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Nodal Description</label>
                <Input required v2={true} className="h-12 italic font-black uppercase tracking-widest" value={costDescription} onChange={e => setCostDescription(e.target.value)} placeholder="ENTER MANIFEST IDENTITY..." />
              </div>

              {costCategory === 'Material' && (
                <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Material Manifest</label>
                    <select value={costMaterialName} onChange={e => setCostMaterialName(e.target.value)} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 outline-none font-black text-[11px] uppercase tracking-widest shadow-sm">
                      <option value="">SELECT WAREHOUSE NODE...</option>
                      {materialStock.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Nodal Qty Pulse</label>
                    <Input type="number" v2={true} className="h-12 font-black tabular-nums" value={costMaterialQty} onChange={e => setCostMaterialQty(e.target.value)} placeholder="00" />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-5">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl text-[10px] font-black bg-white border-[var(--border)] shadow-sm" onClick={() => setIsCostModalOpen(false)}>Abort Protocol</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl font-black text-[10px] uppercase tracking-[4px] shadow-xl shadow-gold-500/10">Execute Transit Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inspection Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-0 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm leading-none">
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-[17px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">QA Inspection Protocol</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Register quality assurance audit pulse</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsReportModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddReport} className="p-8 space-y-6 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Observation Zone Node</label>
                <select required value={reportPhaseId} onChange={e => setReportPhaseId(e.target.value)} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 outline-none font-black text-[11px] uppercase tracking-widest shadow-sm">
                  <option value="">SELECT TARGET PHASE...</option>
                  {displayPhases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Auditor Identity</label>
                  <Input required v2={true} className="h-12 italic font-black uppercase tracking-widest" value={reportObserver} onChange={e => setReportObserver(e.target.value)} placeholder="INSPECTOR NAME..." />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Registry Status</label>
                  <select value={reportStatus} onChange={e => setReportStatus(e.target.value)} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 outline-none font-black text-[11px] uppercase tracking-widest shadow-sm">
                    <option value="Cleared">CLEARED</option>
                    <option value="Pending">PENDING ACTION</option>
                    <option value="In Review">IN NODAL REVIEW</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Nodal Observations</label>
                <textarea required value={reportAction} onChange={e => setReportAction(e.target.value)} placeholder="ENTER DETAILED AUDIT FINDINGS..." className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-white focus:border-[var(--gold)]/30 outline-none text-[13px] min-h-[120px] font-bold uppercase tracking-tight shadow-sm" />
              </div>

              <div className="pt-4 flex gap-5">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl text-[10px] font-black bg-white border-[var(--border)] shadow-sm" onClick={() => setIsReportModalOpen(false)}>Abort</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl bg-[#1e2a4a] text-white font-black text-[10px] uppercase tracking-[4px] shadow-xl shadow-blue-500/20">Submit Protocol</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--sb)] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-6 transition-all ring-1 ring-white/20">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]"></div>
          <span className="text-[10px] font-black uppercase tracking-[3px] whitespace-nowrap">{toast.message}</span>
        </div>
      )}
    </>
  );
}
