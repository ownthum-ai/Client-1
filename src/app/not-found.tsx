import React from 'react'
import { Button } from '@/components/ui/Button'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-[var(--bg)] animate-in fade-in duration-1000">
      <div className="text-[120px] font-black text-white/5 absolute -z-10 select-none tracking-tighter">404</div>
      
      <div className="w-24 h-24 bg-[var(--gold)]/5 border border-[var(--gold)]/20 rounded-[40px] flex items-center justify-center mb-10 shadow-3xl group">
        <MagnifyingGlassIcon className="w-12 h-12 text-[var(--gold)] group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <h1 className="text-5xl font-serif text-[var(--gold)] mb-6 tracking-tight uppercase">
        Node Not Found
      </h1>
      
      <p className="text-[14px] text-[var(--text-dim)] max-w-sm mx-auto mb-12 leading-relaxed uppercase tracking-[3px] font-medium opacity-60">
        Specified coordinates do not map to any active environment. Check the registry or return to primary node.
      </p>

      <Button 
        variant="primary" 
        onClick={() => {}} // Next link handled by wrapper or component if needed
        className="h-16 px-10 !rounded-[32px] tracking-[5px] font-bold shadow-gold-500/20"
        icon={<HomeIcon className="w-5 h-5" />}
      >
        <a href="/">Back to Command Center</a>
      </Button>
      
      <div className="mt-20 flex gap-10 opacity-20">
        <div className="text-[9px] font-bold uppercase tracking-[5px]">X-Coordinate: null</div>
        <div className="text-[9px] font-bold uppercase tracking-[5px]">Y-Coordinate: null</div>
      </div>
    </div>
  )
}
