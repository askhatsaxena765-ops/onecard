import React, { useState, useEffect } from 'react';
import { Business } from '../../types';
import { DEMO_BUSINESS } from '../../data/initialData';
import {
  Store,
  Check,
  ExternalLink,
  Plus,
  Copy,
  X,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { getBusinessPublicUrl } from '../../utils/qr';

interface ShopSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlug: string;
  onSelectShop: (slug: string, mode?: 'admin' | 'customer') => void;
  onAddNewShop: () => void;
}

export const ShopSwitcherModal: React.FC<ShopSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentSlug,
  onSelectShop,
  onAddNewShop,
}) => {
  const [allShops, setAllShops] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchShops = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/businesses');
        let serverShops: Business[] = [];
        if (res.ok) {
          serverShops = await res.json();
        }

        // Merge with local storage shops in case server restarted
        let localShops: Business[] = [];
        try {
          const raw = localStorage.getItem('onecard_saved_shops');
          if (raw) {
            localShops = JSON.parse(raw);
          }
        } catch (e) {}

        const map = new Map<string, Business>();

        // Always include default demo
        map.set(DEMO_BUSINESS.slug, DEMO_BUSINESS);

        // Add server shops
        serverShops.forEach((b) => map.set(b.slug, b));

        // Add local shops
        localShops.forEach((b) => {
          if (!map.has(b.slug)) {
            map.set(b.slug, b);
          }
        });

        const list = Array.from(map.values());
        setAllShops(list);

        // Keep local storage updated with full list
        try {
          localStorage.setItem('onecard_saved_shops', JSON.stringify(list));
        } catch (e) {}
      } catch (err) {
        console.error('Error fetching shops list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredShops = allShops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const url = getBusinessPublicUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
                All Shops & Locations
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Switch active shop, view client cards, or create new ones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-stone-100">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, category, or slug..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Shops List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-stone-400 font-medium">
              Loading shops...
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No shops match &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredShops.map((shop) => {
              const isCurrent = shop.slug === currentSlug;
              return (
                <div
                  key={shop.slug}
                  onClick={() => {
                    onSelectShop(shop.slug, 'admin');
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrent
                      ? 'bg-stone-50 border-stone-900/80 shadow-xs ring-1 ring-stone-900/10'
                      : 'bg-white border-stone-200/80 hover:border-stone-400 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: shop.brandColor || '#059669' }}
                    >
                      {shop.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-stone-900 truncate">
                          {shop.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-stone-900 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Check className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider bg-stone-100 px-1.5 py-0.2 rounded">
                          {shop.category || 'Shop'}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400 truncate">
                          ?biz={shop.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(e, shop.slug)}
                      title="Copy Public Link"
                      className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-white text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      {copiedSlug === shop.slug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectShop(shop.slug, 'customer');
                        onClose();
                      }}
                      title="Open Customer Card View"
                      className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-white text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & New Shop Action */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/70 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Each shop has a permanent URL: <strong className="font-mono text-stone-700">/?biz=slug</strong></span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onAddNewShop();
              }}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Shop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
