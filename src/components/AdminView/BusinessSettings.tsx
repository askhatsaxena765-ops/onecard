import React, { useState } from 'react';
import {
  Save,
  Check,
  Building,
  Clock,
  Palette,
  Award,
  Link as LinkIcon,
  Phone,
} from 'lucide-react';
import { Business, BusinessCategory, BusinessHours } from '../../types';
import { api } from '../../utils/api';

interface BusinessSettingsProps {
  business: Business;
  onUpdateBusiness: (updated: Business) => void;
}

const BRAND_COLORS = [
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Deep Indigo', hex: '#4f46e5' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Berry Rose', hex: '#e11d48' },
  { name: 'Espresso Bronze', hex: '#78350f' },
  { name: 'Midnight Slate', hex: '#1e293b' },
];

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  business,
  onUpdateBusiness,
}) => {
  const [formData, setFormData] = useState<Business>({ ...business });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof Business, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHourChange = (index: number, key: keyof BusinessHours, value: any) => {
    const newHours = [...formData.hours];
    newHours[index] = { ...newHours[index], [key]: value };
    setFormData((prev) => ({ ...prev, hours: newHours }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.updateBusiness(formData.slug, formData);
      onUpdateBusiness(data);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving business profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      id="business-settings-form"
      onSubmit={handleSave}
      className="space-y-4 max-w-2xl mx-auto pb-12"
    >
      {/* Basic Profile */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Building className="w-4 h-4 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900">
            Business Profile & Branding
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Store URL Handle (Slug) *
            </label>
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
              <span className="text-stone-400 font-semibold mr-1">onecard.app/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full bg-transparent font-bold text-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as BusinessCategory)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
            >
              <option value="cafe">Cafe / Bakery</option>
              <option value="restaurant">Restaurant / Bistro</option>
              <option value="salon">Salon & Spa</option>
              <option value="retail">Retail Boutique</option>
              <option value="other">Other Local Shop</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-bold text-stone-700 mb-1">Logo URL</label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => handleChange('logo', e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Brand Theme Color Selector */}
        <div className="pt-2 text-xs">
          <label className="block font-bold text-stone-700 mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-stone-500" />
            <span>Brand Accent Color</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {BRAND_COLORS.map((col) => {
              const isSelected = formData.brandColor === col.hex;
              return (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => handleChange('brandColor', col.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-stone-900 bg-stone-100 font-bold shadow-2xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact & Links */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Phone className="w-4 h-4 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900">
            Contact Details & Links
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Phone (Tap to Call)
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              WhatsApp (Tap to Chat)
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-bold text-stone-700 mb-1">
            Physical Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Google Review Booster URL
            </label>
            <input
              type="url"
              value={formData.googleReviewUrl}
              onChange={(e) => handleChange('googleReviewUrl', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
            />
          </div>
        </div>
      </div>

      {/* Loyalty Program Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Award className="w-4 h-4 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900">
            Digital Loyalty Card Settings
          </h3>
        </div>

        <div className="text-xs">
          <label className="block font-bold text-stone-700 mb-2">Loyalty Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  loyaltyConfig: { ...prev.loyaltyConfig, mode: 'stamp' },
                }))
              }
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.loyaltyConfig.mode === 'stamp'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs font-bold'
                  : 'border-stone-200 bg-white text-stone-600'
              }`}
            >
              <div className="font-bold text-stone-900">Digital Stamp Card</div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                "Buy 9, Get 1 Free" visual punch pass
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  loyaltyConfig: { ...prev.loyaltyConfig, mode: 'points' },
                }))
              }
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.loyaltyConfig.mode === 'points'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs font-bold'
                  : 'border-stone-200 bg-white text-stone-600'
              }`}
            >
              <div className="font-bold text-stone-900">Points System</div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Earn X points per visit or spend
              </div>
            </button>
          </div>
        </div>

        {formData.loyaltyConfig.mode === 'stamp' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Stamps Required for Free Reward
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={formData.loyaltyConfig.stampTarget}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    loyaltyConfig: {
                      ...prev.loyaltyConfig,
                      stampTarget: Number(e.target.value),
                    },
                  }))
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Reward Title
              </label>
              <input
                type="text"
                value={formData.loyaltyConfig.stampRewardTitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    loyaltyConfig: {
                      ...prev.loyaltyConfig,
                      stampRewardTitle: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. Free Artisanal Coffee or Pastry"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Security & Owner PIN */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Owner & Staff Security PIN</h3>
            <p className="text-xs text-stone-500">
              4-digit security code used to access this Admin Portal and punch customer loyalty cards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              4-Digit Access PIN
            </label>
            <input
              type="password"
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
              value={formData.staffPin || '8808'}
              onChange={(e) => handleChange('staffPin', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base tracking-widest font-bold text-stone-900"
              placeholder="8808"
            />
            <p className="text-[11px] text-stone-400 mt-1">Default is <strong>8808</strong>. Enter any 4 digits.</p>
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Owner Mobile Number
            </label>
            <input
              type="tel"
              value={formData.ownerPhone || ''}
              onChange={(e) => handleChange('ownerPhone', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
              placeholder="070558 08808"
            />
            <p className="text-[11px] text-stone-400 mt-1">Used for emergency recovery and alerts.</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 z-20">
        <button
          id="save-business-settings-btn"
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
