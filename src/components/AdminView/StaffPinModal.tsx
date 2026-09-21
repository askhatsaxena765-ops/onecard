import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, X } from 'lucide-react';
import { Business } from '../../types';

interface StaffPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isDev?: boolean) => void;
  business: Business;
}

export const StaffPinModal: React.FC<StaffPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  business,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const targetPin = business.staffPin || '8808';

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (candidatePin: string) => {
    // Master Developer PIN: unlocks multi-shop Agency tools
    if (candidatePin === '9999') {
      try {
        sessionStorage.setItem(`onecard_staff_auth_${business.slug}`, 'true');
        localStorage.setItem('onecard_is_developer', 'true');
      } catch (e) {}
      onSuccess(true);
      return;
    }

    // Normal Shop Staff PIN: unlocks ONLY this specific shop
    if (candidatePin === targetPin) {
      try {
        sessionStorage.setItem(`onecard_staff_auth_${business.slug}`, 'true');
        localStorage.removeItem('onecard_is_developer');
      } catch (e) {}
      onSuccess(false);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  return (
    <div
      id="staff-pin-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="staff-pin-modal-card"
        className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-stone-100 flex flex-col items-center text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md"
          style={{ backgroundColor: business.brandColor || '#b91c1c' }}
        >
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-stone-900 tracking-tight">Staff & Owner Portal</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-[220px]">
          Enter the 4-digit staff PIN to access stamps, menu editor & scanner.
        </p>

        {/* PIN Indicators */}
        <div className={`flex items-center justify-center gap-3 my-5 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                pin.length > i
                  ? error
                    ? 'bg-rose-500 border-rose-500 scale-110'
                    : 'bg-stone-900 border-stone-900 scale-110'
                  : 'bg-transparent border-stone-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 mb-2">
            Incorrect PIN. Try again.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[230px] my-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`pin-btn-${digit}`}
              onClick={() => handleDigit(digit)}
              className="w-16 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 font-bold text-base text-stone-800 flex items-center justify-center transition-all mx-auto shadow-2xs"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="w-16 h-12 rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-xs font-semibold text-stone-400 flex items-center justify-center transition-all mx-auto"
          >
            Clear
          </button>
          <button
            id="pin-btn-0"
            onClick={() => handleDigit('0')}
            className="w-16 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 font-bold text-base text-stone-800 flex items-center justify-center transition-all mx-auto shadow-2xs"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-12 rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-xs font-semibold text-stone-600 flex items-center justify-center transition-all mx-auto"
          >
            ⌫
          </button>
        </div>

        <p className="text-[11px] text-stone-400 mt-4">
          Default Owner PIN: <strong className="text-stone-600 font-mono">8808</strong>
        </p>
      </div>
    </div>
  );
};
