import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Gift,
  History,
  Phone,
  Sparkles,
  ArrowRight,
  LogOut,
  Coffee,
} from 'lucide-react';
import { Business, CustomerLoyalty } from '../../types';

interface LoyaltyCardTabProps {
  business: Business;
  onOpenReviewModal: () => void;
}

export const LoyaltyCardTab: React.FC<LoyaltyCardTabProps> = ({
  business,
  onOpenReviewModal,
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [customer, setCustomer] = useState<CustomerLoyalty | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Read remembered phone and cached loyalty profile from localStorage for instant offline/fast load
  useEffect(() => {
    const savedPhone = localStorage.getItem(`onecard_phone_${business.slug}`);
    const cachedLoyalty = localStorage.getItem(`onecard_loyalty_data_${business.slug}`);
    if (cachedLoyalty) {
      try {
        setCustomer(JSON.parse(cachedLoyalty));
      } catch (e) {}
    }

    if (savedPhone) {
      setPhoneInput(savedPhone);
      fetchLoyalty(savedPhone);
    } else {
      // Auto-load demo customer Rohan Sharma for instant evaluation
      if (business.slug === 'moti-mahal-delux' || business.slug === 'crave-cafe') {
        const demoPhone = '7055808808';
        setPhoneInput(demoPhone);
        fetchLoyalty(demoPhone);
      }
    }
  }, [business.slug]);

  const fetchLoyalty = async (phone: string) => {
    if (!phone || phone.trim().length < 4) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/businesses/${business.slug}/loyalty/${encodeURIComponent(phone.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
        localStorage.setItem(`onecard_phone_${business.slug}`, phone.trim());
        localStorage.setItem(`onecard_loyalty_data_${business.slug}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching loyalty, using cached state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.trim().length < 4) return;
    fetchLoyalty(phoneInput);
    setShowPhoneModal(false);
  };

  const handleSwitchPhone = () => {
    localStorage.removeItem(`onecard_phone_${business.slug}`);
    setCustomer(null);
    setPhoneInput('');
    setShowPhoneModal(true);
  };

  const loyaltyConfig = business.loyaltyConfig || {
    mode: 'stamp',
    stampTarget: 9,
    stampRewardTitle: 'Free Artisanal Coffee or Pastry',
    stampDescription: 'Collect 9 stamps to unlock a free handcrafted item!',
    pointsPerVisit: 25,
    pointRewards: [],
  };

  const stampTarget = loyaltyConfig.stampTarget || 9;
  const currentStamps = customer?.stamps || 0;
  const isRewardReady = currentStamps >= stampTarget;

  return (
    <div id="loyalty-card-section" className="space-y-4 pb-14 animate-in fade-in duration-300">
      {/* Phone number identifier bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-stone-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Linked Mobile Number
            </div>
            <div className="text-xs font-bold text-stone-800">
              {customer ? (
                <span>
                  +91 {customer.phone.slice(0, 5)} {customer.phone.slice(5)}
                </span>
              ) : (
                <span className="text-stone-400">Not linked yet</span>
              )}
            </div>
          </div>
        </div>

        <button
          id="switch-loyalty-phone-btn"
          onClick={() => setShowPhoneModal(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1"
        >
          <span>{customer ? 'Change' : 'Enter Phone'}</span>
        </button>
      </div>

      {/* Apple Wallet Style Punch Card */}
      <div
        id="digital-punch-card"
        className="rounded-3xl p-6 shadow-lg text-white relative overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${business.brandColor || '#059669'} 0%, #064e3b 100%)`,
        }}
      >
        {/* Subtle holographic circles / watermarks */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

        {/* Top Header of Card */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-200/80">
              ONE-PASS DIGITAL LOYALTY
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
              {business.name}
            </h2>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-2 ring-white/30 shadow-xs">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
        </div>

        {/* Reward Status Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/15 relative z-10">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs font-bold text-white leading-tight">
              {loyaltyConfig.stampRewardTitle}
            </span>
          </div>
          <p className="text-[11px] text-white/80 mt-1">
            {loyaltyConfig.stampDescription || 'Show this digital pass to the barista or cashier at checkout.'}
          </p>
        </div>

        {loyaltyConfig.mode === 'stamp' ? (
          /* Visual Punch Card Grid (Apple Wallet style) */
          <div className="mt-5 relative z-10">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-2.5">
              <span>Punch Progress</span>
              <span>
                {currentStamps} of {stampTarget} Stamps
              </span>
            </div>

            {/* Stamp Circles Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: stampTarget }).map((_, idx) => {
                const isStamped = idx < currentStamps;
                const isFinalRewardSlot = idx === stampTarget - 1;

                return (
                  <div
                    key={idx}
                    id={`stamp-slot-${idx + 1}`}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                      isStamped
                        ? 'bg-white text-emerald-900 shadow-md ring-2 ring-amber-300/80 scale-100'
                        : 'bg-white/15 border border-white/20 text-white/60'
                    }`}
                  >
                    {isStamped ? (
                      <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
                        {isFinalRewardSlot ? (
                          <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
                        ) : (
                          <Coffee className="w-5 h-5 text-emerald-700" />
                        )}
                        <span className="text-[9px] font-extrabold mt-0.5 text-emerald-800">
                          #{idx + 1}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {isFinalRewardSlot ? (
                          <Gift className="w-4 h-4 text-white/70" />
                        ) : (
                          <span className="text-xs font-bold text-white/50">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status Message */}
            <div className="mt-4 pt-3 border-t border-white/15 text-center">
              {isRewardReady ? (
                <div className="bg-amber-400 text-stone-950 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm animate-pulse">
                  <Sparkles className="w-4 h-4 text-stone-900" />
                  <span>Reward Unlocked! Show to staff to redeem.</span>
                </div>
              ) : (
                <div className="text-xs text-white/90 font-medium">
                  {stampTarget - currentStamps === 1 ? (
                    <strong className="text-amber-300 font-bold">
                      Just 1 more stamp to unlock your free reward! 🔥
                    </strong>
                  ) : (
                    <span>
                      Collect <strong>{stampTarget - currentStamps}</strong> more stamps to unlock your reward.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Points Mode */
          <div className="mt-5 relative z-10">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-white">
                  {customer?.points || 0}
                </span>
                <span className="text-xs font-medium text-emerald-200 ml-1.5">
                  Points Balance
                </span>
              </div>
              <span className="text-xs text-white/80 font-medium">
                +{loyaltyConfig.pointsPerVisit} pts / visit
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Redeemable Rewards
              </div>
              <div className="space-y-1.5">
                {loyaltyConfig.pointRewards?.map((r) => {
                  const canRedeem = (customer?.points || 0) >= r.points;
                  return (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        canRedeem
                          ? 'bg-white text-stone-900 border-white font-semibold'
                          : 'bg-white/10 text-white/70 border-white/10'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{r.title}</div>
                        <div className="text-[10px] opacity-80">{r.description}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          canRedeem
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {r.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How it Works / Instructions */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          How It Works (No App Download Needed)
        </h3>
        <div className="space-y-2 text-xs text-stone-600">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </div>
            <div>
              <strong>Order & tell your mobile number</strong> to the cashier or barista when paying.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </div>
            <div>
              <strong>Your digital card automatically stamps!</strong> It stays saved in this browser bookmark or whenever you scan the table QR.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </div>
            <div>
              <strong>Claim your free perk</strong> when you complete {stampTarget} stamps.
            </div>
          </div>
        </div>
      </div>

      {/* Customer Visit & Stamp History */}
      {customer && customer.history && customer.history.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-stone-500" />
            Recent Visit Activity
          </h3>
          <div className="divide-y divide-stone-100 text-xs">
            {customer.history.slice(0, 5).map((h) => (
              <div key={h.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">
                    {h.type === 'stamp_added'
                      ? `+${h.amount} Stamp Added`
                      : h.type === 'reward_redeemed'
                      ? '🎁 Reward Redeemed'
                      : `+${h.amount} Points`}
                  </div>
                  {h.note && (
                    <div className="text-[10px] text-stone-400">{h.note}</div>
                  )}
                </div>
                <span className="text-[11px] text-stone-400">{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Demo Stamping simulation button so the user can test the customer view! */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-center">
        <div className="text-xs font-bold text-emerald-900 mb-1">
          💡 Try the Live Experience
        </div>
        <p className="text-[11px] text-emerald-700 mb-2.5">
          Want to test adding a stamp and seeing the celebration & Google Review prompt?
        </p>
        <button
          id="simulate-stamp-btn"
          onClick={async () => {
            const phone = customer?.phone || '9876543210';
            const res = await fetch(`/api/businesses/${business.slug}/loyalty/punch`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone,
                action: 'stamp',
                amount: 1,
                note: 'Test visit simulated by customer',
              }),
            });
            if (res.ok) {
              const result = await res.json();
              setCustomer(result.customer);
              // Trigger friendly Google Review prompt after completed visit
              onOpenReviewModal();
            }
          }}
          className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 mx-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate Store Visit (+1 Stamp)</span>
        </button>
      </div>

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h4 className="text-base font-bold text-stone-900">
              Enter Your Mobile Number
            </h4>
            <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed">
              No password or account required! Your stamps will stay linked to your phone number.
            </p>

            <form onSubmit={handlePhoneSubmit} className="space-y-3">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  +91
                </span>
                <input
                  id="phone-modal-input"
                  type="tel"
                  autoFocus
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-2.5 bg-stone-100 rounded-xl text-sm font-semibold tracking-wider text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-phone-btn"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
