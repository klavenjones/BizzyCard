import { CardPreview } from '@/components/card/card-preview';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCard } from '@/hooks/use-card';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { router } from 'expo-router';
import * as React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';

export default function MyCardScreen() {
  const { card, isLoading, hasCard } = useCard();
  const profilePhotoUrl = useQuery(
    api.files.getUrl,
    card?.profilePhotoId ? { fileId: card.profilePhotoId } : 'skip'
  );

  // Redirect to onboarding if no card
  React.useEffect(() => {
    if (!isLoading && !hasCard) {
      router.replace('/onboarding');
    }
  }, [isLoading, hasCard]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!card) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-muted-foreground">No card found</Text>
        <Button className="mt-4" onPress={() => router.push('/onboarding')}>
          <Text>Create Your Card</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <View className="mb-4 flex-row justify-end">
          <Button variant="outline" onPress={() => router.push('/card/edit')}>
            <Text>Edit Card</Text>
          </Button>
        </View>
        <CardPreview
          cardId={card._id}
          profilePhotoUrl={profilePhotoUrl?.url || null}
        />
      </View>
    </ScrollView>
  );
}

