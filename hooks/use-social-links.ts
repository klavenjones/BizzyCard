import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Custom hook for managing social links.
 * 
 * Provides:
 * - Social links fetching by card ID
 * - Add social link
 * - Update social link
 * - Remove social link
 */
export function useSocialLinks(cardId: Id<'cards'> | null | undefined) {
  // Query social links for the card
  const socialLinks = useQuery(
    api.socialLinks.getByCardId,
    cardId ? { cardId } : 'skip'
  );

  // Mutations
  const addLink = useMutation(api.socialLinks.add);
  const updateLink = useMutation(api.socialLinks.update);
  const removeLink = useMutation(api.socialLinks.remove);

  // Loading state
  const isLoading = cardId !== null && cardId !== undefined && socialLinks === undefined;

  return {
    // Social links data
    socialLinks: socialLinks ?? [],
    isLoading,
    hasLinks: (socialLinks?.length ?? 0) > 0,

    // Mutations
    addLink: async (data: {
      platform: string;
      url: string;
      order?: number;
    }) => {
      if (!cardId) {
        throw new Error('Card ID is required to add social links');
      }
      return await addLink(data);
    },

    updateLink: async (data: {
      linkId: Id<'socialLinks'>;
      url?: string;
      order?: number;
    }) => {
      return await updateLink(data);
    },

    removeLink: async (linkId: Id<'socialLinks'>) => {
      return await removeLink({ linkId });
    },
  };
}

