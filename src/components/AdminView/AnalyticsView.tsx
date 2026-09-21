import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  QrCode,
  Star,
  Gift,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Business } from '../../types';

interface AnalyticsViewProps {
  business: Business;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ business }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    fetch(`/api/businesses/${business.slug}/analytics`)
      .then((res) => res.json())
      .then((data) => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      });
  }, [business.slug]);

  const stats = business.stats || {
    qrScans: 482,
    totalCustomers: 128,
    newCustomers: 42,
    returningCustomers: 86,
    reviewPromptViews: 194,
    reviewPromptClicks: 147,
    rewardsRedeemed: 38,
  };

  const whatsappSummaryText =
    analyticsData?.whatsappSummary ||
    `📊 *OneCard Weekly Business Digest*
🏢 *${business.name}*
━━━━━━━━━━━━━━━━━━
📲 *Total QR Scans:* ${stats.qrScans}
👥 *Total Customers Logged:* ${stats.totalCustomers}
⭐ *New Customers:* ${stats.newCustomers}
🔄 *Repeat Regulars:* ${stats.returningCustomers}
🎁 *Rewards Claimed:* ${stats.rewardsRedeemed}
🌟 *Google Review Clicks:* ${stats.reviewPromptClicks}

💡 *Top Highlight:* High loyalty repeat rate (${Math.round(
      (stats.returningCustomers / (stats.totalCustomers || 1)) * 100
    )}% of customers returned!)

🔗 View Live OneCard: https://onecard.app/${business.slug}
_Powered by OneCard_`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(whatsappSummaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(whatsappSummaryText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const repeatRate = Math.round(
    ((stats.returningCustomers || 0) /
      (stats.totalCustomers || (stats.newCustomers + stats.returningCustomers) || 1)) *
      100
  );

  return (
    <div id="analytics-section" className="space-y-4 max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Real-Time Metrics
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-2">
              Performance & Loyalty Analytics
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Live data from customer QR scans, loyalty card punches, and review clicks.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* 4 Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-stone-900">
              {stats.qrScans}
            </div>
            <div className="text-[11px] font-bold text-stone-400 mt-0.5">
              Total QR Scans
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-stone-900">
              {stats.totalCustomers}
            </div>
            <div className="text-[11px] font-bold text-stone-400 mt-0.5">
              Active Patrons
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
              <Star className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-stone-900">
              {stats.reviewPromptClicks}
            </div>
            <div className="text-[11px] font-bold text-stone-400 mt-0.5">
              Review Clicks
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-stone-900">
              {stats.rewardsRedeemed}
            </div>
            <div className="text-[11px] font-bold text-stone-400 mt-0.5">
              Perks Claimed
            </div>
          </div>
        </div>
      </div>

      {/* Customer Breakdown Card (New vs Returning) */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80">
        <h3 className="text-base font-bold text-stone-900 mb-2">
          New vs. Repeat Regulars
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Calculated automatically whenever staff logs customer mobile numbers.
        </p>

        {/* Visual Progress Ratio Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Repeat Regulars ({stats.returningCustomers})
            </span>
            <span className="flex items-center gap-1.5 text-stone-500">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              New Patrons ({stats.newCustomers})
            </span>
          </div>

          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${repeatRate}%` }}
              title={`Repeat: ${repeatRate}%`}
            />
            <div
              className="bg-stone-300 h-full transition-all duration-500"
              style={{ width: `${100 - repeatRate}%` }}
              title={`New: ${100 - repeatRate}%`}
            />
          </div>

          <div className="pt-2 text-xs text-stone-600">
            <strong>{repeatRate}% Retention Rate:</strong> Your digital stamp card is effectively turning first-time visitors into repeat regulars!
          </div>
        </div>

        {/* Google API Transparency Notice */}
        <div className="mt-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-900 leading-normal">
            <strong>Google Review Tracking Transparency:</strong> Google strictly restricts 3rd-party platforms from tracking actual review submissions to prevent manipulation. We accurately track every time a customer opens your review link ({stats.reviewPromptClicks} times).
          </div>
        </div>
      </div>

      {/* Weekly WhatsApp Digest Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900">
                Weekly WhatsApp Digest
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Ready-to-send formatted text summary for the business owner or staff group.
            </p>
          </div>
        </div>

        {/* Pre-formatted Message Box */}
        <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 font-mono text-xs whitespace-pre-line leading-relaxed shadow-inner">
          {whatsappSummaryText}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            id="copy-whatsapp-summary-btn"
            onClick={handleCopySummary}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
          </button>

          <button
            id="share-whatsapp-btn"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
