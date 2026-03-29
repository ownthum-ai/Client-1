"use client";
import React, { useState } from 'react';

export default function Settings() {
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
          className="w-[50px] h-[55px] text-center text-[22px] font-bold border border-[var(--border)] rounded-[9px] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,150,59,0.2)] bg-[#FAFAF8] transition-colors"
          value={state[i]}
          onChange={(e) => {
            const val = [...state];
            val[i] = e.target.value.replace(/[^0-9]/g, '');
            setter(val);
            if (e.target.value && i < 3) {
              document.getElementById(`${idPrefix}-${i+1}`)?.focus();
            }
          }}
          id={`${idPrefix}-${i}`}
        />
      ))}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <div className="font-[family-name:var(--font-instrument)] text-[24px] text-[var(--text)] leading-tight">Settings</div>
          <div className="text-[12.5px] text-[var(--text3)] mt-[2px]">Manage your account security and preferences</div>
        </div>
      </div>

      <div className="w-full max-w-[600px]">
        
        {/* Profile Section */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh)] mb-5">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-[50px] h-[50px] rounded-lg bg-[var(--gold)] flex items-center justify-center text-white text-[16px] font-bold shrink-0 shadow-sm">
              OM
            </div>
            <div>
              <div className="text-[16px] font-bold text-[var(--text)]">Owner Management</div>
              <div className="text-[12px] text-[var(--text3)] mb-1">Super Admin Account</div>
              <button className="text-[11.5px] font-medium text-[var(--gold)] hover:underline mt-1">Edit Profile</button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--r-lg)] shadow-[var(--sh)] overflow-hidden">
          <div className="p-[18px_24px] border-b border-[var(--border)] bg-[#FAFAF8]">
            <h2 className="text-[14px] font-semibold text-[var(--text)]">Change Secret PIN</h2>
            <p className="text-[12.5px] text-[var(--text3)] mt-1">Update the 4-digit PIN used to unlock sensitive cash records.</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              
              <div>
                <label className="block text-[11.5px] font-semibold text-[var(--text2)] mb-2 uppercase tracking-[1px]">Current PIN</label>
                {renderPinInputs(currentPin, setCurrentPin, 'cp')}
              </div>

              <div className="h-[1px] bg-[var(--border)] w-full block my-1"></div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[var(--text2)] mb-2 uppercase tracking-[1px]">New PIN</label>
                {renderPinInputs(newPin, setNewPin, 'np')}
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[var(--text2)] mb-2 uppercase tracking-[1px]">Confirm New PIN</label>
                {renderPinInputs(confirmPin, setConfirmPin, 'cnp')}
              </div>

              <div className="flex items-center gap-4 mt-2">
                <button 
                  type="submit" 
                  disabled={currentPin.join('').length < 4 || newPin.join('').length < 4 || confirmPin.join('').length < 4}
                  className="px-[20px] py-[10px] rounded-[7px] border-none bg-[var(--gold)] text-white font-semibold text-[13px] transition-all hover:bg-[var(--gold-dk)] hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[var(--gold)] shadow-sm"
                >
                  Save New PIN
                </button>
                {saved && (
                  <span className="text-[13px] font-medium text-black animate-in fade-in slide-in-from-left-2 flex items-center gap-1.5">
                    <span className="bg-[#FAFAF8] px-1.5 py-0.5 rounded-[4px] text-[11px]">✓</span> PIN Successfully Updated
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
