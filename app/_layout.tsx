import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ClerkProvider } from '@clerk/clerk-expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { useReactQueryPersist } from '@/lib/hooks/use-react-query-persist';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { ErrorBoundary } from '@/components/error-boundary';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary as ExpoErrorBoundary,
} from 'expo-router';

// Token cache for Clerk using Expo SecureStore
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('Failed to save token:', err);
    }
  },
};

const clerkPublishableKey =
  Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    'Missing Clerk publishable key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'
  );
}

function AppContent() {
  const { colorScheme } = useColorScheme();
  useReactQueryPersist();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
