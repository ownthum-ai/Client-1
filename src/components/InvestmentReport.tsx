"use client";
import React from 'react';

interface InvestmentReportProps {
  data: {
    revenue: number;
    plotsSold: string;
    landCost: number;
    activeLeads: number;
    profit: number;
    recentActivities: any[];
    expenses: {
      land: number;
      material: number;
      marketing: number;
      salary: number;
      broker: number;
      assets: number;
    };
    inventory: {
      total: number;
      sold: number;
      available: number;
    };
    leads: {
      total: number;
      converted: number;
      ratio: number;
    };
  };
}

export const InvestmentReport = ({ data }: InvestmentReportProps) => {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalExpenses = Object.values(data.expenses).reduce((a, b) => a + b, 0);

  return (
    <div className="investment-report-print font-sans">
      {/* PAGE 1: STRATEGIC COVER */}
      <div className="report-page cover-page bg-white">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-[4px] bg-[#AD841F] mb-12"></div>
          <h1 className="text-[80px] font-serif text-[#002B49] leading-[0.85] tracking-tighter uppercase mb-6">
            Executive<br/>Portfolio<br/>Review
          </h1>
          <p className="text-lg text-[#AD841F] font-bold uppercase tracking-[8px] mb-10">Fiscal Audit • 2025</p>
          <div className="w-64 h-[1px] bg-gray-100 mb-12"></div>
          <div className="max-w-md text-[13px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest px-8">
            A comprehensive analytical summary of real estate assets, operational liquidity, and market acquisition velocity.
          </div>
        </div>

        <div className="pt-20 border-t border-gray-50 w-full flex flex-col items-center">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#002B49] flex items-center justify-center">
              <span className="text-[#AD841F] font-serif text-xl">O</span>
            </div>
            <div className="text-left border-l border-gray-200 pl-4">
              <p className="text-[14px] font-bold text-[#002B49] uppercase tracking-wider leading-none mb-1">Ownthum Group</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Real Estate Management</p>
            </div>
          </div>
          <div className="flex gap-12 text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">
            <span>Ref: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            <span>Date: {currentDate}</span>
          </div>
        </div>
      </div>

      {/* PAGE 2: FINANCIAL PERFORMANCE & AUDIT */}
      <div className="report-page p-20">
        <header className="flex justify-between items-start mb-24 border-b border-gray-100 pb-10">
          <div>
            <h2 className="text-4xl font-serif text-[#002B49] mb-2 uppercase tracking-tight">01. Financial Audit</h2>
            <p className="text-[11px] font-bold text-[#AD841F] uppercase tracking-[4px]">P&L Summary & Capital Allocation</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Portfolio Instance</p>
            <p className="text-[14px] font-bold text-[#002B49] tabular-nums">{currentDate}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-20 mb-20">
          <div className="space-y-12">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] mb-6">Capital Flow Dashboard</p>
              <div className="grid grid-cols-1 gap-6">
                <div className="p-10 bg-gray-50 border-l-[12px] border-[#AD841F]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Cumulative Revenue Generated</p>
                  <p className="text-5xl font-serif text-[#002B49] tracking-tighter">₹{data.revenue.toLocaleString()}</p>
                </div>
                <div className="p-10 bg-[#002B49] text-white">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Net Operational Liquidity</p>
                  <p className="text-5xl font-serif text-[#AD841F] tracking-tighter">₹{data.profit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] mb-6">Cost Center Breakdown</p>
            <div className="space-y-4">
              {[
                { label: 'Land Asset Acquisition', value: data.expenses.land },
                { label: 'Raw Material Procurement', value: data.expenses.material },
                { label: 'Marketing & Outreach', value: data.expenses.marketing },
                { label: 'Human Resource (Salaries)', value: data.expenses.salary },
                { label: 'Channel Partner Commissions', value: data.expenses.broker },
                { label: 'Infrastructure & Assets', value: data.expenses.assets },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 group">
                  <span className="text-[12px] font-medium text-gray-500 uppercase tracking-tight">{item.label}</span>
                  <span className="text-[14px] font-bold text-[#002B49] tabular-nums">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-8 mt-4">
                <div className="flex justify-between items-center p-6 bg-[#AD841F]/5 rounded-sm">
                  <span className="text-[12px] font-bold text-[#AD841F] uppercase tracking-[2px]">Total Portfolio Outflow</span>
                  <span className="text-[20px] font-serif text-[#002B49] tabular-nums">₹{totalExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-900 rounded-sm text-white text-center mt-auto">
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-[4px] mb-2">Audit Verdict</p>
          <p className="text-[16px] font-serif text-white tracking-wide uppercase italic leading-relaxed">
            &ldquo;The portfolio maintains a positive liquidity ratio with capital heavily allocated towards land asset appreciation and sales operations.&rdquo;
          </p>
        </div>
      </div>

      {/* PAGE 3: SALES DYNAMICS & SYSTEM LOG */}
      <div className="report-page p-20">
        <header className="flex justify-between items-start mb-24 border-b border-gray-100 pb-10">
          <div>
            <h2 className="text-4xl font-serif text-[#002B49] mb-2 uppercase tracking-tight">02. Market Dynamics</h2>
            <p className="text-[11px] font-bold text-[#AD841F] uppercase tracking-[4px]">Lead Conversion & Inventory Liquidity</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-16 mb-20 text-left">
          <div className="col-span-5 space-y-10">
            <h3 className="text-[12px] font-bold text-[#002B49] uppercase tracking-[3px] mb-8 border-b border-gray-100 pb-4">Sales Velocity</h3>
            <div className="p-10 bg-[#002B49] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <div className="w-32 h-32 rounded-full border-[10px] border-white"></div>
              </div>
              <div className="relative z-10">
                <p className="text-[40px] font-serif text-[#AD841F] leading-none mb-2">{data.leads.ratio}%</p>
                <p className="text-[10px] font-bold text-white uppercase tracking-[4px]">Success Ratio</p>
                <div className="h-[1px] bg-white/10 my-8"></div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Leads</p>
                    <p className="text-xl font-serif text-white">{data.leads.total}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Liquidated</p>
                    <p className="text-xl font-serif text-[#AD841F]">{data.leads.converted}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-7">
            <h3 className="text-[12px] font-bold text-[#002B49] uppercase tracking-[3px] mb-8 border-b border-gray-100 pb-4">Inventory Liquidity Matrix</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Total Portfolio Units', value: data.inventory.total },
                { label: 'Total Units Liquidated (Sold)', value: data.inventory.sold, highlight: true },
                { label: 'Available Market Inventory', value: data.inventory.available },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between items-center p-6 border ${item.highlight ? 'bg-gray-50 border-[#AD841F]/30' : 'border-gray-100'}`}>
                  <span className="text-[12px] font-bold text-[#002B49] uppercase tracking-tight">{item.label}</span>
                  <span className={`text-[18px] font-serif ${item.highlight ? 'text-[#AD841F]' : 'text-[#002B49]'}`}>{item.value} Units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-left mt-10">
          <h3 className="text-[11px] font-bold text-[#002B49] uppercase tracking-[3px] mb-8 border-b border-gray-100 pb-4 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-gray-200"></span>
            Operational Ledger • Audit Trail
          </h3>
          <div className="space-y-4">
            {data.recentActivities.map((item, i) => (
              <div key={i} className="flex gap-12 items-center py-3 border-b border-gray-50 last:border-0 opacity-80">
                <span className="text-[10px] font-bold text-gray-400 tabular-nums w-28 shrink-0 uppercase tracking-widest">{item.time}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#002B49] uppercase tracking-tight leading-none mb-1">{item.title}</p>
                  <p className="text-[10px] font-bold text-[#AD841F] uppercase tracking-[2px] opacity-70">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-24 text-center">
          <div className="flex justify-center gap-12 mb-6">
            <div className="text-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Generated Via</p>
              <p className="text-[11px] font-bold text-[#002B49] uppercase">Secure Portal v4.2</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Audit Signature</p>
              <p className="text-[11px] font-bold text-[#002B49] uppercase">Digitally Verified</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[6px]">© 2026 Ownthum Real Estate Group • Global Operations</p>
        </div>
      </div>
    </div>
  );
};
