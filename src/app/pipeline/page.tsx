"use client";
import React, { useState, useMemo } from 'react';
import { useStore, Query, LeadStatus } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KPICard } from '@/components/ui/KPICard';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const STAGES: { value: LeadStatus; label: string; desc: string; color: string }[] = [
  { value: 'New', label: 'New Lead', desc: 'Raw enquiries waiting', color: 'border-t-blue-500 bg-blue-50/10' },
  { value: 'Contacted', label: 'Contacted', desc: 'First contact completed', color: 'border-t-indigo-500 bg-indigo-50/10' },
  { value: 'Qualified', label: 'Qualified', desc: 'Budget & choice verified', color: 'border-t-purple-500 bg-purple-50/10' },
  { value: 'Site Visit Scheduled', label: 'Site Visit', desc: 'Tour booked or done', color: 'border-t-amber-500 bg-amber-50/10' },
  { value: 'Negotiation', label: 'Negotiation', desc: 'Talking pricing / rates', color: 'border-t-orange-500 bg-orange-50/10' },
  { value: 'Booking', label: 'Booking', desc: 'Token amount paid', color: 'border-t-pink-500 bg-pink-50/10' },
  { value: 'Won', label: 'Closed Won', desc: 'Agreement registered', color: 'border-t-emerald-500 bg-emerald-50/10' },
  { value: 'Lost', label: 'Closed Lost', desc: 'Archived leads', color: 'border-t-rose-500 bg-rose-50/10' }
];

export default function PipelinePage() {
  const { queries, updateQueryStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const selectedDeal = useMemo(() => queries.find(q => q.id === selectedDealId), [queries, selectedDealId]);

  // Clean numeric parser for budget strings (e.g., "₹25,00,000" or "₹1.5 - ₹2.0 Cr" or "2500000")
  const parseBudget = (budStr: string): number => {
    if (!budStr) return 0;

    const parseSingleValue = (str: string): number => {
      let clean = str.trim().toLowerCase();
      let multiplier = 1;

      if (clean.includes('cr') || clean.includes('crore')) {
        multiplier = 10000000; // 1 Crore
        clean = clean.replace(/cr(ore)?s?/g, '');
      } else if (clean.includes('l') || clean.includes('lakh')) {
        multiplier = 100000; // 1 Lakh
        clean = clean.replace(/l(akh)?s?/g, '');
      } else if (clean.includes('k') || clean.includes('thousand')) {
        multiplier = 1000; // 1 Thousand
        clean = clean.replace(/(k|thousand)s?/g, '');
      }

      clean = clean.replace(/[^\d.]/g, '');
      const parsedVal = parseFloat(clean);
      return isNaN(parsedVal) ? 0 : parsedVal * multiplier;
    };

    const rangeSeparators = /[-–—]|\bto\b|\band\b/i;
    if (rangeSeparators.test(budStr)) {
      const parts = budStr.split(rangeSeparators);
      if (parts.length > 0) {
        const lowerStr = budStr.toLowerCase();
        const hasCr = lowerStr.includes('cr') || lowerStr.includes('crore');
        const hasLakh = lowerStr.includes('l') || lowerStr.includes('lakh');
        const hasK = lowerStr.includes('k') || lowerStr.includes('thousand');

        const parsedParts = parts.map(part => {
          let partVal = parseSingleValue(part);
          const partClean = part.trim().toLowerCase();
          const partHasSuffix = partClean.includes('cr') || partClean.includes('crore') ||
                                partClean.includes('l') || partClean.includes('lakh') ||
                                partClean.includes('k') || partClean.includes('thousand');

          if (partVal > 0 && !partHasSuffix) {
            if (hasCr) partVal *= 10000000;
            else if (hasLakh) partVal *= 100000;
            else if (hasK) partVal *= 1000;
          }
          return partVal;
        }).filter(v => v > 0);

        if (parsedParts.length > 0) {
          const sum = parsedParts.reduce((acc, val) => acc + val, 0);
          return sum / parsedParts.length;
        }
      }
    }

    return parseSingleValue(budStr);
  };

  // Stage budget aggregates
  const stageStats = useMemo(() => {
    const stats: Record<string, { count: number; totalBudget: number }> = {};
    STAGES.forEach(s => {
      stats[s.value] = { count: 0, totalBudget: 0 };
    });

    queries.forEach(q => {
      if (stats[q.status]) {
        stats[q.status].count += 1;
        stats[q.status].totalBudget += parseBudget(q.budget);
      }
    });

    return stats;
  }, [queries]);

  // Filtered queries
  const filteredQueries = useMemo(() => {
    return queries.filter(q =>
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.phone && q.phone.includes(searchTerm)) ||
      (q.interest && q.interest.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [queries, searchTerm]);

  // Workflow triggers
  const moveDealLeft = (id: string, currentStatus: LeadStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const statusOrder: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Negotiation', 'Booking', 'Won'];
    const idx = statusOrder.indexOf(currentStatus);
    if (idx > 0) {
      updateQueryStatus(id, statusOrder[idx - 1]);
    }
  };

  const moveDealRight = (id: string, currentStatus: LeadStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const statusOrder: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Negotiation', 'Booking', 'Won'];
    const idx = statusOrder.indexOf(currentStatus);
    if (idx < statusOrder.length - 1 && idx !== -1) {
      updateQueryStatus(id, statusOrder[idx + 1]);
    }
  };

  const handleStatusSelectorChange = (id: string, status: LeadStatus) => {
    updateQueryStatus(id, status);
  };

  const formatLargeValue = (val: number) => {
    if (val >= 10000000) {
      const cr = val / 10000000;
      return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)}Cr`;
    }
    if (val >= 100000) {
      const lakh = val / 100000;
      return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)}L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight mb-2 uppercase">Deals Pipeline</h1>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Sales Funnel</Badge>
              <span className="text-[14px] text-gray-400 font-bold tracking-tight uppercase opacity-85">Drag or move deals through active negotiation</span>
            </div>
          </div>
          <div className="relative w-full md:w-[320px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              v2={true}
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-11 h-12 border rounded-xl shadow-sm text-[12px] uppercase"
            />
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            label="Active Deals"
            value={queries.filter(q => q.status !== 'Won' && q.status !== 'Lost').length}
            trend={{ value: "In Pipeline", type: "neutral" }}
          />
          <KPICard
            label="In Negotiation"
            value={queries.filter(q => q.status === 'Negotiation').length}
            trend={{ value: "High value", type: "up" }}
          />
          <KPICard
            label="Total Pipeline Value"
            value={formatLargeValue(queries.reduce((acc, q) => acc + parseBudget(q.budget), 0))}
            isCurrency={false}
            trend={{ value: "Potential", type: "up" }}
          />
          <KPICard
            label="Won Bookings"
            value={queries.filter(q => q.status === 'Won').length}
            trend={{ value: "Closed deals", type: "up" }}
          />
        </div>

        {/* Horizontal Kanban Grid */}
        <div className="flex gap-4 overflow-x-auto pb-8 items-start no-scrollbar min-h-[640px]">
          {STAGES.map(stage => {
            const stageDeals = filteredQueries.filter(q => q.status === stage.value);
            const stats = stageStats[stage.value];

            return (
              <div
                key={stage.value}
                className="w-[280px] shrink-0 bg-gray-50 border border-gray-200/80 rounded-[20px] p-4 flex flex-col max-h-[580px] shadow-sm overflow-hidden"
              >
                {/* Column Header */}
                <div className="flex items-start justify-between mb-4 border-b border-gray-200/60 pb-3">
                  <div className="text-left space-y-1">
                    <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">{stage.label}</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{stage.desc}</p>
                  </div>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-[11px] font-bold text-gray-900 shadow-inner">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Aggregate Budget Bar */}
                <div className="bg-white/60 border border-gray-200/40 rounded-lg p-2 mb-4 text-center">
                  <span className="text-[11px] font-bold text-amber-600 font-price">{formatLargeValue(stats.totalBudget)}</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase block tracking-wider mt-0.5">Value</span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 overflow-y-auto pr-1 no-scrollbar flex-1 pb-1">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className={`p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-500/50 hover:shadow-md cursor-pointer transition-all duration-200 border-t-4 ${stage.color} group relative text-left`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-tight line-clamp-1">{deal.name}</h4>
                          <Badge variant="neutral" className="text-[8px] font-bold px-1.5 py-0 uppercase shrink-0">
                            {deal.source}
                          </Badge>
                        </div>

                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-tight flex items-center gap-1.5">
                          <MapPinIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>Interest: {deal.interest}</span>
                        </div>

                        <div className="text-[12px] text-amber-600 font-bold font-price flex items-center gap-1.5">
                          <CurrencyRupeeIcon className="w-4 h-4 shrink-0" />
                          <span>{deal.budget}</span>
                        </div>

                        {/* Transition Buttons */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                          <button
                            disabled={stage.value === 'New'}
                            onClick={(e) => moveDealLeft(deal.id, deal.status, e)}
                            className="p-1 rounded-md border border-gray-100 bg-gray-50 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:hover:text-gray-400"
                          >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            Shift deal
                          </span>

                          <button
                            disabled={stage.value === 'Won'}
                            onClick={(e) => moveDealRight(deal.id, deal.status, e)}
                            className="p-1 rounded-md border border-gray-100 bg-gray-50 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:hover:text-gray-400"
                          >
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="py-12 border border-dashed border-gray-200 rounded-xl flex flex-col items-center opacity-30 text-center">
                      <InformationCircleIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Empty Stage</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details drawer */}
      <div className={`fixed top-0 right-0 h-screen w-[460px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedDealId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedDeal ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-sm font-bold text-[18px] shrink-0">
                  {selectedDeal.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedDeal.name}</h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-85">{selectedDeal.source}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm flex items-center justify-center" onClick={() => setSelectedDealId(null)}>✕</Button>
            </div>

            <div className="space-y-6">
              {/* Quick Status Selector */}
              <div className="p-5 bg-gray-50 border border-[var(--border)] rounded-md text-left space-y-2">
                <p className="text-[11px] font-bold text-gray-450 uppercase tracking-[1.5px]">Transition Funnel Status</p>
                <select
                  value={selectedDeal.status}
                  onChange={(e) => handleStatusSelectorChange(selectedDeal.id, e.target.value as LeadStatus)}
                  className="w-full h-[46px] rounded-md border border-gray-200 px-3 font-bold uppercase tracking-wider text-[12px] bg-white focus:border-amber-500/50 outline-none"
                >
                  {STAGES.map(s => (
                    <option key={s.value} value={s.value}>{s.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Details Info */}
              <div className="space-y-3">
                <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-gray-100 pb-2">
                  Deal profile
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Client Phone', value: selectedDeal.phone, icon: <PhoneIcon className="w-4 h-4" /> },
                    { label: 'Client Email', value: selectedDeal.email || 'N/A', icon: <EnvelopeIcon className="w-4 h-4" /> },
                    { label: 'Project Choice', value: selectedDeal.interest, icon: <MapPinIcon className="w-4 h-4" /> },
                    { label: 'Verified Budget', value: selectedDeal.budget, icon: <CurrencyRupeeIcon className="w-4 h-4" /> },
                    { label: 'Date Added', value: selectedDeal.date, icon: <CalendarDaysIcon className="w-4 h-4" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded-md border border-[var(--border)] shadow-sm hover:bg-gray-50 transition-none">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-gray-50 flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-inner shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</span>
                      </div>
                      <span className="text-[14.5px] font-bold text-gray-900 tracking-tight uppercase">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Note */}
              <div className="space-y-3">
                <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase">
                  Client requirement remarks
                </h3>
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-md shadow-sm text-[14px] text-amber-900 leading-relaxed font-semibold italic border-l-4 !border-l-amber-500 uppercase">
                  &quot;{selectedDeal.message || 'No additional remarks recorded.'}&quot;
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[var(--border)] flex gap-4">
              <Button
                variant="secondary"
                className="flex-1 h-[46px] font-bold uppercase tracking-wider shadow-sm rounded-md text-[12px] bg-white border"
                onClick={() => setSelectedDealId(null)}
              >
                Close
              </Button>
              <Button
                className="flex-[2] h-[46px] font-bold uppercase tracking-wider shadow-md rounded-md gap-2 text-[12px] flex items-center justify-center"
                onClick={() => { handleStatusSelectorChange(selectedDeal.id, 'Won'); setSelectedDealId(null); }}
              >
                Close Won Deal
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
