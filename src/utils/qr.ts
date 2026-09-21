import QRCode from 'qrcode';
import { Business } from '../types';

export async function generateQRCodeDataUrl(
  text: string,
  options?: {
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width || 512,
      margin: 2,
      color: {
        dark: options?.color?.dark || '#111827',
        light: options?.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (error) {
    console.error('Failed to generate QR code data URL:', error);
    return '';
  }
}

export function downloadQRCodeImage(dataUrl: string, businessName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  const cleanName = businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `${cleanName}_onecard_qr.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getBusinessPublicUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    let origin = window.location.origin;
    // If running in development preview container (ais-dev), point QR to the shared/public container (ais-pre)
    // so any phone or external device scanning the QR code doesn't hit Google internal 403 login barrier!
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    return `${origin}/?biz=${slug}`;
  }
  return `https://onecard.app/?biz=${slug}`;
}
