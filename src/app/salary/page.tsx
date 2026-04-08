"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ProfessionalPayslip } from '@/components/ProfessionalPayslip';
import { exportToCSV } from '@/utils/export';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  UserIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
  FolderOpenIcon,
  ChartBarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const formatCurrency = (amt: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amt);
};

// Custom Select for Month Filters
const MonthFilter = ({ 
  months, 
  value, 
  onChange 
}: { 
  months: string[], 
  value: string, 
  onChange: (val: string) => void 
}) => (
  <div className="flex bg-[var(--bg)] border border-[var(--border)] p-1.5 rounded-xl mr-2 shadow-sm">
    {months.slice(0, 3).map((month) => (
      <button 
        key={month}
        onClick={() => onChange(month)}
        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[1.5px] transition-all leading-none
          ${value === month ? 'bg-white text-[var(--text)] shadow-sm ring-1 ring-black/5' : 'text-[var(--text3)] hover:text-[var(--text)] opacity-40 hover:opacity-100'}`}
      >
        {month}
      </button>
    ))}
  </div>
);

export default function StaffSalaryPage() {
  const { salaries, updateSalaryStatus, addSalary, processPayroll, addSalaryAdvance, salaryAdvances } = useStore();
  const [selectedSalaryId, setSelectedSalaryId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear()
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string, type?: 'success' | 'warning' } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({ employeeName: '', amount: 0 });

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // New Staff Form State
  const [newStaffForm, setNewStaffForm] = useState({ name: '', role: '', basic: '' });

  // Available months
  const availableMonths = useMemo(() => 
    Array.from(new Set(salaries.map(s => s.month))).sort((a,b) => new Date(b).getTime() - new Date(a).getTime())
  , [salaries]);
  
  // Filter for current month and search
  const monthlySalaries = useMemo(() => 
    salaries.filter(s => s.month === currentMonth && s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
  , [salaries, currentMonth, searchTerm]);

  const selectedSalary = useMemo(() => salaries.find(s => s.id === selectedSalaryId), [salaries, selectedSalaryId]);
  
  // History for comparison (last 3 months)
  const salaryHistory = useMemo(() => selectedSalary 
    ? salaries.filter(s => s.employeeName === selectedSalary.employeeName && s.id !== selectedSalary.id && s.month !== currentMonth)
        .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
        .slice(0, 3)
    : []
  , [salaries, selectedSalary, currentMonth]);

  const totalPayroll = monthlySalaries.reduce((acc, s) => acc + s.net, 0);
  const paidCount = monthlySalaries.filter(s => s.status === 'Paid').length;
  const pendingCount = monthlySalaries.length - paidCount;

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const basicValue = Number(newStaffForm.basic);
    addSalary({
      employeeName: newStaffForm.name,
      role: newStaffForm.role,
      basic: basicValue,
      days: '0/26',
      allowance: 0,
      advanceDeduction: 0,
      otherDeduction: 0,
      net: basicValue,
      status: 'Pending',
      month: currentMonth
    });
    setIsAddStaffModalOpen(false);
    setNewStaffForm({ name: '', role: '', basic: '' });
    showToast(`${newStaffForm.name} registered in payroll node.`, 'success');
  };

  const handleExportSalarySheet = () => {
    const dataToExport = monthlySalaries.map(s => ({
      'Employee Name': s.employeeName,
      'Role': s.role,
      'Month': s.month,
      'Days': s.days,
      'Basic': s.basic,
      'Allowance': s.allowance,
      'Advance Deduction': s.advanceDeduction,
      'Other Deduction': s.otherDeduction,
      'Net Salary': s.net,
      'Status': s.status
    }));
    exportToCSV(dataToExport, `Salary_Sheet_${currentMonth.replace(' ', '_')}.csv`);
    showToast("Salary sheet exported successfully.", 'success');
  };

  const handleBulkAuthorize = () => {
    const pending = monthlySalaries.filter(s => s.status === 'Pending');
    pending.forEach(s => updateSalaryStatus(s.id, 'Paid'));
    processPayroll(currentMonth);
    setIsBulkModalOpen(false);
    showToast(`Payroll processed for ${pending.length} nodes — ₹${totalPayroll.toLocaleString('en-IN')}`, 'success');
  };

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear();
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    addSalaryAdvance({
      employeeName: advanceForm.employeeName,
      amount: advanceForm.amount,
      date: timestamp,
      month
    });
    setIsAdvanceModalOpen(false);
    showToast(`Advance of ₹${advanceForm.amount.toLocaleString('en-IN')} recorded for ${advanceForm.employeeName}`, 'warning');
    setAdvanceForm({ employeeName: '', amount: 0 });
  };

  return (
    <>
      <div className={`space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left transition-all duration-700 ease-in-out ${selectedSalaryId ? 'pr-[480px]' : ''}`} onClick={() => !selectedSalaryId && setSelectedSalaryId(null)}>
        {/* V2 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Staff Salary</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider leading-none">
                <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                LIVE OPERATIONAL STREAM
              </span>
              <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50 underline decoration-dotted">Payroll management & itemized disbursement logs</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MonthFilter months={availableMonths} value={currentMonth} onChange={setCurrentMonth} />
            <Button v2={true} variant="secondary" onClick={() => setIsAdvanceModalOpen(true)} className="px-6 rounded-lg bg-white border-[var(--border)] shadow-sm text-[10px] uppercase font-black tracking-widest">
              <BanknotesIcon className="w-4 h-4 mr-2" /> Advance
            </Button>
            <Button v2={true} variant="secondary" onClick={handleExportSalarySheet} className="px-6 rounded-lg bg-white border-[var(--border)] shadow-sm text-[10px] uppercase font-black tracking-widest">
              <ChartBarIcon className="w-4 h-4 mr-2" /> Salary Sheet
            </Button>
            <Button v2={true} onClick={() => setIsBulkModalOpen(true)} className="px-8 shadow-lg shadow-black/10 rounded-lg text-[10px] uppercase font-black tracking-widest">
              <PlusIcon className="w-4 h-4 mr-2" /> Process Payroll
            </Button>
          </div>
        </div>

        {/* KPI Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard label="CUMULATIVE PAYROLL" value={formatCurrency(totalPayroll)} trend={{ value: "Current Month", type: "neutral" }} color="blue" />
          <KPICard label="AUTHORIZED NODES" value={`${paidCount} Employees`} trend={{ value: `${monthlySalaries.length} Total`, type: "neutral" }} color="green" />
          <KPICard label="ADVANCE RECOUP" value={formatCurrency(monthlySalaries.reduce((acc, s) => acc + s.advanceDeduction, 0))} trend={{ value: "Auto-Recovered", type: "neutral" }} color="amber" />
          <KPICard label="IN-PIPELINE" value={formatCurrency(monthlySalaries.filter(s => s.status === 'Pending').reduce((acc, s) => acc + s.net, 0))} trend={{ value: "Pending Auth", type: pendingCount > 0 ? "down" : "up" }} color="red" />
        </div>

        {/* Payroll Ledger Table */}
        <Card className="p-0 overflow-hidden border-[var(--border)] shadow-sm bg-white text-left">
          <div className="p-8 border-b border-[var(--border)] bg-[#F8F7F4]/50 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--text)] uppercase tracking-tight leading-none mb-1.5">Payroll Detail Journal</h2>
              <p className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-40 leading-none">Cycle {currentMonth} engineering disbursements</p>
            </div>
            <div className="relative group w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10 opacity-50" />
              <Input placeholder="SEARCH STAFF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} v2={true} className="pl-10 h-10 border-[var(--border)] rounded-lg shadow-sm font-black uppercase text-[10px] tracking-widest" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[var(--border)]">
                  <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Employee Identity</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Attendance Node</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Principal</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Allowances</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Deductions</th>
                  <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Net Trajectory</th>
                  <th className="p-[12px_24px] text-center text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1.5px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {monthlySalaries.map(s => (
                  <tr 
                    key={s.id} 
                    onClick={(e) => { e.stopPropagation(); setSelectedSalaryId(s.id); }}
                    className={`group cursor-pointer hover:bg-[#F8F7F4] transition-all ${selectedSalaryId === s.id ? 'bg-[#F8F7F4]' : ''}`}
                  >
                    <td className="p-[12px_24px]">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[var(--gold-lt)] text-[var(--gold)] flex items-center justify-center text-[11px] font-black border border-[var(--border)] shadow-sm transform group-hover:scale-110 transition-transform">
                          {s.employeeName[0]}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[14px] font-bold text-[var(--text)] uppercase tracking-tight leading-none group-hover:text-[var(--gold)] transition-colors mb-1.5">{s.employeeName}</span>
                          <span className="text-[9px] text-[var(--text3)] font-black uppercase tracking-[1px] opacity-40 leading-none">{s.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-[12px_15px]">
                      <div className="text-[12px] font-black text-[var(--text)] tabular-nums uppercase leading-none">{s.days}</div>
                    </td>
                    <td className="p-[12px_15px] text-[14px] font-black text-[var(--text)] tabular-nums">{s.basic.toLocaleString()}</td>
                    <td className="p-[12px_15px] text-[14px] font-black text-[var(--green)] tabular-nums">+{s.allowance.toLocaleString()}</td>
                    <td className="p-[12px_15px] text-[14px] font-black text-[var(--red)] tabular-nums">
                      -{(s.advanceDeduction + s.otherDeduction).toLocaleString()}
                    </td>
                    <td className="p-[12px_15px]">
                       <span className="text-[15px] font-black text-[var(--text)] tabular-nums">{formatCurrency(s.net)}</span>
                    </td>
                    <td className="p-[12px_24px] text-center">
                      <Badge variant={s.status === 'Paid' ? 'success' : 'warning'} className="text-[9px] font-black px-3 py-1 shadow-sm uppercase tracking-widest leading-none">
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Fixed elements outside the animated container */}
      {/* Modals outside the animated container avoid the 'containing block' trap */}
      {selectedSalaryId && (
        <div className="modal-overlay">
          <div className="modal-container">
            {selectedSalary ? (
              <>
                <div className="modal-header">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm leading-none">
                         <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                         <h2 className="text-[18px] font-black text-[var(--text)] uppercase tracking-tight leading-none mb-1.5">{selectedSalary.employeeName}</h2>
                         <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-40 leading-none">Functional Grade: {selectedSalary.role}</p>
                      </div>
                   </div>
                   <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setSelectedSalaryId(null)}>✕</Button>
                </div>
                <div className="modal-body space-y-10">
                  <div className="grid grid-cols-2 gap-5">
                    <Button
                      variant="secondary" v2={true}
                      className="!bg-[var(--gold-lt)] !border-[var(--gold)]/20 !text-[var(--gold-dk)] hover:!bg-[var(--gold)] hover:!text-white h-14 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-sm"
                      onClick={() => window.location.href = `tel:9988776655`}
                    >
                      <span className="text-xl">📞</span>
                      <span className="text-[10px] font-black uppercase tracking-[2px]">Contact</span>
                    </Button>
                    <Button
                      variant="secondary" v2={true}
                      className="!bg-[#e8fbf0] !border-[#10b981]/20 !text-[#10b981] hover:!bg-[#10b981] hover:!text-white h-14 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-sm"
                      onClick={() => window.open(`https://wa.me/9988776655`, '_blank')}
                    >
                      <span className="text-xl">💬</span>
                      <span className="text-[10px] font-black uppercase tracking-[2px]">Sync</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    {[
                      { label: 'Status', val: <Badge variant={selectedSalary.status === 'Paid' ? 'success' : 'warning'} className="text-[8px] font-black px-2">{selectedSalary.status}</Badge> },
                      { label: 'Attendance', val: <span className="text-[13px] font-black text-[var(--text)] tabular-nums">{selectedSalary.days}</span> },
                      { label: 'Cycle Node', val: <span className="text-[11px] font-black text-[var(--gold-dk)] tabular-nums">#{selectedSalary.id.slice(0, 4)}</span> }
                    ].map((stat, i) => (
                      <div key={i} className="p-5 bg-[#F8F7F4] rounded-2xl border border-[var(--border)] text-center shadow-inner group hover:bg-white hover:border-[var(--gold)]/30 transition-all">
                        <span className="text-[8px] font-black text-[var(--text3)] uppercase block mb-3 opacity-40 tracking-[2px]">{stat.label}</span>
                        {stat.val}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5">
                    <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[4px] opacity-40 ml-1">Capital Disbursement Logic</p>
                    <Card className="bg-[var(--sb)] rounded-[32px] p-10 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
                      <div className="absolute -right-16 -bottom-16 opacity-[0.05] group-hover:scale-125 transition-all duration-1000 rotate-12 pointer-events-none text-[var(--gold)]">
                        <BanknotesIcon className="w-[200px] h-[200px]" />
                      </div>
                      <div className="flex justify-between items-start mb-12 relative z-10 text-left">
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold text-white/40 uppercase tracking-[4px]">Verified Net Yield</p>
                           <p className="text-4xl font-black tracking-tighter leading-none font-serif text-[var(--gold)]">{formatCurrency(selectedSalary.net)}</p>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                           <p className="text-[10px] font-black tracking-[3px] uppercase leading-none">{currentMonth}</p>
                        </div>
                      </div>
                      <Button v2={true} onClick={() => setIsPreviewModalOpen(true)} className="w-full !py-5 uppercase tracking-[4px] shadow-2xl text-[11px] font-black bg-[var(--gold)] hover:bg-[var(--gold-dk)] border-none">
                        Generate Node Document
                      </Button>
                    </Card>
                  </div>

                  <div className="space-y-8">
                     <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 px-1">
                       <h3 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[3px]">Itemized Registry</h3>
                       <span className="text-[9px] font-black text-[var(--gold)] opacity-50 uppercase tracking-widest leading-none">Core Logic V2</span>
                     </div>
                     <div className="space-y-6">
                        <div className="p-8 bg-[#F8F7F4] rounded-[32px] border border-[var(--border)] space-y-6 group hover:bg-white hover:border-[var(--gold)]/30 transition-all shadow-inner hover:shadow-lg">
                          <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[4px] opacity-40 mb-2 leading-none italic underline decoration-dotted decoration-black/10">I. Inflow Matrix</p>
                          <div className="flex justify-between items-center text-[14px]">
                            <span className="font-bold text-[var(--text3)] uppercase tracking-tight opacity-60">Principal Yield</span>
                            <span className="font-black text-[var(--text)] tabular-nums">{formatCurrency(selectedSalary.basic)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[14px]">
                            <span className="font-bold text-[var(--text3)] uppercase tracking-tight opacity-60">Variable Allowance</span>
                            <span className="font-black text-[var(--green)] tabular-nums">+{formatCurrency(selectedSalary.allowance)}</span>
                          </div>
                        </div>
                        <div className="p-8 bg-[#F8F7F4] rounded-[32px] border border-[var(--border)] space-y-6 group hover:bg-white hover:border-[var(--gold)]/30 transition-all shadow-inner hover:shadow-lg">
                          <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[4px] opacity-40 mb-2 leading-none italic underline decoration-dotted decoration-black/10">II. Offset Protocols</p>
                          <div className="flex justify-between items-center text-[14px]">
                            <span className="font-bold text-[var(--text3)] uppercase tracking-tight opacity-60">Liquidity Recoup</span>
                            <span className="font-black text-[var(--red)] tabular-nums">-{formatCurrency(selectedSalary.advanceDeduction)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[14px]">
                            <span className="font-bold text-[var(--text3)] uppercase tracking-tight opacity-60">Admin Offset</span>
                            <span className="font-black text-[var(--red)] tabular-nums">-{formatCurrency(selectedSalary.otherDeduction)}</span>
                          </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8 pb-10">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 px-1">
                       <h3 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[3px]">Audit Registry history</h3>
                       <span className="text-[9px] font-black text-[var(--text3)] opacity-40 uppercase tracking-widest leading-none">Live Trace</span>
                     </div>
                    <div className="relative space-y-8 pl-8 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-0 before:w-1 before:bg-[#F8F7F4] before:rounded-full">
                      {salaryHistory.map((h, i) => (
                        <div key={i} className="relative group/node text-left">
                          <div className="absolute -left-[29px] top-2 w-5 h-5 rounded-full border-4 border-white shadow-md bg-[var(--gold)] transition-transform group-hover/node:scale-125"></div>
                          <div className="bg-[#F8F7F4] p-6 rounded-[28px] border border-[var(--border)] group-hover/node:bg-white group-hover/node:border-[var(--gold)]/30 group-hover/node:shadow-xl transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                               <p className="text-[12px] font-black text-[var(--text)] uppercase tracking-[1.5px] leading-none">{h.month}</p>
                               <Badge variant="success" className="text-[9px] font-black px-2 py-0 shadow-sm uppercase leading-none tracking-widest">VERIFIED</Badge>
                            </div>
                            <p className="text-[13px] font-black text-[var(--gold-dk)] tabular-nums leading-none italic opacity-80">{formatCurrency(h.net)} NET DISBURSEMENT</p>
                          </div>
                        </div>
                      ))}
                      {salaryHistory.length === 0 && (
                        <div className="text-center py-16 bg-[#F8F7F4]/50 border-2 border-dashed border-[var(--border)] rounded-[32px] opacity-30 italic text-[11px] font-black uppercase tracking-[3px]">
                          Zero Historical Trace Detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer flex gap-3">
                  {selectedSalary.status !== 'Paid' && (
                    <Button v2={true} onClick={() => { updateSalaryStatus(selectedSalary.id, 'Paid'); showToast(`${selectedSalary.employeeName} authorized.`); }} className="w-full !py-5 shadow-2xl shadow-black/20 text-[11px] font-black uppercase tracking-[4px] bg-[#1e2a4a] hover:bg-black border-none">
                      AUTHORIZE DISBURSEMENT NODE
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setSelectedSalaryId(null)} className="flex-1">Dismiss Registry</Button>
                </div>
              </>
            ) : (
              <div className="p-20 text-center opacity-20 grayscale flex flex-col items-center">
                  <FolderOpenIcon className="w-32 h-32 mb-10 text-[var(--text)]" />
                  <h3 className="text-[20px] font-black text-[var(--text)] uppercase tracking-[8px]">Protocol Lock</h3>
                  <p className="text-[12px] text-[var(--text3)] mt-6 leading-relaxed font-bold uppercase tracking-[2px] max-w-[280px]">Select a disbursement node from the ledger.</p>
                  <Button variant="secondary" onClick={() => setSelectedSalaryId(null)} className="mt-8">Close</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {isAddStaffModalOpen && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container max-w-xl animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)] leading-none">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase leading-none mb-1.5">Employment Onboarding</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] opacity-60 leading-none">Register new nodal agent in payroll</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsAddStaffModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddStaff} className="modal-body space-y-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Legal Identity Moniker</label>
                <Input placeholder="FULL LEGAL NAME..." required v2={true} value={newStaffForm.name} onChange={e => setNewStaffForm({...newStaffForm, name: e.target.value})} className="h-12 shadow-sm font-black uppercase tracking-widest italic" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Functional Grade</label>
                  <Input placeholder="DESIGNATION..." required v2={true} value={newStaffForm.role} onChange={e => setNewStaffForm({...newStaffForm, role: e.target.value})} className="h-12 shadow-sm font-black uppercase tracking-widest italic" />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Base Capital Yield (₹)</label>
                  <Input type="number" placeholder="00,000" required v2={true} value={newStaffForm.basic} onChange={e => setNewStaffForm({...newStaffForm, basic: e.target.value})} className="h-12 shadow-sm font-black tabular-nums" />
                </div>
              </div>
              <div className="modal-footer flex gap-5 pt-4 px-0 border-none bg-transparent">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12" onClick={() => setIsAddStaffModalOpen(false)}>Abort Protocol</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 shadow-xl shadow-gold-500/20">Initialize Agent</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container max-w-xl animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--green-lt)] rounded-xl flex items-center justify-center border border-[var(--green)]/20 shadow-sm text-[var(--green)] leading-none">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase leading-none mb-1.5">Cycle Authorization</h2>
                  <p className="text-[10px] text-[var(--green)] font-black uppercase tracking-[2.5px] leading-none opacity-60">Bulk disbursement finalization</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsBulkModalOpen(false)}>✕</Button>
            </div>
            <div className="modal-body space-y-10">
              <div className="p-8 bg-[#F8F7F4] rounded-[32px] border border-dashed border-[var(--border)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--green)]/5 rounded-bl-full blur-2xl"></div>
                <p className="text-[15px] text-[var(--text2)] leading-relaxed font-bold uppercase tracking-tight relative z-10">
                  You are authorizing <span className="text-[var(--green)] font-black underline decoration-dotted decoration-current">{monthlySalaries.filter(s => s.status === 'Pending').length} pending</span> spectral nodes for 
                  the <span className="font-bold">{currentMonth}</span> cycle. This action marks all assets as <strong className="text-[var(--green)] font-black tracking-widest text-[13px] bg-white px-3 py-1 rounded-lg shadow-sm border border-[var(--green)]/10">VERIFIED</strong> in the ledger.
                </p>
              </div>
              <div className="modal-footer flex gap-5 px-0 border-none bg-transparent">
                <Button v2={true} variant="secondary" className="flex-1 h-14" onClick={() => setIsBulkModalOpen(false)}>Abort Phase</Button>
                <Button v2={true} className="flex-[2] h-14 bg-[var(--green)] hover:bg-[var(--green-dk)] shadow-green-500/20" onClick={handleBulkAuthorize}>Authorize Cycle Nodes</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdvanceModalOpen && (
        <div className="modal-overlay animate-in fade-in duration-300">
          <div className="modal-container max-w-xl animate-in zoom-in-95 duration-300">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm text-amber-600 leading-none">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase leading-none mb-1.5">Advance Protocol</h2>
                  <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2.5px] leading-none opacity-60">Register liquidity disbursement node</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsAdvanceModalOpen(false)}>✕</Button>
            </div>
            <form onSubmit={handleAddAdvance} className="modal-body space-y-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Target Agent</label>
                <select required value={advanceForm.employeeName} onChange={e => setAdvanceForm({ ...advanceForm, employeeName: e.target.value })} className="w-full h-12 px-5 rounded-xl border border-[var(--border)] bg-[#F8F7F4]/50 focus:border-[var(--gold)] outline-none font-black text-[13px] uppercase tracking-widest shadow-sm">
                  <option value="">SELECT TARGET AGENT...</option>
                  {salaries.filter(s => s.month === currentMonth).map(s => <option key={s.id} value={s.employeeName}>{s.employeeName} — {s.role}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2.5px] px-1">Monetary Volume (₹)</label>
                <Input required v2={true} type="number" placeholder="0.00" value={advanceForm.amount || ''} onChange={e => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })} className="h-12 shadow-sm font-black text-amber-600 tabular-nums" />
              </div>
              {advanceForm.employeeName && advanceForm.amount > 0 && (
                <div className="p-6 bg-amber-50 rounded-[28px] border border-amber-100 flex items-start gap-4 italic font-bold text-[10px] tracking-[1px] text-amber-700 animate-in slide-in-from-top-4 duration-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0 animate-pulse"></div>
                  <p className="uppercase leading-relaxed">PROTOCOL: LIQUIDITY WILL BE AUTO-RECOUPED FROM SUBSEQUENT PAYROLL CYCLE REGISTRY.</p>
                </div>
              )}
              <div className="modal-footer flex gap-5 pt-4 px-0 border-none bg-transparent">
                <Button type="button" variant="secondary" v2={true} className="flex-1 h-12" onClick={() => setIsAdvanceModalOpen(false)}>Abort</Button>
                <Button type="submit" v2={true} className="flex-[2] h-12 bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 font-black tracking-[4px]">Execute Advance</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewModalOpen && selectedSalary && (
        <div className="modal-overlay">
          <div className="modal-container max-w-4xl">
            <div className="modal-header">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-2xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)] leading-none">
                   <DocumentTextIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-black text-[var(--text)] tracking-tight uppercase leading-none mb-2">Disbursement Document</h2>
                  <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[4px] leading-none opacity-80 underline decoration-dotted decoration-[var(--gold)]/30">Nodal Status: Finalized Registry</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)] h-8 w-8" onClick={() => setIsPreviewModalOpen(false)}>✕</Button>
            </div>
            <div className="modal-body overflow-y-auto">
              <div className="bg-white shadow-[0_30px_70px_rgba(0,0,0,0.1)] transform origin-top scale-[0.8] -my-16 mx-auto rounded-[32px] overflow-hidden border border-black/5 ring-1 ring-black/5">
                <ProfessionalPayslip salary={selectedSalary} />
              </div>
            </div>
            <div className="modal-footer flex justify-between items-center text-left px-0 border-none bg-transparent pt-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-[var(--green)] shadow-[0_0_10px_var(--green)]"></div>
                <span className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[3px] opacity-60">Verified Financial Token Authorized</span>
              </div>
              <div className="flex gap-5">
                <Button variant="secondary" v2={true} className="h-12 px-8" onClick={() => setIsPreviewModalOpen(false)}>Dismiss</Button>
                <Button v2={true} onClick={() => { window.print(); setIsPreviewModalOpen(false); }} className="h-12 px-10 bg-[#1e2a4a] text-white flex items-center gap-4 text-[11px] border-none shadow-2xl">
                  <ArrowDownTrayIcon className="w-5 h-5" /> Dispatch Node
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Agent Button */}
      {!selectedSalaryId && (
        <div className="fixed bottom-12 right-12 z-[400] animate-in slide-in-from-bottom-10 duration-700">
          <Button v2={true} className="h-20 w-20 !p-0 rounded-full shadow-[0_20px_50px_rgba(196,160,82,0.4)] flex items-center justify-center bg-[var(--gold)] text-white hover:scale-110 active:scale-95 transition-all border-none ring-4 ring-white/20 group">
            <PlusIcon className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" onClick={() => setIsAddStaffModalOpen(true)} />
          </Button>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] text-white px-10 py-5 rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex items-center gap-5 animate-in fade-in slide-in-from-bottom-8 transition-all ring-1 ring-white/10 ${toast.type === 'warning' ? 'bg-amber-600' : 'bg-[#1e2a4a]'}`}>
          <div className={`w-3 h-3 rounded-full ${toast.type === 'warning' ? 'bg-white animate-pulse shadow-[0_0_10px_white]' : 'bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]'}`}></div>
          <span className="text-[11px] font-black uppercase tracking-[4px] whitespace-nowrap">{toast.message}</span>
        </div>
      )}
    </>
  );
}
