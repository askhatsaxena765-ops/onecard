import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  Wifi,
  Smartphone,
} from 'lucide-react';
import { Business } from '../../types';
import { generateQRCodeDataUrl, downloadQRCodeImage, getBusinessPublicUrl } from '../../utils/qr';

interface QRStudioProps {
  business: Business;
}

export const QRStudio: React.FC<QRStudioProps> = ({ business }) => {
  const defaultUrl = getBusinessPublicUrl(business.slug);
  const [customUrl, setCustomUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`onecard_qr_target_${business.slug}`);
      if (saved) return saved;
    } catch (e) {}
    return defaultUrl;
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [wifiName, setWifiName] = useState('MotiMahal_Guest');
  const [wifiPass, setWifiPass] = useState('motimahal123');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Keep saved target URL in sync
  useEffect(() => {
    try {
      if (customUrl) {
        localStorage.setItem(`onecard_qr_target_${business.slug}`, customUrl);
      }
    } catch (e) {}
  }, [customUrl, business.slug]);

  const activeUrl = customUrl.trim() || defaultUrl;

  useEffect(() => {
    generateQRCodeDataUrl(activeUrl, {
      width: 600,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    }).then((data) => {
      setQrDataUrl(data);
    });
  }, [activeUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    downloadQRCodeImage(qrDataUrl, business.name);
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div id="qr-studio-section" className="space-y-4 max-w-2xl mx-auto">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Single Universal QR Code
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-2">
              Your OneCard QR Hub
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-md leading-relaxed">
              When customers scan this single QR on their phone, they instantly get your Contact Card, Digital Menu, Loyalty Punch Pass, and Google Review prompt.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* Public Link Bar */}
        <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
            <span>Target Web Address for QR Code</span>
            <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Live Link
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              placeholder="https://..."
            />
            <div className="flex gap-1.5 shrink-0">
              <button
                id="copy-hub-link-btn"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1 shadow-2xs"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                id="open-hub-link"
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-stone-800"
              >
                <span>Open</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <strong>💡 Testing on your mobile phone?</strong>
            <p className="mt-0.5 text-amber-800">
              If your phone says <em>&quot;Page not found (404)&quot;</em> or <em>&quot;403 Forbidden&quot;</em>, click the <strong>Share</strong> button at the top right of the Google AI Studio window and copy the shared link, or paste your published URL in the box above.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tabletop Standee Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-stone-900">
            Print-Ready Tabletop Standee / Tent Card
          </h3>
          <span className="text-xs text-stone-400 font-medium">Standard A5 / Tent Size</span>
        </div>

        {/* The Standee Render (matches print format) */}
        <div
          id="print-standee-card"
          className="w-full max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-md border-2 border-stone-200 text-center relative overflow-hidden"
        >
          {/* Top Brand Stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-3"
            style={{ backgroundColor: business.brandColor || '#059669' }}
          />

          {/* Business Logo & Name */}
          <div className="pt-2">
            <img
              src={business.logo}
              alt={business.name}
              className="w-16 h-16 rounded-2xl mx-auto object-cover ring-4 ring-stone-100 shadow-xs mb-2"
            />
            <h4 className="text-lg font-black text-stone-900 tracking-tight">
              {business.name}
            </h4>
            <p className="text-xs text-stone-500 font-medium">
              {business.tagline || 'Digital Business Hub'}
            </p>
          </div>

          {/* Big High-Res QR Code */}
          <div className="my-5 p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="OneCard QR Code"
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-stone-300">
                Generating QR...
              </div>
            )}
            <div className="mt-2 text-[11px] font-black uppercase tracking-widest text-stone-800 flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scan with Phone Camera</span>
            </div>
          </div>

          {/* Value props pills */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-stone-700 bg-stone-100 p-2 rounded-xl mb-4">
            <div>📖 Live Menu</div>
            <div>🎁 Loyalty Stamp</div>
            <div>⭐ Google Review</div>
          </div>

          {/* Optional WiFi Credentials */}
          <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-center justify-between text-left">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-stone-700" />
              <span>WiFi: <strong>{wifiName}</strong></span>
            </div>
            <span>Pass: <strong>{wifiPass}</strong></span>
          </div>
        </div>

        {/* Customization & Action buttons */}
        <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                WiFi Network Name (Optional)
              </label>
              <input
                type="text"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                placeholder="e.g. Cafe_Guest"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                WiFi Password (Optional)
              </label>
              <input
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                placeholder="e.g. coffee123"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="download-qr-png-btn"
              onClick={handleDownloadPng}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-800 font-bold text-xs hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG QR Code</span>
            </button>

            <button
              id="print-standee-btn"
              onClick={handlePrintStandee}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Standee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
