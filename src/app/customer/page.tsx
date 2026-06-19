"use client";
import React, { useState, useMemo } from 'react';
import { useStore, Query, Payment } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { KPICard } from '@/components/ui/KPICard';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  HomeIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function CustomersPage() {
  const { queries, payments, followUps, addFollowUpInteraction } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Interaction notes logger state
  const [newNote, setNewNote] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Filter won queries (Customers)
  const customersList = useMemo(() => {
    return queries.filter(q => q.status === 'Won' || q.status === 'Converted');
  }, [queries]);

  // Search filtered customers
  const filteredCustomers = useMemo(() => {
    return customersList.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.interest && c.interest.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customersList, searchTerm]);

  const selectedCustomer = useMemo(() => {
    return customersList.find(c => c.id === selectedCustomerId);
  }, [customersList, selectedCustomerId]);

  // Aggregate stats
  const totalCollections = useMemo(() => {
    return payments.filter(p => p.status === 'Complete').reduce((acc, curr) => acc + curr.amount, 0);
  }, [payments]);

  const customerPayments = useMemo(() => {
    if (!selectedCustomer) return [];
    return payments.filter(p => p.customerName.toLowerCase() === selectedCustomer.name.toLowerCase());
  }, [payments, selectedCustomer]);

  const customerTotalPaid = useMemo(() => {
    return customerPayments.filter(p => p.status === 'Complete').reduce((acc, curr) => acc + curr.amount, 0);
  }, [customerPayments]);

  const customerTotalBalance = useMemo(() => {
    const firstPayment = customerPayments[0];
    return firstPayment ? firstPayment.balanceDue : 0;
  }, [customerPayments]);

  // Resolve matching followUps history interactions
  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    const followUp = followUps.find(f => f.phone === selectedCustomer.phone || f.customerName.toLowerCase() === selectedCustomer.name.toLowerCase());
    return followUp ? followUp.interactions : [];
  }, [followUps, selectedCustomer]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    const followUp = followUps.find(f => f.phone === selectedCustomer.phone || f.customerName.toLowerCase() === selectedCustomer.name.toLowerCase());
    if (followUp) {
      addFollowUpInteraction(followUp.id, {
        type: 'Call',
        outcome: 'Interested',
        notes: newNote
      });
      setNewNote('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
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
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight mb-2 uppercase">Customers Ledger</h1>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Sales Completed</Badge>
              <span className="text-[14px] text-gray-400 font-bold tracking-tight uppercase opacity-85">Client records, plots ownership and payments ledger</span>
            </div>
          </div>
          <div className="relative w-full md:w-[320px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              v2={true}
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-11 h-12 border rounded-xl shadow-sm text-[12px] uppercase"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            label="Total Customers"
            value={customersList.length}
            trend={{ value: "Closed Won", type: "neutral" }}
          />
          <KPICard
            label="Total Collection"
            value={totalCollections}
            isCurrency={true}
            trend={{ value: "Received in bank", type: "up" }}
          />
          <KPICard
            label="Booked Properties"
            value={queries.filter(q => q.status === 'Won').length}
            trend={{ value: "Allocated plots", type: "neutral" }}
          />
          <KPICard
            label="Milestone Progress"
            value="89%"
            trend={{ value: "Construction avg", type: "up" }}
          />
        </div>

        {/* Data Grid */}
        <Card title="Customers List" subtitle="Verify billing and property occupancy records" className="p-0 overflow-hidden shadow-lg border-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-[var(--border)]">
                  <th className="p-[16px_32px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Customer</th>
                  <th className="p-[16px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Booked Plot</th>
                  <th className="p-[16px_20px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Phone Number</th>
                  <th className="p-[16px_20px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Collected</th>
                  <th className="p-[16px_32px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="p-[16px_32px]">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-amber-600 flex items-center justify-center text-[15px] font-bold shadow-sm border border-white">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-gray-900 uppercase tracking-tight leading-none mb-1">{customer.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{customer.email || 'No email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-[16px_20px]">
                      <span className="text-[13px] font-bold text-gray-700 uppercase tracking-tight">Plot {customer.interest}</span>
                    </td>
                    <td className="p-[16px_20px] tabular-nums font-semibold text-gray-500 text-[13px]">
                      {customer.phone}
                    </td>
                    <td className="p-[16px_20px] text-right">
                      <span className="text-[14px] font-bold text-emerald-600 font-price">
                        {formatCurrency(payments.filter(p => p.customerName.toLowerCase() === customer.name.toLowerCase() && p.status === 'Complete').reduce((a, c) => a + c.amount, 0))}
                      </span>
                    </td>
                    <td className="p-[16px_32px] text-right">
                      <Badge variant="success" className="px-3 py-1 text-[9px] font-bold uppercase shadow-sm">Active owner</Badge>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-32 text-center text-gray-400 font-bold uppercase italic tracking-widest">
                      Awaiting Query Conversions / Won Bookings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Details drawer */}
      <div className={`fixed top-0 right-0 h-screen w-[460px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedCustomerId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedCustomer ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-sm font-bold text-[18px] shrink-0">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedCustomer.name}</h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-85">Owner profile</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm flex items-center justify-center" onClick={() => setSelectedCustomerId(null)}>✕</Button>
            </div>

            <div className="space-y-6">
              {/* Plot Allocation widget */}
              <div className="p-5 bg-gray-900 rounded text-white shadow-2xl relative overflow-hidden text-left border-none">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <span className="text-[11px] font-bold text-white/45 tracking-[1.5px] uppercase">Property Booked</span>
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-none px-2.5 py-1 text-[10px] font-bold uppercase">Plot Occupied</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-white/35 uppercase tracking-[1.5px] mb-1">Unit Number</p>
                    <p className="text-[16px] font-bold text-white uppercase tracking-tight flex items-center gap-2">
                      <HomeIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      Plot {selectedCustomer.interest}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-white/35 uppercase tracking-[1.5px] mb-1">Balance outstanding</p>
                    <p className="text-[16px] font-bold text-amber-500 font-price">{formatCurrency(customerTotalBalance)}</p>
                  </div>
                </div>
              </div>

              {/* Installments Ledger */}
              <div className="space-y-3">
                <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-gray-50 pb-2">
                  Collection installments (Milestones)
                </h3>
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                  {customerPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded border border-gray-150 shadow-inner">
                      <div className="flex items-center gap-3 text-left">
                        <CreditCardIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[14.5px] font-bold text-gray-800 uppercase tracking-tight">{p.installmentName || 'Booking token'}</span>
                          <span className="text-[10.5px] text-gray-400 font-bold uppercase tracking-wider">{p.date} via {p.mode}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[14.5px] font-bold text-gray-900 font-price">{formatCurrency(p.amount)}</span>
                        <Badge variant={p.status === 'Complete' ? 'success' : 'warning'} className="text-[9px] font-bold px-2 py-0.5 uppercase">
                          {p.status === 'Complete' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {customerPayments.length === 0 && (
                    <p className="text-[12.5px] text-gray-400 font-bold uppercase italic text-center py-3">No payment records logged.</p>
                  )}
                </div>
              </div>

              {/* Interactions History */}
              <div className="space-y-3">
                <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-gray-50 pb-2">
                  Client Logs history
                </h3>
                
                {/* Logger Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    required
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Log a client callback notes..."
                    className="w-full px-3 py-2 rounded border border-gray-250 bg-gray-50 focus:border-amber-500/30 outline-none text-[13px] min-h-[64px] font-semibold uppercase tracking-tight shadow-inner"
                  />
                  <Button type="submit" className="h-[42px] px-4 text-[11px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5">
                    <PlusIcon className="w-3.5 h-3.5" /> Save Timeline Log
                  </Button>
                </form>

                {/* Timeline list */}
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                  {customerHistory.map((h) => (
                    <div key={h.id} className="bg-white p-3.5 rounded border border-gray-100 shadow-sm relative text-left">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-left">
                          <span className="text-[14px] font-bold text-gray-900 uppercase tracking-tight block">{h.type}</span>
                          <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block opacity-75">{h.date}</span>
                        </div>
                        <Badge variant="success" className="px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm">
                          {h.outcome}
                        </Badge>
                      </div>
                      <p className="text-[13px] font-bold text-gray-500 leading-relaxed border-l-4 border-amber-500/30 pl-2.5 py-0.5 italic uppercase tracking-tight">
                        &quot;{h.notes}&quot;
                      </p>
                    </div>
                  ))}

                  {customerHistory.length === 0 && (
                    <div className="py-5 border border-dashed border-gray-100 rounded flex flex-col items-center opacity-30 text-center">
                      <ClipboardDocumentCheckIcon className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-[12.5px] font-bold text-gray-400 uppercase tracking-widest">Awaiting logs</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-5 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                className="w-full h-[46px] font-bold uppercase tracking-wider shadow-sm rounded text-[12px] bg-white border"
                onClick={() => setSelectedCustomerId(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
