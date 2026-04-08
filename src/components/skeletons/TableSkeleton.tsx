"use client";
import React from 'react';
import { Skeleton } from '../ui/Skeleton';
import { Card } from '../ui/Card';

export const TableSkeleton = () => {
  return (
    <div className="space-y-[var(--section-gap)] animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-3">
          <Skeleton width="320px" height="32px" />
          <Skeleton width="480px" height="14px" />
        </div>
        <div className="flex gap-4">
          <Skeleton width="140px" height="44px" borderRadius="12px" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} height="100px" borderRadius="16px" />
        ))}
      </div>

      <Card className="p-0 border-[var(--border)] overflow-hidden">
        <div className="p-8 border-b border-[var(--border)] bg-[#fbfaf8] flex items-center justify-between">
           <div className="space-y-2">
             <Skeleton width="180px" height="20px" />
             <Skeleton width="280px" height="12px" />
           </div>
           <Skeleton width="220px" height="40px" borderRadius="10px" />
        </div>
        <div className="p-8">
           <div className="space-y-6">
             <div className="grid grid-cols-6 gap-6 border-b border-[var(--border)] pb-4">
               {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} height="10px" />
               ))}
             </div>
             {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
               <div key={i} className="grid grid-cols-6 gap-6 py-2">
                  <Skeleton width="140px" height="14px" />
                  <Skeleton width="100px" height="14px" />
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="80px" height="14px" />
                  <Skeleton width="100px" height="24px" borderRadius="20px" />
                  <Skeleton width="120px" height="32px" borderRadius="8px" />
               </div>
             ))}
           </div>
        </div>
      </Card>
    </div>
  );
};
