/**
 * vCard (vcf) file generation utilities.
 * 
 * vCard is a file format standard for electronic business cards.
 * This module provides functions to generate vCard files from card data.
 */

export interface CardData {
  name: string;
  title?: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  role?: string;
  bio?: string;
  tags?: string[];
  profilePhotoUrl?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

/**
 * Escapes special characters in vCard field values.
 * @param value - Value to escape
 * @returns Escaped value
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/,/g, "\\,") // Escape commas
    .replace(/;/g, "\\;") // Escape semicolons
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, ""); // Remove carriage returns
}

/**
 * Formats a phone number for vCard (removes formatting characters).
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
function formatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s\-\(\)]/g, "");
}

/**
 * Generates a vCard file content from card data.
 * @param cardData - Card data to convert to vCard
 * @returns vCard file content as string
 */
export function generateVCard(cardData: CardData): string {
  const lines: string[] = [];

  // vCard header
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");

  // Name (required)
  lines.push(`FN:${escapeVCardValue(cardData.name)}`);
  lines.push(`N:${escapeVCardValue(cardData.name)};;;`);

  // Email (required)
  lines.push(`EMAIL:${escapeVCardValue(cardData.email)}`);

  // Phone number (optional)
  if (cardData.phoneNumber) {
    const formattedPhone = formatPhoneNumber(cardData.phoneNumber);
    lines.push(`TEL:${escapeVCardValue(formattedPhone)}`);
  }

  // Title/Job Title (optional)
  if (cardData.title) {
    lines.push(`TITLE:${escapeVCardValue(cardData.title)}`);
  }

  // Organization/Company (optional)
  if (cardData.company) {
    lines.push(`ORG:${escapeVCardValue(cardData.company)}`);
    if (cardData.role) {
      // Role can be included in ORG field or as a separate note
      lines.push(`ROLE:${escapeVCardValue(cardData.role)}`);
    }
  }

  // Bio/Notes (optional)
  if (cardData.bio) {
    lines.push(`NOTE:${escapeVCardValue(cardData.bio)}`);
  }

  // Tags/Categories (optional)
  if (cardData.tags && cardData.tags.length > 0) {
    const tagsString = cardData.tags.map(escapeVCardValue).join(",");
    lines.push(`CATEGORIES:${tagsString}`);
  }

  // Profile photo URL (optional)
  if (cardData.profilePhotoUrl) {
    // Note: vCard 3.0 doesn't support URLs for photos directly
    // We'll add it as a note or use PHOTO;TYPE=URL format
    lines.push(`PHOTO;TYPE=URL;VALUE=uri:${escapeVCardValue(cardData.profilePhotoUrl)}`);
  }

  // Social links (optional)
  // vCard doesn't have a standard field for social links, so we add them as URLs
  if (cardData.socialLinks && cardData.socialLinks.length > 0) {
    for (const link of cardData.socialLinks) {
      lines.push(`URL;TYPE=${escapeVCardValue(link.platform.toUpperCase())}:${escapeVCardValue(link.url)}`);
    }
  }

  // vCard footer
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Generates a vCard file and returns it as a Blob (for web) or file content (for mobile).
 * @param cardData - Card data to convert to vCard
 * @returns vCard file content as string (can be saved as .vcf file)
 */
export function generateVCardFile(cardData: CardData): string {
  return generateVCard(cardData);
}

