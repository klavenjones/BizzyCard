import { View, Clipboard, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useSharing } from '@/hooks/use-sharing';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';
import {
  Share2,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Airplay,
} from 'lucide-react-native';

/**
 * Share actions component with AirDrop, email, SMS, and copy link buttons.
 * Provides multiple ways to share the digital business card.
 */
export function ShareActions() {
  const { getShareLinkUrl, card, isLoading } = useSharing();
  const shareLinkUrl = getShareLinkUrl();

  const handleCopyLink = () => {
    if (!shareLinkUrl) {
      return;
    }

    try {
      Clipboard.setString(shareLinkUrl);
      // TODO: Show success toast/alert
    } catch (error) {
      console.error('Error copying link:', error);
      // TODO: Show error toast/alert
    }
  };

  const handleAirDrop = async () => {
    if (!shareLinkUrl) {
      return;
    }

    try {
      if (await Sharing.isAvailableAsync()) {
        // For AirDrop on iOS, we can use the native share sheet
        // which includes AirDrop option
        await Sharing.shareAsync(shareLinkUrl, {
          mimeType: 'text/plain',
          dialogTitle: 'Share via AirDrop',
        });
      } else {
        // Fallback: Open share sheet
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing via AirDrop:', error);
      // TODO: Show error toast/alert
    }
  };

  const handleEmail = () => {
    if (!shareLinkUrl) {
      return;
    }

    const subject = encodeURIComponent('My Digital Business Card');
    const body = encodeURIComponent(
      `Check out my digital business card: ${shareLinkUrl}`
    );
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;

    Linking.openURL(emailUrl).catch((error) => {
      console.error('Error opening email:', error);
      // TODO: Show error toast/alert
    });
  };

  const handleSMS = () => {
    if (!shareLinkUrl) {
      return;
    }

    const message = encodeURIComponent(
      `Check out my digital business card: ${shareLinkUrl}`
    );
    const smsUrl = `sms:?body=${message}`;

    Linking.openURL(smsUrl).catch((error) => {
      console.error('Error opening SMS:', error);
      // TODO: Show error toast/alert
    });
  };

  const handleShare = async () => {
    if (!shareLinkUrl) {
      return;
    }

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareLinkUrl, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Digital Business Card',
        });
      } else {
        // Fallback: Copy to clipboard
        await handleCopyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // TODO: Show error toast/alert
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

  if (!card || !shareLinkUrl) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">
            No card found. Please complete onboarding first.
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Text variant="h3">Share Your Card</Text>
        <Text variant="muted">
          Choose how you'd like to share your digital business card
        </Text>
      </CardHeader>
      <CardContent className="gap-3">
        {/* Copy Link */}
        <Button onPress={handleCopyLink} variant="outline" className="w-full">
          <LinkIcon className="size-4" />
          <Text>Copy Link</Text>
        </Button>

        {/* AirDrop (iOS) or Share (Android) */}
        {Platform.OS === 'ios' ? (
          <Button onPress={handleAirDrop} variant="outline" className="w-full">
            <Airplay className="size-4" />
            <Text>AirDrop</Text>
          </Button>
        ) : (
          <Button onPress={handleShare} variant="outline" className="w-full">
            <Share2 className="size-4" />
            <Text>Share</Text>
          </Button>
        )}

        {/* Email */}
        <Button onPress={handleEmail} variant="outline" className="w-full">
          <Mail className="size-4" />
          <Text>Email</Text>
        </Button>

        {/* SMS */}
        <Button onPress={handleSMS} variant="outline" className="w-full">
          <MessageSquare className="size-4" />
          <Text>SMS</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

