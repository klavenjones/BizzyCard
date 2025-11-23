import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { generateShareLinkUrl, generateQRCodeData } from '@/services/qr-code';

/**
 * Custom hook for sharing functionality.
 * 
 * Provides:
 * - Share link generation and regeneration
 * - QR code data generation
 * - Share link URL generation
 */
export function useSharing() {
  // Query current user's card to get shareId
  const card = useQuery(api.cards.getCurrentUserCard);

  // Mutation to regenerate share ID
  const regenerateShareId = useMutation(api.cards.regenerateShareId);

  // Get share link URL
  const getShareLinkUrl = (): string | null => {
    if (!card?.shareId) {
      return null;
    }
    return generateShareLinkUrl(card.shareId);
  };

  // Get QR code data (URL string to encode)
  const getQRCodeData = (): string | null => {
    if (!card?.shareId) {
      return null;
    }
    return generateQRCodeData(card.shareId);
  };

  // Regenerate share ID (creates new share link)
  const regenerateShareLink = async () => {
    if (!card) {
      throw new Error('Card not found');
    }
    return await regenerateShareId({});
  };

  return {
    // Card data
    card,
    shareId: card?.shareId ?? null,
    hasCard: card !== null && card !== undefined,

    // Share link utilities
    getShareLinkUrl,
    getQRCodeData,

    // Mutations
    regenerateShareLink,
  };
}

