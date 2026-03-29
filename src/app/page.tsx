"use client";
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  ArrowDownTrayIcon,
  PlusIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const FinanceTrendChart = dynamic(() => import('@/components/DashboardCharts').then(mod => mod.FinanceTrendChart), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const { 
    payments, 
    isPinUnlocked, 
    unlockPin, 
    lockPin, 
    addQuery,
    lands,
    plots,
    followUps,
    brokers,
    constructionPhases,
    materialStock,
    campaigns,
    salaries,
    queries,
    materialTxns,
    constructionCosts,
    inspectionAlerts,
    siteVisits,
    transmissionLogs,
    activityFeed,
    assets,
    salaryAdvances,
    propertyHolders
  } = useStore();

  const handlePinClick = (val: string | number) => {
    if (val === 'X') {
      setEnteredPin("");
    } else if (val === 'OK') {
      if (enteredPin.length === 0) return;
      if (unlockPin(enteredPin)) {
        setIsPinModalOpen(false);
        setEnteredPin("");
      } else {
        setEnteredPin("");
        alert("Invalid PIN");
      }
    } else {
      const newPin = enteredPin + val;
      if (newPin.length <= 4) {
        setEnteredPin(newPin);
        if (newPin.length === 4) {
          setTimeout(() => {
            if (unlockPin(newPin)) {
              setIsPinModalOpen(false);
              setEnteredPin("");
            } else {
              setEnteredPin("");
              alert("Invalid PIN");
            }
          }, 100);
        }
      }
    }
  };

  React.useEffect(() => {
    if (!isPinModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinClick(e.key);
      } else if (e.key === 'Backspace') {
        setEnteredPin(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handlePinClick('OK');
      } else if (e.key === 'Escape') {
        setIsPinModalOpen(false);
        setEnteredPin("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinModalOpen, enteredPin]);

  const whiteTotal = useMemo(() => payments.filter(p => p.mode !== 'Cash').reduce((acc, curr) => acc + curr.amount, 0), [payments]);
  const blackTotal = useMemo(() => payments.filter(p => p.mode === 'Cash').reduce((acc, curr) => acc + curr.amount, 0), [payments]);
  const displayRevenue = useMemo(() => whiteTotal + (isPinUnlocked ? blackTotal : 0), [whiteTotal, blackTotal, isPinUnlocked]);

  const totalLandInvestment = useMemo(() => lands.reduce((acc, l) => acc + l.purchasePrice, 0), [lands]);
  const soldPlotsCount = useMemo(() => plots.filter(p => p.status === 'Sold').length, [plots]);
  const bookedPlotsCount = useMemo(() => plots.filter(p => p.status === 'Booked').length, [plots]);
  const activeProspects = useMemo(() => followUps.filter(f => f.status !== 'Lost' && f.status !== 'Booked').length, [followUps]);
  const totalVisits = siteVisits.length;
  const hotLeads = useMemo(() => siteVisits.filter(v => v.interest === 'Hot').length, [siteVisits]);
  const bookedCount = useMemo(() => followUps.filter(f => f.status === 'Booked').length, [followUps]);
  const lostLeads = useMemo(() => followUps.filter(f => f.status === 'Lost').length, [followUps]);

  const formatLargeCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString()}`;
  };

  const landCost = useMemo(() => propertyHolders.reduce((acc, h) => acc + h.paidAmount, 0), [propertyHolders]);
  const materialCost = useMemo(() => materialTxns.filter(t => t.type === 'Inward').reduce((acc, t) => acc + (t.totalCost || 0), 0), [materialTxns]);
  const constructionCostExpenses = useMemo(() => constructionCosts.reduce((acc, c) => acc + c.amount, 0), [constructionCosts]);
  const marketingCost = useMemo(() => campaigns.reduce((acc, c) => acc + (c.spent || 0), 0), [campaigns]);
  const salaryCost = useMemo(() => salaries.filter(s => s.status === 'Paid').reduce((acc, s) => acc + (s.net || 0), 0), [salaries]);
  const salaryAdvanceCost = useMemo(() => salaryAdvances.reduce((acc, a) => acc + a.amount, 0), [salaryAdvances]);
  const brokerCommissionCost = useMemo(() => brokers.reduce((acc, b) => acc + b.commissions.filter(c => c.status === 'Paid').reduce((a, c) => a + c.amount, 0), 0), [brokers]);
  const assetCost = useMemo(() => assets.reduce((acc, a) => acc + a.price, 0), [assets]);
  
  const totalExpenses = landCost + materialCost + constructionCostExpenses + marketingCost + salaryCost + salaryAdvanceCost + brokerCommissionCost + assetCost;
  const netProfit = displayRevenue - totalExpenses;

  const lowStockCount = useMemo(() => materialStock.filter(m => m.current < m.threshold).length, [materialStock]);
  const availablePlots = useMemo(() => plots.filter(p => p.status === 'Available').length, [plots]);
  
  const recentActivities = useMemo(() => {
    const list: any[] = [];
    queries.slice(0, 2).forEach(q => list.push({ title: `New query — ${q.name}`, time: q.date, sub: `${q.source} · ${q.interest}`, dot: 'gold' }));
    payments.slice(0, 2).forEach(p => list.push({ title: `Payment — ${p.customerName} ₹${p.amount.toLocaleString()}`, time: p.date, sub: `${p.mode} · Plot ${p.plotId}`, dot: 'gold' }));
    siteVisits.slice(0, 2).forEach(v => list.push({ title: `Site visit — ${v.customerName}`, time: v.visitDate, sub: `${v.source} · ${v.interest}`, dot: v.interest === 'Hot' ? 'red' : 'gold' }));
    followUps.slice(0, 2).forEach(f => {
      const lastInteraction = f.interactions[0];
      if (lastInteraction) {
        list.push({ title: `${lastInteraction.type} — ${f.customerName}`, time: lastInteraction.date, sub: `${lastInteraction.outcome} · ${f.status}`, dot: f.status === 'Hot' ? 'red' : 'gold' });
      }
    });
    transmissionLogs.slice(0, 1).forEach(t => list.push({ title: `Weekend post sent to ${t.delivered} contacts`, time: t.date, sub: `${t.postTitle} · ${t.channel}`, dot: 'gold' }));
    activityFeed.slice(0, 5).forEach(item => {
      const dotColor = item.type === 'material_alert' || item.type === 'land_overdue' ? 'red' :
                       item.type === 'material_inward' || item.type === 'land_payment' ? 'gold' :
                       item.type === 'material_outward' ? 'border' : 'gold';
      list.push({ title: item.message, time: item.timestamp, sub: '', dot: dotColor });
    });
    return list.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10);
  }, [queries, payments, siteVisits, followUps, transmissionLogs, activityFeed]);

  const financialTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ month: m, revenue: 0, expenses: 0 }));
    payments.forEach(p => {
      const monthIndex = new Date(p.date).getMonth();
      if (!isNaN(monthIndex)) data[monthIndex].revenue += p.amount;
    });
    return data.filter(d => d.revenue > 0 || d.expenses > 0);
  }, [payments]);

  const highestMonth = useMemo(() => {
    if (financialTrend.length === 0) return null;
    return financialTrend.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current);
  }, [financialTrend]);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left">
        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Good evening, Owner 👋</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50 underline decoration-dotted">Real estate business overview • {currentDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button v2={true} variant="secondary" size="default" className="shadow-sm rounded-lg" onClick={() => window.print()}>
               <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Export Summary
            </Button>
            <Button v2={true} size="default" className="px-8 shadow-lg shadow-black/10 rounded-lg" onClick={() => setIsQuickAddOpen(true)}>
               <PlusIcon className="w-4 h-4 mr-2" /> Quick Lead
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <KPICard label="TOTAL REVENUE" value={formatLargeCurrency(displayRevenue)} trend={{ value: "+12%", type: "up" }} />
          <KPICard label="PLOTS SOLD" value={`${soldPlotsCount} / ${plots.length}`} trend={{ value: `${((soldPlotsCount / plots.length) * 100).toFixed(1)}% Yield`, type: "neutral" }} />
          <KPICard label="LAND COST PAID" value={formatLargeCurrency(landCost)} trend={{ value: "Operational", type: "neutral" }} />
          <KPICard label="ACTIVE PROSPECTS" value={activeProspects.toString()} trend={{ value: "Pipeline Nodes", type: "neutral" }} />
          <KPICard label="CONSTRUCTION ALERTS" value={lowStockCount.toString()} trend={{ value: lowStockCount > 3 ? "URGENT" : "STABLE", type: lowStockCount > 3 ? "down" : "neutral" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--section-gap)]">
          {/* Revenue chart */}
          <Card title="REVENUE MATRIX" subtitle="MONTHLY TRANSIT PULSE" actions={highestMonth ? <Badge variant="gold" className="uppercase tracking-widest leading-none px-2 py-0.5">{highestMonth.month} HIGH {formatLargeCurrency(highestMonth.revenue)}</Badge> : null}>
            <div className="h-[220px] w-full mt-8">
              <FinanceTrendChart data={financialTrend} />
            </div>
            <div className="flex gap-4 mt-6 border-t border-[var(--border)] pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">
                <div className="w-2.5 h-2.5 rounded-sm bg-[var(--green)]"></div> REVENUE NODES
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">
                <div className="w-2.5 h-2.5 rounded-sm bg-[var(--red)]"></div> EXPENSE LOADS
              </div>
            </div>
          </Card>

          {/* P&L summary */}
          <Card title="SETTLEMENT LEDGER" subtitle="REAL-TIME P&L POSITION" actions={<Button v2={true} variant="secondary" size="sm" className="gap-2 text-[9px] uppercase tracking-widest h-8" onClick={() => setIsPinModalOpen(true)}><ShieldCheckIcon className="w-3.5 h-3.5" /> SECURE ACCESS</Button>}>
            <div className="space-y-2 mt-6">
              {[
                { label: 'Bank & Institutional Revenue', value: whiteTotal, mode: 'plus', path: '/payments' },
                { label: 'Private Ledger Revenue (Cash)', value: blackTotal, mode: 'private', path: '/payments' },
                { label: 'Land Acquisition (Property Holder)', value: landCost, mode: 'minus', path: '/propertyholder' },
                { label: 'Material & Construction Sync', value: materialCost + constructionCostExpenses, mode: 'minus', path: '/material' },
                { label: 'Marketing & Campaign Leads', value: marketingCost, mode: 'minus', path: '/brochure' },
                { label: 'Payroll, Advances & Broker Comm', value: salaryCost + salaryAdvanceCost + brokerCommissionCost, mode: 'minus', path: '/salary' },
              ].map((item, idx) => (
                <div key={idx} onClick={() => router.push(item.path)} className={`flex items-center justify-between p-4 rounded-xl text-[13px] font-bold cursor-pointer transition-all border shadow-sm uppercase tracking-tight ${
                  item.mode === 'plus' ? 'bg-[var(--green-lt)]/30 border-[var(--green)]/10 text-[var(--green)] hover:scale-[1.01]' :
                  item.mode === 'private' ? (isPinUnlocked ? 'bg-[var(--gold-lt)]/30 border-[var(--gold)]/20 text-[var(--gold)] hover:scale-[1.01]' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text3)] opacity-60') :
                  'bg-[var(--red-lt)]/30 border-[var(--red)]/10 text-[var(--red)] hover:scale-[1.01]'
                }`}>
                  <span className="flex items-center gap-2">
                    {item.mode === 'plus' && <PlusIcon className="w-3.5 h-3.5" />}
                    {item.mode === 'private' && (isPinUnlocked ? '🔓 ' : '🔒 ')}
                    {item.label}
                  </span>
                  <span className={`font-price ${item.mode === 'private' && !isPinUnlocked ? 'blur-sm' : ''}`}>₹{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-6 rounded-xl text-[15px] bg-[var(--gold)] text-white font-black mt-4 shadow-lg shadow-gold-500/20 uppercase tracking-tighter italic">
                <span>Net Projected Position</span>
                <span className="font-price">₹{netProfit.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--section-gap)]">
          <Card title="OPERATIONAL PROGRESS" subtitle="CONSTRUCTION LIFECYCLE" actions={<Badge variant="neutral" className="uppercase tracking-widest text-[9px] font-black">{constructionPhases.length} ACTIVE NODES</Badge>}>
            <div className="space-y-6 mt-8">
              {constructionPhases.length > 0 ? constructionPhases.map((p, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-[12px] font-bold text-[var(--text)] uppercase tracking-tight leading-none group-hover:text-[var(--gold)] transition-colors">{p.name}</span>
                    <span className="text-[10px] font-black tabular-nums text-[var(--gold)] leading-none">{p.progress}% COMPLETED</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg)] rounded-full border border-[var(--border)] overflow-hidden p-0.5 shadow-inner">
                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]" style={{ width: `${p.progress}%`, backgroundColor: `var(${p.colorVar})` }}></div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-[180px] text-[var(--text3)] opacity-20 select-none">
                  <ChartBarIcon className="w-12 h-12 mb-4" />
                  <span className="text-[11px] font-black uppercase tracking-[3px]">Awaiting Phase data</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="OPERATIONAL FEED" subtitle="REAL-TIME ACTIVITY STREAM">
            <div className="space-y-5 mt-8">
              {recentActivities.length > 0 ? recentActivities.map((item, i, arr) => (
                <div key={i} className="flex gap-4 relative group">
                  {i !== arr.length - 1 && <div className="absolute left-[6.5px] top-4 bottom-[-16px] w-[1px] bg-[var(--border)] group-hover:bg-[var(--gold)]/30 transition-colors"></div>}
                  <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10 mt-1 shadow-sm transition-transform group-hover:scale-125 ${item.dot === 'gold' ? 'bg-[var(--gold)] border-white' : item.dot === 'red' ? 'bg-[var(--red)] border-white' : 'bg-white border-[var(--border)]'}`}></div>
                  <div className="text-left pb-1">
                    <div className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight leading-tight group-hover:text-[var(--gold)] transition-colors">{item.title}</div>
                    <div className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[1px] mt-2 opacity-50 tabular-nums leading-none">{item.time} · {item.sub}</div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-[180px] text-[var(--text3)] opacity-20 select-none">
                  <ArrowPathIcon className="w-12 h-12 mb-4 animate-spin-slow" />
                  <span className="text-[11px] font-black uppercase tracking-[3px]">Synchronizing Node Activity...</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Fixed elements outside the animated container to avoid the 'contained' trap */}
      {/* PIN Authorization Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-[340px] shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] text-center relative">
              <button 
                onClick={() => { setIsPinModalOpen(false); setEnteredPin(""); }}
                className="absolute right-6 top-6 text-[var(--text3)] hover:text-[var(--text)] transition-colors"
                aria-label="Close PIN Pad"
              >✕</button>
              <div className="w-16 h-16 bg-[var(--gold-lt)] rounded-2xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm mx-auto mb-6">
                 <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-2">Vault Access</h2>
              <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2.5px] opacity-60 leading-none">Enter Secure Administrative PIN</p>
            </div>
            
            <div className="p-8 space-y-8 bg-white">
              <div className="flex gap-4 justify-center">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 shadow-sm ${enteredPin.length >= i ? 'bg-[var(--gold)] border-[var(--gold)] scale-125 shadow-[0_0_12px_var(--gold)]/50' : 'border-[var(--border)] bg-[var(--bg)]'}`}></div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'X', 0, 'OK'].map((k, i) => (
                  <button
                    key={i}
                    onClick={() => handlePinClick(k)}
                    className={`flex items-center justify-center h-16 rounded-xl border border-[var(--border)] bg-gray-50/50 cursor-pointer transition-all hover:bg-[var(--gold)] hover:text-white hover:border-[var(--gold)] hover:shadow-lg hover:shadow-gold-500/20 active:scale-95 select-none font-bold text-[18px] text-[var(--text)] shadow-sm
                      ${k === 'X' || k === 'OK' ? 'text-[10px] uppercase tracking-widest bg-[var(--bg)]' : ''}`}
                  >
                    {k === 'X' ? 'Clear' : k === 'OK' ? 'Enter' : k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Initialization Protocol (Lead Capture) */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-0 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                   <PlusIcon className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase font-serif leading-none mb-1.5">Quick Registration</h2>
                   <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Establish new prospective lead node</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsQuickAddOpen(false)}>✕</Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addQuery({
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                source: 'Walk-in',
                interest: formData.get('interest') as string,
                budget: formData.get('budget') as string,
                status: 'New'
              });
              setIsQuickAddOpen(false);
            }} className="p-8 space-y-8 text-left">
              <div className="space-y-6">
                 <div className="space-y-3">
                   <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Customer Identity</label>
                   <Input required name="name" v2={true} type="text" placeholder="FULL LEGAL NAME" className="h-12 shadow-sm uppercase italic" />
                 </div>

                 <div className="space-y-3">
                   <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Contact Protocol</label>
                   <Input required name="phone" v2={true} type="tel" placeholder="+91 XXXX XXXX" className="h-12 shadow-sm font-price" />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Asset Preference</label>
                     <Input required name="interest" v2={true} type="text" placeholder="PLOT ID" className="h-12 shadow-sm uppercase" />
                   </div>
                   <div className="space-y-3">
                     <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Engagement Load</label>
                     <Input required name="budget" v2={true} type="text" placeholder="BUDGET NODAL" className="h-12 shadow-sm uppercase font-price" />
                   </div>
                 </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-[var(--bg)]/50 rounded-xl border border-dashed border-[var(--border)]">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--gold)] border border-[var(--border)] shadow-sm">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] text-[var(--text3)] font-bold italic leading-relaxed uppercase tracking-[1px] opacity-60">
                    Initializing this quick-entry record will trigger an immediate lead synchronization with the Inbound Query module.
                 </p>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold text-[10px] uppercase tracking-[2px] shadow-sm bg-white" onClick={() => setIsQuickAddOpen(false)}>Abort Protocol</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 rounded-xl font-bold text-[10px] uppercase tracking-[3px] shadow-lg shadow-gold-500/10">Initialize Registry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
