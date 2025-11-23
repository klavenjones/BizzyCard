import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/card/qr-code-display';
import { ShareActions } from '@/components/sharing/share-actions';
import { VCFGenerator } from '@/components/sharing/vcf-generator';
import { UserLookup } from '@/components/sharing/user-lookup';
import { QRScanner } from '@/components/sharing/qr-scanner';
import { useAuth } from '@/hooks/use-auth';
import { useCard } from '@/hooks/use-card';
import { router } from 'expo-router';
import * as React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { extractShareIdFromUrl } from '@/services/qr-code';
import { Alert } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Share screen displaying QR code and sharing options.
 * Shows validation message if onboarding is not completed.
 */
export default function ShareScreen() {
  const { convexUser, isLoading: isAuthLoading } = useAuth();
  const { card, isLoading: isCardLoading } = useCard();
  const [showQRScanner, setShowQRScanner] = React.useState(false);
  const sendCard = useMutation(api.sharing.sendCard);

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

  const currentUser = useQuery(api.users.getCurrentUser);

  const handleQRScanComplete = async (shareId: string) => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to share cards.');
        setShowQRScanner(false);
        return;
      }

      // Fetch card by shareId using HTTP endpoint or action
      // For now, we'll need to use the Convex HTTP endpoint
      const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        Alert.alert('Error', 'Convex URL not configured.');
        setShowQRScanner(false);
        return;
      }

      const response = await fetch(`${convexUrl}/public/${shareId}`);
      if (!response.ok) {
        Alert.alert('Error', 'Card not found.');
        setShowQRScanner(false);
        return;
      }

      const data = await response.json();
      const scannedCard = data.card;
      
      if (!scannedCard) {
        Alert.alert('Error', 'Card not found.');
        setShowQRScanner(false);
        return;
      }

      // Get the card owner (recipient) - we need to find the user who owns this card
      // The card has userId, but we need the user's _id to send the card
      // We'll need to query for the user by the card's userId
      // For now, let's use an action or query to get the user
      // Actually, we can use the card's userId directly as recipientUserId
      const recipientUserId = scannedCard.userId as Id<'users'>;

      // Prevent sending to self
      if (recipientUserId === currentUser._id) {
        Alert.alert('Error', 'You cannot send your card to yourself.');
        setShowQRScanner(false);
        return;
      }

      // Send card
      await sendCard({ recipientUserId });
      Alert.alert('Success', 'Card sent successfully!');
      setShowQRScanner(false);
    } catch (error) {
      console.error('Error sending card from QR scan:', error);
      Alert.alert('Error', 'Failed to send card. Please try again.');
      setShowQRScanner(false);
    }
  };

  if (showQRScanner) {
    return (
      <View className="flex-1">
        <QRScanner
          onScanComplete={(shareId) => handleQRScanComplete(shareId)}
          onCancel={() => setShowQRScanner(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="gap-4 p-4">
        {/* QR Code Display */}
        <QRCodeDisplay />

        {/* Share Actions */}
        <ShareActions />

        {/* Scan QR Code Button */}
        <Button
          variant="outline"
          onPress={() => setShowQRScanner(true)}
          className="w-full">
          <Text>Scan QR Code to Share</Text>
        </Button>

        {/* User Lookup */}
        <UserLookup />

        {/* VCF Generator */}
        <VCFGenerator />
      </View>
    </ScrollView>
  );
}
