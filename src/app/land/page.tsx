"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserIcon,
  ScaleIcon,
  ShieldCheckIcon,
  MapIcon,
  ArrowPathIcon,
  ChartBarIcon
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
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Land Buying</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5"></span>
                Live status
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums tracking-tight opacity-50">Manage all land details and owner records</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              v2={true}
              size="default"
              className="px-8 shadow-sm rounded-lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add land
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard label="Total Area" value={`${totalArea.toFixed(1)} SqYards`} trend={{ value: "Total", type: "neutral" }} />
          <KPICard label="Total Price" value={formatCurrency(totalValue)} trend={{ value: "Total", type: "neutral" }} color="green" />
          <KPICard label="Registered" value={acquiredCount.toString()} trend={{ value: "Done", type: "neutral" }} color="blue" />
          <KPICard label="In progress" value={inProgressCount.toString()} trend={{ value: "Pending", type: "neutral" }} color="gold" />
        </div>

        {/* Land list */}
        <Card className="bg-white border-[var(--border)] shadow-sm p-0 overflow-hidden min-h-[600px] text-left">
          <div className="p-6 border-b border-[var(--border)] bg-gray-50/30 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--text)]">Land list</h2>
              <p className="text-[9px] text-[var(--text3)] font-bold tracking-[2px] mt-2 opacity-40 leading-none">Legal and financial records</p>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                v2={true}
                className="pl-10 h-10 w-[240px] border-[var(--border)] rounded-lg text-[11px] font-bold shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[var(--border)]">
                  <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Location</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Size</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Value</th>
                  <th className="p-[12px_15px] text-right text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Paid</th>
                  <th className="p-[12px_24px] text-right text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredLands.map((parcel) => (
                  <tr
                    key={parcel.id}
                    onClick={() => setSelectedLandId(parcel.id)}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedLandId === parcel.id ? 'bg-gray-50' : ''}`}
                  >
                    <td className="p-[12px_24px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[14px] font-bold text-[var(--text)] tracking-tight mb-2">{parcel.location}</span>
                        <span className="text-[9px] text-[var(--text3)] font-bold tracking-[1px] opacity-40 leading-none">ID: {parcel.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-[var(--text2)] leading-none tabular-nums">{parcel.area} {parcel.areaUnit}</span>
                        <span className="text-[9px] font-bold text-[var(--text3)] tracking-[1px] mt-2 opacity-40 leading-none uppercase">{parcel.zoneType} zone</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-[var(--text)] tracking-tight leading-none">{formatCurrency(parcel.purchasePrice)}</span>
                        <span className="text-[10px] text-[var(--gold)] font-bold tracking-[1px] mt-2 opacity-60 tabular-nums">{formatCurrency(parcel.ratePerSqyd)} / sqyd</span>
                      </div>
                    </td>
                    <td className="p-[12px_15px] text-right">
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[14px] font-bold text-[var(--green)] leading-none">{formatCurrency(parcel.paidTillDate)}</span>
                        <span className="text-[9px] font-bold text-[var(--text3)] mt-2 opacity-40 tracking-widest leading-none uppercase">of {formatCurrency(parcel.purchasePrice)}</span>
                        <div className="w-[120px] h-1.5 bg-gray-100 border border-[var(--border)] rounded-full mt-3 overflow-hidden p-0.5 shadow-inner">
                          <div
                            className="h-full bg-[var(--green)] rounded-full"
                            style={{ width: `${(parcel.paidTillDate / parcel.purchasePrice) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-[20px_24px] text-right">
                      <div className="flex items-center justify-end gap-3">
                        {landOverdueMap[parcel.id] && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-[var(--red-lt)] text-[var(--red)] border border-[var(--red)]/20 tracking-[2px] shadow-sm leading-none uppercase">
                            Overdue
                          </span>
                        )}
                        <Badge variant={parcel.status === 'Registered' ? 'success' : 'warning'} className="shadow-sm text-[9px] font-bold uppercase">
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

      {/* Side Panel */}
      {selectedLandId && (
        <div className="fixed inset-0 z-[400] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLandId(null)}></div>
          <div className="relative w-[640px] bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
            {selectedLand && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="p-10 border-b-2 border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                  <div className="flex items-center gap-6 text-left">
                    <div className="modal-header-icon text-amber-600">
                      <MapIcon className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-none mb-2 uppercase">{selectedLand.location}</h2>
                      <p className="text-[12px] text-gray-500 font-bold tracking-[2px] opacity-60 leading-none uppercase">Land record • #{selectedLand.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="icon" className="h-12 w-12 rounded-xl border-2 shadow-sm" onClick={() => setSelectedLandId(null)}>✕</Button>
                </div>

                <div className="p-10 space-y-12">
                  {/* Tabs */}
                  <div className="flex gap-10 border-b-2 border-gray-100">
                    {['details', 'financials', 'history'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-5 text-[11px] font-bold tracking-[3px] relative uppercase transition-colors ${activeTab === tab ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {tab === 'details' ? 'Details' : tab === 'financials' ? 'Payment List' : 'Work Log'}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-600 rounded-t-full"></div>}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-12 text-left">
                    {activeTab === 'details' ? (
                      <>
                        <div className="grid grid-cols-2 gap-10">
                          <div className="p-8 bg-gray-50 rounded-[32px] border-2 border-gray-100 shadow-inner text-left">
                            <p className="text-[10px] font-bold text-gray-400 tracking-[3px] mb-4 uppercase opacity-60">Legal Owner</p>
                            <div className="flex items-center gap-4">
                              <UserIcon className="w-6 h-6 text-amber-600" />
                              <span className="text-[16px] font-bold text-gray-900 tracking-tight leading-none">{selectedLand.ownerName}</span>
                            </div>
                          </div>
                          <div className="p-8 bg-gray-50 rounded-[32px] border-2 border-gray-100 shadow-inner text-left">
                            <p className="text-[10px] font-bold text-gray-400 tracking-[3px] mb-4 uppercase opacity-60">Total Area</p>
                            <div className="flex items-center gap-4">
                              <ScaleIcon className="w-6 h-6 text-amber-600" />
                              <span className="text-[16px] font-bold text-gray-900 tracking-tight tabular-nums leading-none">{selectedLand.area} {selectedLand.areaUnit}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <h3 className="text-[11px] font-bold text-gray-900 tracking-[3px] uppercase border-b-2 border-gray-100 pb-4">Document Verification</h3>
                          <div className="space-y-4">
                            {selectedLand.docs.length > 0 ? selectedLand.docs.map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:border-amber-100 transition-colors">
                                <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                    <DocumentTextIcon className="w-6 h-6" />
                                  </div>
                                  <div className="text-left">
                                    <span className="text-[14px] font-bold text-gray-900 tracking-tight leading-none block mb-1.5">{doc.name}</span>
                                    <span className="text-[10px] text-gray-400 font-bold tracking-[2px] opacity-60 uppercase">Record Confirmed</span>
                                  </div>
                                </div>
                                <Badge variant="success" className="px-3 py-1 shadow-sm uppercase font-bold text-[9px]">Verified</Badge>
                              </div>
                            )) : (
                              <div className="p-16 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 opacity-40">
                                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-[11px] font-bold tracking-[3px] uppercase">No digital records</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : activeTab === 'financials' ? (
                      <>
                        <div className="p-10 bg-gray-900 rounded-[40px] shadow-2xl text-left relative overflow-hidden text-white">
                          <div className="absolute top-0 right-0 p-10 opacity-5">
                            <ChartBarIcon className="w-32 h-32" />
                          </div>
                          <div className="flex justify-between items-center mb-8 relative z-10">
                            <span className="text-[11px] font-bold text-white/40 tracking-[4px] uppercase">Acquisition Progress</span>
                            <span className="text-[18px] font-bold text-amber-500 tabular-nums">{Math.round((selectedLand.paidTillDate / selectedLand.purchasePrice) * 100)}% complete</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-10 p-0.5 relative z-10">
                            <div className="h-full bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]" style={{ width: `${(selectedLand.paidTillDate / selectedLand.purchasePrice) * 100}%` }}></div>
                          </div>
                          <div className="grid grid-cols-2 gap-10 relative z-10">
                            <div className="text-left">
                              <p className="text-[10px] font-bold text-white/40 tracking-[3px] mb-3 uppercase">Capital Settled</p>
                              <p className="text-[24px] font-bold text-white tracking-tighter tabular-nums font-price">{formatCurrency(selectedLand.paidTillDate)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-white/40 tracking-[3px] mb-3 uppercase">Outstanding</p>
                              <p className="text-[24px] font-bold text-amber-500 tracking-tighter tabular-nums font-price">{formatCurrency(selectedLand.purchasePrice - selectedLand.paidTillDate)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <h3 className="text-[11px] font-bold text-gray-900 tracking-[3px] uppercase border-b-2 border-gray-100 pb-4">Transaction History</h3>
                          <div className="space-y-4">
                            {selectedLand.payments.length > 0 ? selectedLand.payments.map((pmt, idx) => (
                              <div key={idx} className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-amber-100 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-[18px] font-bold text-gray-900 tabular-nums font-price">{formatCurrency(pmt.amount)}</span>
                                  <Badge variant="success" className="px-3 py-1 shadow-sm uppercase font-bold text-[9px]">Settled</Badge>
                                </div>
                                <p className="text-[11px] font-bold text-gray-400 tracking-[2px] opacity-60 uppercase">{pmt.date} • {pmt.mode}</p>
                              </div>
                            )) : (
                              <div className="p-16 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 opacity-40">
                                <p className="text-[11px] font-bold tracking-[3px] uppercase">No payment entries</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-10">
                        <h3 className="text-[11px] font-bold text-gray-900 tracking-[3px] uppercase border-b-2 border-gray-100 pb-4">Work History</h3>
                        <div className="space-y-8">
                          <div className="flex gap-8 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-white shadow-md text-gray-500 shrink-0">
                              <PlusIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 pt-1 border-b-2 border-gray-50 pb-6">
                              <p className="text-[15px] font-bold text-gray-900 tracking-tight mb-2 uppercase">Parcel Initialized</p>
                              <p className="text-[11px] text-gray-400 font-bold opacity-60 tracking-[2px] leading-tight uppercase">Manual record creation by administrator</p>
                            </div>
                          </div>

                          {selectedLand.docs.map((doc, i) => (
                            <div key={i} className="flex gap-8 text-left">
                              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border-2 border-white shadow-md text-amber-600 shrink-0">
                                <ShieldCheckIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1 pt-1 border-b-2 border-gray-50 pb-6">
                                <p className="text-[15px] font-bold text-gray-900 tracking-tight mb-2 uppercase">Document Verified: {doc.name}</p>
                                <p className="text-[11px] text-gray-400 font-bold opacity-60 tracking-[2px] leading-tight uppercase">Record checked</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-8 bg-gray-900 text-white rounded-[32px] flex items-center gap-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <ShieldCheckIcon className="w-16 h-16" />
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-amber-500 border border-white/10 shadow-sm shrink-0">
                        <ShieldCheckIcon className="w-7 h-7" />
                      </div>
                      <div className="text-left relative">
                        <p className="text-[11px] font-bold tracking-[3px] uppercase text-amber-500 mb-1">System Integrity</p>
                        <p className="text-[13px] font-medium text-white/60 tracking-wide uppercase">All records match the main land list.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto p-10 border-t-2 border-gray-100 flex gap-6 bg-white sticky bottom-0">
                  <Button
                    variant="secondary" className="flex-1 h-[56px] rounded-2xl border-2 font-bold uppercase tracking-widest shadow-md bg-white"
                    onClick={() => setSelectedLandId(null)}
                  >
                    Close Panel
                  </Button>
                  <Button
                    variant="primary" className="flex-[2] h-[56px] rounded-2xl shadow-xl font-bold uppercase tracking-widest"
                    onClick={() => {
                      if (confirm(`Add property for: ${selectedLand.location}?`)) {
                        updateLandStatus(selectedLand.id, 'Registered');
                        setSelectedLandId(null);
                      }
                    }}
                  >
                    Add Property
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Land</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">New acquisition record entry</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddModalOpen(false)}>✕</Button>
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
            }} className="modal-body space-y-10 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label required>Location identity</Label>
                    <Input required name="location" v2={true} type="text" placeholder="e.g. Green Valley Estates" className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" />
                  </div>
                  <div className="space-y-4">
                    <Label required>Survey reference</Label>
                    <Input required name="surveyNo" v2={true} type="text" placeholder="e.g. 144/A" className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums text-[15px] uppercase" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label required>Area size</Label>
                      <Input required name="area" v2={true} type="number" placeholder="0" className="h-[56px] shadow-md rounded-2xl tabular-nums font-bold text-[15px]" />
                    </div>
                    <div className="space-y-4">
                      <Label required>Unit</Label>
                      <Select name="unit" v2={true} className="h-[56px] shadow-md rounded-2xl font-bold text-gray-900 uppercase">
                        <option value="SqFt">Sq feet</option>
                        <option value="Bigha">Bigha</option>
                        <option value="SqMt">Sq meters</option>
                        <option value="SqYards">Sq yards</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label required>Legal owner</Label>
                    <Input required name="owner" v2={true} type="text" placeholder="Full name of owner" className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" />
                  </div>
                  <div className="space-y-4">
                    <Label required>Total valuation (₹)</Label>
                    <Input required name="price" v2={true} type="number" placeholder="0.00" className="h-[56px] shadow-md rounded-2xl font-bold tabular-nums text-amber-600 text-[18px] font-price" />
                  </div>
                  <div className="space-y-4">
                    <Label required>Zoning category</Label>
                    <Select name="zone" v2={true} className="h-[56px] shadow-md rounded-2xl font-bold text-gray-900 uppercase">
                      <option value="Residential">Residential</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Commercial">Commercial</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <ShieldCheckIcon className="w-10 h-10 text-amber-500 shrink-0" />
                <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                  All new land entries are initialized in &apos;Under Negotiation&apos; status until verified by the legal department.
                </p>
              </div>

              <div className="pt-6 flex gap-6">
                <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Commit record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'warning' ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-[10px] font-bold tracking-[3px] whitespace-nowrap uppercase">{toast.message}</span>
        </div>
      )}
    </>
  );
}
