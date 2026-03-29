"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { LockClosedIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const login = useStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] flex items-center justify-center p-6 selection:bg-[var(--gold)] selection:text-white font-[family-name:var(--font-geist)]">
      <div className="w-full max-w-[380px] animate-in fade-in duration-1000">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--gold)] rounded-2xl shadow-[0_8px_20px_rgba(201,150,59,0.15)] mb-6">
            <BuildingOfficeIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-[family-name:var(--font-instrument)] text-[var(--text)] text-[42px] leading-none tracking-[-0.5px]">Ownthum</h1>
          <div className="w-10 h-[3px] bg-[var(--gold)] mx-auto mt-4 rounded-full"></div>
          <p className="text-[var(--text3)] text-[11px] mt-4 uppercase tracking-[3.5px] font-extrabold opacity-80">Private Admin Access</p>
        </div>

        <Card variant="premium" className="relative animate-in zoom-in-95 duration-500 !p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">System Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none z-10">
                  <LockClosedIcon className="w-5 h-5 text-[var(--text3)] group-focus-within:text-[var(--gold)] transition-colors" />
                </div>
                <Input
                  type="password"
                  v2={true}
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`pl-14 tracking-widest ${error ? 'border-red-500' : ''}`}
                />
              </div>
              {error && <p className="text-red-600 text-[11px] font-bold text-center mt-3 animate-in fade-in slide-in-from-top-1">Verification Failed</p>}
            </div>

            <Button
              type="submit"
              v2={true}
              variant="primary"
              className="w-full h-14 rounded-2xl shadow-xl shadow-gold-500/20 text-[12px] uppercase tracking-[3px]"
            >
              Sign In to System
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-[var(--border)] flex justify-between items-center text-[11px] text-[var(--text3)] font-black uppercase tracking-[2px]">
            <span className="opacity-60">Key: <strong className="text-[var(--text)] opacity-100 italic">1234</strong></span>
            <span className="cursor-not-allowed opacity-20 hover:opacity-100 transition-opacity">Technical Support</span>
          </div>
        </Card>

        <p className="fixed bottom-10 left-0 right-0 text-center text-[10px] text-[var(--text3)] opacity-40 uppercase tracking-[4px] font-black">
          &copy; 2026 Ownthum &mdash; Elite
        </p>
      </div>
    </div>
  );
}
