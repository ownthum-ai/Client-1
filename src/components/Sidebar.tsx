"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  Squares2X2Icon,
  MapIcon,
  TableCellsIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CalendarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
  HandRaisedIcon,
  CurrencyRupeeIcon,
  HomeIcon,
  UsersIcon,
  Square3Stack3DIcon,
  TruckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';




export default function Sidebar() {
  const pathname = usePathname();
  const setActiveModule = useStore(state => state.setActiveModule);
  const { unreadQueries, unreadFollowUps } = useStore();

  const navItems = [
    {
      section: 'Overview', items: [
        { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon, path: '/' }
      ]
    },
    {
      section: 'Project', items: [
        { id: 'land', label: 'Land Purchase', icon: MapIcon, path: '/land' },
        { id: 'layout', label: 'Planning Layout', icon: TableCellsIcon, path: '/layout' },
        { id: 'construction', label: 'Structure Layout', icon: BuildingOfficeIcon, path: '/construction' }
      ]
    },
    {
      section: 'Marketing', items: [
        { id: 'brochure', label: 'Brochure', icon: DocumentTextIcon, path: '/brochure' },
        { id: 'weekend', label: 'Weekend Posts', icon: CalendarIcon, path: '/weekend' }
      ]
    },
    {
      section: 'CRM', items: [
        { id: 'sitevisit', label: 'Site Visits', icon: HandRaisedIcon, path: '/sitevisit' },
        { id: 'followup', label: 'Follow-Up', icon: ArrowPathIcon, path: '/followup', badge: unreadFollowUps },
        { id: 'query', label: 'New Queries', icon: ChatBubbleBottomCenterTextIcon, path: '/query', badge: unreadQueries },
        { id: 'broker', label: 'Brokers', icon: UsersIcon, path: '/broker' }
      ]
    },
    {
      section: 'Finance', items: [
        { id: 'payments', label: 'Payments', icon: CurrencyRupeeIcon, path: '/payments' },
        { id: 'propertyholder', label: 'Property Holder', icon: HomeIcon, path: '/propertyholder' },
        { id: 'salary', label: 'Staff Salary', icon: UserGroupIcon, path: '/salary' }
      ]
    },
    {
      section: 'Operations', items: [
        { id: 'material', label: 'Running Material', icon: Square3Stack3DIcon, path: '/material' },
        { id: 'assets', label: 'Fixed Assets', icon: TruckIcon, path: '/assets' }
      ]
    }
  ];

  return (
    <div className="w-[var(--sb-w-collapsed)] lg:w-[var(--sb-w)] bg-[#0A0A0A] flex flex-col h-screen shrink-0 overflow-y-auto custom-scrollbar-dark transition-[width] duration-200 overflow-x-hidden border-r border-white-[0.03] relative">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[var(--gold)]/10 to-transparent pointer-events-none opacity-20"></div>
      {/* Sidebar Logo */}
      <div className="p-[20px_16px_14px] border-b border-white/[0.03] relative z-10">
        <Link href="/" className="flex items-center gap-[11px] group">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dk)] rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform duration-200">
            <BuildingOfficeIcon className="w-5 h-5" />
          </div>
          <div className="hidden lg:block">
            <div className="font-['Instrument_Serif'] text-white text-[20px] tracking-[0.4px] leading-none font-bold">Ownthum</div>
          </div>
        </Link>
        <div className="hidden lg:block text-[9px] text-white/30 uppercase tracking-[3.5px] mt-1.5 pl-[43px] font-bold opacity-60">Executive Intelligence</div>
      </div>

      <div className="flex-1 py-[18px]">
        {navItems.map((group, i) => (
          <div key={i} className="mb-4">
            <div className="hidden lg:block text-[9px] uppercase tracking-[3px] text-white/40 font-bold px-4 ml-0.5 mb-1.5">{group.section}</div>
            <div className="px-3 space-y-0.5">
              {group.items.map(item => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link href={item.path} key={item.id} onClick={() => setActiveModule(item.id)}
                    className={`flex items-center gap-[12px] p-[10px_14px] rounded-[10px] cursor-pointer transition-colors duration-150 text-[13.5px] group relative
                        ${isActive
                        ? 'bg-gradient-to-r from-[var(--gold)]/20 to-transparent text-white font-semibold shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80 font-medium'}`}>

                    {isActive && (
                      <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--gold)] rounded-full shadow-[2px_0_10px_var(--gold)]"></div>
                    )}

                    <Icon className={`w-5 h-5 shrink-0 transition-all duration-200 group-hover:scale-110 
                      ${isActive ? 'text-[var(--gold)] opacity-100 drop-shadow-[0_0_8px_var(--gold)]' : 'opacity-50 group-hover:opacity-100 group-hover:text-white'}`} />

                    <span className={`hidden lg:block flex-1 leading-none transition-transform duration-200 whitespace-nowrap tracking-[0.3px]
                      ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                      {item.label}
                    </span>

                    {(item.badge ?? 0) > 0 && (
                      <span className={`hidden lg:flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest transition-all
                        ${isActive ? 'bg-[var(--gold)] text-white shadow-[0_0_8px_var(--gold)]/40' : 'bg-[var(--red)] text-white shadow-lg shadow-red-500/20'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-[14px_12px] border-t border-white/[0.03] bg-white/[0.01]">
        <Link href="/settings" className="block">
          <div className="flex items-center gap-[12px] p-[10px_12px] rounded-xl bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] transition-colors duration-200 group overflow-hidden border border-white/[0.05] shadow-sm">
            <div className="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dk)] flex items-center justify-center text-white text-[12px] font-black shrink-0 shadow-lg shadow-gold-500/10 group-hover:scale-105 transition-transform duration-200">OM</div>
            <div className="hidden lg:block flex-1">
              <div className="text-[14px] text-white/90 font-bold leading-none whitespace-nowrap tracking-[0.3px]">Owner</div>
              <div className="text-[9px] text-white/20 mt-[3px] whitespace-nowrap font-bold uppercase tracking-[2px] opacity-60">Admin Control</div>
            </div>
            <Cog6ToothIcon className="hidden lg:block w-4 h-4 text-white/20 group-hover:text-[var(--gold)] group-hover:rotate-90 transition-transform duration-500 ease-out" />
          </div>
        </Link>
      </div>
    </div>
  );
}
