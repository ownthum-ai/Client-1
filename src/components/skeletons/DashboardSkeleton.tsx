"use client";
import React from 'react';
import { Skeleton } from '../ui/Skeleton';
import { Card } from '../ui/Card';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-[var(--section-gap)] animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-3">
          <Skeleton width="320px" height="32px" />
          <Skeleton width="480px" height="14px" />
        </div>
        <div className="flex gap-4">
          <Skeleton width="140px" height="44px" borderRadius="12px" />
          <Skeleton width="140px" height="44px" borderRadius="12px" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} height="120px" borderRadius="16px" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--section-gap)]">
        <Card className="h-[400px] border-[var(--border)] p-8">
           <Skeleton width="200px" height="24px" className="mb-4" />
           <Skeleton width="100%" height="240px" borderRadius="12px" />
        </Card>
        <Card className="h-[400px] border-[var(--border)] p-8">
           <Skeleton width="200px" height="24px" className="mb-4" />
           <div className="space-y-4">
             {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} height="48px" borderRadius="12px" />
             ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--section-gap)]">
        <Card className="h-[350px] border-[var(--border)] p-8">
           <Skeleton width="200px" height="24px" className="mb-4" />
           <div className="space-y-6 mt-8">
             {[1, 2, 3].map(i => (
                <Skeleton key={i} height="60px" borderRadius="10px" />
             ))}
           </div>
        </Card>
        <Card className="h-[350px] border-[var(--border)] p-8">
           <Skeleton width="200px" height="24px" className="mb-4" />
           <div className="space-y-4 mt-8">
              {[1, 2, 3, 4].map(i => (
                 <div key={i} className="flex gap-4 items-center">
                    <Skeleton width="10px" height="10px" borderRadius="50%" />
                    <Skeleton width="80%" height="20px" />
                 </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );
};
