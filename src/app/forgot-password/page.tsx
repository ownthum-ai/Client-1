"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate reset
    router.push('/login');
  };

  return (
    <div className="w-full max-w-[400px] animate-in fade-in duration-300">
      <div className="flex flex-col items-center mb-6">
        <div className="w-[50px] h-[50px] bg-white border border-[var(--border)] rounded-full flex items-center justify-center text-[22px] shadow-sm mb-3">
          🔐
        </div>
        <h1 className="font-[family-name:var(--font-instrument)] text-[26px] text-[var(--text)] leading-none text-center">Account Recovery</h1>
        <div className="text-[12px] text-[var(--text3)] mt-2">Recover access via security question</div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-[var(--r-lg)] p-8 shadow-[var(--sh-lg)]">
        
        {step === 1 && (
          <form onSubmit={handleVerify} className="animate-in fade-in slide-in-from-left-2 duration-300 flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--text2)] mb-1.5">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-[14px] py-[10px] rounded-[7px] border border-[var(--border)] bg-[#FAFAF8] text-[13.5px] text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:bg-white transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-2 py-[11px] rounded-[7px] border-none bg-[var(--gold)] text-white font-semibold text-[13.5px] transition-all hover:bg-[var(--gold-dk)] shadow-sm"
            >
              Verify Account
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-5">
            <div>
              <div className="text-[11.5px] uppercase tracking-[1px] font-semibold text-[var(--text3)] mb-1">Security Question</div>
              <div className="text-[14px] font-medium text-[var(--gold)]">What was your childhood nickname?</div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text2)] mb-1.5">Your Answer</label>
              <input 
                type="text" 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-[14px] py-[10px] rounded-[7px] border border-[var(--border)] bg-[#FAFAF8] text-[13.5px] text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:bg-white transition-colors"
                placeholder="Enter answer"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text2)] mb-1.5">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-[14px] py-[10px] rounded-[7px] border border-[var(--border)] bg-[#FAFAF8] text-[13.5px] text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:bg-white transition-colors"
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-[90px] py-[11px] rounded-[7px] border border-[var(--border)] bg-white text-[var(--text)] font-semibold text-[13.5px] transition-all hover:bg-[#FAFAF8] shadow-sm"
              >
                Back
              </button>
              <button 
                type="submit" 
                className="flex-1 py-[11px] rounded-[7px] border-none bg-[var(--gold)] text-white font-semibold text-[13.5px] transition-all hover:bg-[var(--gold-dk)] hover:-translate-y-[1px] shadow-[0_4px_12px_rgba(201,150,59,0.35)]"
              >
                Reset Password
              </button>
            </div>
          </form>
        )}

        <div className="mt-7 pt-4 border-t border-[var(--border)] text-center">
          <Link href="/login" className="text-[11.5px] font-medium text-[var(--text3)] hover:text-[var(--text)] transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
