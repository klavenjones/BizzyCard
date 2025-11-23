import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Custom hook for managing card data and operations.
 * 
 * Provides:
 * - Card data fetching
 * - Card creation (onboarding)
 * - Card updates
 * - File upload operations (profile photo, resume)
 * - File removal operations
 */
export function useCard() {
  // Query current user's card
  const card = useQuery(api.cards.getCurrentUserCard);

  // Mutations
  const createCard = useMutation(api.cards.create);
  const updateCard = useMutation(api.cards.update);
  const updateProfilePhoto = useMutation(api.cards.updateProfilePhoto);
  const updateResume = useMutation(api.cards.updateResume);
  const removeProfilePhoto = useMutation(api.cards.removeProfilePhoto);
  const removeResume = useMutation(api.cards.removeResume);

  // Loading state
  const isLoading = card === undefined;

  return {
    // Card data
    card,
    isLoading,
    hasCard: card !== null && card !== undefined,

    // Mutations
    createCard: async (data: {
      name: string;
      email: string;
      title?: string;
      phoneNumber?: string;
      company?: string;
      role?: string;
      bio?: string;
      tags?: string[];
    }) => {
      return await createCard(data);
    },

    updateCard: async (data: {
      name?: string;
      title?: string;
      email?: string;
      phoneNumber?: string;
      company?: string;
      role?: string;
      bio?: string;
      tags?: string[];
    }) => {
      return await updateCard(data);
    },

    updateProfilePhoto: async (fileId: Id<'_storage'>) => {
      return await updateProfilePhoto({ fileId });
    },

    updateResume: async (fileId: Id<'_storage'>) => {
      return await updateResume({ fileId });
    },

    removeProfilePhoto: async () => {
      return await removeProfilePhoto({});
    },

    removeResume: async () => {
      return await removeResume({});
    },
  };
}

