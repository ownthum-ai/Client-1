import React from 'react';
import { SalaryRecord } from '@/store/useStore';

interface ProfessionalPayslipProps {
  salary: SalaryRecord;
}

const formatCurrency = (amt: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amt);
};

export const ProfessionalPayslip = ({ salary }: ProfessionalPayslipProps) => {
  const gross = salary.basic + salary.allowance;
  const totalDeductions = salary.advanceDeduction + salary.otherDeduction;

  return (
    <div className="bg-white p-12 max-w-[800px] mx-auto border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          #printable-payslip-container { /* Allow visibility for preview */ }
        }
        @media print {
          @page { size: A4; margin: 0; }
          body * { display: none !important; }
          #printable-payslip-container, #printable-payslip-container * { display: block !important; visibility: visible !important; }
          #printable-payslip-container { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; z-index: 9999; padding: 20mm; }
          
          /* Ensure colors and backgrounds print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
      
      <div id="printable-payslip" className="space-y-16 text-left font-primary">
        {/* Header with Logo Area */}
        <div className="flex justify-between items-end border-b-4 border-[var(--gold)] pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--gold)] flex items-center justify-center text-white text-2xl font-black rounded-sm">O</div>
              <h1 className="text-5xl font-black tracking-tighter uppercase font-serif">OWNTHUM</h1>
            </div>
            <p className="text-[12px] font-bold text-[var(--gold-dk)] uppercase tracking-[6px] ml-1">Executive Asset Management Protocol</p>
          </div>
          <div className="text-right space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-[3px] font-serif text-[var(--gold-dk)]">Official Payslip</h2>
            <div className="border-2 border-[var(--gold)] text-[var(--gold-dk)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[2px] inline-block">
              Payroll Cycle: {salary.month.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Employee Identification Section */}
        <div className="grid grid-cols-[1fr_300px] gap-16">
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-[3px] mb-4">I. Recipient Identity</p>
              <h3 className="text-3xl font-black uppercase font-serif tracking-tight leading-none mb-3">{salary.employeeName}</h3>
              <p className="text-[13px] font-bold text-black/60 tracking-[1px] uppercase mb-4">{salary.role}</p>
              <p className="text-[12px] font-medium text-black/60 leading-relaxed max-w-md italic border-l-2 border-[var(--gold)] pl-4">
                &quot;The recipient is classified as an authorized internal agent within the Ownthum Executive Framework. 
                Disbursement of funds is tied to the successful execution of contractual duties.&quot;
              </p>
            </div>
          </div>

          <div className="border-l border-gray-200 pl-10 space-y-8">
            <div>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-[3px] mb-2">II. Dispatch Metadata</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Audit Node ID</label>
                  <span className="text-md font-bold tabular-nums">NODE-{salary.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Settlement Code</label>
                  <span className="text-md font-bold">{salary.status === 'Paid' ? 'VERIFIED' : 'PENDING'}</span>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Cycle Range</label>
                  <span className="text-md font-bold">{salary.month}</span>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Attendance Metric</label>
                  <span className="text-md font-bold">{salary.days} Nodes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Matrix - Earnings & Deductions */}
        <div className="grid grid-cols-2 gap-10">
          <div>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-[3px] mb-4">III. Capital Inflow (Earnings)</p>
            <div className="border-t-2 border-black divide-y divide-gray-100">
              <div className="py-4 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-[1px]">Principal yield (Basic)</span>
                <span className="text-[14px] font-black font-price">{formatCurrency(salary.basic)}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-[1px]">Operational Variable (Allow.)</span>
                <span className="text-[14px] font-black font-price text-[var(--green)]">+{formatCurrency(salary.allowance)}</span>
              </div>
              <div className="py-4 flex justify-between items-center bg-gray-50 px-2 font-black">
                <span className="text-[11px] uppercase tracking-[2px]">Gross Result</span>
                <span className="text-[16px] font-price">{formatCurrency(gross)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-[3px] mb-4">IV. Capital Offsets (Deductions)</p>
            <div className="border-t-2 border-black divide-y divide-gray-100">
              <div className="py-4 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-[1px]">Liquidity Recoup (Advance)</span>
                <span className="text-[14px] font-black font-price text-[var(--red)]">-{formatCurrency(salary.advanceDeduction)}</span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-[1px]">Administrative Offset (Other)</span>
                <span className="text-[14px] font-black font-price text-[var(--red)]">-{formatCurrency(salary.otherDeduction)}</span>
              </div>
              <div className="py-4 flex justify-between items-center bg-gray-50 px-2 font-black">
                <span className="text-[11px] uppercase tracking-[2px]">Total Offsets</span>
                <span className="text-[16px] font-price">-{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Net Yield Summary */}
        <div className="pt-6">
            <div className="bg-black text-white p-8 rounded-sm flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[4px] mb-1">Total Verified Net Yield</p>
                <p className="text-[11px] font-medium text-white/60 mb-1">Disbursed via authorized treasury node</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black font-price tracking-tighter text-[var(--gold)]">{formatCurrency(salary.net)}</p>
              </div>
            </div>
        </div>

        {/* Signature Block */}
        <div className="pt-20 flex justify-between items-end border-t border-gray-100">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-black/40">Audit Authorization</p>
            <div className="h-12 w-48 border-b border-black flex items-end pb-1 overflow-hidden">
               <span className="text-[10px] text-gray-400 font-serif italic">Electronic Signature - OW-77421</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[3px]">Secure Document • Proprietary Protocol</p>
            <p className="text-[9px] text-gray-200">Generated by Ownthum Intelligence System v2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
