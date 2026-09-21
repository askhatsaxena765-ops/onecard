import React, { useState, useEffect } from 'react';
import { CreditCard, Utensils, Award, Star, Lock } from 'lucide-react';
import { Business, MenuItem } from '../../types';
import { BusinessCardTab } from './BusinessCardTab';
import { DigitalMenuTab } from './DigitalMenuTab';
import { LoyaltyCardTab } from './LoyaltyCardTab';
import { ReviewPromptModal } from './ReviewPromptModal';
import { StaffPinModal } from '../AdminView/StaffPinModal';

interface CustomerHubProps {
  business: Business;
  menuItems: MenuItem[];
  onSwitchToAdmin: (isDev?: boolean) => void;
}

export type TabType = 'card' | 'menu' | 'loyalty';

export const CustomerHub: React.FC<CustomerHubProps> = ({
  business,
  menuItems,
  onSwitchToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('card');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handleAdminClick = () => {
    try {
      const isAuth = sessionStorage.getItem(`onecard_staff_auth_${business.slug}`);
      if (isAuth === 'true') {
        const isDev = localStorage.getItem('onecard_is_developer') === 'true';
        onSwitchToAdmin(isDev);
        return;
      }
    } catch (e) {}
    setIsPinModalOpen(true);
  };

  // Track QR scan / page view on mount
  useEffect(() => {
    fetch(`/api/businesses/${business.slug}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'qr_scan' }),
    }).catch((err) => console.error('Error logging scan:', err));
  }, [business.slug]);

  const handleOpenReview = () => {
    setIsReviewModalOpen(true);
    fetch(`/api/businesses/${business.slug}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'review_prompt_view' }),
    }).catch((err) => console.error('Error logging review view:', err));
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      {/* Mobile container constraint */}
      <div className="w-full max-w-md bg-stone-50 min-h-screen shadow-2xl flex flex-col relative border-x border-stone-200/60">
        {/* Sticky App Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-2xs"
              style={{ backgroundColor: business.brandColor || '#059669' }}
            >
              1C
            </div>
            <span className="font-extrabold text-sm tracking-tight text-stone-900 truncate max-w-[170px]">
              {business.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="header-review-btn"
              onClick={handleOpenReview}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1 hover:bg-amber-100 transition-colors"
              title="Leave a Google Review"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Review</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation Pill Bar */}
        <nav className="px-4 pt-3 pb-1 bg-stone-50">
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-stone-200/70 border border-stone-300/40">
            <button
              id="tab-btn-card"
              onClick={() => setActiveTab('card')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'card'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Contact</span>
            </button>

            <button
              id="tab-btn-menu"
              onClick={() => setActiveTab('menu')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'menu'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>

            <button
              id="tab-btn-loyalty"
              onClick={() => setActiveTab('loyalty')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === 'loyalty'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Loyalty</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>
        </nav>

        {/* Main Tab Content */}
        <main className="flex-1 px-4 py-3">
          {activeTab === 'card' && (
            <BusinessCardTab
              business={business}
              onOpenReviewModal={handleOpenReview}
            />
          )}

          {activeTab === 'menu' && (
            <DigitalMenuTab
              items={menuItems}
              business={business}
            />
          )}

          {activeTab === 'loyalty' && (
            <LoyaltyCardTab
              business={business}
              onOpenReviewModal={handleOpenReview}
            />
          )}
        </main>

        {/* Bottom Persistent Brand Footer */}
        <footer className="mt-auto py-4 px-4 text-center border-t border-stone-200 bg-white">
          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 font-medium">
            <span>Powered by</span>
            <strong className="text-stone-700 font-extrabold flex items-center gap-1">
              <span
                className="w-3.5 h-3.5 rounded-xs inline-flex items-center justify-center text-white text-[8px] font-black"
                style={{ backgroundColor: business.brandColor || '#059669' }}
              >
                1C
              </span>
              OneCard
            </strong>
            <span>•</span>
            <button
              id="staff-secret-entry-btn"
              onClick={handleAdminClick}
              className="text-stone-300 hover:text-stone-600 transition-colors p-1"
              title="Staff PIN Login"
              aria-label="Staff Login"
            >
              <Lock className="w-3 h-3 inline" />
            </button>
          </div>
        </footer>

        {/* Compliant Google Review Booster Modal */}
        <ReviewPromptModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          business={business}
        />

        {/* Staff Security PIN Protection Modal */}
        <StaffPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={(isDev) => {
            setIsPinModalOpen(false);
            onSwitchToAdmin(isDev);
          }}
          business={business}
        />
      </div>
    </div>
  );
};
