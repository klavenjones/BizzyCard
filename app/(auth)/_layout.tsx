/**
 * Auth layout for authentication screens (sign-in, sign-up)
 */

import { Stack } from 'expo-router';
import { AuthRoute } from '@/lib/clerk/guards';

export default function AuthLayout() {
  return (
    <AuthRoute>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack>
    </AuthRoute>
  );
}

