import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Custom hook for managing contacts data and operations.
 * 
 * Provides:
 * - Contacts data fetching
 * - Accept card (add to network)
 * - Update tags
 * - Add/update meeting metadata
 * - Remove contact
 */
export function useContacts() {
  // Query all contacts for current user
  const contacts = useQuery(api.contacts.getByOwnerId);

  // Mutations
  const acceptCard = useMutation(api.contacts.acceptCard);
  const updateTags = useMutation(api.contacts.updateTags);
  const addMeetingMetadata = useMutation(api.contacts.addMeetingMetadata);
  const removeContact = useMutation(api.contacts.remove);

  // Loading state
  const isLoading = contacts === undefined;

  return {
    // Contacts data
    contacts: contacts ?? [],
    isLoading,
    hasContacts: (contacts?.length ?? 0) > 0,

    // Mutations
    acceptCard: async (data: {
      sourceCardId: Id<'cards'>;
      sourceUserId: Id<'users'>;
    }) => {
      return await acceptCard(data);
    },

    updateTags: async (data: {
      contactId: Id<'contacts'>;
      tags: string[];
    }) => {
      return await updateTags(data);
    },

    addMeetingMetadata: async (data: {
      contactId: Id<'contacts'>;
      date: number;
      location?: string;
      notes?: string;
    }) => {
      return await addMeetingMetadata(data);
    },

    removeContact: async (contactId: Id<'contacts'>) => {
      return await removeContact({ contactId });
    },
  };
}

/**
 * Custom hook for fetching a single contact by ID.
 */
export function useContact(contactId: Id<'contacts'> | null | undefined) {
  const contact = useQuery(
    api.contacts.getById,
    contactId ? { contactId } : 'skip'
  );

  const isLoading = contactId !== null && contactId !== undefined && contact === undefined;

  return {
    contact,
    isLoading,
    hasContact: contact !== null && contact !== undefined,
  };
}

