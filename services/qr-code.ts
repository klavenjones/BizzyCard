/**
 * QR code generation service.
 * 
 * This service provides utilities for generating QR codes from share links
 * and handling QR code-related operations.
 */

/**
 * Generates a share link URL from a share ID.
 * @param shareId - Unique share identifier for the card
 * @param baseUrl - Base URL for the application (defaults to environment variable or localhost)
 * @returns Full share link URL
 */
export function generateShareLinkUrl(
  shareId: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.EXPO_PUBLIC_APP_URL || "https://your-app.com";
  return `${base}/public/${shareId}`;
}

/**
 * Generates QR code data (URL string) from a share ID.
 * This is the data that will be encoded in the QR code.
 * @param shareId - Unique share identifier for the card
 * @param baseUrl - Base URL for the application
 * @returns URL string to encode in QR code
 */
export function generateQRCodeData(
  shareId: string,
  baseUrl?: string
): string {
  return generateShareLinkUrl(shareId, baseUrl);
}

/**
 * Validates that a share ID is in the correct format.
 * @param shareId - Share ID to validate
 * @returns true if share ID format is valid, false otherwise
 */
export function isValidShareId(shareId: string): boolean {
  if (!shareId || typeof shareId !== "string") {
    return false;
  }

  // Share IDs should be alphanumeric strings (can include hyphens/underscores)
  // Typical format: 20-30 character alphanumeric string
  const shareIdRegex = /^[a-zA-Z0-9_-]{10,50}$/;

  return shareIdRegex.test(shareId);
}

