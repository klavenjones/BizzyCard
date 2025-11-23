import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import QRCode, { QRCodeRef } from 'react-native-qrcode-svg';
import { useSharing } from '@/hooks/use-sharing';
import { useAuth } from '@/hooks/use-auth';
import { useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Download } from 'lucide-react-native';

/**
 * QR code display component showing QR code with save option.
 * Displays a QR code for the current user's share link.
 */
export function QRCodeDisplay() {
  const { getQRCodeData, card, isLoading } = useSharing();
  const { convexUser } = useAuth();
  const qrCodeRef = useRef<QRCodeRef>(null);
  const [isSaving, setIsSaving] = useState(false);

  const qrCodeData = getQRCodeData();

  // Check if onboarding is completed (FR-048)
  const isOnboardingCompleted = convexUser?.onboardingCompleted ?? false;
  const canShare = isOnboardingCompleted && card !== null && qrCodeData !== null;

  const handleSaveQRCode = async () => {
    if (!qrCodeRef.current || !qrCodeData) {
      return;
    }

    try {
      setIsSaving(true);

      // Get QR code as base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        qrCodeRef.current?.toDataURL((data: string) => {
          if (data) {
            resolve(data);
          } else {
            reject(new Error('Failed to generate QR code image'));
          }
        });
      });

      // Convert data URL to file URI
      const base64Data = dataUrl.split(',')[1];
      const fileUri = `${FileSystem.cacheDirectory}qr-code-${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share/save the image
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Save QR Code',
        });
      } else {
        // Fallback: Copy to clipboard or show error
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      // TODO: Show error toast/alert to user
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">Loading...</Text>
        </CardContent>
      </Card>
    );
  }

  if (!card || !qrCodeData || !isOnboardingCompleted) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">
            {!isOnboardingCompleted
              ? 'Please complete onboarding before sharing your card.'
              : 'No card found. Please complete onboarding first.'}
        </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center gap-4">
        <Text variant="h3" className="text-center">
          Scan to Share
        </Text>
        <Text variant="muted" className="text-center">
          Share your digital business card by scanning this QR code
        </Text>
      </CardHeader>
      <CardContent className="items-center gap-4">
        <View className="rounded-lg bg-white p-4">
          <QRCode
            ref={qrCodeRef}
            value={qrCodeData}
            size={250}
            color="#000000"
            backgroundColor="#FFFFFF"
            logo={undefined}
            logoSize={0}
            logoMargin={0}
            logoBackgroundColor="transparent"
            logoBorderRadius={0}
            quietZone={10}
          />
        </View>
        <Button
          onPress={handleSaveQRCode}
          disabled={isSaving || !canShare}
          variant="outline"
          className="w-full">
          <Download className="size-4" />
          <Text>{isSaving ? 'Saving...' : 'Save QR Code'}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

