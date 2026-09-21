import React, { useState } from 'react';
import { Star, ExternalLink, X, Heart, Sparkles } from 'lucide-react';
import { Business } from '../../types';

interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onReviewClick?: () => void;
}

export const ReviewPromptModal: React.FC<ReviewPromptModalProps> = ({
  isOpen,
  onClose,
  business,
  onReviewClick,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleOpenGoogleReview = () => {
    if (onReviewClick) {
      onReviewClick();
    }
    // Track click
    fetch(`/api/businesses/${business.slug}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'review_prompt_click' }),
    }).catch((err) => console.error('Error tracking review click:', err));

    // Direct link to Google Review page with 5-star pre-fill where possible
    const reviewUrl =
      business.googleReviewUrl ||
      `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
        business.name
      )}`;
    window.open(reviewUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="review-prompt-card"
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header decoration */}
        <div
          className="p-6 pb-4 text-white relative"
          style={{ backgroundColor: business.brandColor || '#059669' }}
        >
          <button
            id="close-review-modal-btn"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            aria-label="Close review dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs ring-4 ring-white/30">
            <Sparkles className="w-7 h-7 text-amber-300 fill-amber-300" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            Enjoyed your visit today?
          </h3>
          <p className="text-xs text-white/90 mt-1 font-medium">
            At {business.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            Your honest feedback helps our small neighborhood business grow and helps other food lovers find us!
          </p>

          {/* Interactive Star Selection */}
          <div className="flex justify-center items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoveredRating !== null ? hoveredRating : selectedRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  id={`star-btn-${star}`}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  onClick={() => setSelectedRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                  aria-label={`${star} Stars`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      active
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-300 fill-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-left flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 fill-amber-600" />
            <div className="text-xs text-amber-900 leading-normal">
              <span className="font-semibold">Unfiltered & compliant:</span> Takes you directly to our official Google Maps review listing.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              id="submit-google-review-btn"
              onClick={handleOpenGoogleReview}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition-all"
              style={{ backgroundColor: business.brandColor || '#059669' }}
            >
              <span>Write a Google Review</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              id="maybe-later-review-btn"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
