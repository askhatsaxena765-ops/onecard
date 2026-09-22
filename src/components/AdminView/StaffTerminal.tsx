import React, { useState } from 'react';
import {
  Coffee,
  CheckCircle2,
  Gift,
  Plus,
  Search,
  Sparkles,
  Star,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Business, CustomerLoyalty } from '../../types';
import { api } from '../../utils/api';

interface StaffTerminalProps {
  business: Business;
  onRefreshBusiness: () => void;
}

export const StaffTerminal: React.FC<StaffTerminalProps> = ({
  business,
  onRefreshBusiness,
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [stampCount, setStampCount] = useState(1);
  const [visitNote, setVisitNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastPunchedCustomer, setLastPunchedCustomer] = useState<CustomerLoyalty | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [qualifiesForReward, setQualifiesForReward] = useState(false);

  // Quick demo customers to quickly test without typing
  const quickTestPhones = [
    { name: 'Rohan (8 stamps)', phone: '9876543210' },
    { name: 'Priya (9 stamps - Ready)', phone: '9988776655' },
    { name: 'New Customer', phone: '9811223344' },
  ];

  const handlePunch = async (action: 'stamp' | 'points' | 'redeem') => {
    if (!phoneInput || phoneInput.trim().length < 4) {
      alert('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      const data = await api.punchLoyalty(business.slug, {
        phone: phoneInput.trim(),
        action,
        amount: action === 'stamp' ? stampCount : 25,
        note: visitNote.trim() || 'Store visit',
        rewardTitle: business.loyaltyConfig?.stampRewardTitle,
      });

      setLastPunchedCustomer(data.customer);
      setQualifiesForReward(data.qualifiesForReward);
      setShowCelebration(true);
      onRefreshBusiness();
    } catch (err) {
      console.error('Error punching customer card:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShowCelebration(false);
    setPhoneInput('');
    setVisitNote('');
    setStampCount(1);
  };

  const stampTarget = business.loyaltyConfig?.stampTarget || 9;

  return (
    <div id="staff-terminal-view" className="space-y-4 max-w-xl mx-auto">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Staff Stamping Terminal
            </span>
            <h2 className="text-lg font-black text-stone-900 mt-2">
              Reward Customer Visit
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter customer's phone number after their order to punch their digital card.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Coffee className="w-6 h-6" />
          </div>
        </div>

        {/* Quick Demo Pre-fill Buttons */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="text-[11px] font-semibold text-stone-400 mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Quick test phone numbers:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickTestPhones.map((qp) => (
              <button
                key={qp.phone}
                id={`quick-phone-${qp.phone}`}
                type="button"
                onClick={() => setPhoneInput(qp.phone)}
                className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                  phoneInput === qp.phone
                    ? 'bg-stone-900 text-white border-stone-900 font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {qp.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Punch Form or Celebration Modal */}
      {!showCelebration ? (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Customer Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                +91
              </span>
              <input
                id="staff-phone-input"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                maxLength={10}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold tracking-wider text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Visit Note / Order Items (Optional)
            </label>
            <input
              id="staff-note-input"
              type="text"
              value={visitNote}
              onChange={(e) => setVisitNote(e.target.value)}
              placeholder="e.g. 2x Cappuccino + Croissant"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Stamp selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
            <div>
              <span className="text-xs font-bold text-stone-800">Stamps to Add</span>
              <span className="text-[10px] text-stone-400 block">Default 1 stamp per visit</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStampCount(Math.max(1, stampCount - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-black text-stone-900">
                {stampCount}
              </span>
              <button
                type="button"
                onClick={() => setStampCount(stampCount + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              id="staff-punch-stamp-btn"
              type="button"
              disabled={loading || !phoneInput}
              onClick={() => handlePunch('stamp')}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Processing...' : `Punch Card (+${stampCount} Stamp)`}</span>
            </button>

            <button
              id="staff-redeem-btn"
              type="button"
              disabled={loading || !phoneInput}
              onClick={() => handlePunch('redeem')}
              className="w-full py-2.5 px-4 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Redeem Free Reward ({business.loyaltyConfig?.stampRewardTitle})</span>
            </button>
          </div>
        </div>
      ) : (
        /* Celebration / Success Screen */
        <div className="bg-white rounded-2xl p-6 shadow-md border border-stone-200/80 text-center animate-in zoom-in-95 duration-200 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-stone-900">
              Stamp Added Successfully!
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Customer: <strong>+91 {lastPunchedCustomer?.phone}</strong>
            </p>
          </div>

          {/* Progress preview */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="text-xs font-bold text-stone-700 mb-1">
              Current Balance: {lastPunchedCustomer?.stamps} of {stampTarget} Stamps
            </div>
            <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    ((lastPunchedCustomer?.stamps || 0) / stampTarget) * 100
                  )}%`,
                }}
              />
            </div>
            {qualifiesForReward && (
              <div className="mt-3 p-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Customer has earned a FREE Reward!</span>
              </div>
            )}
          </div>

          {/* Review prompt reminder note */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-left flex items-start gap-2.5">
            <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
            <div className="text-xs text-stone-600 leading-normal">
              <strong>Google Review Prompt Activated:</strong> If the customer has their OneCard open, a friendly review prompt just popped up to encourage them to leave 5 stars!
            </div>
          </div>

          <button
            id="next-customer-btn"
            onClick={handleReset}
            className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            Punch Next Customer
          </button>
        </div>
      )}
    </div>
  );
};
