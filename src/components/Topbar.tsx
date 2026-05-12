"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const activeModule = useStore(state => state.activeModule);
  const { 
    activityFeed, 
    markAllNotificationsRead, 
    clearActivityFeed 
  } = useStore();

  const labels: Record<string, string> = {
    dashboard: 'Dashboard', land: 'Land Purchase', layout: 'Planning Layout', 
    construction: 'Structure Layout', brochure: 'Brochure', meta: 'Meta Marketing',
    weekend: 'Weekend Posts', website: 'Website', sitevisit: 'Site Visits', 
    followup: 'Follow-Up', query: 'New Queries', broker: 'Brokers', 
    payments: 'Payments', propertyholder: 'Property Holder', salary: 'Staff Salary', 
    material: 'Running Material', assets: 'Company Items'
  };

  const displayName = labels[activeModule] || 'Dashboard';
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  const unreadCount = activityFeed.filter(item => !item.read).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'material_alert': return '◌';
      case 'payment': return '◌';
      case 'construction_alert': return '◌';
      case 'booking': return '◌';
      case 'query': return '◌';
      case 'land_payment': return '◌';
      case 'staff_alert': return '◌';
      case 'weekend_post': return '◌';
      default: return '◌';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-50/50';
      case 'high': return 'text-orange-500 bg-orange-50/50';
      case 'medium': return 'text-blue-500 bg-blue-50/50';
      default: return 'text-gray-400 bg-gray-50/50';
    }
  };

  return (
    <div className="h-[var(--tb-h)] bg-white border-b border-gray-100 flex items-center px-8 gap-3 shrink-0 z-50">
      {/* breadcrumb refined */}
      <div className="flex items-center gap-2 group cursor-default">
        <span className="text-[10px] font-black uppercase tracking-[3px] text-gray-300 group-hover:text-gold transition-colors duration-500">Ownthume</span>
        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
        <span className="font-accent text-[18px] text-gray-900 italic lowercase opacity-90">{displayName}</span>
      </div>
      
      <div className="ml-auto flex items-center gap-6 relative">
        {/* Search Refined */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-lg transition-all duration-250 ease-out group cursor-text hover:shadow-sm">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors duration-200" />
          <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 tracking-tight">Search...</span>
        </div>
        
        {/* Date Refined */}
        <div className="text-[10px] font-black uppercase tracking-[2px] text-gray-300 pr-6 border-r border-gray-100 hidden sm:block">
          {currentDate}
        </div>

        {/* Executive Bell Interface */}
        <div 
          role="button"
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-350 ease-out relative
            ${showNotifications ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-110' : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:shadow-md'}`}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <BellIcon className={`w-5 h-5 transition-all duration-350 ease-out ${showNotifications ? 'rotate-12' : 'group-hover:scale-110'}`} />
          {unreadCount > 0 && (
            <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black
              ${showNotifications ? 'bg-white text-gray-900 animate-none' : 'bg-red-500 text-white animate-pulse'}`}>
              {unreadCount}
            </div>
          )}
        </div>

        {/* Help Dropdown - Professional Refinement */}
        {showNotifications && (
          <div className="absolute top-14 right-[-10px] w-[380px] bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-350 ease-out">
            {/* Header refined */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50">
              <div>
                <h4 className="font-accent text-[22px] italic text-gray-900 leading-none mb-1 lowercase">Updates</h4>
                <p className="text-[8px] font-black text-gray-300 uppercase tracking-[2px]">
                   {unreadCount > 0 ? `${unreadCount} new updates` : 'No new updates'}
                </p>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={(e) => { e.stopPropagation(); markAllNotificationsRead(); }}
                  className="text-[9px] font-black uppercase tracking-[2px] text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Mark
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearActivityFeed(); }}
                  className="text-[9px] font-black uppercase tracking-[2px] text-red-400 hover:text-red-500 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="max-h-[440px] overflow-y-auto custom-scrollbar p-2">
              {activityFeed.length > 0 ? (
                activityFeed.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`m-2 p-5 rounded-2xl flex gap-4 items-start transition-all duration-250 ease-out hover:bg-gray-50 hover:shadow-sm group
                       ${!notif.read ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'opacity-60'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs shrink-0 transition-transform group-hover:scale-110 shadow-sm border border-white
                       ${getPriorityColor(notif.priority)}`}>
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                        <span className={`text-[8px] font-bold uppercase tracking-[1.5px] px-2 py-0.5 rounded-full border
                           ${notif.priority === 'critical' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                          {notif.priority}
                        </span>
                        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">{notif.timestamp.split(',').pop()?.trim()}</span>
                      </div>
                      <div className="text-[12px] text-gray-800 leading-[1.6] font-bold group-hover:text-gray-950 transition-colors pr-2">
                        {notif.message}
                      </div>
                      <div className="text-[8px] text-gray-300 mt-2.5 font-black uppercase tracking-[2px] italic opacity-40">
                         Type: {notif.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 px-12 text-center group cursor-default">
                  {/* Mininalist Radar Animation */}
                  <div className="relative w-16 h-16 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gray-100 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-2 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                       <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <h5 className="font-accent text-[20px] italic text-gray-400 mb-2 lowercase opacity-60">System Synchronized</h5>
                  <p className="text-[9px] font-black text-gray-200 uppercase tracking-[2px] max-w-[180px] mx-auto leading-relaxed">
                    Monitoring nodal intelligence for anomalies...
                  </p>
                </div>
              )}
            </div>

            {/* Subdued Footer Actions */}
            <div className="p-6 bg-gray-50/50 flex justify-center items-center gap-10">
               <div className="flex items-center gap-1.5 opacity-30">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black tracking-[1.5px] uppercase">Live Sync</span>
               </div>
               <div role="button" onClick={() => setShowNotifications(false)} className="text-[9px] font-black uppercase tracking-[3px] text-gray-400 hover:text-gray-900 transition-colors">
                  Minimize
               </div>
               <div className="flex items-center gap-1.5 opacity-30">
                  <span className="text-[8px] font-black tracking-[1.5px] uppercase">Nodal v2.0</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
