/**
 * Profile Hooks
 * 
 * React Query hooks for profile data management.
 * Provides useProfile and useUpdateProfile hooks with caching and optimistic updates.
 * Uses last-write-wins strategy via Supabase updated_at timestamp.
 * 
 * Task: T046 [US1]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/clerk/hooks';
import * as profileService from '@/lib/supabase/profiles';
import { Profile, ProfileWithRelations } from '@/lib/types/profile';

/**
 * Query key factory for profile queries
 */
const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

/**
 * Hook to fetch current user's profile
 * Automatically refetches when profile is updated
 */
export function useProfile() {
  const { userId, isLoaded } = useAuth();

  return useQuery<ProfileWithRelations | null, Error>({
    queryKey: profileKeys.detail(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return null;
      }
      return profileService.getProfile(userId);
    },
    enabled: isLoaded && !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to update current user's profile
 * Uses optimistic updates and last-write-wins strategy
 */
export function useUpdateProfile() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Profile,
    Error,
    Partial<{
      email: string;
      phone: string;
      name: string;
      title: string | null;
      company: string | null;
      role: string | null;
      bio: string | null;
      tags: string[];
      resume_visible: boolean;
    }>
  >({
    mutationFn: async (updates) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return profileService.updateProfile(userId, updates);
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.detail(userId || '') });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<ProfileWithRelations | null>(
        profileKeys.detail(userId || '')
      );

      // Optimistically update cache
      if (previousProfile) {
        queryClient.setQueryData<ProfileWithRelations | null>(
          profileKeys.detail(userId || ''),
          {
            ...previousProfile,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        );
      }

      return { previousProfile };
    },
    onError: (error, updates, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(userId || ''), context.previousProfile);
      }
    },
    onSuccess: (updatedProfile) => {
      // Refetch to get latest data from server (last-write-wins)
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId || '') });
    },
  });
}

/**
 * Hook to create a new profile
 */
export function useCreateProfile() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Profile,
    Error,
    {
      email: string;
      phone: string;
      name: string;
      title?: string | null;
      company?: string | null;
      role?: string | null;
      bio?: string | null;
      tags?: string[];
      resume_visible?: boolean;
    }
  >({
    mutationFn: async (profileData) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return profileService.createProfile(userId, profileData);
    },
    onSuccess: () => {
      // Invalidate profile query to refetch with new data
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId || '') });
    },
  });
}

/**
 * Hook to delete current user's profile (soft delete)
 */
export function useDeleteProfile() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return profileService.deleteProfile(userId);
    },
    onSuccess: () => {
      // Remove profile from cache
      queryClient.removeQueries({ queryKey: profileKeys.detail(userId || '') });
    },
  });
}

