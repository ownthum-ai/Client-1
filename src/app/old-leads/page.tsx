"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KPICard } from '@/components/ui/KPICard';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

export default function OldLeadsPage() {
  const router = useRouter();
  const { followUps, sendWeekendPostNow } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Get leads older than 21 days
  const isOlderThan21Days = (createdAt: string | undefined) => {
    if (!createdAt) return false;
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 21;
  };

  const oldLeads = useMemo(() => {
    return followUps.filter(f => isOlderThan21Days(f.createdAt));
  }, [followUps]);

  const filteredLeads = useMemo(() => {
    return oldLeads.filter(f =>
      f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone.includes(searchTerm)
    );
  }, [oldLeads, searchTerm]);

  const selectedLead = useMemo(() => {
    return oldLeads.find(f => f.id === selectedLeadId);
  }, [oldLeads, selectedLeadId]);

  const handleSendMessage = () => {
    if (selectedLead) {
      setIsSendingMessage(true);
      sendWeekendPostNow('Weekend Offer - Reactivation Message', 1, [selectedLead.phone]);
      setTimeout(() => {
        setIsSendingMessage(false);
        alert(`Weekend message sent to ${selectedLead.customerName}`);
        setSelectedLeadId(null);
      }, 1500);
    }
  };

  const calculateDaysSinceCreation = (createdAt: string | undefined): number => {
    if (!createdAt) return 0;
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-100"
                onClick={() => router.back()}
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </Button>
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight uppercase">Old Leads</h1>
            </div>
            <div className="flex items-center gap-3 ml-14">
              <Badge variant="warning" className="px-3 py-1 text-[11px] font-bold shadow-sm">21+ Days</Badge>
              <span className="text-[14px] text-gray-400 font-bold tracking-tight opacity-85 uppercase">Eligible for re-engagement messaging</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            label="Old Leads"
            value={oldLeads.length}
            trend={{ value: "Older than 21 days", type: "neutral" }}
          />
          <KPICard
            label="Available to Contact"
            value={oldLeads.filter(l => l.status !== 'Lost').length}
            trend={{ value: "Active status", type: "up" }}
          />
          <KPICard
            label="Messages Sent"
            value={oldLeads.filter(l => l.interactions.some(i => i.type === 'WhatsApp')).length}
            trend={{ value: "Re-engagement", type: "neutral" }}
          />
        </div>

        {/* Alert Box */}
        <div className="p-6 md:p-8 bg-amber-50 border-2 border-amber-200 rounded-2xl md:rounded-[24px] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
              <PaperAirplaneIcon className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-[13px] md:text-[14px] font-bold text-amber-900 uppercase tracking-tight mb-1">Bulk Messaging Available</p>
              <p className="text-[11px] text-amber-700 font-bold uppercase tracking-[1px] opacity-75">Send weekend offers or re-engagement messages to these old leads</p>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <Card title="Old Leads List" subtitle="Select a lead to send weekend message" className="p-0 overflow-hidden shadow-lg border-2">
          {/* Search Bar */}
          <div className="p-4 md:p-6 border-b border-[var(--border)] bg-gray-50/30">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                v2={true}
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 md:h-12 border rounded-xl shadow-sm text-[12px] uppercase"
              />
            </div>
          </div>

          {/* Leads Grid/Table */}
          <div className="overflow-x-auto">
            {filteredLeads.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                    <th className="p-[12px_18px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Lead Name</th>
                    <th className="p-[12px_14px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Interest</th>
                    <th className="p-[12px_14px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Days Inactive</th>
                    <th className="p-[12px_14px] text-[10px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                    <th className="p-[12px_18px] text-right text-[10px] font-bold text-gray-500 tracking-widest uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredLeads.map(lead => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedLeadId === lead.id ? 'bg-gray-50' : ''}`}
                    >
                      <td className="p-[12px_18px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 text-amber-600 flex items-center justify-center border border-white shadow-sm font-bold text-[12px]">
                            {lead.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tight block">{lead.customerName}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider tabular-nums">{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-[12px_14px]">
                        <span className="text-[12px] font-bold text-gray-700 uppercase tracking-tight">{lead.interest}</span>
                      </td>
                      <td className="p-[12px_14px]">
                        <span className="text-[12px] font-bold text-amber-600 uppercase tracking-tight">{calculateDaysSinceCreation(lead.createdAt)} days</span>
                      </td>
                      <td className="p-[12px_14px]">
                        <Badge
                          variant={lead.status === 'Lost' ? 'destructive' : lead.status === 'Hot' ? 'warning' : 'neutral'}
                          className="px-2 py-1 text-[9px] font-bold uppercase shadow-sm"
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-[12px_18px] text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLeadId(lead.id);
                          }}
                        >
                          Send
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center">
                <ClockIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">No old leads found</p>
                <p className="text-[12px] text-gray-400 font-bold mt-2 uppercase tracking-wider">All your leads are within 21 days or no dormant leads exist yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detail Panel */}
      <div className={`fixed top-0 right-0 h-screen w-full md:w-[460px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedLeadId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedLead ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-sm font-bold shrink-0">
                  {selectedLead.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedLead.customerName}</h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-85">Old Lead Profile</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm flex items-center justify-center" onClick={() => setSelectedLeadId(null)}>✕</Button>
            </div>

            <div className="space-y-6">
              {/* Lead Info */}
              <div className="p-5 bg-gray-900 rounded text-white shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <span className="text-[11px] font-bold text-white/45 tracking-[1.5px] uppercase">Dormancy Details</span>
                  <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-none px-2.5 py-1 text-[10px] font-bold uppercase">Inactive</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-white/35 uppercase tracking-[1.5px] mb-1">Days Since Created</p>
                    <p className="text-[18px] font-bold text-amber-500">{calculateDaysSinceCreation(selectedLead.createdAt)} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-white/35 uppercase tracking-[1.5px] mb-1">Lead Created</p>
                    <p className="text-[16px] font-bold text-white">{formatDate(selectedLead.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-[var(--border)] pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Phone No.', value: selectedLead.phone, icon: <PhoneIcon className="w-4 h-4" /> },
                    { label: 'Interest', value: selectedLead.interest, icon: <CheckCircleIcon className="w-4 h-4" /> },
                    { label: 'Current Status', value: selectedLead.status, icon: <IdentificationIcon className="w-4 h-4" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded border border-[var(--border)] shadow-sm hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-gray-50 flex items-center justify-center text-amber-600 border border-[var(--border)] shadow-inner shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</span>
                      </div>
                      <span className="text-[13px] font-bold text-gray-900 tracking-tight uppercase">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Interactions */}
              {selectedLead.interactions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[12.5px] font-bold text-gray-900 tracking-[1.5px] uppercase border-b border-[var(--border)] pb-2">Recent Interactions</h3>
                  <div className="space-y-2">
                    {selectedLead.interactions.slice(0, 3).map((interaction) => (
                      <div key={interaction.id} className="p-3 bg-gray-50 rounded border border-gray-100 flex items-start gap-3 shadow-sm">
                        <div className="w-7 h-7 rounded bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700 shrink-0">
                          {interaction.type.charAt(0)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[11px] font-bold text-gray-900">{interaction.type}</span>
                            <span className="text-[9px] text-gray-400 font-bold">{interaction.date}</span>
                          </div>
                          <p className="text-[12px] text-gray-600 font-medium">{interaction.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-[var(--border)] flex gap-4">
              <Button
                variant="secondary"
                className="flex-1 h-[46px] font-bold uppercase tracking-wider shadow-sm rounded text-[12px] bg-white border"
                onClick={() => setSelectedLeadId(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                className="flex-1 h-[46px] font-bold uppercase tracking-wider shadow-md rounded gap-2 flex items-center justify-center text-[12px]"
                onClick={handleSendMessage}
                disabled={isSendingMessage}
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'} <PaperAirplaneIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center opacity-40">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-[16px] font-bold text-gray-900 tracking-[4px] uppercase">No Selection</h3>
            <p className="text-[12px] text-gray-400 mt-4 leading-relaxed font-bold uppercase tracking-widest">Select a lead to send weekend message</p>
          </div>
        )}
      </div>
    </>
  );
}
