'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-[var(--bg)] animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
        <ExclamationTriangleIcon className="w-10 h-10 text-rose-500 animate-pulse" />
      </div>
      
      <h1 className="text-4xl font-serif text-white mb-4 tracking-tight uppercase">
        Something went wrong
      </h1>
      
      <p className="text-[13px] text-[var(--text-dim)] max-w-md mx-auto mb-10 leading-relaxed uppercase tracking-[2px] font-medium opacity-60">
        The system encountered a structural anomaly during node execution. Hydration has been suspended.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button 
          variant="primary" 
          onClick={() => reset()}
          className="w-full h-14 !rounded-2xl tracking-[3px] font-bold"
          icon={<ArrowPathIcon className="w-4 h-4" />}
        >
          Try Again
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => window.location.href = '/'}
          className="w-full h-14 !rounded-2xl tracking-[3px] font-bold border-white/5 hover:bg-white/5"
        >
          Go to Home
        </Button>
      </div>

      <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-xs">
        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[4px]">Error Signature</p>
        <p className="text-[10px] text-white/40 mt-2 font-mono break-all">{error.digest || 'ERR_STRUCT_NULL'}</p>
      </div>
    </div>
  )
}
