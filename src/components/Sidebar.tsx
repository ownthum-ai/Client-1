"use client";
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { BorderBeam } from './lightswind/border-beam';
import {
  Squares2X2Icon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
  HandRaisedIcon,
  CurrencyRupeeIcon,
  HomeIcon,
  UsersIcon,
  Square3Stack3DIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';




export default function Sidebar() {
  const pathname = usePathname();
  const setActiveModule = useStore(state => state.setActiveModule);
  const { unreadQueries, unreadFollowUps } = useStore();

  const navItems = [
    {
      section: 'Summary', items: [
        { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon, path: '/' }
      ]
    },
    {
      section: 'CRM', items: [
        { id: 'query', label: 'New Enquiries', icon: ChatBubbleBottomCenterTextIcon, path: '/query', badge: unreadQueries },
        { id: 'pipeline', label: 'Deals Pipeline', icon: Squares2X2Icon, path: '/pipeline' },
        { id: 'sitevisit', label: 'Site Visits', icon: HandRaisedIcon, path: '/sitevisit' },
        { id: 'followup', label: 'Follow-ups', icon: ArrowPathIcon, path: '/followup', badge: unreadFollowUps },
        { id: 'customer', label: 'Customers', icon: UserGroupIcon, path: '/customer' },
        { id: 'broker', label: 'Brokers', icon: UsersIcon, path: '/broker' }
      ]
    },
    {
      section: 'Marketing', items: [
        { id: 'weekend', label: 'Weekend Posts', icon: CalendarIcon, path: '/weekend' }
      ]
    },
    /*
    {
      section: 'Finance', items: [
        { id: 'payments', label: 'Payments', icon: CurrencyRupeeIcon, path: '/payments' },
        { id: 'propertyholder', label: 'Property Holder', icon: HomeIcon, path: '/propertyholder' },
        { id: 'salary', label: 'Staff Salary', icon: UserGroupIcon, path: '/salary' }
      ]
    },
    */

    {
      section: 'Operations', items: [
        { id: 'property', label: 'Property', icon: HomeIcon, path: '/property' },
        { id: 'labour', label: 'Labour', icon: WrenchScrewdriverIcon, path: '/labour' },
        { id: 'material', label: 'Running Material', icon: Square3Stack3DIcon, path: '/material' },
        { id: 'assets', label: 'Company Asset', icon: TruckIcon, path: '/assets' }
      ]
    }
  ];

  return (
    <div className="w-[var(--sb-w-collapsed)] lg:w-[var(--sb-w)] bg-[#0A0A0A] flex flex-col h-screen shrink-0 overflow-y-auto custom-scrollbar-dark transition-[width] duration-200 overflow-x-hidden border-r border-white/[0.05] relative z-[600]">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[var(--gold)]/5 to-transparent pointer-events-none opacity-20"></div>

      {/* Sidebar Logo */}
      <div className="p-[20px_16px_14px] border-b border-white/[0.05] relative z-10">
        <Link href="/" className="flex items-center gap-[11px] group">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dk)] rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-gold-500/10">
            <BuildingOfficeIcon className="w-5 h-5" />
          </div>
          <div className="hidden lg:block">
            <div className="font-sans text-white text-[18px] tracking-[0.4px] leading-none font-semibold">Ownthum</div>
          </div>
        </Link>
        <div className="hidden lg:block text-[9px] text-white/50 tracking-[2px] mt-1.5 pl-[43px] font-medium opacity-80">Dashboard</div>
      </div>

      <div className="flex-1 py-[18px]">
        {navItems.map((group, i) => (
          <div key={i} className="mb-4">
            <div className="hidden lg:block text-[9px] tracking-[1.5px] text-white/50 font-semibold px-4 ml-0.5 mb-1.5">{group.section}</div>
            <div className="px-3 space-y-0.5">
              {group.items.map(item => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link href={item.path} key={item.id} onClick={() => setActiveModule(item.id)}
                    className={`flex items-center gap-[12px] p-[10px_14px] rounded-[10px] cursor-pointer transition-colors duration-200 text-[13.5px] group relative overflow-hidden
                        ${isActive
                        ? 'bg-white/[0.08] text-white font-medium shadow-sm'
                        : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90 font-medium'}`}>

                    {isActive && (
                      <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--gold)] rounded-full shadow-[0_0_8px_var(--gold)] z-20"></div>
                    )}

                    <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200
                      ${isActive ? 'text-[var(--gold)]' : 'opacity-60 group-hover:opacity-100 group-hover:text-white'}`} />

                    <span className="hidden lg:block flex-1 leading-none whitespace-nowrap tracking-[0.3px] relative z-10">
                      {item.label}
                    </span>

                    {(item.badge ?? 0) > 0 && (
                      <span className={`hidden lg:flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider relative z-10
                        ${isActive ? 'bg-[var(--gold)] text-white' : 'bg-[var(--red)] text-white'}`}>
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

      <div className="mt-auto p-[14px_12px] border-t border-white/[0.05] bg-white/[0.01]">
        <Link href="/settings" className="block">
          <div className="flex items-center gap-[12px] p-[10px_12px] rounded-xl bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] transition-all duration-200 group overflow-hidden border border-white/[0.05]">
            <div className="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dk)] flex items-center justify-center text-white text-[12px] font-bold shrink-0">OM</div>
            <div className="hidden lg:block flex-1">
              <div className="text-[14px] text-white/90 font-medium leading-none whitespace-nowrap tracking-[0.3px]">Owner</div>
              <div className="text-[9px] text-white/40 mt-[3px] whitespace-nowrap font-medium tracking-[1px]">Administrator</div>
            </div>
            <Cog6ToothIcon className="hidden lg:block w-4 h-4 text-white/40 group-hover:text-[var(--gold)] transition-colors duration-200" />
          </div>
        </Link>
      </div>
    </div>
  );
}

