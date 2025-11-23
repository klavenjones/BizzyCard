import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCard } from '@/hooks/use-card';
import { useSocialLinks } from '@/hooks/use-social-links';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { generateVCardFile, CardData } from '@/lib/vcf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Download } from 'lucide-react-native';
import { useState } from 'react';

/**
 * vCF generator component for .vcf file generation.
 * Generates and shares a vCard (.vcf) file from the current user's card data.
 */
export function VCFGenerator() {
  const { card, isLoading: isCardLoading } = useCard();
  const { convexUser } = useAuth();
  const { socialLinks, isLoading: isSocialLinksLoading } = useSocialLinks(
    card?._id
  );

  // Get profile photo URL if available
  const profilePhotoUrl = useQuery(
    api.files.getUrl,
    card?.profilePhotoId ? { fileId: card.profilePhotoId } : 'skip'
  );

  const [isGenerating, setIsGenerating] = useState(false);

  // Check if onboarding is completed (FR-048)
  const isOnboardingCompleted = convexUser?.onboardingCompleted ?? false;
  const canShare = isOnboardingCompleted && card !== null;

  const handleGenerateVCF = async () => {
    if (!card) {
      return;
    }

    try {
      setIsGenerating(true);

      // Prepare card data for vCard generation
      const cardData: CardData = {
        name: card.name,
        title: card.title,
        email: card.email,
        phoneNumber: card.phoneNumber,
        company: card.company,
        role: card.role,
        bio: card.bio,
        tags: card.tags,
        profilePhotoUrl: profilePhotoUrl?.url,
        socialLinks: socialLinks.map((link) => ({
          platform: link.platform,
          url: link.url,
        })),
      };

      // Generate vCard content
      const vcfContent = generateVCardFile(cardData);

      // Save to temporary file
      const fileName = `${card.name.replace(/\s+/g, '-')}-business-card.vcf`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, vcfContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/vcard',
          dialogTitle: 'Share vCard',
          UTI: 'public.vcard', // iOS uniform type identifier
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error generating vCard:', error);
      // TODO: Show error toast/alert
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = isCardLoading || isSocialLinksLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">Loading...</Text>
        </CardContent>
      </Card>
    );
  }

  if (!card || !isOnboardingCompleted) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">
            {!isOnboardingCompleted
              ? 'Please complete onboarding before exporting your card.'
              : 'No card found. Please complete onboarding first.'}
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Text variant="h3">Export as vCard</Text>
        <Text variant="muted">
          Generate a .vcf file that can be imported into contacts
        </Text>
      </CardHeader>
      <CardContent>
        <Button
          onPress={handleGenerateVCF}
          disabled={isGenerating || !canShare}
          variant="outline"
          className="w-full">
          <Download className="size-4" />
          <Text>{isGenerating ? 'Generating...' : 'Download vCard (.vcf)'}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

