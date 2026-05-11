import React from 'react';
import { PropertyHolder, PropertyHolderInstallment } from '@/store/useStore';

interface ProfessionalReceiptProps {
  holder: PropertyHolder;
  installment: PropertyHolderInstallment;
}

const formatCurrency = (amt: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amt);
};

export const ProfessionalReceipt = ({ holder, installment }: ProfessionalReceiptProps) => {
  return (
    <div className="bg-white p-12 max-w-[800px] mx-auto border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          #printable-receipt-container { /* Allow visibility for preview */ }
        }
        @media print {
          @page { size: A4; margin: 0; }
          body * { display: none !important; }
          #printable-receipt-container, #printable-receipt-container * { display: block !important; visibility: visible !important; }
          #printable-receipt-container { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; z-index: 9999; padding: 20mm; }
          
          /* Ensure colors and backgrounds print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
      
      <div id="printable-receipt" className="space-y-16 text-left font-primary">
        {/* Header with Logo Area */}
        <div className="flex justify-between items-end border-b-4 border-[var(--gold)] pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--gold)] flex items-center justify-center text-white text-2xl font-black rounded-sm">O</div>
              <h1 className="text-5xl font-black tracking-tighter uppercase font-serif">OWNTHUM</h1>
            </div>
            <p className="text-[12px] font-bold text-[var(--gold-dk)] uppercase tracking-[6px] ml-1">Ownthum Account Record</p>
          </div>
          <div className="text-right space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-[3px] font-serif text-[var(--gold-dk)]">Professional Receipt</h2>
            <div className="border-2 border-[var(--gold)] text-[var(--gold-dk)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[2px] inline-block">
              Payment Record: v2.04
            </div>
          </div>
        </div>

        {/* Narrative Authentication Section */}
        <div className="grid grid-cols-[1fr_300px] gap-16">
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-[3px] mb-4">I. Payment Details</p>
              <h3 className="text-3xl font-black uppercase font-serif tracking-tight leading-none mb-3">{holder.name}</h3>
              <p className="text-[13px] font-medium text-black/60 leading-relaxed max-w-md">
                Details of the land owner linked with this payment record 
                designated as <strong>#{holder.id.slice(0, 10).toUpperCase()}</strong>.
              </p>
            </div>

            <div className="p-10 bg-gray-50 border border-gray-100 rounded-sm italic text-[14px] leading-relaxed text-gray-600 border-l-4 border-black">
              &quot;This certificate serves as irrevocable proof of the financial deployment authorized for the land parcel 
              shown in the main list. This payment has been checked and confirmed 
              by the Ownthum Transaction Engine.&quot;
            </div>
          </div>

          <div className="border-l border-gray-200 pl-10 space-y-8">
            <div>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-[3px] mb-2">II. Dispatch Metadata</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Parcel ID</label>
                  <span className="text-md font-bold">{holder.parcelId}</span>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Execution Date</label>
                  <span className="text-md font-bold">{installment.paidDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Total Value</label>
                  <span className="text-md font-bold text-[var(--gold-dk)]">{formatCurrency(holder.totalAmount)}</span>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-30">Outstanding Balance</label>
                  <span className="text-md font-bold text-[var(--red)]">{formatCurrency(holder.totalAmount - holder.paidAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Matrix Table */}
        <div className="pt-10">
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-[3px] mb-6">III. Financial Settlement Details</p>
          <div className="border-y-2 border-black">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-[2px] border-b border-gray-100">
                  <th className="py-6 pr-6">Payment Step and Rule</th>
                  <th className="py-6 text-right w-48">Settled Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-8 pr-6">
                    <p className="text-xl font-black uppercase tracking-tight mb-2">{installment.installmentName}</p>
                    <p className="text-[13px] text-gray-500 font-medium">Rule: {installment.condition}</p>
                  </td>
                  <td className="py-8 text-right align-top">
                    <p className="text-3xl font-black font-price">{formatCurrency(installment.amount)}</p>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[var(--bg)] border-t-2 border-black">
                  <td className="p-6 text-[12px] font-bold uppercase tracking-[4px]">Verified Settlement Total</td>
                  <td className="p-6 text-right text-2xl font-black font-price text-[var(--gold-dk)]">{formatCurrency(installment.amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Note */}
        <div className="flex gap-10 items-start pt-10">
          <div className="w-20 h-20 bg-gray-100 flex items-center justify-center grayscale scale-75 opacity-20">
            {/* Mock QR/Security Stamp */}
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-black"></div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
              This document was made by the Ownthum system. 
              Manual signatures are not required for validation within the internal check framework. 
              Forgery or unauthorized modification of this receipt is subject to legal intervention 
              in the digital record.
            </p>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-20 border-t border-gray-100 flex justify-between items-end italic">
          <div className="space-y-4 not-italic">
            <p className="text-[10px] font-bold uppercase tracking-[3px]">System Check</p>
            <div className="h-10 w-40 border-b border-black flex items-end pb-1">
               <span className="text-xs text-gray-400 font-serif">Electronic Signature Processed</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[2px]">Authentic Copy • Confidential Distribution</p>
        </div>
      </div>
    </div>
  );
};
