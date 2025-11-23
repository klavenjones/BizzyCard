import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useContacts } from '@/hooks/use-contacts';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Check, X } from 'lucide-react-native';

interface ContactAcceptanceProps {
  sourceCardId: Id<'cards'>;
  sourceUserId: Id<'users'>;
  card?: {
    name: string;
    title?: string;
    email: string;
    phoneNumber?: string;
    company?: string;
    role?: string;
    bio?: string;
    profilePhotoId?: Id<'_storage'>;
  };
  onAccept?: () => void;
  onDecline?: () => void;
}

/**
 * Contact acceptance component for accepting or declining shared cards.
 * Displays card preview and allows user to accept or decline.
 * FR-036: Decline dismisses notification without storing card.
 */
export function ContactAcceptance({
  sourceCardId,
  sourceUserId,
  card: cardData,
  onAccept,
  onDecline,
}: ContactAcceptanceProps) {
  const { acceptCard } = useContacts();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get profile photo URL if available
  const profilePhotoUrl = useQuery(
    api.files.getUrl,
    cardData?.profilePhotoId ? { fileId: cardData.profilePhotoId } : 'skip'
  );

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      await acceptCard({
        sourceCardId,
        sourceUserId,
      });
      Alert.alert('Success', 'Contact added to your network!');
      onAccept?.();
    } catch (error) {
      console.error('Error accepting contact:', error);
      Alert.alert('Error', 'Failed to accept contact. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    // FR-036: Decline dismisses notification without storing card
    // Just call the onDecline callback - no mutation needed
    onDecline?.();
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!cardData) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">
            Loading card information...
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center gap-4">
        {profilePhotoUrl?.url ? (
          <Avatar className="size-20">
            <AvatarImage source={{ uri: profilePhotoUrl.url }} />
            <AvatarFallback>
              <Text className="text-xl">{getInitials(cardData.name)}</Text>
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="size-20">
            <AvatarFallback>
              <Text className="text-xl">{getInitials(cardData.name)}</Text>
            </AvatarFallback>
          </Avatar>
        )}

        <View className="items-center gap-1">
          <Text variant="h4" className="text-center">
            {cardData.name} wants to share their card
          </Text>
          {cardData.title && (
            <Text variant="muted" className="text-center">
              {cardData.title}
            </Text>
          )}
        </View>
      </CardHeader>

      <CardContent className="gap-4">
        <Text className="text-center text-muted-foreground">
          Would you like to add this contact to your network?
        </Text>

        <View className="flex-row gap-3">
          <Button
            variant="outline"
            onPress={handleDecline}
            disabled={isProcessing}
            className="flex-1">
            <X className="size-4" />
            <Text>Decline</Text>
          </Button>
          <Button
            onPress={handleAccept}
            disabled={isProcessing}
            className="flex-1">
            <Check className="size-4" />
            <Text>{isProcessing ? 'Adding...' : 'Accept'}</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

