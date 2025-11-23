import { SocialLinksForm } from '@/components/card/social-links-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function OnboardingSocialLinksScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="p-4 py-8 sm:py-4 sm:p-6">
      <View className="w-full max-w-2xl mx-auto">
        <SocialLinksForm />
        <View className="mt-4">
          <Button className="w-full" onPress={() => router.push('/onboarding/resume')}>
            <Text>Continue</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

