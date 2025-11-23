import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/card/qr-code-display';
import { ShareActions } from '@/components/sharing/share-actions';
import { VCFGenerator } from '@/components/sharing/vcf-generator';
import { useAuth } from '@/hooks/use-auth';
import { useCard } from '@/hooks/use-card';
import { router } from 'expo-router';
import * as React from 'react';

/**
 * Share screen displaying QR code and sharing options.
 * Shows validation message if onboarding is not completed.
 */
export default function ShareScreen() {
  const { convexUser, isLoading: isAuthLoading } = useAuth();
  const { card, isLoading: isCardLoading } = useCard();

  const isLoading = isAuthLoading || isCardLoading;

  // Check if onboarding is completed
  const isOnboardingCompleted = convexUser?.onboardingCompleted ?? false;
  const hasCard = card !== null && card !== undefined;

  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!isLoading && !isOnboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [isLoading, isOnboardingCompleted]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show validation message if onboarding not completed
  if (!isOnboardingCompleted || !hasCard) {
    return (
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="rounded-lg border border-border bg-card p-6">
            <Text variant="h3" className="mb-2 text-center">
              Complete Onboarding First
            </Text>
            <Text variant="muted" className="mb-4 text-center">
              Please complete your profile setup before sharing your digital business card.
            </Text>
            <Button onPress={() => router.push('/onboarding')} className="w-full">
              <Text>Go to Onboarding</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="gap-4 p-4">
        {/* QR Code Display */}
        <QRCodeDisplay />

        {/* Share Actions */}
        <ShareActions />

        {/* VCF Generator */}
        <VCFGenerator />
      </View>
    </ScrollView>
  );
}
