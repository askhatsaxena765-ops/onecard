import React, { useState } from 'react';
import {
  Coffee,
  Utensils,
  QrCode,
  BarChart3,
  Settings,
  Eye,
  PlusCircle,
  Sparkles,
  ExternalLink,
  Lock,
  ChevronDown,
  Store,
} from 'lucide-react';
import { Business, MenuItem } from '../../types';
import { clearAuthSession } from '../../utils/api';
import { StaffTerminal } from './StaffTerminal';
import { MenuManager } from './MenuManager';
import { QRStudio } from './QRStudio';
import { AnalyticsView } from './AnalyticsView';
import { BusinessSettings } from './BusinessSettings';
import { ShopSwitcherModal } from './ShopSwitcherModal';

interface AdminDashboardProps {
  business: Business;
  menuItems: MenuItem[];
  isDeveloper?: boolean;
  onToggleDeveloper?: (val: boolean) => void;
  onSwitchToCustomer: () => void;
  onStartNewOnboarding: () => void;
  onRefreshData: () => void;
  onUpdateBusiness: (updated: Business) => void;
  onSelectBusiness?: (slug: string, mode?: 'admin' | 'customer') => void;
}

export type AdminTabType =
  | 'terminal'
  | 'menu'
  | 'qr'
  | 'analytics'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  business,
  menuItems,
  isDeveloper = false,
  onToggleDeveloper,
  onSwitchToCustomer,
  onStartNewOnboarding,
  onRefreshData,
  onUpdateBusiness,
  onSelectBusiness,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('terminal');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const handleLock = () => {
    try {
      sessionStorage.removeItem(`onecard_staff_auth_${business.slug}`);
      clearAuthSession();
    } catch (e) {}
    onSwitchToCustomer();
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Business Identity */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0"
              style={{ backgroundColor: business.brandColor || '#059669' }}
            >
              {business.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base text-stone-900 tracking-tight">
                  {business.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200/60 hidden sm:inline-block">
                  {business.category}
                </span>
                {isDeveloper && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                    Agency / Dev Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <span>Merchant Hub</span>
                <span>•</span>
                <span className="font-mono text-stone-400 text-[10px]">
                  onecard.app/{business.slug}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Developer Only: All Shops & New Shop Buttons */}
            {isDeveloper && (
              <>
                <button
                  id="developer-all-shops-btn"
                  type="button"
                  onClick={() => setIsSwitcherOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Agency directory: Switch between client shops"
                >
                  <Store className="w-3.5 h-3.5 text-purple-700" />
                  <span>All Shops</span>
                </button>

                <button
                  id="developer-new-shop-btn"
                  onClick={onStartNewOnboarding}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  title="Onboard New Client Shop"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Shop</span>
                </button>
              </>
            )}

            <button
              id="preview-customer-hub-btn"
              onClick={onSwitchToCustomer}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer View</span>
            </button>

            <button
              id="lock-portal-btn"
              onClick={handleLock}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-stone-600 text-xs font-semibold transition-colors flex items-center gap-1"
              title="Lock portal with staff PIN"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Portal</span>
            </button>

            {isDeveloper && (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('onecard_is_developer');
                  if (onToggleDeveloper) onToggleDeveloper(false);
                  alert('Exited Developer Mode. You are now viewing as the shop owner.');
                }}
                className="text-[10px] text-stone-400 hover:text-stone-700 underline px-1"
                title="Exit Agency mode to preview regular shop owner view"
              >
                Exit Dev
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-stone-200/80 mb-6 flex overflow-x-auto scrollbar-none gap-1">
          <button
            id="tab-admin-terminal"
            onClick={() => setActiveTab('terminal')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'terminal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Staff Terminal (Punch)</span>
          </button>

          <button
            id="tab-admin-menu"
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'menu'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Digital Menu & AI Scanner</span>
          </button>

          <button
            id="tab-admin-qr"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'qr'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Standee & Code</span>
          </button>

          <button
            id="tab-admin-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics & WhatsApp</span>
          </button>

          <button
            id="tab-admin-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Branding</span>
          </button>
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === 'terminal' && (
            <StaffTerminal
              business={business}
              onRefreshBusiness={onRefreshData}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManager
              business={business}
              menuItems={menuItems}
              onRefreshMenu={onRefreshData}
            />
          )}

          {activeTab === 'qr' && <QRStudio business={business} />}

          {activeTab === 'analytics' && <AnalyticsView business={business} />}

          {activeTab === 'settings' && (
            <BusinessSettings
              business={business}
              onUpdateBusiness={onUpdateBusiness}
            />
          )}
        </div>
      </div>

      {/* Switch Shop / Locations Modal */}
      <ShopSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentSlug={business.slug}
        onSelectShop={(slug, mode) => {
          if (onSelectBusiness) {
            onSelectBusiness(slug, mode);
          }
        }}
        onAddNewShop={() => {
          setIsSwitcherOpen(false);
          onStartNewOnboarding();
        }}
      />
    </div>
  );
};
