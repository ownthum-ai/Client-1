"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Settings() {
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const { lockPin, resetSystem, systemPin, setSystemPin } = useStore();
  const router = useRouter();

  const handleCloseSystem = () => {
    lockPin();
    router.push('/');
  };

  const handleRestartSystem = () => {
    if (confirm("Are you sure you want to restart the system? This will delete all data and start from zero.")) {
      resetSystem();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const activePin = systemPin || '1234';
    if (currentPin.join('') !== activePin) {
      setError(true);
      setSaved(false);
      return;
    }
    
    if (newPin.join('') !== confirmPin.join('')) {
      alert("Confirm PIN does not match new PIN!");
      return;
    }

    setSystemPin(newPin.join(''));
    setError(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setCurrentPin(['', '', '', '']);
      setNewPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
    }, 3000);
  };

  const renderPinInputs = (state: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, idPrefix: string) => (
    <div className="flex gap-3">
      {[0, 1, 2, 3].map(i => (
        <input
          key={`${idPrefix}-${i}`}
          type="password"
          maxLength={1}
          className="w-[50px] h-[55px] text-center text-[22px] font-bold border border-[var(--border)] rounded-[9px] focus:outline-none bg-gray-50"
          value={state[i]}
          onChange={(e) => {
            const val = [...state];
            val[i] = e.target.value.replace(/[^0-9]/g, '');
            setter(val);
            if (e.target.value && i < 3) {
              // Use refs instead of direct DOM access in a real implementation
              // For now, we'll keep it but note this is not ideal in React
              setTimeout(() => {
                document.getElementById(`${idPrefix}-${i + 1}`)?.focus();
              }, 0);
            }
          }}
          id={`${idPrefix}-${i}`}
        />
      ))}
    </div>
  );

  return (
    <div className="text-left">
      <div className="flex items-start justify-between mb-10 gap-3">
        <div className="text-left">
          <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2">Settings</h1>
          <p className="text-[12.5px] text-[var(--text3)] font-medium">Change security and app settings</p>
        </div>
      </div>

      <div className="w-full max-w-[600px] space-y-6">

        {/* Details */}
        <Card className="p-6 bg-white border-[var(--border)] shadow-sm">
          <div className="flex items-start gap-4 mb-2 text-left">
            <div className="w-[50px] h-[50px] rounded-lg bg-[var(--gold)] flex items-center justify-center text-white text-[16px] font-bold shrink-0 shadow-sm">
              OM
            </div>
            <div className="text-left">
              <h3 className="text-[16px] font-bold text-[var(--text)]">Owner</h3>
              <p className="text-[12px] text-[var(--text3)] mb-1">Admin account</p>
              <button className="text-[11.5px] font-bold text-[var(--gold)] hover:underline mt-1">Edit profile</button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-white border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-[18px_24px] border-b border-[var(--border)] bg-gray-50/30 text-left">
            <h2 className="text-[14px] font-bold text-[var(--text)] uppercase tracking-wider">Change pin</h2>
            <p className="text-[12.5px] text-[var(--text3)] mt-1 font-medium">Update the 4-digit pin to secure the system.</p>
          </div>

          <div className="p-8 text-left">
            <form onSubmit={handleSave} className="flex flex-col gap-8">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-[var(--text3)] mb-3 uppercase tracking-[2px]">Current pin</label>
                {renderPinInputs(currentPin, setCurrentPin, 'cp')}
              </div>

              <div className="h-[1px] bg-[var(--border)] w-full"></div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-[var(--text3)] mb-3 uppercase tracking-[2px]">New pin</label>
                {renderPinInputs(newPin, setNewPin, 'np')}
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-[var(--text3)] mb-3 uppercase tracking-[2px]">Confirm new pin</label>
                {renderPinInputs(confirmPin, setConfirmPin, 'cnp')}
              </div>

              <div className="flex items-center gap-4 mt-2">
                <Button
                  type="submit"
                  v2={true}
                  disabled={currentPin.join('').length < 4 || newPin.join('').length < 4 || confirmPin.join('').length < 4}
                  className="px-10 h-12 shadow-sm rounded-xl font-bold uppercase text-[11px] tracking-wider"
                >
                  Save
                </Button>
                {saved && (
                  <span className="text-[11px] font-bold text-green-600 flex items-center gap-1.5 uppercase tracking-wider">
                    Pin updated
                  </span>
                )}
                {error && (
                  <span className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 uppercase tracking-wider">
                    Incorrect current PIN
                  </span>
                )}
              </div>
            </form>
          </div>
        </Card>

        {/* System Controls */}
        <Card className="bg-white border-[var(--border)] shadow-sm overflow-hidden mt-6">
          <div className="p-[18px_24px] border-b border-[var(--border)] bg-gray-50/30 text-left">
            <h2 className="text-[14px] font-bold text-[var(--text)] uppercase tracking-wider">System settings</h2>
            <p className="text-[12px] text-[var(--text3)] mt-1 font-medium">Control app access and data.</p>
          </div>
          <div className="p-8 flex flex-col md:flex-row gap-6 text-left">
            <div className="flex-1 p-6 rounded-2xl bg-gray-50 border border-[var(--border)] text-left shadow-inner">
              <h3 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[2px] mb-2 opacity-70">Lock system</h3>
              <p className="text-[10px] font-bold text-[var(--text3)] mb-6 leading-relaxed uppercase opacity-60">Locks the system. No data is lost.</p>
              <Button
                type="button"
                v2={true}
                variant="secondary"
                onClick={handleCloseSystem}
                className="w-full h-12 rounded-xl border-[var(--border)] bg-white font-bold text-[10px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
              >
                <LockClosedIcon className="w-4 h-4" />
                Lock system
              </Button>
            </div>
            <div className="flex-1 p-6 rounded-2xl bg-red-50 border border-red-100 text-left shadow-inner">
              <h3 className="text-[10px] font-bold text-red-900 uppercase tracking-[2px] mb-2 opacity-70">Reset system</h3>
              <p className="text-[10px] font-bold text-red-600/60 mb-6 leading-relaxed uppercase opacity-60">Deletes all data and resets the system.</p>
              <Button
                type="button"
                v2={true}
                onClick={handleRestartSystem}
                className="w-full h-12 rounded-xl bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset system
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
