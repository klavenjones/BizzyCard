import '@/global.css';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { View, ScrollView, Linking, ActivityIndicator, Platform } from 'react-native';

interface CardData {
  name: string;
  title?: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  role?: string;
  bio?: string;
  tags: string[];
  profilePhotoUrl?: string;
  resumeFileUrl?: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
}

/**
 * Public web view for digital business cards.
 * Displays card information for non-app users who access share links.
 * 
 * This route is accessible without authentication and works in web browsers.
 */
export default function PublicCardView() {
  const { shareId } = useLocalSearchParams<{ shareId: string }>();
  const [cardData, setCardData] = React.useState<CardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!shareId) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    fetchCardData(shareId);
  }, [shareId]);

  const fetchCardData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get Convex URL from environment
      const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error('Convex URL not configured');
      }

      // Fetch card data from Convex HTTP endpoint
      const response = await fetch(`${convexUrl}/public/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Card not found. This share link may be invalid or the card may have been deleted.');
        }
        throw new Error(`Failed to load card: ${response.statusText}`);
      }

      const data = await response.json();
      setCardData(data.card);
    } catch (err) {
      console.error('Error fetching card data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load card');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVcf = async () => {
    if (!shareId) return;
    
    const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
    if (!convexUrl) return;

    // Open vCard download endpoint
    const vcfUrl = `${convexUrl}/public/${shareId}/vcf`;
    
    if (Platform.OS === 'web') {
      // For web, fetch and trigger download
      try {
        const response = await fetch(vcfUrl);
        if (!response.ok) throw new Error('Failed to download vCard');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cardData?.name.replace(/[^a-z0-9]/gi, '_') || 'contact'}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download vCard:', err);
        // Fallback to opening URL
        Linking.openURL(vcfUrl).catch((err) => {
          console.error('Failed to open vCard URL:', err);
        });
      }
    } else {
      // For mobile, open in browser
      Linking.openURL(vcfUrl).catch((err) => {
        console.error('Failed to open vCard download:', err);
      });
    }
  };

  const handleDownloadResume = () => {
    if (!shareId || !cardData?.resumeFileUrl) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // For web, open resume URL in new tab
      window.open(cardData.resumeFileUrl, '_blank');
    } else {
      // For mobile, open in browser
      Linking.openURL(cardData.resumeFileUrl).catch((err) => {
        console.error('Failed to open resume:', err);
      });
    }
  };

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center min-h-screen bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading card...</Text>
      </View>
    );
  }

  if (error || !cardData) {
    return (
      <View className="flex-1 items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <Text variant="h3" className="text-center mb-2">
              Card Not Found
            </Text>
            <Text className="text-center text-muted-foreground">
              {error || 'This share link is invalid or the card may have been deleted.'}
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="w-full">
          <CardHeader className="items-center gap-4 pb-6">
            {cardData.profilePhotoUrl ? (
              <Avatar className="size-24 md:size-32">
                <AvatarImage source={{ uri: cardData.profilePhotoUrl }} />
                <AvatarFallback>
                  <Text className="text-2xl md:text-3xl">{getInitials(cardData.name)}</Text>
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="size-24 md:size-32">
                <AvatarFallback>
                  <Text className="text-2xl md:text-3xl">{getInitials(cardData.name)}</Text>
                </AvatarFallback>
              </Avatar>
            )}

            <View className="items-center gap-1">
              <Text variant="h2" className="text-center text-2xl md:text-3xl">
                {cardData.name}
              </Text>
              {cardData.title && (
                <Text variant="muted" className="text-center text-base md:text-lg">
                  {cardData.title}
                </Text>
              )}
              {cardData.company && cardData.role && (
                <Text variant="muted" className="text-center text-base md:text-lg">
                  {cardData.role} at {cardData.company}
                </Text>
              )}
              {cardData.company && !cardData.role && (
                <Text variant="muted" className="text-center text-base md:text-lg">
                  {cardData.company}
                </Text>
              )}
            </View>
          </CardHeader>

          <CardContent className="gap-6 pb-8">
            {/* Contact Information */}
            <View className="gap-2">
              <Text variant="small" className="font-semibold text-muted-foreground text-sm md:text-base">
                Contact
              </Text>
              <View className="gap-1">
                <Text className="text-base md:text-lg">{cardData.email}</Text>
                {cardData.phoneNumber && (
                  <Text className="text-base md:text-lg">{cardData.phoneNumber}</Text>
                )}
              </View>
            </View>

            {/* Bio */}
            {cardData.bio && (
              <View className="gap-2">
                <Text variant="small" className="font-semibold text-muted-foreground text-sm md:text-base">
                  About
                </Text>
                <Text className="text-base md:text-lg leading-relaxed">{cardData.bio}</Text>
              </View>
            )}

            {/* Tags */}
            {cardData.tags && cardData.tags.length > 0 && (
              <View className="gap-2">
                <Text variant="small" className="font-semibold text-muted-foreground text-sm md:text-base">
                  Tags
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {cardData.tags.map((tag, index) => (
                    <View
                      key={index}
                      className="rounded-md bg-muted px-3 py-1.5">
                      <Text variant="small" className="text-sm md:text-base">{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Social Links */}
            {cardData.socialLinks && cardData.socialLinks.length > 0 && (
              <View className="gap-2">
                <Text variant="small" className="font-semibold text-muted-foreground text-sm md:text-base">
                  Social Links
                </Text>
                <View className="gap-2">
                  {cardData.socialLinks.map((link, index) => (
                    <Text
                      key={index}
                      className="text-primary underline text-base md:text-lg"
                      onPress={() => handleSocialLinkPress(link.url)}>
                      {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Download Actions */}
            <View className="gap-3 pt-4 border-t border-border">
              <Button
                onPress={handleDownloadVcf}
                className="w-full">
                <Text className="text-base md:text-lg">Download Contact (.vcf)</Text>
              </Button>
              
              {cardData.resumeFileUrl && (
                <Button
                  onPress={handleDownloadResume}
                  variant="outline"
                  className="w-full">
                  <Text className="text-base md:text-lg">Download Resume</Text>
                </Button>
              )}
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

