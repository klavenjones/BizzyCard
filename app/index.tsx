/**
 * Root Index Screen
 * 
 * Handles authentication redirect logic:
 * - Authenticated users → redirect to tabs (My Card screen)
 * - Unauthenticated users → redirect to auth (sign-in screen)
 * 
 * Task: T043 [US1]
 */

import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/clerk/hooks';
import { Loading } from '@/components/ui/loading';

export default function IndexScreen() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return <Loading />;
  }

  // Redirect based on authentication status
  if (isSignedIn && userId) {
    // User is authenticated → redirect to main app (tabs)
    return <Redirect href="/(tabs)/my-card" />;
  }

  // User is not authenticated → redirect to sign-in
  return <Redirect href="/(auth)/sign-in" />;
}
