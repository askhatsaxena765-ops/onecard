import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  UserPlus,
  Instagram,
  Facebook,
  Globe,
  Share2,
  Check,
  Star,
  Sparkles,
  ExternalLink,
  UtensilsCrossed,
  Leaf,
} from 'lucide-react';
import { Business } from '../../types';
import { downloadVCard } from '../../utils/vcard';

interface BusinessCardTabProps {
  business: Business;
  onOpenReviewModal: () => void;
}

export const BusinessCardTab: React.FC<BusinessCardTabProps> = ({
  business,
  onOpenReviewModal,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedContact, setSavedContact] = useState(false);

  // Clean phone numbers for tel: and wa.me
  const cleanPhone = business.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = (business.whatsapp || business.phone).replace(/[^0-9]/g, '');

  const handleSaveContact = () => {
    downloadVCard(business);
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 3000);
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name}'s digital OneCard!`,
          url,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Check today's day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  const todayHours = business.hours.find(
    (h) => h.day.toLowerCase() === todayName.toLowerCase()
  );

  const ratingValue = business.rating || 4.6;
  const reviewCountValue = business.reviewCount || 258;

  return (
    <div id="business-card-section" className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Hero Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-stone-200/80 overflow-hidden relative">
        {/* Subtle top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: business.brandColor || '#b91c1c' }}
        />

        <div className="flex items-start gap-4 pt-1">
          <div className="relative">
            <img
              src={business.logo}
              alt={business.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-stone-100 shadow-xs"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=240&auto=format&fit=crop&q=80';
              }}
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {business.category}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Opens 11 am
              </span>
            </div>

            <h1 className="text-xl font-extrabold text-stone-900 mt-1.5 tracking-tight leading-snug break-words">
              {business.name}
            </h1>

            {/* Google Rating Badge */}
            <a
              id="google-maps-rating-badge"
              href={business.googleReviewUrl || business.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors text-xs"
            >
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
              </div>
              <span className="font-extrabold text-stone-900">{ratingValue}</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-600 font-medium">{reviewCountValue} Reviews</span>
              <ExternalLink className="w-3 h-3 text-stone-400 ml-0.5" />
            </a>

            <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
              {business.tagline}
            </p>

            {/* Vegetarian friendly highlight */}
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md w-fit">
              <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Serves vegetarian dishes</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons (Call, WhatsApp, Directions) */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-stone-100">
          <a
            id="call-business-btn"
            href={`tel:${cleanPhone}`}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-95 transition-all text-stone-800"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-2xs">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Call</span>
            <span className="text-[10px] text-stone-400">070558 08808</span>
          </a>

          <a
            id="whatsapp-business-btn"
            href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
              `Hi ${business.name}, I found your OneCard and would like to reserve a table / ask a question!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-95 transition-all text-stone-800"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 shadow-2xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">WhatsApp</span>
            <span className="text-[10px] text-stone-400">Quick chat</span>
          </a>

          <a
            id="directions-business-btn"
            href={business.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-95 transition-all text-stone-800"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Directions</span>
            <span className="text-[10px] text-stone-400">Bareilly Map</span>
          </a>
        </div>

        {/* Reservations / Swiggy link */}
        {(business.reservationsUrl || business.socialLinks?.swiggy) && (
          <div className="mt-3">
            <a
              id="swiggy-reservations-btn"
              href={business.reservationsUrl || business.socialLinks?.swiggy}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 font-semibold text-xs flex items-center justify-between transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                  S
                </div>
                <div>
                  <span className="font-bold">Reservations & Online Orders</span>
                  <span className="text-orange-700 text-[10px] block">via swiggy.com</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-orange-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>
        )}

        {/* Save to Phone Contacts (vCard) Button */}
        <div className="mt-3 flex gap-2">
          <button
            id="save-contact-vcf-btn"
            onClick={handleSaveContact}
            className="flex-1 py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.98]"
            style={{ backgroundColor: business.brandColor || '#b91c1c' }}
          >
            {savedContact ? (
              <>
                <Check className="w-4 h-4" />
                <span>Contact Downloaded!</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Save Contact to Phone</span>
              </>
            )}
          </button>

          <button
            id="share-card-btn"
            onClick={handleShareLink}
            aria-label="Share card"
            className="p-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 active:scale-95 transition-all flex items-center justify-center"
          >
            {copiedLink ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Google Review Callout Booster */}
      <div
        id="google-review-callout"
        onClick={onOpenReviewModal}
        className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/80 cursor-pointer hover:border-amber-300 active:scale-[0.99] transition-all flex items-center justify-between gap-3 shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Star className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-stone-900">Loved our Dal Makhani & Service?</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xs text-stone-500">
              Join {reviewCountValue} happy foodies · Tap to rate 5 stars on Google
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 shadow-2xs">
          Review ⭐
        </span>
      </div>

      {/* Location & Address */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200/80">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-stone-500" />
          Location & Address
        </h2>
        <p className="text-sm font-medium text-stone-800 leading-relaxed">
          {business.address}
        </p>
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-stone-100">
          <a
            id="open-maps-link"
            href={business.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200/60"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            id="call-address-btn"
            href={`tel:${cleanPhone}`}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>070558 08808</span>
          </a>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200/80">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            Operating Hours
          </h2>
          {todayHours && (
            <span className="text-xs text-stone-500 font-medium">
              Today: <strong className="text-stone-800">{todayHours.open} - {todayHours.close}</strong>
            </span>
          )}
        </div>

        <div className="divide-y divide-stone-100 text-xs mt-3">
          {business.hours.map((hour) => {
            const isToday = hour.day.toLowerCase() === todayName.toLowerCase();
            return (
              <div
                key={hour.day}
                className={`py-2 flex items-center justify-between ${
                  isToday ? 'font-bold text-stone-900 bg-stone-50/80 -mx-2 px-2 rounded-lg' : 'text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{hour.day}</span>
                  {isToday && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Today
                    </span>
                  )}
                </div>
                <span>
                  {hour.isClosed ? (
                    <span className="text-rose-500 font-medium">Closed</span>
                  ) : (
                    `${hour.open} – ${hour.close}`
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social & Reservation Links */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200/80">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
          Connect Online
        </h2>
        <div className="flex flex-wrap gap-2">
          {business.reservationsUrl && (
            <a
              id="swiggy-pill-link"
              href={business.reservationsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors text-xs font-semibold border border-orange-200/60"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Swiggy Reservations</span>
            </a>
          )}

          {business.socialLinks?.instagram && (
            <a
              id="instagram-link"
              href={`https://instagram.com/${business.socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors text-xs font-semibold"
            >
              <Instagram className="w-4 h-4" />
              <span>@{business.socialLinks.instagram}</span>
            </a>
          )}

          {business.socialLinks?.facebook && (
            <a
              id="facebook-link"
              href={`https://facebook.com/${business.socialLinks.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-semibold"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </a>
          )}

          {business.socialLinks?.website && (
            <a
              id="website-link"
              href={business.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors text-xs font-semibold"
            >
              <Globe className="w-4 h-4" />
              <span>Official Website</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
