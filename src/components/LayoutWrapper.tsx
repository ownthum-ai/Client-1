"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useStore } from '@/store/useStore';
import LoginPage from '@/app/login/page';
import { PinGate } from './PinGate';
import { AppShellSkeleton } from './skeletons/AppShellSkeleton';
import { DashboardSkeleton } from './skeletons/DashboardSkeleton';
import { TableSkeleton } from './skeletons/TableSkeleton';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isPinUnlocked } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = ['/login', '/forgot-password'].includes(pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // Global Scrollbar & Modal Viewport Lock Method
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasModal = !!document.querySelector('.modal-overlay');
      const root = document.documentElement;
      
      if (hasModal) {
        root.style.overflow = 'hidden';
        root.style.paddingRight = `${window.innerWidth - root.clientWidth}px`; // Prevent layout shift
        document.body.classList.add('body-lock');
      } else {
        root.style.overflow = '';
        root.style.paddingRight = '';
        document.body.classList.remove('body-lock');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial check
    const initialModal = !!document.querySelector('.modal-overlay');
    if (initialModal) document.documentElement.style.overflow = 'hidden';

    return () => {
      observer.disconnect();
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
    };
  }, []);

  // Smooth page transition on route change
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 40); // drastically reduced from 150ms
    return () => clearTimeout(timer);
  }, [pathname, children]);

  // Global Loading & Auth Guard Method
  if (!mounted) return <AppShellSkeleton />; // Premium Initial Hydration State

  // System Locked Gate (Pin Password Page)
  if (!isPinUnlocked && !isAuthPage && pathname !== '/setup') {
    return <PinGate />;
  }

  if (isAuthPage || pathname === '/setup') {
    return (
      <div className="w-full min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center p-4 smooth-fade-in">
        {children}
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[var(--color-page-bg)]">
          <div 
            className={`max-w-[var(--max-content-w)] mx-auto p-[var(--content-p)] transition-opacity duration-150 ease-out ${
              isTransitioning 
                ? 'opacity-0' 
                : 'opacity-100'
            }`}
          >
            {displayChildren}
          </div>
        </main>
      </div>
    </div>
  );
}
