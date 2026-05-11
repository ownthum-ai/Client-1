"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { ShieldCheckIcon, KeyIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

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
    router.push('/login');
  };

  const [mounted, setMounted] = React.useState(false); React.useEffect(() => { setMounted(true); }, []); if (!mounted) return null;

  return (
    <div className="w-full max-w-[500px]">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl">
           <ShieldCheckIcon className="w-8 h-8" />
        </div>
        <h1 className="text-[32px] text-gray-900 font-bold leading-none text-center tracking-tight uppercase">Security Setup</h1>
        <div className="text-[12px] text-gray-400 mt-3 font-bold uppercase tracking-widest">Step {step} of 2</div>
      </div>

      <div className="bg-white border-2 border-[var(--border)] rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gray-900"></div>
        
        {step === 1 && (
          <div className="text-left">
            <div className="flex items-center justify-center gap-3 mb-4">
               <KeyIcon className="w-6 h-6 text-amber-600" />
               <h2 className="text-[18px] font-bold text-gray-900 uppercase">Set Access PIN</h2>
            </div>
            <p className="text-[13px] text-gray-400 text-center mb-10 font-bold uppercase tracking-wide leading-relaxed">
              Create a 4-digit PIN to secure your administrative records.
            </p>
            
            <div className="flex flex-col items-center gap-10 mb-10">
              <div>
                <Label className="text-center mb-4">New PIN</Label>
                <div className="flex gap-4 justify-center">
                  {[0, 1, 2, 3].map(i => (
                    <input 
                      key={`pin-${i}`}
                      type="password"
                      maxLength={1}
                      className="w-[60px] h-[70px] text-center text-[28px] font-bold border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-gray-900 bg-gray-50 shadow-md transition-none"
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
                <Label className="text-center mb-4">Verify PIN</Label>
                <div className="flex gap-4 justify-center">
                  {[0, 1, 2, 3].map(i => (
                    <input 
                      key={`cpin-${i}`}
                      type="password"
                      maxLength={1}
                      className="w-[60px] h-[70px] text-center text-[28px] font-bold border-2 border-[var(--border)] rounded-2xl focus:outline-none focus:border-gray-900 bg-gray-50 shadow-md transition-none"
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

            <Button 
              onClick={() => setStep(2)}
              disabled={pin.join('').length < 4 || confirmPin.join('').length < 4 || pin.join('') !== confirmPin.join('')}
              className="w-full h-[56px] rounded-2xl bg-gray-900 text-white font-bold text-[14px] uppercase tracking-[2px] shadow-xl disabled:opacity-30"
            >
              Continue to Recovery
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="text-left">
            <div className="flex items-center justify-center gap-3 mb-4">
               <QuestionMarkCircleIcon className="w-6 h-6 text-amber-600" />
               <h2 className="text-[18px] font-bold text-gray-900 uppercase">Recovery Settings</h2>
            </div>
            <p className="text-[13px] text-gray-400 text-center mb-10 font-bold uppercase tracking-wide leading-relaxed">
              Set a security question to regain access if you forget your PIN.
            </p>
            
            <form onSubmit={handleFinish} className="space-y-10">
                <div className="space-y-4">
                   <Label required>Security Question</Label>
                   <Select 
                     v2={true}
                     value={question}
                     onChange={e => setQuestion(e.target.value)}
                     className="h-[56px] rounded-2xl"
                   >
                     {questions.map(q => <option key={q} value={q}>{q}</option>)}
                   </Select>
                </div>
              
              <div className="space-y-4">
                <Label required>Your Secret Answer</Label>
                <Input 
                  v2={true}
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="h-[56px] rounded-2xl"
                  placeholder="Enter secret answer"
                  required
                />
              </div>

              <div className="flex gap-6 pt-4">
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="w-[120px] h-[56px] rounded-2xl font-bold text-[14px] uppercase tracking-widest shadow-md"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-[56px] rounded-2xl bg-gray-900 text-white font-bold text-[14px] uppercase tracking-[2px] shadow-xl"
                >
                  Save & Complete
                </Button>
              </div>
            </form>
          </div>
        )}
        
        <div className="mt-10 pt-8 border-t-2 border-[var(--border)] text-center">
          <Link href="/login" className="text-[12px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest">
            Cancel setup
          </Link>
        </div>
      </div>
    </div>
  );
}
