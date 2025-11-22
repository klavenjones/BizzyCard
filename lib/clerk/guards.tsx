/**
 * Authentication guards and protected route components
 */

import { Redirect } from 'expo-router';
import { ReactNode } from 'react';
import { useAuth } from './hooks';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Component that protects routes requiring authentication
 * Redirects to sign-in if user is not authenticated
 */
export function ProtectedRoute({ children, redirectTo = '/(auth)/sign-in' }: ProtectedRouteProps) {
  const { userId, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    // Show loading state while checking auth
    return null;
  }

  if (!isSignedIn || !userId) {
    return <Redirect href={redirectTo} />;
  }

  return <>{children}</>;
}

/**
 * Component that redirects authenticated users away from auth screens
 * Redirects to main app if user is already signed in
 */
export function AuthRoute({ children, redirectTo = '/(tabs)/my-card' }: ProtectedRouteProps) {
  const { userId, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn && userId) {
    return <Redirect href={redirectTo} />;
  }

  return <>{children}</>;
}

