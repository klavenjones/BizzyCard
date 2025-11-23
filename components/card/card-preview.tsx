import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { View, ScrollView, Linking } from 'react-native';
import { useSocialLinks } from '@/hooks/use-social-links';
import { Id } from '@/convex/_generated/dataModel';

interface CardPreviewProps {
  cardId: Id<'cards'> | null | undefined;
  profilePhotoUrl?: string | null;
  showEditButton?: boolean;
  onEditPress?: () => void;
}

/**
 * Card preview component displaying card information.
 * Shows profile photo, name, title, contact info, bio, tags, and social links.
 */
export function CardPreview({
  cardId,
  profilePhotoUrl,
  showEditButton = false,
  onEditPress,
}: CardPreviewProps) {
  const card = useQuery(api.cards.getCurrentUserCard);
  const { socialLinks } = useSocialLinks(cardId);

  if (!card) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">No card found</Text>
        </CardContent>
      </Card>
    );
  }

  const handleSocialLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView className="flex-1">
      <Card>
        <CardHeader className="items-center gap-4">
          {profilePhotoUrl ? (
            <Avatar className="size-24">
              <AvatarImage source={{ uri: profilePhotoUrl }} />
              <AvatarFallback>
                <Text className="text-2xl">{getInitials(card.name)}</Text>
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="size-24">
              <AvatarFallback>
                <Text className="text-2xl">{getInitials(card.name)}</Text>
              </AvatarFallback>
            </Avatar>
          )}

          <View className="items-center gap-1">
            <Text variant="h3" className="text-center">
              {card.name}
            </Text>
            {card.title && (
              <Text variant="muted" className="text-center">
                {card.title}
              </Text>
            )}
            {card.company && card.role && (
              <Text variant="muted" className="text-center">
                {card.role} at {card.company}
              </Text>
            )}
            {card.company && !card.role && (
              <Text variant="muted" className="text-center">
                {card.company}
              </Text>
            )}
          </View>
        </CardHeader>

        <CardContent className="gap-4">
          {/* Contact Information */}
          <View className="gap-2">
            <Text variant="small" className="font-semibold text-muted-foreground">
              Contact
            </Text>
            <View className="gap-1">
              <Text>{card.email}</Text>
              {card.phoneNumber && <Text>{card.phoneNumber}</Text>}
            </View>
          </View>

          {/* Bio */}
          {card.bio && (
            <View className="gap-2">
              <Text variant="small" className="font-semibold text-muted-foreground">
                About
              </Text>
              <Text>{card.bio}</Text>
            </View>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <View className="gap-2">
              <Text variant="small" className="font-semibold text-muted-foreground">
                Tags
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {card.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="rounded-md bg-muted px-2 py-1">
                    <Text variant="small">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Social Links */}
          {socialLinks && socialLinks.length > 0 && (
            <View className="gap-2">
              <Text variant="small" className="font-semibold text-muted-foreground">
                Social Links
              </Text>
              <View className="gap-2">
                {socialLinks.map((link) => (
                  <Text
                    key={link._id}
                    className="text-primary underline"
                    onPress={() => handleSocialLinkPress(link.url)}>
                    {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Resume indicator */}
          {card.resumeFileId && (
            <View className="gap-2">
              <Text variant="small" className="font-semibold text-muted-foreground">
                Resume
              </Text>
              <Text variant="muted">Resume attached</Text>
            </View>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}

