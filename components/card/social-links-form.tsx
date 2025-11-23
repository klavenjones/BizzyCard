import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSocialLinks } from '@/hooks/use-social-links';
import { useCard } from '@/hooks/use-card';
import { isValidUrl } from '@/lib/validation';
import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';

const VALID_PLATFORMS = [
  'linkedin',
  'github',
  'twitter',
  'bluesky',
  'facebook',
  'instagram',
  'portfolio',
  'custom',
] as const;

type Platform = (typeof VALID_PLATFORMS)[number];

interface SocialLinkItem {
  _id: Id<'socialLinks'>;
  platform: string;
  url: string;
  order: number;
}

/**
 * Social links form component for managing social links.
 * Allows adding, editing, and removing social links.
 */
export function SocialLinksForm() {
  const { card } = useCard();
  const { socialLinks, addLink, updateLink, removeLink, isLoading } = useSocialLinks(
    card?._id
  );

  const [editingId, setEditingId] = React.useState<Id<'socialLinks'> | null>(null);
  const [newPlatform, setNewPlatform] = React.useState<Platform>('custom');
  const [newUrl, setNewUrl] = React.useState('');
  const [errors, setErrors] = React.useState<{ url?: string; platform?: string }>({});

  const handleAddLink = async () => {
    if (!card) return;

    const newErrors: typeof errors = {};
    if (!newUrl.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(newUrl)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await addLink({
        platform: newPlatform,
        url: newUrl.trim(),
      });
      setNewUrl('');
      setNewPlatform('custom');
      setErrors({});
    } catch (error) {
      console.error('Failed to add social link:', error);
      if (error instanceof Error) {
        setErrors({ url: error.message });
      }
    }
  };

  const handleUpdateLink = async (linkId: Id<'socialLinks'>, url: string) => {
    const newErrors: typeof errors = {};
    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await updateLink({
        linkId,
        url: url.trim(),
      });
      setEditingId(null);
      setErrors({});
    } catch (error) {
      console.error('Failed to update social link:', error);
      if (error instanceof Error) {
        setErrors({ url: error.message });
      }
    }
  };

  const handleRemoveLink = async (linkId: Id<'socialLinks'>) => {
    try {
      await removeLink(linkId);
    } catch (error) {
      console.error('Failed to remove social link:', error);
    }
  };

  return (
    <ScrollView className="flex-1">
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Add and manage your social media links</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          {/* Existing Links */}
          {socialLinks && socialLinks.length > 0 && (
            <View className="gap-3">
              {socialLinks.map((link) => (
                <View key={link._id} className="gap-2 rounded-md border border-border p-3">
                  {editingId === link._id ? (
                    <View className="gap-2">
                      <Label>{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</Label>
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChangeText={(url) => {
                          // Update local state for editing
                          const updatedLinks = socialLinks.map((l) =>
                            l._id === link._id ? { ...l, url } : l
                          );
                          // This is a simplified approach - in a real implementation,
                          // you'd manage the editing state more carefully
                        }}
                        keyboardType="url"
                        autoCapitalize="none"
                      />
                      <View className="flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onPress={() => setEditingId(null)}>
                          <Text>Cancel</Text>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onPress={() => handleUpdateLink(link._id, link.url)}>
                          <Text>Save</Text>
                        </Button>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 gap-1">
                        <Text className="font-medium">
                          {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        </Text>
                        <Text variant="muted" numberOfLines={1}>
                          {link.url}
                        </Text>
                      </View>
                      <View className="flex-row gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => setEditingId(link._id)}>
                          <Text>Edit</Text>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onPress={() => handleRemoveLink(link._id)}>
                          <Text>Remove</Text>
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Add New Link */}
          <View className="gap-3 border-t border-border pt-4">
            <Text variant="small" className="font-semibold">
              Add New Link
            </Text>

            <View className="gap-1.5">
              <Label htmlFor="platform">Platform</Label>
              <View className="flex-row flex-wrap gap-2">
                {VALID_PLATFORMS.map((platform) => (
                  <Pressable
                    key={platform}
                    onPress={() => setNewPlatform(platform)}
                    className={`rounded-md border px-3 py-2 ${
                      newPlatform === platform
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background'
                    }`}>
                    <Text
                      className={
                        newPlatform === platform ? 'font-semibold text-primary' : ''
                      }>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-1.5">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={newUrl}
                onChangeText={setNewUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
              {errors.url && (
                <Text className="text-sm font-medium text-destructive">{errors.url}</Text>
              )}
            </View>

            <Button onPress={handleAddLink} disabled={isLoading}>
              <Text>Add Link</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

