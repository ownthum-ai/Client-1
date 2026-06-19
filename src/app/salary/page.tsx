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
  UserIcon,
  ClockIcon,
  BanknotesIcon,
  FolderOpenIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

const formatCurrency = (amt: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amt);
};

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
    Array.from(new Set(salaries.map(s => s.month))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
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
    showToast(`${newStaffForm.name} added to payroll.`, 'success');
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
    showToast("Sheet exported.", 'success');
  };

  const handleBulkAuthorize = () => {
    const pending = monthlySalaries.filter(s => s.status === 'Pending');
    pending.forEach(s => updateSalaryStatus(s.id, 'Paid'));
    processPayroll(currentMonth);
    setIsBulkModalOpen(false);
    showToast(`Payroll processed for ${pending.length} staff.`, 'success');
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
    showToast(`Advance of ₹${advanceForm.amount.toLocaleString('en-IN')} for ${advanceForm.employeeName}`, 'warning');
    setAdvanceForm({ employeeName: '', amount: 0 });
  };

  const [mounted, setMounted] = React.useState(false); React.useEffect(() => { setMounted(true); }, []); if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-10 py-5 rounded-2xl shadow-2xl border-2 border-white/10 flex items-center gap-5">
            <div className={`w-3 h-3 rounded-full ${toast.type === 'warning' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
            <span className="text-[14px] font-bold tracking-tight uppercase">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="text-left">
            <h1 className="text-[var(--h1-fs)] font-bold text-[var(--text)] tracking-tight leading-tight mb-2">Payroll</h1>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Live status</Badge>
              <span className="text-[14px] text-[var(--text3)] font-bold tabular-nums tracking-tight opacity-80 uppercase">Manage staff payments and history</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 border-2 border-[var(--border)] p-1.5 rounded-2xl">
              <Select
                v2={true}
                value={currentMonth}
                onChange={e => setCurrentMonth(e.target.value)}
                className="h-10 border-none bg-transparent shadow-none px-4 min-w-[160px]"
              >
                {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <Button variant="secondary" size="default" onClick={() => setIsAdvanceModalOpen(true)} className="px-8 shadow-md rounded-xl h-[52px]">
              <BanknotesIcon className="w-5 h-5 mr-3" /> Advance
            </Button>
            <Button variant="secondary" size="default" onClick={handleExportSalarySheet} className="px-8 shadow-md rounded-xl h-[52px]">
              <ChartBarIcon className="w-5 h-5 mr-3" /> Export
            </Button>
            <div className="h-10 w-[2px] bg-[var(--border)] mx-2"></div>
            <Button size="default" onClick={() => setIsBulkModalOpen(true)} className="px-10 shadow-lg rounded-xl h-[52px]">
              <PlusIcon className="w-5 h-5 mr-3" /> Run payroll
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard label="Total amount" value={totalPayroll} trend={{ value: "Current month", type: "neutral" }} />
          <KPICard label="Paid staff" value={`${paidCount} staff`} trend={{ value: `${monthlySalaries.length} Total`, type: "neutral" }} />
          <KPICard label="Advances" value={monthlySalaries.reduce((acc, s) => acc + s.advanceDeduction, 0)} trend={{ value: "Recovered", type: "neutral" }} />
          <KPICard label="Pending pay" value={monthlySalaries.filter(s => s.status === 'Pending').reduce((acc, s) => acc + s.net, 0)} trend={{ value: "Awaiting", type: pendingCount > 0 ? "down" : "up" }} />
        </div>

        {/* Staff List */}
        <Card title="Staff list" subtitle={`Salary details for ${currentMonth}`} actions={
          <div className="relative w-80">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} v2={true} className="pl-12 h-12 border-2 rounded-xl shadow-sm" />
          </div>
        } className="p-0 overflow-hidden shadow-lg border-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                  <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Employee</th>
                  <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Days</th>
                  <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Basic</th>
                  <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Allowance</th>
                  <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Deductions</th>
                  <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Net pay</th>
                  <th className="p-[16px_32px] text-center text-[11px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border)]">
                {monthlySalaries.map(s => (
                  <tr
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedSalaryId(s.id); }}
                    className="hover:bg-gray-50 cursor-pointer transition-none"
                  >
                    <td className="p-[16px_32px]">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-amber-600 flex items-center justify-center text-[16px] font-bold border-2 border-white shadow-sm">
                          {s.employeeName[0]}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[16px] font-bold text-gray-900 tracking-tight leading-none mb-2">{s.employeeName}</span>
                          <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider opacity-80">{s.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-[16px_20px]">
                      <div className="text-[14px] font-bold text-gray-700 tabular-nums">{s.days}</div>
                    </td>
                    <td className="p-[16px_20px] text-[15px] font-bold text-gray-900 tabular-nums">₹{s.basic.toLocaleString()}</td>
                    <td className="p-[16px_20px] text-[15px] font-bold text-green-600 tabular-nums">+{s.allowance.toLocaleString()}</td>
                    <td className="p-[16px_20px] text-[15px] font-bold text-red-600 tabular-nums">
                      -{(s.advanceDeduction + s.otherDeduction).toLocaleString()}
                    </td>
                    <td className="p-[16px_20px]">
                      <span className="text-[16px] font-bold text-gray-900 tabular-nums">{formatCurrency(s.net)}</span>
                    </td>
                    <td className="p-[16px_32px] text-center">
                      <Badge variant={s.status === 'Paid' ? 'success' : 'warning'} className="px-4 py-1 text-[10px] font-bold uppercase shadow-sm tracking-widest">
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

      {/* Details Panel - Side drawer for better clarity */}
      <div className={`fixed top-0 right-0 h-screen w-[460px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedSalaryId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedSalary ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-sm shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedSalary.employeeName}</h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80">{selectedSalary.role}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm flex items-center justify-center" onClick={() => setSelectedSalaryId(null)}>✕</Button>
            </div>

            <div className="space-y-6">
              {/* Earnings Card */}
              <div className="p-5 bg-gray-900 rounded text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <BanknotesIcon className="w-16 h-16" />
                </div>
                <div className="flex justify-between items-center mb-4 relative pb-3 border-b border-white/10">
                  <span className="text-[11px] font-bold text-white/40 tracking-[2px] uppercase">Net salary pay</span>
                  <Badge variant="success" className="px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase">{selectedSalary.status}</Badge>
                </div>
                <div className="relative">
                  <p className="text-2xl font-bold tracking-tight text-amber-500 mb-1">{formatCurrency(selectedSalary.net)}</p>
                  <p className="text-[13.5px] font-bold text-white/50 uppercase tracking-[1px]">{currentMonth} · {selectedSalary.days} Days</p>
                </div>
                <Button onClick={() => setIsPreviewModalOpen(true)} className="w-full h-[42px] mt-4 bg-white/10 hover:bg-white/20 border-none text-[11px] font-bold uppercase tracking-wider shadow-md rounded">
                  View digital payslip
                </Button>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-3">
                <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-[var(--border)] pb-2 flex items-center gap-2">
                  Financial Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded border border-[var(--border)] space-y-3 shadow-inner">
                    <div className="flex justify-between items-center">
                      <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-wide">Gross basic pay</span>
                      <span className="text-[14.5px] font-bold text-gray-900 tabular-nums">₹{selectedSalary.basic.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-wide">Allowances</span>
                      <span className="text-[14.5px] font-bold text-green-600 tabular-nums">+₹{selectedSalary.allowance.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded border border-[var(--border)] space-y-3 shadow-inner">
                    <div className="flex justify-between items-center">
                      <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-wide">Advance recovery</span>
                      <span className="text-[14.5px] font-bold text-red-600 tabular-nums">-₹{selectedSalary.advanceDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-wide">Other deductions</span>
                      <span className="text-[14.5px] font-bold text-red-600 tabular-nums">-₹{selectedSalary.otherDeduction.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-[var(--border)] pb-2 flex items-center gap-2">
                  Recent history
                </h3>
                <div className="space-y-3">
                  {salaryHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-white rounded border border-[var(--border)] shadow-sm">
                      <div className="flex flex-col text-left">
                        <span className="text-[13.5px] font-bold text-gray-900 uppercase tracking-tight">{h.month}</span>
                        <span className="text-[10.5px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Released</span>
                      </div>
                      <span className="text-[14.5px] font-bold text-amber-600 tabular-nums">{formatCurrency(h.net)}</span>
                    </div>
                  ))}
                  {salaryHistory.length === 0 && (
                    <div className="p-6 text-center bg-gray-50 rounded border border-dashed border-gray-200 opacity-40">
                      <span className="text-[11px] font-bold uppercase tracking-[2px]">No history available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[var(--border)] flex gap-4">
              <Button
                variant="secondary" className="flex-1 h-[46px] font-bold uppercase tracking-wider shadow-sm rounded text-[12px]"
                onClick={() => setSelectedSalaryId(null)}
              >
                Close
              </Button>
              {selectedSalary.status !== 'Paid' && (
                <Button
                  className="flex-[2] h-[46px] font-bold uppercase tracking-wider shadow-md rounded text-[12px]"
                  onClick={() => { updateSalaryStatus(selectedSalary.id, 'Paid'); showToast(`${selectedSalary.employeeName} paid.`); }}
                >
                  Release payment
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center opacity-40">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-8 border-2 border-[var(--border)] shadow-md">
              <FolderOpenIcon className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 tracking-[4px] uppercase">No staff selected</h3>
            <p className="text-[12px] text-gray-400 mt-4 leading-relaxed font-bold uppercase tracking-widest">Select an employee from the list.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddStaffModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">New employee</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Enrollment into active payroll</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddStaffModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
              <form onSubmit={handleAddStaff} className="space-y-10 text-left">
                <div className="space-y-4">
                  <Label required>Full name</Label>
                  <Input placeholder="e.g. Sameer Khanna" required v2={true} value={newStaffForm.name} onChange={e => setNewStaffForm({ ...newStaffForm, name: e.target.value })} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px]" />
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label required>Role / Designation</Label>
                    <Input placeholder="e.g. Site Manager" required v2={true} value={newStaffForm.role} onChange={e => setNewStaffForm({ ...newStaffForm, role: e.target.value })} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px] uppercase" />
                  </div>
                  <div className="space-y-4">
                    <Label required>Basic monthly salary (₹)</Label>
                    <Input type="number" placeholder="0.00" required v2={true} value={newStaffForm.basic} onChange={e => setNewStaffForm({ ...newStaffForm, basic: e.target.value })} className="h-[56px] shadow-md rounded-2xl font-bold text-[18px] text-amber-600 font-price" />
                  </div>
                </div>

                <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 border border-gray-100 shadow-sm">
                    <InformationCircleIcon className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                    New employees are automatically enrolled in the active month&apos;s payroll cycle.
                  </p>
                </div>

                <div className="pt-6 flex gap-6">
                  <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsAddStaffModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Enroll employee</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-green-600 border-green-100 bg-green-50">
                  <BanknotesIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Run monthly payroll</h2>
                  <p className="text-[12px] text-green-600 font-bold uppercase tracking-[2px] opacity-70 leading-none">Bulk authorization engine</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsBulkModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
              <div className="p-10 bg-gray-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ChartBarIcon className="w-32 h-32" />
                </div>
                <p className="text-[18px] text-white/80 leading-relaxed font-bold tracking-tight relative z-10">
                  You are about to approve payments for <span className="text-green-400 font-black">{monthlySalaries.filter(s => s.status === 'Pending').length} pending staff</span> for
                  <span className="text-amber-500 font-black"> {currentMonth}</span>.
                </p>
                <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-white/40 tracking-[3px] uppercase relative z-10">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  System reconciliation active
                </div>
              </div>

              <div className="pt-6 flex gap-6">
                <Button variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
                <Button variant="primary" className="flex-[2] h-[56px] bg-green-600 hover:bg-green-700 border-none rounded-2xl shadow-xl font-bold uppercase tracking-widest text-white" onClick={handleBulkAuthorize}>Approve & Pay</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdvanceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <BanknotesIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Advance payment</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Add cash advance</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAdvanceModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body space-y-10">
              <form onSubmit={handleAddAdvance} className="space-y-10 text-left">
                <div className="space-y-4">
                  <Label required>Select employee</Label>
                  <Select required value={advanceForm.employeeName} onChange={e => setAdvanceForm({ ...advanceForm, employeeName: e.target.value })} className="h-[56px] shadow-md rounded-2xl font-bold text-[15px]">
                    <option value="">Select staff member...</option>
                    {salaries.filter(s => s.month === currentMonth).map(s => <option key={s.id} value={s.employeeName}>{s.employeeName} · {s.role}</option>)}
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label required>Advance amount (₹)</Label>
                  <Input required v2={true} type="number" placeholder="0.00" value={advanceForm.amount || ''} onChange={e => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })} className="h-[56px] shadow-md rounded-2xl font-bold text-amber-600 text-[20px] font-price" />
                </div>

                <div className="flex items-center gap-5 p-8 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] text-amber-700 font-bold leading-relaxed uppercase tracking-wide">
                    This advance will be automatically deducted from the employee&apos;s next salary release.
                  </p>
                </div>

                <div className="pt-6 flex gap-6">
                  <Button type="button" variant="secondary" className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsAdvanceModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl">Commit advance</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && selectedSalary && (
        <div className="modal-overlay">
          <div className="modal-container max-w-5xl shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <DocumentTextIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Digital Payslip</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Verified financial document</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsPreviewModalOpen(false)}>✕</Button>
            </div>

            <div className="modal-body bg-gray-50 p-12 overflow-y-auto max-h-[70vh]">
              <div className="bg-white rounded-[48px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border-2 border-gray-100 max-w-[800px] mx-auto">
                <ProfessionalPayslip salary={selectedSalary} />
              </div>
            </div>

            <div className="modal-footer bg-white border-t-2 border-[var(--border)] p-10">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Badge variant="success" className="px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-sm">Verified & Allowed</Badge>
                </div>
                <div className="flex gap-6">
                  <Button variant="secondary" className="h-[56px] px-12 rounded-2xl border-2 font-bold uppercase tracking-widest shadow-md bg-white" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
                  <Button variant="primary" className="h-[56px] px-12 rounded-2xl shadow-xl font-bold uppercase tracking-widest flex items-center gap-4" onClick={() => { window.print(); }}>
                    <ArrowDownTrayIcon className="w-6 h-6" /> Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-12 right-12 z-[400]">
        <Button className="h-20 w-20 !p-0 rounded-[28px] shadow-2xl flex items-center justify-center bg-gray-900 text-white border-none ring-[12px] ring-black/5 hover:scale-110 transition-transform" onClick={() => setIsAddStaffModalOpen(true)}>
          <PlusIcon className="w-10 h-10" />
        </Button>
      </div>
    </>
  );
}
