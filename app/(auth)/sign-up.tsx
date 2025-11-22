/**
 * Sign-Up Screen
 * 
 * Displays Clerk's SignUp component for new user registration.
 * Users can create an account with email/password or other configured methods.
 * 
 * Task: T042 [US1]
 */

import { SignUp } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function SignUpScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 items-center justify-center bg-background">
        <SignUp
          afterSignUpUrl="/(tabs)/my-card"
          signInUrl="/(auth)/sign-in"
        />
      </View>
    </>
  );
}

