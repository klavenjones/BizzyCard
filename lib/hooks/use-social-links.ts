/**
 * Social Links Hooks
 * 
 * React Query hooks for social links data management.
 * Provides useSocialLinks and useUpdateSocialLinks hooks with caching.
 * 
 * Task: T047 [US1]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as socialLinksService from '@/lib/supabase/social-links';
import { SocialLink } from '@/lib/types/profile';
import { socialLinkSchema } from '@/lib/validation/schemas';

/**
 * Query key factory for social links queries
 */
const socialLinksKeys = {
  all: ['social-links'] as const,
  byProfile: (profileId: string) => [...socialLinksKeys.all, 'profile', profileId] as const,
};

/**
 * Hook to fetch social links for a profile
 */
export function useSocialLinks(profileId: string | null | undefined) {
  return useQuery<SocialLink[], Error>({
    queryKey: socialLinksKeys.byProfile(profileId || ''),
    queryFn: async () => {
      if (!profileId) {
        return [];
      }
      return socialLinksService.getSocialLinks(profileId);
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new social link
 */
export function useCreateSocialLink(profileId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation<
    SocialLink,
    Error,
    {
      platform: string;
      url: string;
      display_order?: number;
      visible?: boolean;
    }
  >({
    mutationFn: async (linkData) => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }
      return socialLinksService.createSocialLink(profileId, linkData);
    },
    onSuccess: () => {
      // Invalidate social links query to refetch
      if (profileId) {
        queryClient.invalidateQueries({
          queryKey: socialLinksKeys.byProfile(profileId),
        });
      }
    },
  });
}

/**
 * Hook to update an existing social link
 */
export function useUpdateSocialLink(profileId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation<
    SocialLink,
    Error,
    {
      linkId: string;
      updates: Partial<{
        platform: string;
        url: string;
        display_order: number;
        visible: boolean;
      }>;
    }
  >({
    mutationFn: async ({ linkId, updates }) => {
      return socialLinksService.updateSocialLink(linkId, updates);
    },
    onSuccess: () => {
      // Invalidate social links query to refetch
      if (profileId) {
        queryClient.invalidateQueries({
          queryKey: socialLinksKeys.byProfile(profileId),
        });
      }
    },
  });
}

/**
 * Hook to delete a social link
 */
export function useDeleteSocialLink(profileId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (linkId) => {
      return socialLinksService.deleteSocialLink(linkId);
    },
    onSuccess: () => {
      // Invalidate social links query to refetch
      if (profileId) {
        queryClient.invalidateQueries({
          queryKey: socialLinksKeys.byProfile(profileId),
        });
      }
    },
  });
}

/**
 * Hook to replace all social links for a profile
 */
export function useUpdateSocialLinks(profileId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation<
    SocialLink[],
    Error,
    Array<{
      platform: string;
      url: string;
      display_order?: number;
      visible?: boolean;
    }>
  >({
    mutationFn: async (links) => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }
      return socialLinksService.replaceSocialLinks(profileId, links);
    },
    onSuccess: () => {
      // Invalidate social links query to refetch
      if (profileId) {
        queryClient.invalidateQueries({
          queryKey: socialLinksKeys.byProfile(profileId),
        });
      }
    },
  });
}

