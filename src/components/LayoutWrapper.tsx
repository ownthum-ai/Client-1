"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useStore } from '@/store/useStore';
import LoginPage from '@/app/login/page';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useStore();
  const isAuthPage = ['/login', '/forgot-password'].includes(pathname);

  // Global Auth Guard
  if (!isAuthenticated && !isAuthPage) {
    return <LoginPage />;
  }

  if (isAuthPage || pathname === '/setup') {
    return (
      <div className="w-full min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen overflow-hidden animate-in fade-in duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[var(--color-page-bg)]">
          <div className="max-w-[var(--max-content-w)] mx-auto p-[var(--content-p)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
