import React, { useState, useEffect } from 'react';
import { DEMO_BUSINESS } from './data/initialData';
import { Business, MenuItem } from './types';
import { CustomerHub } from './components/CustomerView/CustomerHub';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { StaffPinModal } from './components/AdminView/StaffPinModal';
import { api, getCurrentUser, getAuthToken } from './utils/api';

const getInitialSlug = (): string => {
  if (typeof window === 'undefined') return 'meetup-cafe';
  const searchParams = new URLSearchParams(window.location.search);
  const bizParam = searchParams.get('biz') || searchParams.get('b') || searchParams.get('shop');
  if (bizParam && bizParam.trim()) {
    return bizParam.trim().toLowerCase();
  }
  const path = window.location.pathname.replace(/^\/+/, '').trim();
  if (path && path !== '' && !path.startsWith('api') && !path.includes('.')) {
    return path.toLowerCase();
  }
  return 'meetup-cafe';
};

const getInitialViewMode = (): 'customer' | 'admin' | 'onboarding' => {
  if (typeof window === 'undefined') return 'customer';
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode');
  if (mode === 'admin') return 'admin';
  if (mode === 'onboarding') return 'onboarding';
  return 'customer';
};

export default function App() {
  const [currentSlug, setCurrentSlug] = useState<string>(getInitialSlug);
  const [business, setBusiness] = useState<Business | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [viewMode, setViewMode] = useState<'customer' | 'admin' | 'onboarding'>(getInitialViewMode);
  const [loading, setLoading] = useState(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(() => {
    const user = getCurrentUser();
    if (user?.role === 'admin') return true;
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('dev') === 'true' || localStorage.getItem('onecard_is_developer') === 'true';
  });

  // Verify auth session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const res = await api.getMe();
      if (res.authenticated && res.user) {
        if (res.user.role === 'admin') {
          setIsDeveloper(true);
        } else if (res.user.role === 'owner') {
          setIsDeveloper(false);
          // If owner is trying to view a shop they don't own in admin mode, redirect to their shop
          if (res.user.assignedShopSlug && currentSlug !== res.user.assignedShopSlug && viewMode === 'admin') {
            setCurrentSlug(res.user.assignedShopSlug);
          }
        }
      }
    };
    verifyAuth();
  }, [viewMode]);

  const handleSwitchToAdmin = (isDev = false) => {
    if (isDev) {
      setIsDeveloper(true);
    }
    const user = getCurrentUser();
    const token = getAuthToken();
    if (user && token) {
      if (user.role === 'admin' || (user.role === 'owner' && user.assignedShopSlug === currentSlug)) {
        setIsDeveloper(user.role === 'admin');
        setViewMode('admin');
        return;
      }
    }
    setIsPinModalOpen(true);
  };

  // On mount: if no explicit ?biz in URL, query the server/database for latest active shop
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const bizParam = searchParams.get('biz') || searchParams.get('b') || searchParams.get('shop');
    const path = window.location.pathname.replace(/^\/+/, '').trim();
    const hasExplicitSlug = Boolean(bizParam || (path && !path.startsWith('api') && !path.includes('.')));

    if (!hasExplicitSlug) {
      api.getActiveSlug()
        .then((slug) => {
          if (slug && slug !== currentSlug) {
            setCurrentSlug(slug);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Sync state when URL search params or history popstate changes
  useEffect(() => {
    const handleUrlChange = () => {
      const slug = getInitialSlug();
      const mode = getInitialViewMode();
      setCurrentSlug(slug);
      setViewMode(mode);
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Fetch business and menu items from server/database
  const loadData = async (slugToLoad = currentSlug) => {
    try {
      setLoading(true);
      const biz = await api.getBusiness(slugToLoad);
      setBusiness(biz);

      const menu = await api.getMenu(slugToLoad);
      setMenuItems(menu);
    } catch (err: any) {
      console.warn(`Could not load shop "${slugToLoad}":`, err.message);
      // Fallback: try loading active business from DB
      try {
        const activeSlug = await api.getActiveSlug();
        if (activeSlug && activeSlug !== slugToLoad) {
          setCurrentSlug(activeSlug);
          return;
        }
      } catch {}
      // Fallback to default demo if server has not responded yet
      setBusiness(DEMO_BUSINESS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentSlug);
  }, [currentSlug]);

  const handleSelectBusiness = (slug: string, mode: 'customer' | 'admin' = 'admin') => {
    setCurrentSlug(slug);
    setViewMode(mode);
    api.setActiveSlug(slug).catch(() => {});
    const newUrl = mode === 'admin' ? `/?biz=${slug}&mode=admin` : `/?biz=${slug}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleOnboardingComplete = (newBiz: Business, targetMode: 'admin' | 'customer' = 'admin') => {
    setIsDeveloper(true);
    setBusiness(newBiz);
    setCurrentSlug(newBiz.slug);
    setMenuItems([]);
    setViewMode(targetMode);
    const newUrl = targetMode === 'admin' ? `/?biz=${newBiz.slug}&mode=admin` : `/?biz=${newBiz.slug}`;
    window.history.pushState({}, '', newUrl);
  };

  if (!business && loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 animate-pulse">
          <span className="text-white font-black text-lg">1C</span>
        </div>
        <p className="text-stone-400 font-medium text-xs">Loading OneCard...</p>
      </div>
    );
  }

  const currentBusiness = business || DEMO_BUSINESS;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Main Active View */}
      <div className="flex-1">
        {viewMode === 'customer' && (
          <CustomerHub
            business={currentBusiness}
            menuItems={menuItems}
            onSwitchToAdmin={handleSwitchToAdmin}
          />
        )}

        {viewMode === 'admin' && (
          <AdminDashboard
            business={currentBusiness}
            menuItems={menuItems}
            isDeveloper={isDeveloper}
            onToggleDeveloper={(val) => setIsDeveloper(val)}
            onSwitchToCustomer={() => setViewMode('customer')}
            onStartNewOnboarding={() => setViewMode('onboarding')}
            onRefreshData={() => loadData(currentBusiness.slug)}
            onUpdateBusiness={(updated) => setBusiness(updated)}
            onSelectBusiness={handleSelectBusiness}
          />
        )}

        {viewMode === 'onboarding' && (
          <OnboardingWizard
            onComplete={handleOnboardingComplete}
            onCancel={() => setViewMode('customer')}
          />
        )}

        {/* Staff PIN gate */}
        <StaffPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={(isDev) => {
            setIsPinModalOpen(false);
            setIsDeveloper(Boolean(isDev));
            setViewMode('admin');
          }}
          business={currentBusiness}
        />
      </div>
    </div>
  );
}
