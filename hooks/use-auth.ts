import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';

/**
 * Custom auth hook that integrates Clerk authentication with Convex user data.
 * 
 * This hook:
 * - Provides Clerk authentication state
 * - Automatically syncs user to Convex when authenticated
 * - Returns both Clerk and Convex user data
 * 
 * @returns Object containing Clerk auth state, Clerk user, Convex user, and loading states
 */
export function useAuth() {
  const clerkAuth = useClerkAuth();
  const clerkUser = useClerkUser();
  const syncFromClerk = useMutation(api.users.syncFromClerk);
  const convexUser = useQuery(api.users.getCurrentUser);

  // Automatically sync user to Convex when Clerk user is available
  useEffect(() => {
    if (clerkAuth.isSignedIn && clerkUser.user && !convexUser) {
      // Sync user to Convex
      const email = clerkUser.user.emailAddresses[0]?.emailAddress;
      const phoneNumber = clerkUser.user.phoneNumbers[0]?.phoneNumber;

      if (email) {
        syncFromClerk({
          clerkUserId: clerkUser.user.id,
          email,
          phoneNumber: phoneNumber || undefined,
        }).catch((error) => {
          console.error('Failed to sync user to Convex:', error);
        });
      }
    }
  }, [clerkAuth.isSignedIn, clerkUser.user?.id, convexUser, syncFromClerk]);

  return {
    // Clerk auth state
    isSignedIn: clerkAuth.isSignedIn,
    isLoaded: clerkAuth.isLoaded && clerkUser.isLoaded,
    userId: clerkUser.user?.id,
    
    // Clerk user data
    clerkUser: clerkUser.user,
    
    // Convex user data
    convexUser,
    
    // Auth methods
    signOut: clerkAuth.signOut,
    signIn: clerkAuth.signIn,
    
    // Loading states
    isLoading: !clerkAuth.isLoaded || !clerkUser.isLoaded || convexUser === undefined,
  };
}

