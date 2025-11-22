/**
 * Sign-In Screen
 *
 * Displays Clerk's SignIn component for user authentication.
 * Users can sign in with email/password or other configured methods.
 *
 * Task: T041 [US1]
 */

import { SignIn } from '@clerk/clerk-expo/web';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function SignInScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 items-center justify-center bg-background">
        <SignIn afterSignInUrl="/(tabs)/my-card" signUpUrl="/(auth)/sign-up" />
      </View>
    </>
  );
}
