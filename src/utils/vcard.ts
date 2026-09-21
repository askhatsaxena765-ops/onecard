import { Business } from '../types';

export function generateVCard(business: Business): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${business.name}`,
    `ORG:${business.name}`,
    `TITLE:${business.tagline || business.category}`,
    `TEL;TYPE=WORK,VOICE:${business.phone}`,
  ];

  if (business.whatsapp && business.whatsapp !== business.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${business.whatsapp}`);
  }

  if (business.address) {
    // Format address for vCard
    lines.push(`ADR;TYPE=WORK:;;${business.address.replace(/[,;]/g, ' ')};;;;`);
  }

  if (business.socialLinks?.website) {
    lines.push(`URL:${business.socialLinks.website}`);
  }

  lines.push(`NOTE:OneCard Digital Contact: ${business.tagline || ''}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadVCard(business: Business): void {
  const vcardContent = generateVCard(business);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_contact.vcf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
