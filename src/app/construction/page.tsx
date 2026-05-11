"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useMemo } from 'react';
import { useStore, ConstructionPhase } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  Squares2X2Icon,
  XMarkIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { KPICard } from '@/components/ui/KPICard';

const getProgressColor = (progress: number) => {
  if (progress === 100) return 'var(--green)';
  if (progress >= 30) return 'var(--gold)';
  return 'var(--red)';
};

const getProgressStatus = (progress: number) => {
  if (progress === 100) return 'Done';
  if (progress >= 30) return 'In progress';
  return 'Delayed';
};

export default function ConstructionPage() {
  const {
    constructionPhases,
    constructionBlocks,
    updatePhaseProgress,
    addConstructionPhase,
    deleteConstructionPhase,
    addConstructionBlock,
    layouts,
    addConstructionCost,
    addReport,
    addPhoto,
    materialStock
  } = useStore();

  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Add Step Form State
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
    const firstIncomplete = displayPhases.find(p => p.progress < 100);
    if (firstIncomplete) {
      setExpandedPhaseId(firstIncomplete.id);
      showToast("Opening active work...");
      setTimeout(() => {
        const el = document.getElementById(`phase-${firstIncomplete.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else if (displayPhases.length === 0) {
      setIsPhaseModalOpen(true);
      showToast("Please add a work stage first.");
    } else {
      showToast("All work in this scheme completed.");
    }
  };

  const kpis = useMemo(() => [
    { label: 'Active Work', value: constructionPhases.filter(p => p.progress > 0 && p.progress < 100).length.toString(), icon: ArrowPathIcon, color: 'blue', subtext: 'Active steps' },
    { label: 'Total Done', value: constructionPhases.length > 0 ? `${Math.round(constructionPhases.reduce((acc, p) => acc + p.progress, 0) / constructionPhases.length)}%` : '0%', icon: ChartBarIcon, color: 'green', trend: { value: 'On track', type: 'up' as const } },
    { label: 'Blocks', value: constructionBlocks.length.toString(), icon: Squares2X2Icon, color: 'amber', subtext: 'Units' },
    { label: 'Alerts', value: constructionPhases.filter(p => p.progress < 20 && p.progress > 0).length.toString(), icon: InformationCircleIcon, color: 'red', subtext: 'Delayed work' },
  ], [constructionPhases, constructionBlocks]);

  const handlePhotoUpload = (phaseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    addPhoto(phaseId, { url, date: timestamp });
    showToast(`Photo saved.`);
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
    showToast('Cost saved.');
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
    showToast('Report saved.');
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
    showToast("Work phase added.");
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
    showToast("Block added.");
  };

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Building Work</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5"></span>
                Live status
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tracking-tight opacity-50">Track work progress, blocks, and site reports</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--bg)] border border-[var(--border)] p-1.5 rounded-xl mr-2 shadow-sm">
              {schemeTabs.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveSchemeId(name)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold tracking-[1.5px] leading-none
                      ${activeSchemeId === name ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text3)] hover:text-[var(--text)] opacity-40'}`}
                >
                  {name}
                </button>
              ))}
            </div>
            <Button v2={true} variant="secondary" onClick={() => setIsCostModalOpen(true)} className="px-6 shadow-sm rounded-lg bg-white border-[var(--border)] text-[10px] font-bold">
              <PlusIcon className="w-4 h-4 mr-2" /> Add cost
            </Button>
            <Button v2={true} variant="secondary" onClick={() => setIsReportModalOpen(true)} className="px-6 shadow-sm rounded-lg bg-white border-[var(--border)] text-[10px] font-bold">
              <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" /> Add report
            </Button>
            <Button v2={true} onClick={handleUpdateProgress} className="px-8 shadow-sm rounded-lg text-[10px] font-bold">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" /> Update Work
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k, i) => (
            <KPICard key={i} label={k.label} value={k.value} icon={k.icon} color={k.color as any} trend={k.trend} subtext={k.subtext} />
          ))}
        </div>

        {/* Work Status */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between shadow-sm text-left">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[var(--sb)] text-white rounded-xl flex items-center justify-center shadow-sm">
              <Squares2X2Icon className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[var(--text)] tracking-tight leading-none mb-1.5">Work Status</h2>
              <p className="text-[9px] text-[var(--gold)] font-semibold tracking-[2.5px] leading-none opacity-80">Phase tracking and reports</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-[9px] font-bold tracking-[1.5px] opacity-60 mr-6">
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-[var(--green)]"></div> Done</div>
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-[var(--gold)]"></div> In progress</div>
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-[var(--red)]"></div> Delayed</div>
            </div>
            <Button v2={true} variant="secondary" size="sm" onClick={() => setIsBlockModalOpen(true)} className="h-9 px-4 rounded-lg bg-white border-[var(--border)] text-[9px] font-bold shadow-sm">
              <PlusIcon className="w-3 h-3 mr-2" /> Add block
            </Button>
            <Button v2={true} size="sm" onClick={() => setIsPhaseModalOpen(true)} className="h-9 px-4 rounded-lg text-[9px] font-bold shadow-sm">
              <PlusIcon className="w-3 h-3 mr-2" /> Add Step
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 gap-4">
          {displayPhases.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center bg-white border border-dashed border-[var(--border)] rounded-[16px]">
              <div className="w-20 h-20 bg-[var(--bg)] rounded-3xl flex items-center justify-center mb-8 border border-[var(--border)] shadow-sm">
                <ArrowPathIcon className="w-10 h-10 text-[var(--gold)] opacity-40" />
              </div>
              <h3 className="text-[20px] font-bold text-[var(--text)] tracking-tight mb-3">Work progress</h3>
              <p className="text-[11px] text-[var(--text3)] font-medium max-w-md leading-relaxed opacity-60 mb-10">
                No work phases found. Add a phase to start tracking progress.
              </p>
              <Button v2={true} onClick={() => setIsPhaseModalOpen(true)} className="px-12 h-14 rounded-2xl shadow-sm text-[11px] font-bold tracking-[3px]">
                Add first phase
              </Button>
            </div>
          ) : displayPhases.map((phase: ConstructionPhase) => (
            <div key={phase.id} className="space-y-4">
              <div
                id={`phase-${phase.id}`}
                className={`p-[14px_22px] rounded-2xl border flex items-center justify-between shadow-sm
                  ${expandedPhaseId === phase.id ? 'bg-[var(--bg)] border-[var(--gold)]/40 shadow-md ring-1 ring-[var(--gold)]/10' : 'bg-white border-[var(--border)] hover:bg-[#F8F7F4]'}`}
              >
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedPhaseId(expandedPhaseId === phase.id ? null : phase.id)}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold shadow-sm
                    ${expandedPhaseId === phase.id ? 'bg-[var(--gold)] text-white' : 'bg-[#F8F7F4] text-[var(--text3)] border border-[var(--border)]'}`}>
                    {phase.name.charAt(0)}
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="text-[14px] font-bold text-[var(--text)] tracking-tight leading-none mb-1">{phase.name}</h4>
                    <p className="text-[9px] font-bold text-[var(--text3)] tracking-[1.5px] opacity-40 leading-none">Target date: {phase.targetDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[16px] font-bold tracking-tighter tabular-nums leading-none" style={{ color: getProgressColor(phase.progress) }}>{phase.progress}%</span>
                    <div className="w-24 h-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div className="h-full rounded-full" style={{ width: `${phase.progress}%`, backgroundColor: getProgressColor(phase.progress) }}></div>
                    </div>
                  </div>
                  <button onClick={() => deleteConstructionPhase(phase.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <div
                    onClick={() => setExpandedPhaseId(expandedPhaseId === phase.id ? null : phase.id)}
                    className={`w-7 h-7 flex items-center justify-center rounded-xl cursor-pointer
                    ${expandedPhaseId === phase.id ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[#F8F7F4] text-[var(--text3)]'}`}>
                    <span className="text-[9px]">▼</span>
                  </div>
                </div>
              </div>

              {expandedPhaseId === phase.id && (
                <div className="p-8 bg-white rounded-[12px] border border-[var(--border)] grid grid-cols-1 lg:grid-cols-2 gap-10 text-left shadow-lg">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-4 bg-[var(--gold)] rounded-full"></div>
                      <h5 className="text-[11px] font-bold text-[var(--text)] tracking-[2px]">Work details</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="p-6 bg-[#F8F7F4] rounded-2xl border border-[var(--border)] shadow-inner">
                        <p className="text-[9px] font-bold text-[var(--text3)] tracking-[2px] mb-4 opacity-40 leading-none">Completion</p>
                        <div className="flex items-baseline gap-2">
                          <input
                            type="number"
                            className="text-2xl font-bold text-[var(--text)] w-20 bg-transparent border-none focus:ring-0 p-0 h-auto tabular-nums"
                            value={phase.progress}
                            onChange={(e) => updatePhaseProgress(phase.id, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          />
                          <span className="text-[12px] font-bold opacity-30" style={{ color: getProgressColor(phase.progress) }}>%</span>
                        </div>
                      </div>
                      <div className="p-6 bg-[#F8F7F4] rounded-2xl border border-[var(--border)] shadow-inner flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-[var(--text3)] tracking-[2px] mb-4 opacity-40 leading-none">Status</p>
                        <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-widest w-fit shadow-sm
                          ${phase.progress === 100 ? 'bg-[var(--green-lt)] border-[var(--green)]/20 text-[var(--green)]' :
                            phase.progress < 30 ? 'bg-[var(--red-lt)] border-[var(--red)]/20 text-[var(--red)]' :
                              'bg-[var(--gold-lt)] border-[var(--gold)]/20 text-[var(--gold)]'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {getProgressStatus(phase.progress)}
                        </div>
                      </div>
                    </div>
                    <Button v2={true} size="sm" onClick={() => {
                      setExpandedPhaseId(null);
                      showToast(`Progress updated.`);
                    }} className="w-full !py-4 shadow-sm rounded-xl text-[11px] font-bold tracking-[3px]">
                      Save progress
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-4 bg-[var(--green)] rounded-full"></div>
                        <h5 className="text-[11px] font-bold text-[var(--text)] tracking-[2px]">Site photos</h5>
                      </div>
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(phase.id, e)} />
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-[var(--green-lt)] text-[var(--green)] rounded-xl text-[10px] font-bold tracking-widest shadow-sm border border-[var(--green)]/20">
                          <PlusIcon className="w-4 h-4" />
                          Add photo
                        </div>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {phase.photos?.slice(0, 3).map((photo, i: number) => (
                        <div key={photo.id || i} className="aspect-square bg-[#F8F7F4] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm relative group">
                          <img src={photo.url} alt={`Site photo ${i}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 text-center transition-opacity">
                            <span className="text-white text-[8px] font-bold px-2.5 py-1">View photo</span>
                            <span className="text-white/60 text-[7px] font-bold mt-1">{photo.date}</span>
                          </div>
                        </div>
                      ))}
                      {(!phase.photos || phase.photos.length === 0) && (
                        <div className="col-span-3 p-10 flex flex-col items-center justify-center gap-5 bg-[#F8F7F4] rounded-2xl border border-dashed border-[var(--border)]">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-[var(--border)] shadow-sm">
                            <PlusIcon className="w-7 h-7 text-[var(--gold)] opacity-40" />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-[11px] font-bold text-[var(--text)] tracking-[2px] opacity-60">No photos</p>
                            <p className="text-[9px] font-semibold text-[var(--text3)] tracking-[1px] opacity-40">Upload photos to track progress</p>
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

        {/* Site Reports */}
        <Card className="bg-white border-[var(--border)] p-0 overflow-hidden shadow-sm mt-12 text-left">
          <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/30">
            <div className="flex items-center gap-5 text-left">
              <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-2xl flex items-center justify-center border border-[var(--gold)]/30 shadow-sm text-[20px]">
                📋
              </div>
              <div className="text-left">
                <h2 className="text-[18px] font-bold text-[var(--text)] tracking-tight leading-none mb-2">Site reports</h2>
                <p className="text-[10px] text-[var(--gold)] font-semibold tracking-[3px] leading-none opacity-60">Quality monitoring</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                  <th className="p-[15px_30px] text-[10px] font-bold text-[var(--text3)] tracking-[1.5px]">Date</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1.5px]">Inspected by</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1.5px]">Phase</th>
                  <th className="p-[15px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1.5px]">Notes</th>
                  <th className="p-[15px_30px] text-right text-[10px] font-bold text-[var(--text3)] tracking-[1.5px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {displayPhases.flatMap(phase => (phase.reports || []).map(report => ({ ...report, phaseName: phase.name }))).map((report, idx) => (
                  <tr key={report.id || idx} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="p-[15px_30px] text-[13px] font-semibold text-[var(--text)] tracking-tight tabular-nums opacity-60">{report.date}</td>
                    <td className="p-[15px_15px]">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-[var(--bg)] text-[var(--gold)] flex items-center justify-center text-[11px] font-bold border border-[var(--border)] shadow-sm">{report.observer[0]}</div>
                        <span className="text-[14px] font-bold text-[var(--text2)] tracking-tight leading-none">{report.observer}</span>
                      </div>
                    </td>
                    <td className="p-[15px_15px]">
                      <span className="text-[13px] font-semibold text-[var(--text)] tracking-tight leading-none opacity-70 italic">{report.phaseName}</span>
                    </td>
                    <td className="p-[15px_15px] max-w-[300px]">
                      <p className="text-[12px] font-bold text-[var(--text3)] leading-relaxed tracking-tight">“{report.action}”</p>
                    </td>
                    <td className="p-[15px_30px] text-right">
                      <Badge variant={report.status === 'Cleared' ? 'success' : report.status === 'Pending' ? 'danger' : 'warning'} className="text-[9px] font-bold px-3 py-1 shadow-sm tracking-widest">
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

      {/* Modals */}
      {isPhaseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add phase</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Add new work stage</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsPhaseModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddPhase} className="modal-body space-y-10 text-left">
              <div className="space-y-4">
                <Label required>Phase name</Label>
                <Input required v2={true} value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} type="text" placeholder="e.g. Foundation & Plinth" className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" />
              </div>
              <div className="space-y-4">
                <Label required>Target completion date</Label>
                <Input required v2={true} value={newPhaseDate} onChange={e => setNewPhaseDate(e.target.value)} type="text" placeholder="e.g. 25 OCT 2026" className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums text-[15px] uppercase" />
              </div>
              <div className="pt-6 flex gap-6">
                <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsPhaseModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Add stage</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBlockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <Squares2X2Icon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add block</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Structural unit registration</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsBlockModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddBlock} className="modal-body space-y-10 text-left">
              <div className="space-y-4">
                <Label required>Block designation</Label>
                <Input required v2={true} value={newBlockName} onChange={e => setNewBlockName(e.target.value)} type="text" placeholder="e.g. Tower Alpha" className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" />
              </div>
              <div className="space-y-4">
                <Label required>Plot range coverage</Label>
                <Input required v2={true} value={newBlockRange} onChange={e => setNewBlockRange(e.target.value)} type="text" placeholder="e.g. 101 — 150" className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums text-[15px] uppercase" />
              </div>
              <div className="pt-6 flex gap-6">
                <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsBlockModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Commit block</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cost Modal */}
      {isCostModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-2xl shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Record cost</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Expense allocation node</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsCostModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddCost} className="modal-body space-y-10 text-left">
              <div className="space-y-4">
                <Label required>Target work phase</Label>
                <Select required v2={true} value={costPhaseId} onChange={e => setCostPhaseId(e.target.value)} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase">
                  <option value="">Select phase reference...</option>
                  {displayPhases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Classification</Label>
                  <Select v2={true} value={costCategory} onChange={e => setCostCategory(e.target.value as any)} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase">
                    <option value="Labour">Labour force</option>
                    <option value="Material">Raw materials</option>
                    <option value="Equipment">Heavy equipment</option>
                    <option value="Other">Miscellaneous</option>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label required>Amount (₹)</Label>
                  <Input required type="number" v2={true} className="h-[56px] shadow-md rounded-2xl font-bold text-amber-600 tabular-nums text-[18px] font-price" value={costAmount} onChange={e => setCostAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-4">
                <Label required>Transaction details</Label>
                <Input required v2={true} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" value={costDescription} onChange={e => setCostDescription(e.target.value)} placeholder="Enter allocation purpose" />
              </div>

              {costCategory === 'Material' && (
                <div className="grid grid-cols-2 gap-10 p-8 bg-gray-50 rounded-[16px] border-2 border-gray-100 shadow-inner">
                  <div className="space-y-4">
                    <Label required>Material inventory</Label>
                    <Select v2={true} value={costMaterialName} onChange={e => setCostMaterialName(e.target.value)} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase">
                      <option value="">Select material...</option>
                      {materialStock.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label required>Quantity</Label>
                    <Input type="number" v2={true} className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums text-[15px]" value={costMaterialQty} onChange={e => setCostMaterialQty(e.target.value)} placeholder="0" />
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-6">
                <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsCostModalOpen(false)}>Abort</Button>
                <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Commit expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Site Inspection Modal */}
      {isReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-2xl shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <ClipboardDocumentCheckIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Quality check</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Site inspection report entry</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsReportModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddReport} className="modal-body space-y-10 text-left">
              <div className="space-y-4">
                <Label required>Work stage</Label>
                <Select required v2={true} value={reportPhaseId} onChange={e => setReportPhaseId(e.target.value)} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase">
                  <option value="">Select phase reference...</option>
                  {displayPhases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label required>Site inspector</Label>
                  <Input required v2={true} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" value={reportObserver} onChange={e => setReportObserver(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-4">
                  <Label required>Check status</Label>
                  <Select v2={true} value={reportStatus} onChange={e => setReportStatus(e.target.value)} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase">
                    <option value="Cleared">Cleared</option>
                    <option value="Pending">Pending review</option>
                    <option value="In review">Check in progress</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <Label required>Auditor observations</Label>
                <textarea required value={reportAction} onChange={e => setReportAction(e.target.value)} placeholder="Add site check notes..." className="w-full px-8 py-6 rounded-[16px] border-2 border-gray-100 bg-white focus:border-amber-100 outline-none text-[15px] min-h-[160px] font-bold tracking-tight shadow-inner" />
              </div>

              <div className="pt-6 flex gap-6">
                <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Save check</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
