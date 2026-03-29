"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
   PlusIcon,
   MapIcon,
   RectangleGroupIcon,
   Squares2X2Icon,
   CheckCircleIcon,
   InformationCircleIcon,
   CurrencyRupeeIcon,
   UserIcon,
   ArrowRightIcon,
   ClockIcon,
   XMarkIcon,
   ReceiptPercentIcon,
   DocumentTextIcon
} from '@heroicons/react/24/outline';
import { KPICard } from '@/components/ui/KPICard';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

export default function PlanningLayout() {
   const { plots, updatePlotStatus, layouts, lands, addLayout } = useStore();
   const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
   const [paymentHistoryPlotId, setPaymentHistoryPlotId] = useState<string | null>(null);
   const [activeLayoutId, setActiveLayoutId] = useState<string>(layouts[0]?.id || 'l1');
   const [isAddSchemeModalOpen, setIsAddSchemeModalOpen] = useState(false);
   const [isReraModalOpen, setIsReraModalOpen] = useState(false);
   const [isExporting, setIsExporting] = useState(false);

   // Booking/Sale modal state
   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
   const [bookingAction, setBookingAction] = useState<'Booked' | 'Sold' | 'Reserved' | 'Available'>('Booked');
   const [bookingCustomerName, setBookingCustomerName] = useState('');
   const [bookingAmount, setBookingAmount] = useState('');


   // Form State for new scheme
   const [schemeFormData, setSchemeFormData] = useState({
      name: '',
      landId: lands[0]?.id || '',
      totalPlots: 100,
      plotSizes: '150, 200',
      roadWidth: '30 ft main',
      ratePerSqYd: 15000,
      reraStatus: 'Approved' as 'Approved' | 'Pending' | 'Not Applied'
   });

   const selectedPlot = plots.find(p => p.id === selectedPlotId);
   const paymentPlot = plots.find(p => p.id === paymentHistoryPlotId);
   const currentLayout = layouts.find(l => l.id === activeLayoutId);
   const linkedLand = lands.find(l => l.id === currentLayout?.landId);

   // Stats Calculations
   const layoutPlots = plots.filter(p => p.layoutId === activeLayoutId);
   const availableCount = layoutPlots.filter(p => p.status === 'Available').length;
   const bookedCount = layoutPlots.filter(p => p.status === 'Booked').length;
   const soldCount = layoutPlots.filter(p => p.status === 'Sold').length;
   const reservedCount = layoutPlots.filter(p => p.status === 'Reserved').length;

   const totalRevenue = layoutPlots
      .filter(p => p.status === 'Sold')
      .reduce((acc, p) => acc + (p.size * p.rate), 0);

   const formatCurrency = (val: number) => {
      if (val >= 10000000) {
         const cr = val / 10000000;
         return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)}Cr`;
      }
      if (val >= 100000) {
         const l = val / 100000;
         return `₹${l % 1 === 0 ? l : l.toFixed(1)}L`;
      }
      return `₹${val.toLocaleString()}`;
   };

   const handleExport = () => {
      setIsExporting(true);
      setTimeout(() => {
         window.print();
         setIsExporting(false);
      }, 1000);
   };

   const openBookingModal = (action: 'Booked' | 'Sold' | 'Reserved' | 'Available') => {
      if (!selectedPlot) return;
      if (action === 'Available' && selectedPlot.status !== 'Booked') {
         updatePlotStatus(selectedPlot.id, 'Available');
         return;
      }
      setBookingAction(action);
      setBookingCustomerName(selectedPlot.customerName || '');
      setBookingAmount('');
      setIsBookingModalOpen(true);
   };

   const handleBookingSubmit = () => {
      if (!selectedPlot) return;
      updatePlotStatus(selectedPlot.id, bookingAction, bookingCustomerName || undefined, bookingAmount ? Number(bookingAmount) : undefined);
      setIsBookingModalOpen(false);
      setBookingCustomerName('');
      setBookingAmount('');
   };

   const kpis = [
      { label: 'Total Units', value: layoutPlots.length, color: 'gold', trend: { value: 'Portfolio Size', type: 'neutral' as const } },
      { label: 'Available', value: availableCount, color: 'green', trend: { value: 'Ready for booking', type: 'up' as const } },
      { label: 'Booked Units', value: bookedCount, color: 'blue', trend: { value: 'Confirmed intent', type: 'neutral' as const } },
      { label: 'Reserved / Sold', value: reservedCount + soldCount, color: 'red', trend: { value: 'Registry pending', type: 'neutral' as const } },
   ];

   const [mounted, setMounted] = React.useState(false);
   React.useEffect(() => { setMounted(true); }, []);
   if (!mounted) return null;

   return (
      <>
         <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
            {/* V2 Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="text-left">
                  <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Planning Layout</h1>
                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                        LIVE OPERATIONAL STREAM
                     </span>
                     <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Physical layout audit and sales trajectory registry</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="min-w-[180px]">
                     <Select
                        v2={true}
                        value={activeLayoutId}
                        onChange={(e) => setActiveLayoutId(e.target.value)}
                        className="!h-10 text-[10px] font-black uppercase tracking-[2px] border-[var(--border)] bg-white/50"
                     >
                        {layouts.map(l => (
                           <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                     </Select>
                  </div>
                  <Button
                     v2={true}
                     size="default"
                     onClick={() => setIsAddSchemeModalOpen(true)}
                     className="!h-10 px-8"
                  >
                     <PlusIcon className="w-4 h-4 mr-2" />
                     New Layout
                  </Button>
               </div>
            </div>
            {/* KPI Matrix: Match HTML sg4 grid */}
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
               {/* Plot Grid Section: Match HTML Card Style */}
               <Card className="p-8 bg-white border-[var(--border)] shadow-sm flex flex-col min-h-[500px]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 text-left border-b border-[var(--border)] pb-6 gap-4">
                     <div>
                        <h2 className="text-[18px] font-bold text-[var(--text)] font-serif">Interactive Plot Matrix</h2>
                        <p className="text-[12px] text-[var(--text3)] mt-1">Select a plot to view or update status</p>
                     </div>
                     <div className="flex flex-wrap gap-4 p-2.5 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                        {['Available', 'Booked', 'Sold', 'Reserved'].map(status => (
                           <div key={status} className="flex items-center gap-2 px-2 py-1">
                              <div className={`w-3.5 h-3.5 rounded-sm border transition-all ${status === 'Available' ? 'bg-white border-[var(--border2)]' :
                                 status === 'Booked' ? 'bg-[var(--blue)] border-[var(--blue)]' :
                                    status === 'Sold' ? 'bg-[var(--green)] border-[var(--green)]' :
                                       'bg-[var(--red)] border-[var(--red)]'}`}
                              ></div>
                              <span className="text-[11px] font-bold text-[var(--text2)] uppercase tracking-wider">{status}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2.5 p-2 underline-offset-4 overflow-y-auto max-h-[600px] custom-scrollbar text-center justify-center">
                     {layoutPlots.map((plot, i) => {
                        const totalPrice = plot.size * plot.rate;
                        const isFullyPaid = (plot.amountPaid || 0) >= totalPrice && totalPrice > 0;
                        return (
                        <div
                           key={plot.id}
                           onClick={() => setSelectedPlotId(plot.id)}
                           className={`aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg border text-[12px] font-bold relative group
                       ${selectedPlotId === plot.id ? 'ring-2 ring-[var(--sb)] scale-105 z-20 shadow-lg' : 'z-10'}
                       ${plot.status === 'Available' ? 'bg-white border-[var(--border2)] text-[var(--text)] hover:shadow-md' :
                                 plot.status === 'Booked' ? 'bg-[var(--blue-lt)] border-[var(--blue)] text-[var(--blue)]' :
                                    plot.status === 'Sold' ? 'bg-[var(--green-lt)] border-[var(--green)] text-[var(--green)]' :
                                       'bg-[var(--red-lt)] border-[var(--red)] text-[var(--red)]'}`}
                        >
                           {i + 1}
                           {isFullyPaid && plot.status !== 'Sold' && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--green)] rounded-full border border-white shadow-sm flex items-center justify-center">
                                 <span className="text-white text-[6px] font-bold">✓</span>
                              </div>
                           )}
                           <div className="text-[7px] opacity-40 absolute bottom-1 uppercase tracking-tighter">
                              {isFullyPaid && plot.status !== 'Sold' ? 'PAID' : 'Plot'}
                           </div>
                        </div>
                        );
                     })}
                  </div>
               </Card>

               {/* Sidebar Panel: Scheme & Plot Details */}
               <div className="space-y-6">
                  <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20">
                           <MapIcon className="w-5 h-5 text-[var(--gold)]" />
                        </div>
                        <div>
                           <h3 className="text-[18px] font-serif text-[var(--text)] leading-none mb-1">{currentLayout?.name}</h3>
                           <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text3)]">Scheme Overview</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                           <span className="text-[12px] text-[var(--text3)] uppercase tracking-wider">Survey No</span>
                           <span className="text-[14px] font-bold text-[var(--text)]">{linkedLand?.surveyNo}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                           <span className="text-[12px] text-[var(--text3)] uppercase tracking-wider">Base Rate</span>
                           <span className="text-[14px] font-bold text-[var(--gold)] font-price">₹{currentLayout?.ratePerSqYd}/Yd</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                           <span className="text-[12px] text-[var(--text3)] uppercase tracking-wider">Development</span>
                           <Badge variant="success" className="bg-[var(--green-lt)] text-[var(--green)] border-[var(--green)]/20 uppercase tracking-widest text-[9px]">Active</Badge>
                        </div>
                        <button
                           onClick={() => setIsReraModalOpen(true)}
                           className="w-full mt-2 p-4 bg-[var(--bg)] hover:bg-[var(--border)] transition-colors rounded-xl border border-[var(--border)] flex items-center justify-between group"
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm group-hover:bg-[var(--gold)] group-hover:text-white transition-colors">R</div>
                              <span className="text-[12px] font-bold uppercase tracking-wider">RERA Certificate</span>
                           </div>
                           <ArrowRightIcon className="w-4 h-4 text-[var(--text3)] group-hover:text-[var(--text)] transition-transform group-hover:translate-x-1" />
                        </button>
                     </div>

                     {/* Documentation Section */}
                     <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-4 text-left">
                        <div className="flex items-center justify-between px-1">
                           <h4 className="text-[11px] font-bold text-[var(--text)] uppercase tracking-[2px]">Legal Blueprint Archive</h4>
                           <DocumentTextIcon className="w-4 h-4 text-[var(--text3)] opacity-40" />
                        </div>
                        <div className="space-y-3">
                           {currentLayout?.docs && currentLayout.docs.length > 0 ? currentLayout.docs.map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-2xl border border-[var(--border)] group hover:bg-white hover:shadow-md transition-all gap-4">
                                 <div className="flex items-center gap-3 min-w-0">
                                    <DocumentTextIcon className="w-5 h-5 text-[var(--gold)] shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                       <span className="text-[11px] font-black text-[var(--text)] uppercase truncate">{doc.name}</span>
                                       <span className="text-[9px] font-bold text-[var(--text3)] uppercase opacity-60 tracking-wider truncate">Authorized {doc.type} Node</span>
                                    </div>
                                 </div>
                                 <Badge variant="success" className="text-[8px] px-2 py-1 font-black tracking-tighter shrink-0">VERIFIED</Badge>
                              </div>
                           )) : (
                              <div className="p-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">No additional layout plans<br />authorized in registry</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </Card>

                  <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left relative overflow-hidden">
                     {selectedPlot ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                           <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--border)]">
                              <h4 className="text-[20px] font-serif text-[var(--text)]">Plot {selectedPlot.id.split('-')[1]}</h4>
                              <button onClick={() => setSelectedPlotId(null)} className="p-1 hover:bg-[var(--bg)] rounded-lg transition-colors">
                                 <XMarkIcon className="w-5 h-5 text-[var(--text3)]" />
                              </button>
                           </div>

                            <div className="space-y-6">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                                     <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-1">Size</div>
                                     <div className="text-[16px] font-bold text-[var(--text)] font-serif">{selectedPlot.size} Yd</div>
                                  </div>
                                  <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                                     <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-1">Status</div>
                                     <Badge
                                        variant={selectedPlot.status === 'Sold' ? 'success' : selectedPlot.status === 'Booked' ? 'info' : selectedPlot.status === 'Reserved' ? 'warning' : 'neutral'}
                                        className="uppercase tracking-widest text-[9px]"
                                     >
                                        {selectedPlot.status}
                                     </Badge>
                                  </div>
                               </div>

                               {/* Payment Progress */}
                               {(selectedPlot.amountPaid || 0) > 0 && (
                                  <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)] space-y-3">
                                     <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Payment Progress</span>
                                        <span className="text-[10px] font-bold text-[var(--gold)]">
                                           {Math.round(((selectedPlot.amountPaid || 0) / (selectedPlot.size * selectedPlot.rate)) * 100)}%
                                        </span>
                                     </div>
                                     <div className="h-2 bg-white border border-[var(--border)] rounded-full overflow-hidden">
                                        <div
                                           className="h-full bg-[var(--gold)] rounded-full transition-all duration-1000"
                                           style={{ width: `${Math.min(100, ((selectedPlot.amountPaid || 0) / (selectedPlot.size * selectedPlot.rate)) * 100)}%` }}
                                        ></div>
                                     </div>
                                     <div className="flex justify-between">
                                        <div>
                                           <span className="text-[9px] font-bold text-[var(--text3)] uppercase block">Paid</span>
                                           <span className="text-[13px] font-bold text-[var(--green)] font-price">₹{(selectedPlot.amountPaid || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="text-right">
                                           <span className="text-[9px] font-bold text-[var(--text3)] uppercase block">Balance</span>
                                           <span className={`text-[13px] font-bold font-price ${(selectedPlot.size * selectedPlot.rate) - (selectedPlot.amountPaid || 0) <= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                                              {((selectedPlot.size * selectedPlot.rate) - (selectedPlot.amountPaid || 0)) <= 0
                                                 ? 'Fully Paid'
                                                 : `₹${((selectedPlot.size * selectedPlot.rate) - (selectedPlot.amountPaid || 0)).toLocaleString('en-IN')}`
                                              }
                                           </span>
                                        </div>
                                     </div>
                                  </div>
                               )}

                              <div className="space-y-4">
                                 <p className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-[3px] ml-1 opacity-60">Authentication Protocol</p>
                                  <div className="flex flex-col gap-3">
                                     <div className="flex gap-3">
                                        <Button
                                           variant="secondary"
                                           v2={true}
                                           disabled={selectedPlot.status === 'Sold' || selectedPlot.status === 'Booked'}
                                           onClick={() => openBookingModal('Booked')}
                                           className="flex-1 h-12 border-[var(--border)] text-[11px] font-extrabold hover:bg-[var(--blue-lt)] hover:text-[var(--blue)] uppercase tracking-wider rounded-xl transition-all"
                                        >
                                           Book Plot
                                        </Button>
                                        <Button
                                           variant="secondary"
                                           v2={true}
                                           disabled={selectedPlot.status === 'Sold'}
                                           onClick={() => openBookingModal('Reserved')}
                                           className="flex-1 h-12 border-[var(--border)] text-[11px] font-extrabold hover:bg-[var(--gold-lt)] hover:text-[var(--gold)] uppercase tracking-wider rounded-xl transition-all"
                                        >
                                           Reserve
                                        </Button>
                                     </div>
                                     <Button
                                        v2={true}
                                        disabled={selectedPlot.status === 'Sold'}
                                        onClick={() => openBookingModal('Sold')}
                                        className="h-14 bg-[var(--sb)] text-white font-black uppercase tracking-[3px] text-[12px] shadow-xl hover:shadow-2xl transition-all rounded-2xl border-none"
                                     >
                                        Authorize Sale
                                     </Button>
                                     {selectedPlot.status === 'Booked' && (
                                        <Button
                                           v2={true}
                                           variant="secondary"
                                           onClick={() => openBookingModal('Available')}
                                           className="h-10 border-[var(--border)] text-[10px] font-bold hover:bg-[var(--red-lt)] hover:text-[var(--red)] hover:border-[var(--red)] uppercase tracking-wider rounded-xl transition-all"
                                        >
                                           Cancel Booking
                                        </Button>
                                     )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="py-20 text-center flex flex-col items-center opacity-30">
                           <div className="w-16 h-16 bg-[var(--bg)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--border)]">
                              <RectangleGroupIcon className="w-8 h-8 text-[var(--text3)]" />
                           </div>
                           <p className="text-[12px] font-bold uppercase tracking-[4px]">Select Plot</p>
                        </div>
                     )}
                  </Card>
               </div>
            </div>
         </div>

         {/* Modals moved outside animated container */}
         {/* Booking/Sale Modal */}
         {isBookingModalOpen && selectedPlot && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
               <div className="bg-white rounded-xl p-0 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                     <div>
                        <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                           {bookingAction === 'Booked' ? 'Book Plot' : bookingAction === 'Sold' ? 'Authorize Sale' : bookingAction === 'Available' ? 'Cancel Booking' : 'Reserve Plot'}
                        </h2>
                        <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Plot {selectedPlot.id} • {selectedPlot.size} Yd²</p>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsBookingModalOpen(false)}>✕</Button>
                  </div>

                  <div className="p-8 space-y-6 text-left">
                     {bookingAction !== 'Available' && (
                        <>
                           <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Customer Name</label>
                              <Input
                                 required
                                 v2={true}
                                 className="h-12 rounded-xl"
                                 value={bookingCustomerName}
                                 onChange={(e) => setBookingCustomerName(e.target.value)}
                                 placeholder="Enter customer full name"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">
                                 {bookingAction === 'Booked' ? 'Booking Amount (₹)' : 'Sale Amount (₹)'}
                              </label>
                              <Input
                                 type="number"
                                 v2={true}
                                 className="h-12 rounded-xl !text-[var(--gold)] font-price"
                                 value={bookingAmount}
                                 onChange={(e) => setBookingAmount(e.target.value)}
                                 placeholder={bookingAction === 'Booked' ? 'Advance amount' : `Full value: ${(selectedPlot.size * selectedPlot.rate).toLocaleString()}`}
                              />
                           </div>
                           <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                              <div className="flex justify-between items-center">
                                 <span className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Total Plot Value</span>
                                 <span className="text-[14px] font-bold text-[var(--gold)] font-price">₹{(selectedPlot.size * selectedPlot.rate).toLocaleString()}</span>
                              </div>
                           </div>
                        </>
                     )}
                     {bookingAction === 'Available' && (
                        <div className="p-6 bg-[var(--red-lt)] rounded-xl border border-[var(--red)]/20 text-center">
                           <p className="text-[12px] font-bold text-[var(--red)] uppercase tracking-wider">This booking will be cancelled.</p>
                           <p className="text-[10px] text-[var(--text3)] mt-2">Payment records will be flagged and customer status reverted.</p>
                        </div>
                     )}

                     <div className="pt-2 flex gap-4">
                        <Button
                           type="button"
                           variant="secondary"
                           v2={true}
                           onClick={() => setIsBookingModalOpen(false)}
                           className="flex-1 !py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest border-[var(--border)] hover:bg-[var(--bg)]"
                        >
                           Abort
                        </Button>
                        <Button
                           v2={true}
                           onClick={handleBookingSubmit}
                           className={`flex-[2] !py-4 rounded-xl font-black text-[11px] uppercase tracking-[3px] shadow-lg ${bookingAction === 'Available' ? 'bg-[var(--red)] hover:bg-[var(--red)]/90 shadow-[var(--red)]/10' : 'shadow-[var(--gold)]/10'}`}
                        >
                           {bookingAction === 'Booked' ? 'Confirm Booking' : bookingAction === 'Sold' ? 'Authorize Sale' : bookingAction === 'Available' ? 'Confirm Cancellation' : 'Confirm Reserve'}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* RERA Modal */}
         {isReraModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
               <div className="bg-white rounded-xl p-0 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                     <div>
                        <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                           RERA Governance
                        </h2>
                        <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Official regulatory compliance node</p>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsReraModalOpen(false)}>✕</Button>
                  </div>

                  <div className="p-10 space-y-8 text-center flex flex-col items-center">
                     <div className="w-16 h-16 bg-[var(--gold-lt)] rounded-2xl flex items-center justify-center border border-[var(--gold)]/20 shadow-md">
                        <RectangleGroupIcon className="w-8 h-8 text-[var(--gold)]" />
                     </div>

                     <div className="w-full p-6 bg-[var(--bg)] rounded-xl border border-[var(--border)] text-left">
                        <div className="text-[10px] font-extrabold text-[var(--text3)] uppercase tracking-[3px] mb-3">Certification ID</div>
                        <div className="text-[18px] font-black text-[var(--gold)] tracking-tight font-serif tabular-nums">PR / GJ / AMD / 282 / 2026</div>
                     </div>

                     <Button
                        v2={true}
                        onClick={() => setIsReraModalOpen(false)}
                        className="w-full !py-4 rounded-xl font-black text-[11px] uppercase tracking-[3px] shadow-lg shadow-[var(--gold)]/10"
                     >
                        Close Registry
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {/* Initialize Scheme Modal */}
         {isAddSchemeModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
               <div className="bg-white rounded-xl p-0 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                     <div>
                        <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">
                           New Asset Scheme
                        </h2>
                        <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-[2px] mt-1 opacity-60">Initialize a new portfolio trajectory</p>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsAddSchemeModalOpen(false)}>✕</Button>
                  </div>

                  <form className="p-8 space-y-8 text-left">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Scheme Designation</label>
                              <Input
                                 required
                                 v2={true}
                                 className="h-12 rounded-xl"
                                 value={schemeFormData.name}
                                 onChange={(e) => setSchemeFormData({ ...schemeFormData, name: e.target.value })}
                                 placeholder="e.g. Skyline Heights"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Linked Land Parcel</label>
                              <div className="relative group">
                                 <select
                                    className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 focus:bg-white focus:border-[var(--gold)] outline-none transition-all font-bold text-[13px] appearance-none uppercase"
                                    value={schemeFormData.landId}
                                    onChange={(e) => setSchemeFormData({ ...schemeFormData, landId: e.target.value })}
                                 >
                                    {lands.map(l => (
                                       <option key={l.id} value={l.id}>{l.surveyNo} — {l.location}</option>
                                    ))}
                                 </select>
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text3)] group-hover:text-[var(--gold)] transition-colors">▼</div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Total Unit Count</label>
                              <Input
                                 required type="number"
                                 v2={true}
                                 className="h-12 rounded-xl"
                                 value={schemeFormData.totalPlots}
                                 onChange={(e) => setSchemeFormData({ ...schemeFormData, totalPlots: Number(e.target.value) })}
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Target Valuation/Yd</label>
                              <Input
                                 required type="number"
                                 v2={true}
                                 className="h-12 rounded-xl !text-[var(--gold)] font-price"
                                 value={schemeFormData.ratePerSqYd}
                                 onChange={(e) => setSchemeFormData({ ...schemeFormData, ratePerSqYd: Number(e.target.value) })}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="pt-4 flex gap-4">
                        <Button
                           type="button"
                           variant="secondary"
                           v2={true}
                           onClick={() => setIsAddSchemeModalOpen(false)}
                           className="flex-1 !py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest border-[var(--border)] hover:bg-[var(--bg)]"
                        >
                           Discard Setup
                        </Button>
                        <Button
                           type="button"
                           v2={true}
                           onClick={() => {
                              if (!schemeFormData.name) return;
                              const newId = `l${layouts.length + 1}`;
                              addLayout({ ...schemeFormData, docs: [] });
                              setActiveLayoutId(newId);
                              setIsAddSchemeModalOpen(false);
                           }}
                           className="flex-[2] !py-4 rounded-xl font-black text-[11px] uppercase tracking-[3px] shadow-lg shadow-[var(--gold)]/10"
                        >
                           Initialize Pipeline Node
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </>
   );
}
