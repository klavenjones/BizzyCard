import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { View, Pressable, Linking } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface Contact {
  _id: Id<'contacts'>;
  ownerId: Id<'users'>;
  sourceCardId: Id<'cards'>;
  sourceUserId: Id<'users'>;
  acceptedAt: number;
  updatedAt: number;
  tags: string[];
  meetingMetadataId?: Id<'meetingMetadata'>;
  card: {
    name: string;
    title?: string;
    email: string;
    phoneNumber?: string;
    company?: string;
    role?: string;
    bio?: string;
    tags: string[];
    profilePhotoId?: Id<'_storage'>;
    resumeFileId?: Id<'_storage'>;
  };
  meetingMetadata?: {
    date: number;
    location?: string;
    notes?: string;
  };
}

interface ContactCardProps {
  contact: Contact;
  onPress?: () => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

/**
 * Contact card component for individual contact view.
 * Displays contact information with profile photo, name, title, and tags.
 */
export function ContactCard({
  contact,
  onPress,
  onRemove,
  showRemoveButton = false,
}: ContactCardProps) {
  // Get profile photo URL if available
  const profilePhotoUrl = useQuery(
    api.files.getUrl,
    contact.card.profilePhotoId ? { fileId: contact.card.profilePhotoId } : 'skip'
  );

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contact.card.email}`).catch((err) => {
      console.error('Failed to open email:', err);
    });
  };

  const handlePhonePress = () => {
    if (contact.card.phoneNumber) {
      Linking.openURL(`tel:${contact.card.phoneNumber}`).catch((err) => {
        console.error('Failed to open phone:', err);
      });
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          {profilePhotoUrl?.url ? (
            <Avatar className="size-16">
              <AvatarImage source={{ uri: profilePhotoUrl.url }} />
              <AvatarFallback>
                <Text className="text-lg">{getInitials(contact.card.name)}</Text>
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="size-16">
              <AvatarFallback>
                <Text className="text-lg">{getInitials(contact.card.name)}</Text>
              </AvatarFallback>
            </Avatar>
          )}

          <View className="flex-1 gap-1">
            <Text variant="h4">{contact.card.name}</Text>
            {contact.card.title && (
              <Text variant="muted" className="text-sm">
                {contact.card.title}
              </Text>
            )}
            {contact.card.company && contact.card.role && (
              <Text variant="muted" className="text-sm">
                {contact.card.role} at {contact.card.company}
              </Text>
            )}
            {contact.card.company && !contact.card.role && (
              <Text variant="muted" className="text-sm">
                {contact.card.company}
              </Text>
            )}
          </View>

          {showRemoveButton && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}>
              <Text>×</Text>
            </Button>
          )}
        </CardHeader>

        <CardContent className="gap-3">
          {/* Contact Information */}
          <View className="gap-1">
            <Pressable onPress={handleEmailPress}>
              <Text className="text-primary underline">{contact.card.email}</Text>
            </Pressable>
            {contact.card.phoneNumber && (
              <Pressable onPress={handlePhonePress}>
                <Text className="text-primary underline">{contact.card.phoneNumber}</Text>
              </Pressable>
            )}
          </View>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {contact.tags.map((tag, index) => (
                <View
                  key={index}
                  className="rounded-md bg-muted px-2 py-1">
                  <Text variant="small">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Meeting Metadata */}
          {contact.meetingMetadata && (
            <View className="gap-1 rounded-md bg-muted/50 p-2">
              <Text variant="small" className="font-semibold text-muted-foreground">
                Met on {new Date(contact.meetingMetadata.date).toLocaleDateString()}
              </Text>
              {contact.meetingMetadata.location && (
                <Text variant="small" className="text-muted-foreground">
                  {contact.meetingMetadata.location}
                </Text>
              )}
              {contact.meetingMetadata.notes && (
                <Text variant="small" className="text-muted-foreground">
                  {contact.meetingMetadata.notes}
                </Text>
              )}
            </View>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}

