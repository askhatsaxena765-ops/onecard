import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  Phone,
  Clock,
  Sparkles,
  QrCode,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Eye,
} from 'lucide-react';
import { Business, BusinessCategory } from '../../types';
import { api } from '../../utils/api';
import { generateQRCodeDataUrl, downloadQRCodeImage, getBusinessPublicUrl } from '../../utils/qr';

interface OnboardingWizardProps {
  onComplete: (business: Business, targetMode?: 'admin' | 'customer') => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Phone + OTP
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 2: Basic info
  const [name, setName] = useState('Velvet Roast Coffee & Kitchen');
  const [slug, setSlug] = useState('velvet-roast');
  const [category, setCategory] = useState<BusinessCategory>('cafe');
  const [tagline, setTagline] = useState('Specialty Pour-Overs, Sourdough Melts & Bakes');
  const [logo, setLogo] = useState(
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80'
  );

  // Step 3: Contact & Links
  const [phone, setPhone] = useState('+91 98765 43210');
  const [whatsapp, setWhatsapp] = useState('+91 98765 43210');
  const [address, setAddress] = useState('14/2 Church Street, Bengaluru, Karnataka 560001');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    'https://search.google.com/local/writereview?placeid=ChIJbU60IKMWrjsR5p5Wn9'
  );
  const [instagram, setInstagram] = useState('velvetroast.blr');

  // Step 4: Hours & Brand Color
  const [brandColor, setBrandColor] = useState('#059669');

  // Step 5: Loyalty
  const [loyaltyMode, setLoyaltyMode] = useState<'stamp' | 'points'>('stamp');
  const [stampTarget, setStampTarget] = useState(9);
  const [stampRewardTitle, setStampRewardTitle] = useState('Free Coffee or Dessert');

  // Step 6: Completion & QR
  const [createdBusiness, setCreatedBusiness] = useState<Business | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const handleSendOtp = () => {
    if (phoneNumber.length < 10) return;
    setOtpSent(true);
    setOtpCode('4829'); // Simulated instantaneous OTP for frictionless flow
  };

  const handleVerifyOtp = () => {
    setOtpVerified(true);
    setCurrentStep(2);
  };

  const handleFinishSetup = async () => {
    const newBiz: Business = {
      id: `biz_${slug}_${Date.now()}`,
      slug,
      name,
      tagline,
      category,
      logo,
      phone,
      whatsapp,
      address,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      googleReviewUrl,
      socialLinks: {
        instagram,
      },
      hours: [
        { day: 'Monday', open: '08:00 AM', close: '10:00 PM' },
        { day: 'Tuesday', open: '08:00 AM', close: '10:00 PM' },
        { day: 'Wednesday', open: '08:00 AM', close: '10:00 PM' },
        { day: 'Thursday', open: '08:00 AM', close: '10:00 PM' },
        { day: 'Friday', open: '08:00 AM', close: '11:00 PM' },
        { day: 'Saturday', open: '08:00 AM', close: '11:00 PM' },
        { day: 'Sunday', open: '08:00 AM', close: '10:00 PM' },
      ],
      brandColor,
      loyaltyConfig: {
        mode: loyaltyMode,
        stampTarget,
        stampRewardTitle,
        stampDescription: `Collect ${stampTarget} stamps to unlock ${stampRewardTitle}`,
        pointsPerVisit: 20,
        pointRewards: [
          {
            id: 'pr_def',
            points: 100,
            title: stampRewardTitle,
            description: 'Redeemable on your next visit',
          },
        ],
      },
      stats: {
        qrScans: 0,
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        reviewPromptViews: 0,
        reviewPromptClicks: 0,
        rewardsRedeemed: 0,
        createdAt: new Date().toISOString().split('T')[0],
      },
      ownerPhone: phoneNumber,
    };

    try {
      const savedBiz = await api.createBusiness(newBiz);
      const qr = await generateQRCodeDataUrl(getBusinessPublicUrl(savedBiz.slug));
      setQrDataUrl(qr);
      setCreatedBusiness(savedBiz);
      setCurrentStep(6);
    } catch (err) {
      console.error('Error creating business:', err);
      // Even if network error, allow continuing to QR preview
      const qr = await generateQRCodeDataUrl(getBusinessPublicUrl(newBiz.slug));
      setQrDataUrl(qr);
      setCreatedBusiness(newBiz);
      setCurrentStep(6);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Step Progress Bar */}
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
              1C
            </span>
            <span className="font-extrabold text-sm text-stone-900">
              OneCard Quick Setup
            </span>
          </div>
          <div className="text-xs font-semibold text-stone-400">
            Step {currentStep} of 6
          </div>
        </div>

        {/* Step 1: Sign up Phone + OTP */}
        {currentStep === 1 && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Business Owner Sign-In
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Fast, passwordless login with your mobile phone number.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Send OTP via SMS
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-stone-700">
                        Enter 4-Digit OTP
                      </label>
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Auto-filled for testing: 4829
                      </span>
                    </div>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="4829"
                      maxLength={4}
                      className="w-full text-center py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-lg font-black tracking-widest text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue Setup</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-stone-400 hover:text-stone-600 font-medium"
              >
                Back to Demo Card
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business details */}
        {currentStep === 2 && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Tell us about your business
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                This appears on your customer-facing digital hub.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Custom URL Slug *
                </label>
                <div className="flex items-center bg-stone-100 rounded-xl px-3 py-2 border border-stone-200 font-mono text-xs">
                  <span className="text-stone-400 font-semibold">onecard.app/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="w-full bg-transparent font-bold text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                >
                  <option value="cafe">Cafe / Bakery</option>
                  <option value="restaurant">Restaurant / Eatery</option>
                  <option value="salon">Salon & Spa</option>
                  <option value="retail">Retail Boutique</option>
                  <option value="other">Other Store</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Tagline / Speciality
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact & Links */}
        {currentStep === 3 && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Contact & Social Links
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Enables tap-to-call, WhatsApp chat, and direct Google directions.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Phone (for customer calls)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Google Review Link (for 5-Star Booster)
                </label>
                <input
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Brand Accent Color */}
        {currentStep === 4 && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Choose Your Brand Accent
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Your digital card and QR standee will be styled with your brand color.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              {[
                { name: 'Emerald Cafe', hex: '#059669' },
                { name: 'Warm Amber Bistro', hex: '#d97706' },
                { name: 'Indigo Salon', hex: '#4f46e5' },
                { name: 'Rose Boutique', hex: '#e11d48' },
                { name: 'Espresso Roast', hex: '#78350f' },
                { name: 'Modern Charcoal', hex: '#1e293b' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setBrandColor(c.hex)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    brandColor === c.hex
                      ? 'border-stone-900 bg-stone-50 shadow-xs font-bold'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full ring-2 ring-black/10 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs text-stone-800 font-semibold">{c.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Loyalty setup */}
        {currentStep === 5 && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Setup Your Loyalty Card
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Turn first-time visitors into repeat regulars with a visual punch card.
              </p>
            </div>

            <div className="space-y-4 pt-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoyaltyMode('stamp')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    loyaltyMode === 'stamp'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs font-bold'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="font-bold text-stone-900">Stamp Card</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    "Buy 9, Get 1 Free" punch pass
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLoyaltyMode('points')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    loyaltyMode === 'points'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs font-bold'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="font-bold text-stone-900">Points System</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Points balance per order
                  </div>
                </button>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Stamps Required for Reward
                </label>
                <select
                  value={stampTarget}
                  onChange={(e) => setStampTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                >
                  <option value={5}>5 Stamps (Fast Reward)</option>
                  <option value={8}>8 Stamps</option>
                  <option value={9}>9 Stamps (Classic "Buy 9, 10th Free")</option>
                  <option value={10}>10 Stamps</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  value={stampRewardTitle}
                  onChange={(e) => setStampRewardTitle(e.target.value)}
                  placeholder="e.g. Free Specialty Coffee or Gourmet Pastry"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                id="finish-setup-btn"
                onClick={handleFinishSetup}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate OneCard & QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Congratulations & Download QR */}
        {currentStep === 6 && createdBusiness && (
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900">
                Setup Complete! 🎉
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                <strong>{createdBusiness.name}</strong> is live. Your unique QR code is ready to print and display on your counter.
              </p>
            </div>

            {/* QR Card */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-44 h-44 mx-auto"
                />
              )}
              <div className="mt-2 text-xs font-mono font-bold text-stone-700 break-all">
                ?biz={createdBusiness.slug}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="preview-new-shop-customer-btn"
                  onClick={() => onComplete(createdBusiness, 'customer')}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>View Customer Card</span>
                </button>

                <button
                  type="button"
                  id="launch-my-onecard-btn"
                  onClick={() => onComplete(createdBusiness, 'admin')}
                  className="py-3 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <span>Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const url = getBusinessPublicUrl(createdBusiness.slug);
                  navigator.clipboard.writeText(url);
                  alert(`Copied link for ${createdBusiness.name}:\n${url}`);
                }}
                className="w-full py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs text-stone-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Public Customer Link</span>
              </button>

              <button
                type="button"
                onClick={() => downloadQRCodeImage(qrDataUrl, createdBusiness.name)}
                className="w-full py-2.5 rounded-xl border border-stone-200 font-bold text-xs text-stone-600 hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print-Ready QR (PNG)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
