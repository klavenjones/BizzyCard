/**
 * Clerk authentication hooks
 * Wrappers around Clerk hooks for consistent usage throughout the app
 */

import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-expo';

export interface AuthUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

export interface AuthState {
  userId: string | null | undefined;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
}

/**
 * Hook to get current authentication state
 * @returns AuthState with userId, isLoaded, and isSignedIn
 */
export function useAuth(): AuthState {
  const { userId, isLoaded, isSignedIn } = useClerkAuth();
  return {
    userId,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
  };
}

/**
 * Hook to get current user data
 * @returns User object or null if not authenticated
 */
export function useUser(): { user: AuthUser | null; isLoaded: boolean } {
  const { user, isLoaded } = useClerkUser();

  if (!user || !isLoaded) {
    return { user: null, isLoaded };
  }

  return {
    user: {
      id: user.id,
      emailAddresses: user.emailAddresses,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
    isLoaded,
  };
}

