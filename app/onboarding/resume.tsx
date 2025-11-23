import { FileUpload } from '@/components/card/file-upload';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCard } from '@/hooks/use-card';
import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function OnboardingResumeScreen() {
  const { card } = useCard();

  const handleComplete = () => {
    // Navigate to main app after onboarding is complete
    router.replace('/(tabs)/my-card');
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="p-4 py-8 sm:py-4 sm:p-6">
      <View className="w-full max-w-2xl mx-auto">
        <FileUpload type="resume" onUploadComplete={handleComplete} />
        <View className="mt-4">
          <Button className="w-full" onPress={handleComplete}>
            <Text>Complete Setup</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

