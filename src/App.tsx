import React, { useState, useEffect } from 'react';
import { DEMO_BUSINESS, DEMO_MENU_ITEMS } from './data/initialData';
import { Business, MenuItem } from './types';
import { CustomerHub } from './components/CustomerView/CustomerHub';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { StaffPinModal } from './components/AdminView/StaffPinModal';

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
  const savedActive = localStorage.getItem('onecard_active_slug');
  if (savedActive && savedActive.trim() && savedActive !== 'moti-mahal-delux' && savedActive !== 'demo') {
    return savedActive.trim().toLowerCase();
  }
  // Clear any old stored demo slug
  if (savedActive === 'moti-mahal-delux') {
    try {
      localStorage.setItem('onecard_active_slug', 'meetup-cafe');
    } catch (e) {}
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
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('dev') === 'true' || localStorage.getItem('onecard_is_developer') === 'true';
  });

  const handleSwitchToAdmin = (isDev = false) => {
    if (isDev) {
      setIsDeveloper(true);
    }
    if (business) {
      try {
        const isAuth = sessionStorage.getItem(`onecard_staff_auth_${business.slug}`);
        if (isAuth === 'true') {
          setViewMode('admin');
          return;
        }
      } catch (e) {}
    }
    setIsPinModalOpen(true);
  };

  // On mount: if no explicit ?biz in URL, query the server for latest active shop
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const bizParam = searchParams.get('biz') || searchParams.get('b') || searchParams.get('shop');
    const path = window.location.pathname.replace(/^\/+/, '').trim();
    const hasExplicitSlug = Boolean(bizParam || (path && !path.startsWith('api') && !path.includes('.')));

    if (!hasExplicitSlug) {
      fetch('/api/active-slug')
        .then((res) => res.json())
        .then((data) => {
          if (data?.slug) {
            localStorage.setItem('onecard_active_slug', data.slug);
            if (data.slug !== currentSlug) {
              setCurrentSlug(data.slug);
            }
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

  // Fetch business and menu items from server
  const loadData = async (slugToLoad = currentSlug) => {
    try {
      setLoading(true);
      const bizRes = await fetch(`/api/businesses/${slugToLoad}`);
      if (bizRes.ok) {
        const bizData = await bizRes.json();
        setBusiness(bizData);
      } else if (bizRes.status === 404) {
        // Fallback: load active business
        const activeRes = await fetch('/api/active-slug');
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          if (activeData?.slug && activeData.slug !== slugToLoad) {
            setCurrentSlug(activeData.slug);
            return;
          }
        }
        // Fallback to demo business if nothing else exists
        setBusiness(DEMO_BUSINESS);
      }

      const menuRes = await fetch(`/api/businesses/${slugToLoad}/menu`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData);
      } else {
        setMenuItems([]);
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
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
    localStorage.setItem('onecard_active_slug', slug);
    fetch('/api/active-slug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
    const newUrl = mode === 'admin' ? `/?biz=${slug}&mode=admin` : `/?biz=${slug}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleOnboardingComplete = (newBiz: Business, targetMode: 'admin' | 'customer' = 'admin') => {
    // Save to local storage registry
    try {
      const raw = localStorage.getItem('onecard_saved_shops');
      const list: Business[] = raw ? JSON.parse(raw) : [DEMO_BUSINESS];
      if (!list.some((b) => b.slug === newBiz.slug)) {
        list.push(newBiz);
      }
      localStorage.setItem('onecard_saved_shops', JSON.stringify(list));
    } catch (e) {}

    localStorage.setItem('onecard_active_slug', newBiz.slug);
    localStorage.setItem('onecard_is_developer', 'true');
    setIsDeveloper(true);

    fetch('/api/active-slug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newBiz.slug }),
    }).catch(() => {});

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
