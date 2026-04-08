"use client";
import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const AppShellSkeleton = () => {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar Skeleton */}
      <div className="w-[var(--sb-w)] border-r border-[var(--border)] bg-[var(--sb)] flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton width="40px" height="40px" borderRadius="12px" />
          <Skeleton width="100px" height="24px" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton width="20px" height="20px" borderRadius="4px" />
              <Skeleton width="110px" height="14px" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Skeleton */}
        <div className="h-[var(--tb-h)] border-b border-[var(--border)] bg-white flex items-center justify-between px-8">
          <Skeleton width="200px" height="16px" />
          <div className="flex items-center gap-4">
            <Skeleton width="32px" height="32px" borderRadius="50%" />
            <Skeleton width="32px" height="32px" borderRadius="50%" />
            <Skeleton width="80px" height="32px" borderRadius="8px" />
          </div>
        </div>

        {/* Content Area Skeleton */}
        <main className="flex-1 overflow-hidden p-[var(--content-p)]">
          <div className="max-w-[var(--max-content-w)] mx-auto space-y-8 text-left">
            <div className="flex justify-between items-center">
              <div className="space-y-3">
                <Skeleton width="240px" height="32px" />
                <Skeleton width="320px" height="14px" />
              </div>
              <div className="flex gap-3">
                <Skeleton width="120px" height="40px" borderRadius="10px" />
                <Skeleton width="120px" height="40px" borderRadius="10px" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-5">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} height="100px" borderRadius="16px" />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-8 mt-10">
              <Skeleton height="320px" borderRadius="20px" />
              <Skeleton height="320px" borderRadius="20px" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
