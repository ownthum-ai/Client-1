"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { LockClosedIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion } from 'framer-motion';

export const PinGate = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { unlockPin } = useStore();

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (unlockPin(pin)) {
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  }, [pin, unlockPin]);

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => handleSubmit(), 200);
      return () => clearTimeout(timer);
    }
  }, [pin, handleSubmit]);

  return (
    <div className="min-h-screen w-full bg-[#fbfaf8] flex items-center justify-center p-6 selection:bg-[var(--gold)] selection:text-white overflow-hidden">
      <div className="w-full max-w-[400px] animate-in fade-in duration-1000 slide-in-from-bottom-4">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[var(--gold)] rounded-2xl shadow-[0_12px_30px_rgba(201,150,59,0.2)] mb-8"
          >
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-[family-name:var(--font-instrument)] text-[#111110] text-[48px] leading-tight tracking-[-1px]">Ownthum</h1>
          <div className="w-12 h-[3px] bg-[var(--gold)] mx-auto mt-4 rounded-full"></div>
          <p className="text-[#9A9A97] text-[11px] mt-5 uppercase tracking-[4.5px] font-black opacity-80">Private Admin Access</p>
        </div>

        <Card variant="premium" className="relative animate-in zoom-in-95 duration-700 !p-12 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="block text-[11px] font-black text-[#5C5C5A] uppercase tracking-[2px] ml-1 opacity-60">System Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none z-10">
                  <LockClosedIcon className={`w-5 h-5 transition-colors duration-300 ${error ? 'text-red-500' : 'text-[#9A9A97] group-focus-within:text-[var(--gold)]'}`} />
                </div>
                <Input
                  type="password"
                  v2={true}
                  autoFocus
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••••"
                  className={`pl-16 tracking-[1em] text-[18px] h-16 rounded-2xl border-2 transition-all duration-300 ${error ? 'border-red-500 bg-red-50/30' : 'focus:border-[var(--gold)]'}`}
                />
              </div>
              {error && (
                <p className="text-red-600 text-[11px] font-black text-center mt-4 animate-in fade-in slide-in-from-top-2 tracking-widest uppercase">
                  Wrong PIN
                </p>
              )}
            </div>

            <Button
              type="submit"
              v2={true}
              variant="primary"
              className="w-full h-16 rounded-2xl shadow-xl shadow-gold-500/10 text-[13px] font-black uppercase tracking-[4px] bg-[#C49B45] hover:bg-[#B38A34] transition-all active:scale-95"
            >
              Sign In to System
            </Button>
          </form>

          <div className="mt-12 pt-10 border-t border-[#E5E4DF] flex justify-between items-center text-[10px] text-[#9A9A97] font-black uppercase tracking-[2.5px]">
            <span className="opacity-40">Key: <strong className="text-[#111110] opacity-100 italic ml-1">1234</strong></span>
            <span className="cursor-not-allowed opacity-20 hover:opacity-100 transition-opacity">Technical Support</span>
          </div>
        </Card>

        <p className="mt-16 text-center text-[10px] text-[#9A9A97] opacity-40 uppercase tracking-[5px] font-black">
          &copy; 2026 Ownthum &mdash; Elite
        </p>
      </div>
    </div>
  );
};
