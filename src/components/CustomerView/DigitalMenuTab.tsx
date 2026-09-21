import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  AlertCircle,
  Bell,
  Droplets,
  ReceiptText,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  X,
  Check,
} from 'lucide-react';
import { MenuItem, Business } from '../../types';

interface DigitalMenuTabProps {
  items: MenuItem[];
  business: Business;
}

export const DigitalMenuTab: React.FC<DigitalMenuTabProps> = ({
  items,
  business,
}) => {
  const brandColor = business.brandColor || '#b91c1c';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('Table 4');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [sentAlert, setSentAlert] = useState<string | null>(null);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (vegOnly && !item.isVeg) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCat = item.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, vegOnly, searchQuery]);

  // Cart operations
  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalCartCount: number = (Object.values(cart) as number[]).reduce(
    (sum, qty) => sum + (Number(qty) || 0),
    0
  );

  const totalCartAmount: number = useMemo(() => {
    return Object.entries(cart).reduce((sum: number, [id, qty]) => {
      const item = items.find((i) => i.id === id);
      const quantity = Number(qty) || 0;
      return sum + (item ? item.price * quantity : 0);
    }, 0);
  }, [cart, items]);

  const cleanWhatsApp = (business.whatsapp || business.phone || '917055808808').replace(/[^0-9]/g, '');

  // Quick Waiter / Table Requests
  const sendTableRequest = (type: 'waiter' | 'water' | 'bill') => {
    let message = '';
    if (type === 'waiter') {
      message = `🛎️ *Service Request* from *${tableNumber}* at ${business.name}: Please send a server to our table.`;
    } else if (type === 'water') {
      message = `💧 *Service Request* from *${tableNumber}* at ${business.name}: Please bring fresh drinking water to our table.`;
    } else if (type === 'bill') {
      message = `🧾 *Service Request* from *${tableNumber}* at ${business.name}: Please bring the dining bill for our table.`;
    }

    const url = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setSentAlert(`Requested ${type} for ${tableNumber}`);
    setTimeout(() => setSentAlert(null), 3500);
  };

  // Send Order to Kitchen via WhatsApp
  const handleSendOrderWhatsApp = () => {
    const orderLines: string[] = [];
    Object.entries(cart).forEach(([id, qty]) => {
      const item = items.find((i) => i.id === id);
      const quantity = Number(qty) || 0;
      if (item) {
        orderLines.push(`• ${quantity}x ${item.name} (₹${item.price * quantity})`);
      }
    });

    const fullMessage =
      `🍽️ *Dine-in Order from ${tableNumber}*\n` +
      `*${business.name}*\n` +
      `---------------------------------\n` +
      orderLines.join('\n') +
      `\n---------------------------------\n` +
      `*Total: ₹${totalCartAmount}*\n` +
      (specialInstructions.trim() ? `📝 Note: ${specialInstructions.trim()}\n` : '') +
      `\n_Please confirm order and send to kitchen._`;

    const url = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');
    setIsOrderModalOpen(false);
    setSentAlert(`Order sent via WhatsApp for ${tableNumber}!`);
    setTimeout(() => setSentAlert(null), 4000);
  };

  return (
    <div id="digital-menu-section" className="space-y-4 pb-24 animate-in fade-in duration-300 relative">
      {/* Toast Alert */}
      {sentAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{sentAlert}</span>
        </div>
      )}

      {/* Table Service Quick Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-stone-200/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700">Your Table:</span>
            <select
              id="table-number-select"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-900 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15].map((num) => (
                <option key={num} value={`Table ${num}`}>
                  Table {num}
                </option>
              ))}
              <option value="Takeaway / Counter">Takeaway / Counter</option>
            </select>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">Direct Waiter Call</span>
        </div>

        {/* 3 Quick Action Service Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            id="call-waiter-quick-btn"
            onClick={() => sendTableRequest('waiter')}
            className="py-2 px-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 active:scale-95 text-stone-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Call Waiter</span>
          </button>

          <button
            id="request-water-quick-btn"
            onClick={() => sendTableRequest('water')}
            className="py-2 px-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200/70 active:scale-95 text-blue-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Water</span>
          </button>

          <button
            id="request-bill-quick-btn"
            onClick={() => sendTableRequest('bill')}
            className="py-2 px-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/70 active:scale-95 text-emerald-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <ReceiptText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Get Bill</span>
          </button>
        </div>
      </div>

      {/* Search & Veg Filter Toolbar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-stone-200/80 space-y-3 sticky top-12 z-20 backdrop-blur-md bg-white/95">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="menu-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Dal Makhani, Paneer, Naan..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-100/80 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Veg Only Toggle & Results Count */}
        <div className="flex items-center justify-between pt-1">
          <button
            id="veg-only-toggle"
            type="button"
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span className="w-4 h-4 rounded-xs border-2 border-emerald-600 flex items-center justify-center p-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </span>
            <span>Pure Veg Only</span>
          </button>

          <span className="text-xs text-stone-400 font-medium">
            {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
          </span>
        </div>

        {/* Horizontal Category Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-pill-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
                style={isSelected ? { backgroundColor: brandColor } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-stone-800">No dishes found</h4>
          <p className="text-xs text-stone-500 mt-1">
            Try searching for another dish or reset filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const itemQuantity = cart[item.id] || 0;
            return (
              <div
                key={item.id}
                id={`menu-card-${item.id}`}
                className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                  item.isAvailable
                    ? 'border-stone-200/80 hover:shadow-md'
                    : 'border-stone-200/50 opacity-60 bg-stone-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left details */}
                  <div className="flex-1 min-w-0 pr-1">
                    {/* Veg / Non-Veg Indicator & Badges */}
                    <div className="flex items-center gap-2 mb-1.5">
                      {item.isVeg ? (
                        <span
                          title="Pure Vegetarian"
                          className="w-4 h-4 rounded-xs border-2 border-emerald-600 flex items-center justify-center p-0.5 shrink-0"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        </span>
                      ) : (
                        <span
                          title="Non-Vegetarian"
                          className="w-4 h-4 rounded-xs border-2 border-rose-600 flex items-center justify-center p-0.5 shrink-0"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                        </span>
                      )}

                      {item.isPopular && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                          Legendary Bestseller
                        </span>
                      )}

                      {!item.isAvailable && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          Sold Out Today
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm tracking-tight leading-snug">
                      {item.name}
                    </h3>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-sm font-extrabold text-stone-900">
                        ₹{item.price}
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        taxes included
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Right photo & Add Button */}
                  <div className="flex flex-col items-center shrink-0">
                    {item.image && (
                      <div className="relative w-24 h-22 rounded-xl overflow-hidden bg-stone-100 shadow-2xs mb-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center text-white text-[10px] font-bold text-center px-1">
                            Sold Out
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add to Order Button */}
                    {item.isAvailable && (
                      <div className="mt-1">
                        {itemQuantity === 0 ? (
                          <button
                            id={`add-btn-${item.id}`}
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-stone-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5 text-stone-600" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-stone-900 text-white rounded-xl px-2 py-1 shadow-xs">
                            <button
                              id={`minus-btn-${item.id}`}
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="w-5 h-5 rounded-md hover:bg-stone-700 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3 text-stone-200" />
                            </button>
                            <span className="text-xs font-black min-w-[12px] text-center">
                              {itemQuantity}
                            </span>
                            <button
                              id={`plus-btn-${item.id}`}
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="w-5 h-5 rounded-md hover:bg-stone-700 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3 text-stone-200" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Bar (Appears when items are added) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-3 left-0 right-0 max-w-md mx-auto px-4 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-stone-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-stone-800">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs"
                style={{ backgroundColor: brandColor }}
              >
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-200">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} ·{' '}
                  <span className="text-white font-extrabold">₹{totalCartAmount}</span>
                </div>
                <div className="text-[11px] text-stone-400">For {tableNumber}</div>
              </div>
            </div>

            <button
              id="view-order-summary-btn"
              onClick={() => setIsOrderModalOpen(true)}
              className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 text-stone-950"
              style={{ backgroundColor: '#22c55e' }}
            >
              <span>Review Order</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Order Summary & WhatsApp Dispatch Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">
                  {tableNumber} Order Summary
                </h3>
                <p className="text-xs text-stone-400">{business.name}</p>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Itemized List */}
            <div className="divide-y divide-stone-100 my-3">
              {Object.entries(cart).map(([id, qty]) => {
                const item = items.find((i) => i.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="text-stone-400">₹{item.price} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateCartQuantity(id, -1)}
                          className="text-stone-600 hover:text-stone-900 font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-stone-800 px-1">{qty}</span>
                        <button
                          onClick={() => updateCartQuantity(id, 1)}
                          className="text-stone-600 hover:text-stone-900 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-black text-stone-900 min-w-[50px] text-right">
                        ₹{item.price * (Number(qty) || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Instructions */}
            <div className="my-2">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Special Kitchen Instructions (Optional)
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Mild spice, crisp naans, extra onions"
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Total Calculation */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 my-2 flex items-center justify-between text-sm">
              <span className="font-bold text-stone-600">Total Payable:</span>
              <span className="text-base font-black text-stone-900">₹{totalCartAmount}</span>
            </div>

            {/* Dispatch Button */}
            <div className="space-y-2 mt-2">
              <button
                id="send-whatsapp-order-btn"
                onClick={handleSendOrderWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Send Order to Waiter / Kitchen (WhatsApp)</span>
              </button>
              <button
                onClick={() => setCart({})}
                className="w-full py-2 text-stone-400 hover:text-stone-700 text-xs font-semibold"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time footer note */}
      <div className="p-3 text-center text-xs text-stone-400">
        Authentic North Indian specialties prepared fresh to order.
      </div>
    </div>
  );
};
