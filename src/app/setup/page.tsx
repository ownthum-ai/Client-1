"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomSelect } from '@/components/Select';

export default function Setup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [question, setQuestion] = useState('What was your childhood nickname?');
  const [answer, setAnswer] = useState('');

  const questions = [
    'What was your childhood nickname?',
    'What is the name of your favorite pet?',
    'What city were you born in?',
    'What is your mother\'s maiden name?'
  ];

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate setup complete
    router.push('/login');
  };

  return (
    <div className="w-full max-w-[450px] animate-in fade-in duration-300">
      <div className="flex flex-col items-center mb-6">
        <h1 className="font-[family-name:var(--font-instrument)] text-[28px] text-[var(--text)] leading-none text-center">Security Setup</h1>
        <div className="text-[11px] text-[var(--text3)] mt-2 font-medium">Step {step} of 2</div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-[var(--r-lg)] p-8 shadow-[var(--sh-lg)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--gold)]">
        
        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2 text-center">Set Secret PIN</h2>
            <p className="text-[12px] text-[var(--text3)] text-center mb-6">
              Create a 4-digit PIN. This is required to access sensitive cash (black money) records in the system.
            </p>
            
            <div className="flex flex-col items-center gap-5 mb-8">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text3)] mb-2 text-center uppercase tracking-[1px]">Enter PIN</label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map(i => (
                    <input 
                      key={`pin-${i}`}
                      type="password"
                      maxLength={1}
                      className="w-[45px] h-[55px] text-center text-[20px] font-bold border border-[var(--border)] rounded-[8px] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,150,59,0.2)] bg-[#FAFAF8]"
                      value={pin[i]}
                      onChange={(e) => {
                        const newPin = [...pin];
                        newPin[i] = e.target.value.replace(/[^0-9]/g, '');
                        setPin(newPin);
                        if (e.target.value && i < 3) {
                          document.getElementById(`pin-${i+1}`)?.focus();
                        }
                      }}
                      id={`pin-${i}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text3)] mb-2 text-center uppercase tracking-[1px]">Confirm PIN</label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map(i => (
                    <input 
                      key={`cpin-${i}`}
                      type="password"
                      maxLength={1}
                      className="w-[45px] h-[55px] text-center text-[20px] font-bold border border-[var(--border)] rounded-[8px] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,150,59,0.2)] bg-[#FAFAF8]"
                      value={confirmPin[i]}
                      onChange={(e) => {
                        const newPin = [...confirmPin];
                        newPin[i] = e.target.value.replace(/[^0-9]/g, '');
                        setConfirmPin(newPin);
                        if (e.target.value && i < 3) {
                          document.getElementById(`cpin-${i+1}`)?.focus();
                        }
                      }}
                      id={`cpin-${i}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={pin.join('').length < 4 || confirmPin.join('').length < 4}
              className="w-full py-[11px] rounded-[7px] border-none bg-[var(--gold)] text-white font-semibold text-[13.5px] transition-all hover:bg-[var(--gold-dk)] disabled:opacity-50 disabled:hover:bg-[var(--gold)] disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(201,150,59,0.35)]"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-[16px] font-semibold text-[var(--text)] mb-2 text-center">Account Recovery Option</h2>
            <p className="text-[12px] text-[var(--text3)] text-center mb-6">
              Set a security question. This will be the only way to recover your password if you forget it.
            </p>
            
            <form onSubmit={handleFinish} className="flex flex-col gap-5">
                <CustomSelect 
                  label="Security Question"
                  options={questions.map(q => ({ value: q, label: q }))}
                  value={question}
                  onChange={setQuestion}
                />
              
              <div>
                <label className="block text-[12px] font-medium text-[var(--text2)] mb-1.5">Your Answer</label>
                <input 
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-[14px] py-[10px] rounded-[7px] border border-[var(--border)] bg-[#FAFAF8] text-[13.5px] text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:bg-white transition-colors"
                  placeholder="Enter a memorable answer"
                  required
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-[100px] py-[11px] rounded-[7px] border border-[var(--border)] bg-white text-[var(--text)] font-semibold text-[13.5px] transition-all hover:bg-[#FAFAF8] shadow-sm"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-[11px] rounded-[7px] border-none bg-[var(--gold)] text-white font-semibold text-[13.5px] transition-all hover:bg-[var(--gold-dk)] hover:-translate-y-[1px] shadow-[0_4px_12px_rgba(201,150,59,0.35)]"
                >
                  Complete Setup
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
          <Link href="/login" className="text-[11.5px] font-medium text-[var(--text3)] hover:text-[var(--text)] transition-colors">
            Cancel and return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
