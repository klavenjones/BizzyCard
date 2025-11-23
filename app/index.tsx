import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCard } from '@/hooks/use-card';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Screen() {
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const { card, isLoading: cardLoading } = useCard();

  React.useEffect(() => {
    if (!authLoading && isSignedIn) {
      if (cardLoading) {
        return; // Still loading card data
      }
      if (!card) {
        // No card, redirect to onboarding
        router.replace('/onboarding');
      } else {
        // Has card, redirect to main app
        router.replace('/(tabs)/my-card');
      }
    }
  }, [isSignedIn, authLoading, cardLoading, card]);

  if (authLoading || cardLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Loading...</Text>
    </View>
  );
}
