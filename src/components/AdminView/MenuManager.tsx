import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  Sparkles,
  Check,
  X,
  FileText,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { MenuItem, ExtractedMenuItem, Business } from '../../types';
import { SAMPLE_MENU_OCR_TEXT } from '../../data/initialData';
import { api, getAuthToken } from '../../utils/api';

interface MenuManagerProps {
  business: Business;
  menuItems: MenuItem[];
  onRefreshMenu: () => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({
  business,
  menuItems,
  onRefreshMenu,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'ai_extract'>('items');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  // AI Extraction state
  const [menuImageBase64, setMenuImageBase64] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedMenuItem[]>([]);
  const [extractionError, setExtractionError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState(false);

  const [extractionWarning, setExtractionWarning] = useState<string>('');

  // Sample menu images for one-click testing
  const sampleMenuPresets = [
    {
      label: 'Artisanal Cafe Board',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      description: 'Coffee, Toasts, Croissants',
    },
    {
      label: 'Bistro Food Menu',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      description: 'Sandwiches, Burgers & Salads',
    },
  ];

  // Quick toggle availability
  const handleToggleAvailability = async (itemId: string, current: boolean) => {
    try {
      await api.toggleMenuItemAvailability(business.slug, itemId, !current);
      onRefreshMenu();
    } catch (e) {
      console.error('Failed to toggle availability:', e);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      await api.deleteMenuItem(business.slug, itemId);
      onRefreshMenu();
    } catch (e) {
      console.error('Failed to delete item:', e);
    }
  };

  // Save (Create or Update) manual item
  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemPayload: MenuItem = {
      id: editingItem ? editingItem.id : `menu_${Date.now()}`,
      businessId: business.id,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: (formData.get('category') as string) || 'General',
      description: formData.get('description') as string,
      image:
        (formData.get('image') as string) ||
        'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
      isVeg: formData.get('isVeg') === 'true',
      isAvailable: formData.get('isAvailable') === 'true',
      isPopular: formData.get('isPopular') === 'true',
    };

    try {
      await api.saveMenuItems(business.slug, itemPayload);
      setEditingItem(null);
      setIsNewItemModalOpen(false);
      onRefreshMenu();
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  // Image Upload Handler for AI Extractor
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setMenuImageBase64(base64);
      setImagePreviewUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Vision Extraction
  const handleRunAiExtraction = async (useSampleText = false) => {
    setIsExtracting(true);
    setExtractionError('');
    setExtractionWarning('');
    setImportSuccess(false);

    try {
      const payload: any = {};
      if (useSampleText) {
        payload.sampleText = SAMPLE_MENU_OCR_TEXT;
      } else if (menuImageBase64) {
        payload.imageBase64 = menuImageBase64;
      } else {
        payload.sampleText = SAMPLE_MENU_OCR_TEXT;
      }

      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/menu/extract', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.items && Array.isArray(data.items)) {
        setExtractedItems(data.items);
        if (data.warning) {
          setExtractionWarning(data.warning);
        }
      } else {
        const errorMsg = data.message?.includes('503') || data.message?.includes('high demand')
          ? 'AI server is experiencing temporary high demand spikes. Please try again in 15-30 seconds.'
          : (data.error || 'Failed to extract items from photo.');
        setExtractionError(errorMsg);
      }
    } catch (err: any) {
      setExtractionError(err.message || 'Error communicating with AI service. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Bulk import extracted items into the live menu
  const handleImportExtracted = async () => {
    if (extractedItems.length === 0) return;

    const newMenuItems: MenuItem[] = extractedItems.map((item, index) => ({
      id: `menu_ai_${Date.now()}_${index}`,
      businessId: business.id,
      name: item.name,
      price: item.price || 150,
      category: item.category || 'General',
      description: item.description || '',
      isVeg: Boolean(item.isVeg),
      isAvailable: true,
      isPopular: false,
      image: item.isVeg
        ? 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
    }));

    try {
      // Append to current menu
      const updatedMenu = [...menuItems, ...newMenuItems];
      await api.saveMenuItems(business.slug, updatedMenu);
      setImportSuccess(true);
      setExtractedItems([]);
      setMenuImageBase64('');
      setImagePreviewUrl('');
      onRefreshMenu();
      setTimeout(() => {
        setImportSuccess(false);
        setActiveTab('items');
      }, 1500);
    } catch (err) {
      console.error('Failed to import menu items:', err);
    }
  };

  return (
    <div id="menu-manager-section" className="space-y-4">
      {/* Sub-navigation bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-xs border border-stone-200/80">
        <div className="flex gap-1">
          <button
            id="tab-manual-items-btn"
            onClick={() => setActiveTab('items')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'items'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Live Menu ({menuItems.length})
          </button>

          <button
            id="tab-ai-extract-btn"
            onClick={() => setActiveTab('ai_extract')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ai_extract'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Menu Scanner</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full font-bold">
              Gemini Vision
            </span>
          </button>
        </div>

        {activeTab === 'items' && (
          <button
            id="add-item-btn"
            onClick={() => {
              setEditingItem(null);
              setIsNewItemModalOpen(true);
            }}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {/* Manual Items View */}
      {activeTab === 'items' && (
        <div className="space-y-3">
          {menuItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
              <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-800">Your Menu is Empty</h4>
              <p className="text-xs text-stone-500 mt-1 mb-4">
                Add your items manually or use the AI Menu Scanner to extract from a paper photo!
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setIsNewItemModalOpen(true)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                >
                  Add Item Manually
                </button>
                <button
                  onClick={() => setActiveTab('ai_extract')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Paper Menu</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  id={`admin-item-${item.id}`}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200/80 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center p-0.5 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        {item.category}
                      </span>
                      {item.isPopular && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full">
                          Bestseller
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm">{item.name}</h4>
                    <div className="text-sm font-extrabold text-stone-900 mt-0.5">
                      ₹{item.price}
                    </div>
                    {item.description && (
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}

                    {/* In-stock status toggle */}
                    <div className="mt-3 flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 relative" />
                        <span className="text-[11px] font-semibold text-stone-600">
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsNewItemModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Menu Extractor View */}
      {activeTab === 'ai_extract' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Digitize Paper Menu with Gemini Vision
                </h3>
                <p className="text-xs text-stone-500">
                  Upload a photo of your printed menu board or chalkboard, and AI will automatically extract item names, categories, and prices.
                </p>
              </div>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-stone-50/50">
              {imagePreviewUrl ? (
                <div className="space-y-3">
                  <img
                    src={imagePreviewUrl}
                    alt="Menu preview"
                    className="max-h-56 mx-auto rounded-xl shadow-xs object-cover"
                  />
                  <div className="flex justify-center gap-2">
                    <label className="cursor-pointer text-xs font-bold text-stone-700 bg-white border border-stone-200 px-3 py-1.5 rounded-xl hover:bg-stone-50">
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => {
                        setImagePreviewUrl('');
                        setMenuImageBase64('');
                      }}
                      className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-stone-800">
                    Click to upload photo of your paper menu
                  </div>
                  <div className="text-xs text-stone-400">
                    PNG, JPG or JPEG from camera or gallery
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* One-click Sample Presets for Testing */}
            <div className="mt-4 pt-4 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-500 block mb-2">
                Or test with instant demo menu board:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleRunAiExtraction(true)}
                  disabled={isExtracting}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Extract Sample Artisan Cafe Menu</span>
                </button>
              </div>
            </div>

            {/* Run Button */}
            {imagePreviewUrl && (
              <div className="mt-4">
                <button
                  id="run-ai-extract-btn"
                  onClick={() => handleRunAiExtraction(false)}
                  disabled={isExtracting}
                  className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing with Gemini Vision...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Menu Items with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {extractionError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{extractionError}</span>
              </div>
            )}

            {extractionWarning && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{extractionWarning}</span>
              </div>
            )}
          </div>

          {/* Extracted Items Review & Import Table */}
          {extractedItems.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Review Extracted Items ({extractedItems.length})
                  </h4>
                  <p className="text-xs text-stone-500">
                    Edit names or prices if needed, then import directly to your live menu.
                  </p>
                </div>
                <button
                  id="confirm-import-btn"
                  onClick={handleImportExtracted}
                  className="py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Import All to Live Menu</span>
                </button>
              </div>

              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Items successfully imported into your digital menu!</span>
                </div>
              )}

              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {extractedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-stone-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-xs border-2 flex items-center justify-center p-0.5 ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...extractedItems];
                            updated[idx].name = e.target.value;
                            setExtractedItems(updated);
                          }}
                          className="font-bold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 flex gap-2">
                        <span>Category: {item.category}</span>
                        {item.description && <span>• {item.description}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-stone-700">₹</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => {
                          const updated = [...extractedItems];
                          updated[idx].price = Number(e.target.value);
                          setExtractedItems(updated);
                        }}
                        className="w-16 px-2 py-1 bg-stone-100 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                      />
                      <button
                        onClick={() => {
                          const updated = extractedItems.filter((_, i) => i !== idx);
                          setExtractedItems(updated);
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Item Add/Edit Modal */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsNewItemModalOpen(false);
                }}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Item Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingItem?.name || ''}
                  placeholder="e.g. Classic Cappuccino"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    defaultValue={editingItem?.price || 180}
                    placeholder="180"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Category *
                  </label>
                  <input
                    name="category"
                    type="text"
                    required
                    defaultValue={editingItem?.category || 'Beverages'}
                    placeholder="e.g. Hot Coffee, Mains"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingItem?.description || ''}
                  placeholder="Ingredients, brewing style, flavor notes..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Photo URL
                </label>
                <input
                  name="image"
                  type="url"
                  defaultValue={editingItem?.image || ''}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Dietary Tag</label>
                  <select
                    name="isVeg"
                    defaultValue={editingItem ? String(editingItem.isVeg) : 'true'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    <option value="true">🟢 Vegetarian</option>
                    <option value="false">🔴 Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Availability</label>
                  <select
                    name="isAvailable"
                    defaultValue={editingItem ? String(editingItem.isAvailable) : 'true'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  name="isPopular"
                  type="checkbox"
                  id="popular-checkbox"
                  defaultChecked={editingItem?.isPopular || false}
                  value="true"
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="popular-checkbox" className="font-semibold text-stone-700 cursor-pointer">
                  Mark as Bestseller / Popular
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsNewItemModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
