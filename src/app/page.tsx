"use client";
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { InvestmentReport } from '@/components/InvestmentReport';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { motion } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  PlusIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  MapIcon,
  Square3Stack3DIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const MegaphoneIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.062.51.111.77.147m-0.77-9.327c.26-.036.517-.085.77-.147m0 9.474c1.114.156 2.228.312 3.342.469a.75.75 0 0 0 .858-.742V6.75a.75.75 0 0 0-.858-.742c-1.114.157-2.228.313-3.342.469m0 9.18a45.003 45.003 0 0 1 2.25 3.633.75.75 0 0 0 1.24.032 4.492 4.492 0 0 0 1.583-3.153V6.75m-3.833 9.474a44.972 44.972 0 0 0 1.583-3.153" />
  </svg>
);

const FinanceTrendChart = dynamic(() => import('@/components/DashboardCharts').then(mod => mod.FinanceTrendChart), { ssr: false });
const ConstructionBarChart = dynamic(() => import('@/components/DashboardCharts').then(mod => mod.ConstructionBarChart), { ssr: false });

export default function Dashboard() {
  const router = useRouter();

  const {
    payments,
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
    siteVisits,
    transmissionLogs,
    activityFeed,
    assets,
    salaryAdvances,
    propertyHolders
  } = useStore();

  const whiteTotal = useMemo(() => payments.filter(p => p.mode !== 'Cash').reduce((acc, curr) => acc + curr.amount, 0), [payments]);
  const blackTotal = useMemo(() => payments.filter(p => p.mode === 'Cash').reduce((acc, curr) => acc + curr.amount, 0), [payments]);
  const displayRevenue = useMemo(() => whiteTotal + blackTotal, [whiteTotal, blackTotal]);

  const soldPlotsCount = useMemo(() => plots.filter(p => p.status === 'Sold').length, [plots]);
  const activeLeadsCount = useMemo(() => queries.filter(q => q.status === 'New' || q.status === 'In Progress').length, [queries]);
  const followUpLeadsCount = useMemo(() => followUps.filter(f => f.status !== 'Lost' && f.status !== 'Booked').length, [followUps]);

  const landCost = useMemo(() => propertyHolders.reduce((acc, h) => acc + h.paidAmount, 0), [propertyHolders]);
  const materialCost = useMemo(() => materialTxns.filter(t => t.type === 'Inward').reduce((acc, t) => acc + (t.totalCost || 0), 0), [materialTxns]);
  const constructionCostExpenses = useMemo(() => constructionCosts.reduce((acc, c) => acc + c.amount, 0), [constructionCosts]);
  const marketingCost = useMemo(() => campaigns.reduce((acc, c) => acc + (c.spent || 0), 0), [campaigns]);
  const salaryCost = useMemo(() => salaries.filter(s => s.status === 'Paid').reduce((acc, s) => acc + (s.net || 0), 0), [salaries]);
  const salaryAdvanceCost = useMemo(() => salaryAdvances.reduce((acc, a) => acc + a.amount, 0), [salaryAdvances]);
  const brokerCommissionCost = useMemo(() => brokers.reduce((acc, b) => acc + b.commissions.filter(c => c.status === 'Paid').reduce((a, c) => a + c.amount, 0), 0), [brokers]);
  const itemCost = useMemo(() => assets.reduce((acc, a) => acc + a.price, 0), [assets]);

  const totalExpenses = landCost + materialCost + constructionCostExpenses + marketingCost + salaryCost + salaryAdvanceCost + brokerCommissionCost + itemCost;
  const netProfit = displayRevenue - totalExpenses;

  const lowStockCount = useMemo(() => materialStock.filter(m => m.current < m.threshold).length, [materialStock]);

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
    transmissionLogs.slice(0, 1).forEach(t => list.push({ title: `Message sent to ${t.delivered} contacts`, time: t.date, sub: `${t.postTitle} · ${t.channel}`, dot: 'gold' }));
    activityFeed.slice(0, 5).forEach(item => {
      const dotColor = item.type === 'material_alert' || item.type === 'land_overdue' ? 'red' :
        item.type === 'material_inward' || item.type === 'land_payment' ? 'gold' :
          item.type === 'material_outward' ? 'border' : 'gold';
      list.push({ title: item.message, time: item.timestamp, sub: '', dot: dotColor });
    });
    return list.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
  }, [queries, payments, siteVisits, followUps, transmissionLogs, activityFeed]);

  const siteWiseConstructionData = useMemo(() => {
    const sites: Record<string, { count: number, totalProgress: number }> = {};
    constructionPhases.forEach(p => {
      const site = p.siteName || 'Unassigned';
      if (!sites[site]) sites[site] = { count: 0, totalProgress: 0 };
      sites[site].count += 1;
      sites[site].totalProgress += p.progress;
    });
    return Object.entries(sites).map(([site, data]) => ({
      site: site.toUpperCase(),
      progress: Math.round(data.totalProgress / data.count)
    }));
  }, [constructionPhases]);

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

  const formatLargeCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString()}`;
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <InvestmentReport
        data={{
          revenue: displayRevenue,
          plotsSold: `${soldPlotsCount} / ${plots.length}`,
          landCost: landCost,
          activeLeads: activeLeadsCount,
          profit: netProfit,
          siteWiseData: siteWiseConstructionData,
          recentActivities: recentActivities,
          expenses: {
            land: landCost,
            material: materialCost,
            construction: constructionCostExpenses,
            marketing: marketingCost,
            salary: salaryCost + salaryAdvanceCost,
            broker: brokerCommissionCost,
            assets: itemCost
          },
          inventory: {
            total: plots.length,
            sold: soldPlotsCount,
            available: plots.length - soldPlotsCount
          },
          leads: {
            total: queries.length,
            converted: queries.filter(q => q.status === 'Converted').length,
            ratio: queries.length > 0 ? Math.round((queries.filter(q => q.status === 'Converted').length / queries.length) * 100) : 0
          }
        }}
      />

      <div className="dashboard-container space-y-[var(--section-gap)] pb-20 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Welcome back 👋</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5"></span>
                Live status
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums tracking-tight opacity-70">Overview • {currentDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button v2={true} variant="secondary" size="default" className="shadow-sm rounded-lg bg-white border-[var(--border)]" onClick={() => window.print()}>
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <KPICard label="Revenue" value={displayRevenue} trend={{ value: "+12%", type: "up" }} onClick={() => router.push('/payments')} isCurrency={true} />
          <KPICard label="Plots" value={`${soldPlotsCount} / ${plots.length}`} trend={{ value: `${((soldPlotsCount / plots.length) * 100).toFixed(1)}% sold`, type: "neutral" }} onClick={() => router.push('/layout')} />
          <KPICard label="Land cost" value={landCost} trend={{ value: "Paid", type: "neutral" }} onClick={() => router.push('/propertyholder')} isCurrency={true} />
          <KPICard label="Active leads" value={activeLeadsCount} trend={{ value: "Live", type: "neutral" }} onClick={() => router.push('/query')} />
          <KPICard label="Follow up lead" value={followUpLeadsCount} trend={{ value: "In pipeline", type: "neutral" }} onClick={() => router.push('/followup')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--section-gap)]">
          {/* Revenue chart */}
          <Card title="Revenue" subtitle="Monthly trend" actions={highestMonth ? <Badge variant="gold" className="tracking-widest leading-none px-2 py-0.5 uppercase text-[9px] font-bold">{highestMonth.month} high {formatLargeCurrency(highestMonth.revenue)}</Badge> : null}>
            <div className="h-[220px] w-full mt-8">
              <FinanceTrendChart data={financialTrend} />
            </div>
            <div className="flex gap-4 mt-6 border-t border-[var(--border)] pt-4 text-left">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">
                <div className="w-2.5 h-2.5 rounded-sm bg-[var(--green)]"></div> Income
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">
                <div className="w-2.5 h-2.5 rounded-sm bg-[var(--red)]"></div> Expenses
              </div>
            </div>
          </Card>

          {/* Profit summary */}
          {/* Profit summary */}
          <Card title="Financials" subtitle="Profit & loss" actions={<Badge variant="gold" className="tracking-widest leading-none px-2 py-0.5 uppercase text-[9px] font-bold">Done</Badge>}>
            <div className="space-y-2 mt-6">
              {[
                { label: 'Bank Balance', value: whiteTotal, mode: 'plus', path: '/payments', sub: 'In bank', icon: PlusIcon },
                { label: 'Cash Balance', value: blackTotal, mode: 'private', path: '/payments', sub: 'In hand', icon: ShieldCheckIcon },
                { label: 'Land Cost', value: landCost, mode: 'minus', path: '/propertyholder', sub: 'Land buying', icon: MapIcon },
                { label: 'Material Cost', value: materialCost + constructionCostExpenses, mode: 'minus', path: '/material', sub: 'Stock used', icon: Square3Stack3DIcon },
                { label: 'Marketing Cost', value: marketingCost, mode: 'minus', path: '/brochure', sub: 'Ads & Brochures', icon: MegaphoneIcon },
                { label: 'Salaries', value: salaryCost + salaryAdvanceCost + brokerCommissionCost, mode: 'minus', path: '/salary', sub: 'Staff & Brokers', icon: UserGroupIcon },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 3 }}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 border group shadow-sm
                    ${item.mode === 'plus' ? 'bg-emerald-50/20 border-emerald-100/50 hover:bg-emerald-50' :
                      item.mode === 'private' ? 'bg-gray-900 border-gray-800 hover:bg-black text-white' :
                        'bg-rose-50/20 border-rose-100/50 hover:bg-rose-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border
                      ${item.mode === 'plus' ? 'bg-white text-emerald-600 border-emerald-100' :
                        item.mode === 'private' ? 'bg-white/10 text-amber-500 border-white/10' :
                          'bg-white text-rose-600 border-rose-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className={`text-[12px] font-bold tracking-tight uppercase leading-none mb-1 ${item.mode === 'private' ? 'text-white' : 'text-gray-900'}`}>{item.label}</div>
                      <div className={`text-[8px] font-bold tracking-[1.2px] uppercase opacity-40 ${item.mode === 'private' ? 'text-white/60' : 'text-gray-500'}`}>{item.sub}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[14px] font-bold tabular-nums tracking-tighter ${item.mode === 'private' ? 'text-amber-500' : item.mode === 'plus' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.mode === 'minus' ? '-' : ''}₹{item.value.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="pt-4">
                <div className="relative p-5 rounded-[16px] bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dk)] text-white shadow-lg overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-[9px] font-bold tracking-[2px] uppercase opacity-60 mb-1">Total Profit</div>
                      <div className="text-[22px] font-bold tracking-tighter tabular-nums leading-none flex items-baseline gap-1">
                        <span className="text-[14px] opacity-70">₹</span>
                        {netProfit.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                      <CurrencyRupeeIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--section-gap)]">
          <Card title="Construction status" subtitle="Work progress across sites" actions={<Badge variant="neutral" className="tracking-widest text-[9px] font-bold uppercase">{siteWiseConstructionData.length} projects</Badge>}>
            <div className="h-[220px] w-full mt-8">
              {siteWiseConstructionData.length > 0 ? (
                <ConstructionBarChart data={siteWiseConstructionData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text3)] opacity-40 select-none">
                  <ChartBarIcon className="w-12 h-12 mb-4" />
                  <span className="text-[11px] font-bold tracking-[2px] uppercase">No construction data</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Recent Actions" subtitle="Timeline">
            <div className="space-y-5 mt-8 text-left">
              {recentActivities.length > 0 ? recentActivities.map((item, i, arr) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== arr.length - 1 && <div className="absolute left-[6.5px] top-4 bottom-[-16px] w-[1px] bg-gray-100"></div>}
                  <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10 mt-1 shadow-sm ${item.dot === 'gold' ? 'bg-[var(--gold)] border-white' : item.dot === 'red' ? 'bg-red-500 border-white' : 'bg-white border-[var(--border)]'}`}></div>
                  <div className="text-left pb-1">
                    <div className="text-[13px] font-bold text-[var(--text)] tracking-tight leading-tight">{item.title}</div>
                    <div className="text-[10px] text-[var(--text3)] font-bold tracking-[1px] mt-2 opacity-70 tabular-nums leading-none uppercase">{item.time} · {item.sub}</div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-[180px] text-[var(--text3)] opacity-40 select-none">
                  <ArrowPathIcon className="w-12 h-12 mb-4" />
                  <span className="text-[11px] font-bold tracking-[2px] uppercase">Loading...</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Print Footer */}
      <footer className="print-footer">
        <p>© 2026 Ownthum Real Estate. All rights reserved. Generated via Secure Investment Portal.</p>
      </footer>
    </>
  );
}
