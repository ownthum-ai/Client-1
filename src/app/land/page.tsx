"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  MapIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export default function LandPage() {
  const { lands, updateLandStatus, addLand, propertyHolders } = useStore();
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'financials' | 'history'>('details');
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type?: 'success' | 'warning' } | null>(null);

  const landOverdueMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    const today = new Date();
    propertyHolders.forEach(holder => {
      const land = lands.find(l => l.surveyNo === holder.parcelId);
      if (land) {
        const hasOverdue = holder.installments.some(i => {
          if (i.status === 'Paid') return false;
          const dueDate = new Date(i.dueDate);
          return dueDate < today;
        });
        map[land.id] = hasOverdue;
      }
    });
    return map;
  }, [propertyHolders, lands]);

  const filteredLands = useMemo(() => {
    return lands.filter(l =>
      l.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.surveyNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [lands, searchTerm]);

  const selectedLand = lands.find(l => l.id === selectedLandId);
  const totalArea = lands.reduce((acc, curr) => acc + parseFloat(curr.area), 0);
  const totalValue = lands.reduce((acc, curr) => acc + curr.purchasePrice, 0);
  const acquiredCount = lands.filter(l => l.status === 'Registered').length;
  const inProgressCount = lands.filter(l => l.status === 'Agreement Done' || l.status === 'Under Negotiation').length;

  const [mounted, setMounted] = React.useState(false); 
  React.useEffect(() => { setMounted(true); }, []); 
  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Land Purchase</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50 underline decoration-dotted">Manage all land acquisitions, documents and ownership records</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-lg shadow-black/10 rounded-lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Land Node
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard label="TOTAL HOLDINGS" value={`${totalArea.toFixed(1)} SqYards`} trend={{ value: "Portfolio Size", type: "neutral" }} />
          <KPICard label="PORTFOLIO VALUE" value={formatCurrency(totalValue)} trend={{ value: "Asset Valuation", type: "up" }} color="green" />
          <KPICard label="ACQUIRED ASSETS" value={acquiredCount.toString()} trend={{ value: "Finalized", type: "up" }} color="blue" />
          <KPICard label="IN ACQUISITION" value={inProgressCount.toString()} trend={{ value: "Pipeline", type: "neutral" }} color="gold" />
        </div>

        {/* Main Registry Ledger */}
        <Card className="bg-white border-[var(--border)] shadow-sm p-0 overflow-hidden min-h-[600px] text-left">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/30 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-none">Acquisition Ledger</h2>
              <p className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[2px] mt-2 opacity-40 leading-none">Legal ownership and financial status registry</p>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10" />
              <Input
                type="text"
                placeholder="SEARCH REGISTRY..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                v2={true}
                className="pl-10 h-10 w-[240px] border-[var(--border)] rounded-lg text-[11px] font-black uppercase transition-all focus:w-[320px] shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                  <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Parcel Identity</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Dimensions</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Valuation</th>
                  <th className="p-[12px_15px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Payment Progress</th>
                  <th className="p-[12px_24px] text-right text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Protocol State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredLands.map((parcel) => (
                  <tr
                    key={parcel.id}
                    onClick={() => setSelectedLandId(parcel.id)}
                    className={`group hover:bg-[#F8F7F4] transition-all cursor-pointer ${selectedLandId === parcel.id ? 'bg-[var(--gold)]/5' : ''}`}
                  >
                    <td className="p-[12px_24px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[14px] font-bold text-[var(--text)] font-serif uppercase tracking-tight leading-none group-hover:text-[var(--gold)] transition-colors mb-2">{parcel.location}</span>
                        <span className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[1px] opacity-40 leading-none">ID: {parcel.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-[var(--text2)] leading-none tabular-nums lowercase">{parcel.area} {parcel.areaUnit}</span>
                        <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[1px] mt-2 opacity-40 leading-none">{parcel.zoneType} ZONE</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-[var(--text)] tracking-tight leading-none font-price">{formatCurrency(parcel.purchasePrice)}</span>
                        <span className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[1px] mt-2 opacity-60 font-price tabular-nums">{formatCurrency(parcel.ratePerSqyd)} / SQYD</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px] text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[14px] font-black text-[var(--green)] leading-none font-price">{formatCurrency(parcel.paidTillDate)}</span>
                        <span className="text-[9px] font-bold text-[var(--text3)] mt-2 opacity-40 uppercase tracking-widest leading-none">OF {formatCurrency(parcel.purchasePrice)}</span>
                        <div className="w-[120px] h-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-full mt-3 overflow-hidden p-0.5 shadow-inner">
                          <div
                            className="h-full bg-[var(--green)] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-1000"
                            style={{ width: `${(parcel.paidTillDate / parcel.purchasePrice) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-[20px_24px] text-right">
                      <div className="flex items-center justify-end gap-3">
                        {landOverdueMap[parcel.id] && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-[var(--red-lt)] text-[var(--red)] border border-[var(--red)]/20 uppercase tracking-[2px] animate-pulse shadow-sm leading-none">
                            OVERDUE PULSE
                          </span>
                        )}
                        <Badge variant={parcel.status === 'Registered' ? 'success' : 'warning'} className="uppercase tracking-widest leading-none px-2 py-0.5 shadow-sm text-[9px] font-black">
                          {parcel.status}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Fixed elements outside the animated container */}
      {/* Detail Side Panel */}
      <div className={`fixed top-0 right-0 h-screen w-[520px] bg-white shadow-2xl z-[400] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-[var(--border)] flex flex-col ${selectedLandId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedLand ? (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--sb)] rounded-xl flex items-center justify-center text-white shadow-lg leading-none">
                  <MapIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[18px] font-black text-[var(--text)] font-serif uppercase tracking-tight leading-none mb-2">{selectedLand.location}</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-40 leading-none">Registry Node: #{selectedLand.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <Button variant="secondary" v2={true} size="sm" className="h-9 px-4 rounded-lg bg-white border-[var(--border)] text-[9px] font-black uppercase tracking-widest shadow-sm" onClick={() => setSelectedLandId(null)}>✕ DISMISS</Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-[var(--border)] mb-10 overflow-x-auto custom-scrollbar">
              {['details', 'financials', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 text-[11px] font-black uppercase tracking-[2px] transition-all relative px-6 whitespace-nowrap ${activeTab === tab ? 'text-[var(--gold)]' : 'text-[var(--text3)] hover:text-[var(--text2)] opacity-40'}`}
                >
                  {tab === 'details' ? 'Blueprint' : tab === 'financials' ? 'Capital' : 'Journal'}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--gold)] rounded-t-full shadow-[0_0_10px_var(--gold)]/30"></div>}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-10">
              {activeTab === 'details' ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-[var(--bg)] rounded-2xl border border-[var(--border)] shadow-inner text-left">
                      <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2.5px] mb-3 opacity-40 leading-none">Authorized Owner</p>
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-4.5 h-4.5 text-[var(--gold)]" />
                        <span className="text-[13px] font-black text-[var(--text)] uppercase tracking-tight leading-none">{selectedLand.ownerName}</span>
                      </div>
                    </div>
                    <div className="p-6 bg-[var(--bg)] rounded-2xl border border-[var(--border)] shadow-inner text-left">
                      <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2.5px] mb-3 opacity-40 leading-none">Registry Size</p>
                      <div className="flex items-center gap-3">
                        <ScaleIcon className="w-4.5 h-4.5 text-[var(--gold)]" />
                        <span className="text-[13px] font-black text-[var(--text)] uppercase tracking-tight tabular-nums leading-none">{selectedLand.area} {selectedLand.areaUnit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                      <h3 className="text-[11px] font-black text-[var(--text)] uppercase tracking-[2px]">Documentation Spectrum</h3>
                      <ShieldCheckIcon className="w-5 h-5 text-[var(--gold)] opacity-50" />
                    </div>
                    <div className="space-y-4">
                      {selectedLand.docs.length > 0 ? selectedLand.docs.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[var(--border)] hover:border-[var(--gold)]/30 hover:shadow-md transition-all group shadow-sm">
                          <div className="flex items-center gap-4">
                            <DocumentTextIcon className="w-6 h-6 text-[var(--text3)] group-hover:text-[var(--gold)] transition-colors opacity-40" />
                            <div className="text-left">
                              <span className="text-[12px] font-black text-[var(--text)] uppercase tracking-tight leading-none block mb-2">{doc.name}</span>
                              <span className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[1.5px] opacity-40 leading-none">AUTHORIZED NODE</span>
                            </div>
                          </div>
                          <Badge variant="success" className="text-[8px] font-black px-2 py-0.5 shadow-sm">VERIFIED</Badge>
                        </div>
                      )) : (
                        <div className="p-12 text-center bg-[var(--bg)]/50 rounded-3xl border border-dashed border-[var(--border)] opacity-40 italic">
                          <DocumentTextIcon className="w-10 h-10 mx-auto mb-4 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-[2px]">Awaiting Manifest Upload</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : activeTab === 'financials' ? (
                <>
                  <div className="p-8 bg-[#F8F9FA] rounded-[32px] border border-[var(--border)] shadow-inner text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/5 rounded-bl-full blur-2xl group-hover:bg-[var(--gold)]/10 transition-all duration-500"></div>
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-[11px] font-black text-[var(--text)] uppercase tracking-[3px]">Capital Transit Yield</span>
                      <span className="text-[15px] font-black text-[var(--gold)] font-price italic tabular-nums">{Math.round((selectedLand.paidTillDate / selectedLand.purchasePrice) * 100)}% Positioned</span>
                    </div>
                    <div className="h-3 bg-white border border-[var(--border)] rounded-full overflow-hidden relative mb-10 p-0.5 shadow-sm">
                      <div className="h-full bg-[var(--gold)] rounded-full transition-all duration-1000 shadow-[0_0_12px_var(--gold)]/50" style={{ width: `${(selectedLand.paidTillDate / selectedLand.purchasePrice) * 100}%` }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="text-left">
                        <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] mb-3 opacity-40 leading-none">Settled Nodes</p>
                        <p className="text-[20px] font-black text-[var(--text)] tracking-tighter font-price tabular-nums">{formatCurrency(selectedLand.paidTillDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] mb-3 opacity-40 leading-none">Outstanding Load</p>
                        <p className="text-[20px] font-black text-[var(--gold)] tracking-tighter font-price tabular-nums">{formatCurrency(selectedLand.purchasePrice - selectedLand.paidTillDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                      <h3 className="text-[11px] font-black text-[var(--text)] uppercase tracking-[2px]">Capital Interaction Journal</h3>
                      <ArrowPathIcon className="w-5 h-5 text-[var(--gold)] opacity-30" />
                    </div>
                    <div className="space-y-4">
                      {selectedLand.payments.length > 0 ? selectedLand.payments.map((pmt, idx) => (
                        <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-0 before:w-[2px] before:bg-[var(--border)] last:before:hidden">
                          <div className="relative group text-left">
                            <div className="absolute -left-[27px] top-2 w-4.5 h-4.5 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-[var(--green)]"></div>
                            <div className="bg-[var(--bg)]/50 p-6 rounded-2xl border border-[var(--border)] group-hover:bg-white group-hover:shadow-lg transition-all shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[15px] font-black text-[var(--text)] font-price tabular-nums">{formatCurrency(pmt.amount)}</span>
                                <Badge variant="success" className="text-[8px] font-black px-1.5 py-0.5 shadow-sm uppercase tracking-widest">DISPATCHED</Badge>
                              </div>
                              <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[1.5px] opacity-40 leading-none">{pmt.date} • {pmt.mode}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-12 text-center bg-[var(--bg)]/50 rounded-3xl border border-dashed border-[var(--border)] opacity-40 italic">
                          <p className="text-[10px] font-black uppercase tracking-[2px]">Awaiting Initial Settlement Pulse</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-8 text-left">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <h3 className="text-[11px] font-black text-[var(--text)] uppercase tracking-[2px]">Operational Timeline Spectrum</h3>
                    <ArrowPathIcon className="w-5 h-5 text-[var(--gold)] opacity-40" />
                  </div>
                  <div className="space-y-6 relative before:absolute before:left-[19.5px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gray-100">
                    <div className="flex gap-6 relative group">
                      <div className="w-10 h-10 rounded-xl bg-[var(--gold-lt)] flex items-center justify-center z-10 border border-[var(--gold)]/20 shadow-sm group-hover:scale-110 transition-transform">
                        <PlusIcon className="w-5 h-5 text-[var(--gold)]" />
                      </div>
                      <div className="flex-1 pt-1 text-left">
                        <p className="text-[12px] font-black text-[var(--text)] uppercase tracking-tight leading-none mb-2">Registry Initialized</p>
                        <p className="text-[9px] text-[var(--text3)] font-bold mt-1 uppercase opacity-40 tracking-widest leading-tight">Asset node trajectory established in stream</p>
                      </div>
                    </div>

                    {selectedLand.docs.map((doc, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center z-10 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 pt-1 text-left">
                          <p className="text-[12px] font-black text-[var(--text)] uppercase tracking-tight leading-none mb-2">Node Authenticated: {doc.name}</p>
                          <p className="text-[9px] text-[var(--text3)] font-bold mt-1 uppercase opacity-40 tracking-widest leading-tight">Legal manifest verified and logged</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 bg-[var(--gold)]/5 rounded-[24px] border border-[var(--gold)]/20 flex gap-5 mt-4 items-start shadow-sm italic">
                <ShieldCheckIcon className="w-7 h-7 text-[var(--gold)] shrink-0 opacity-60" />
                <div className="text-left">
                  <p className="text-[11px] font-black text-[var(--gold)] uppercase tracking-[2.5px] mb-2 leading-none">Security Protocol Active</p>
                  <p className="text-[10.5px] text-[var(--text2)] leading-relaxed font-bold opacity-80 uppercase tracking-tight">System is maintaining 1:1 parity with physical registry records. All edits are permanently logged for audit cycles.</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-[var(--border)] flex gap-4">
              <Button
                variant="secondary" v2={true} className="flex-1 h-14 rounded-xl border-[var(--border)] text-[10px] font-black uppercase tracking-[2px] bg-white shadow-sm"
                onClick={() => setSelectedLandId(null)}
              >
                Abort Audit
              </Button>
              <Button
                v2={true} className="flex-[2] h-14 rounded-xl shadow-xl shadow-gold-500/20 text-[10px] font-black uppercase tracking-[3px]"
                onClick={() => {
                  if (confirm(`AUTHORIZE ACQUISITION NODAL: ${selectedLand.location}? This will finalize legal protocol status.`)) {
                    updateLandStatus(selectedLand.id, 'Registered');
                    setSelectedLandId(null);
                  }
                }}
              >
                Authorize Asset
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center opacity-20 select-none grayscale">
            <MapIcon className="w-24 h-24 mb-6 opacity-10" />
            <h3 className="text-[16px] font-black text-[var(--text)] uppercase tracking-[5px]">Protocol Spectator</h3>
            <p className="text-[11px] text-[var(--text3)] mt-4 leading-relaxed font-bold uppercase tracking-[1px]">Select a warehouse node to visualize the lifecycle trajectory and interaction interaction logs.</p>
          </div>
        )}
      </div>

      {/* Add Land Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                    <PlusIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Asset Initialization</h2>
                    <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Register new land parcel into acquisition stream</p>
                 </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsAddModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const price = Number(formData.get('price'));
              const area = formData.get('area') as string;
              addLand({
                surveyNo: formData.get('surveyNo') as string,
                location: formData.get('location') as string,
                area: area,
                areaUnit: formData.get('unit') as any,
                zoneType: formData.get('zone') as any,
                ownerName: formData.get('owner') as string,
                ownerPhone: formData.get('phone') as string,
                purchasePrice: price,
                paidTillDate: 0,
                status: 'Under Negotiation',
                docs: [],
                linkedScheme: 'Unassigned',
                payments: [],
                ratePerSqyd: price / (Number(area) || 1)
              });
              setIsAddModalOpen(false);
            }} className="p-8 space-y-8 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Location Identifier</label>
                    <Input required name="location" v2={true} type="text" placeholder="MANIFEST LOCATION..." className="h-12 shadow-sm font-black uppercase tracking-widest italic" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Survey Manifest Node</label>
                    <Input required name="surveyNo" v2={true} type="text" placeholder="ID/102/NODAL..." className="h-12 shadow-sm font-black uppercase tabular-nums" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Total Area</label>
                      <Input required name="area" v2={true} type="number" placeholder="0000" className="h-12 shadow-sm tabular-nums font-black" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Unit</label>
                      <Select name="unit" v2={true} className="h-12 shadow-sm font-black uppercase tracking-widest leading-none">
                        <option value="SqFt">SQ FEET</option>
                        <option value="Bigha">BIGHA</option>
                        <option value="SqMt">SQ METERS</option>
                        <option value="SqYards">SQ YARDS</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Legal Owner Profile</label>
                    <Input required name="owner" v2={true} type="text" placeholder="LEGAL DEED OWNER..." className="h-12 shadow-sm font-black uppercase tracking-widest italic" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Acquisition Valuation (₹)</label>
                    <Input required name="price" v2={true} type="number" placeholder="ENTER CAPITAL LOAD..." className="h-12 shadow-sm font-black tabular-nums text-[var(--gold)]" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-[var(--text3)] px-1">Zoning Protocol</label>
                    <Select name="zone" v2={true} className="h-12 shadow-sm font-black uppercase tracking-widest leading-none">
                      <option value="Residential">RESIDENTIAL</option>
                      <option value="Agricultural">AGRICULTURAL</option>
                      <option value="Commercial">COMMERCIAL</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl border-[var(--border)] font-black uppercase tracking-[2.5px] text-[10px] bg-white shadow-sm" onClick={() => setIsAddModalOpen(false)}>Discard Manifest</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl font-black uppercase tracking-[3px] shadow-lg shadow-gold-500/20">Initialize Acquisition</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 transition-all ${toast.type === 'warning' ? 'bg-[var(--red)]' : 'bg-[var(--sb)]'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'warning' ? 'bg-white animate-pulse' : 'bg-[var(--gold)]'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-[3px] whitespace-nowrap">{toast.message}</span>
        </div>
      )}
    </>
  );
}
