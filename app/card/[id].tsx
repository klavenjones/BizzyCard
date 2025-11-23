import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, View, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useContact, useContacts } from '@/hooks/use-contacts';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';
import { Linking } from 'react-native';
import { useSocialLinks } from '@/hooks/use-social-links';
import { Mail, Phone, MapPin, Calendar, Tag, Trash2, Edit } from 'lucide-react-native';
import { ContactMetadataForm } from '@/components/network/contact-metadata-form';

/**
 * Contact detail screen for viewing saved contact cards.
 * Displays full contact information including tags and meeting metadata.
 */
export default function ContactDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const contactId = params.id as Id<'contacts'> | undefined;
  const { contact, isLoading } = useContact(contactId || null);
  const { removeContact, updateTags, addMeetingMetadata } = useContacts();

  // Get profile photo URL if available
  const profilePhotoUrl = useQuery(
    api.files.getUrl,
    contact?.card.profilePhotoId ? { fileId: contact.card.profilePhotoId } : 'skip'
  );

  // Get social links for the contact's card
  const { socialLinks } = useSocialLinks(contact?.sourceCardId);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = () => {
    if (!contactId) return;

    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this contact from your network?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await removeContact(contactId);
              router.back();
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEmailPress = () => {
    if (contact?.card.email) {
      Linking.openURL(`mailto:${contact.card.email}`).catch((err) => {
        console.error('Failed to open email:', err);
      });
    }
  };

  const handlePhonePress = () => {
    if (contact?.card.phoneNumber) {
      Linking.openURL(`tel:${contact.card.phoneNumber}`).catch((err) => {
        console.error('Failed to open phone:', err);
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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!contact) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-muted-foreground">
          Contact not found
        </Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="gap-4 p-4">
        {/* Profile Header */}
        <Card>
          <CardHeader className="items-center gap-4">
            {profilePhotoUrl?.url ? (
              <Avatar className="size-24">
                <AvatarImage source={{ uri: profilePhotoUrl.url }} />
                <AvatarFallback>
                  <Text className="text-2xl">{getInitials(contact.card.name)}</Text>
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="size-24">
                <AvatarFallback>
                  <Text className="text-2xl">{getInitials(contact.card.name)}</Text>
                </AvatarFallback>
              </Avatar>
            )}

            <View className="items-center gap-1">
              <Text variant="h3" className="text-center">
                {contact.card.name}
              </Text>
              {contact.card.title && (
                <Text variant="muted" className="text-center">
                  {contact.card.title}
                </Text>
              )}
              {contact.card.company && contact.card.role && (
                <Text variant="muted" className="text-center">
                  {contact.card.role} at {contact.card.company}
                </Text>
              )}
              {contact.card.company && !contact.card.role && (
                <Text variant="muted" className="text-center">
                  {contact.card.company}
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
              <View className="gap-2">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onPress={handleEmailPress}>
                  <Mail className="size-4" />
                  <Text>{contact.card.email}</Text>
                </Button>
                {contact.card.phoneNumber && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onPress={handlePhonePress}>
                    <Phone className="size-4" />
                    <Text>{contact.card.phoneNumber}</Text>
                  </Button>
                )}
              </View>
            </View>

            {/* Bio */}
            {contact.card.bio && (
              <View className="gap-2">
                <Text variant="small" className="font-semibold text-muted-foreground">
                  About
                </Text>
                <Text>{contact.card.bio}</Text>
              </View>
            )}

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <View className="gap-2">
                <Text variant="small" className="font-semibold text-muted-foreground flex-row items-center gap-1">
                  <Tag className="size-4" />
                  Tags
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <View
                      key={index}
                      className="rounded-md bg-muted px-2 py-1">
                      <Text variant="small">{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Meeting Metadata */}
            {contact.meetingMetadata && (
              <View className="gap-2 rounded-md bg-muted/50 p-3">
                <Text variant="small" className="font-semibold text-muted-foreground flex-row items-center gap-1">
                  <Calendar className="size-4" />
                  Meeting Information
                </Text>
                <Text variant="small">
                  Met on {new Date(contact.meetingMetadata.date).toLocaleDateString()}
                </Text>
                {contact.meetingMetadata.location && (
                  <View className="flex-row items-center gap-1">
                    <MapPin className="size-3" />
                    <Text variant="small">{contact.meetingMetadata.location}</Text>
                  </View>
                )}
                {contact.meetingMetadata.notes && (
                  <Text variant="small" className="mt-1">
                    {contact.meetingMetadata.notes}
                  </Text>
                )}
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
                    <Button
                      key={link._id}
                      variant="ghost"
                      className="justify-start"
                      onPress={() => handleSocialLinkPress(link.url)}>
                      <Text className="text-primary underline">
                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                      </Text>
                    </Button>
                  ))}
                </View>
              </View>
            )}

            {/* Edit Button */}
            <Button
              variant="outline"
              onPress={() => setShowEditForm(!showEditForm)}
              className="mt-4">
              <Edit className="size-4" />
              <Text>{showEditForm ? 'Cancel Edit' : 'Edit Contact'}</Text>
            </Button>

            {/* Delete Button */}
            <Button
              variant="destructive"
              onPress={handleDelete}
              disabled={isDeleting}
              className="mt-2">
              <Trash2 className="size-4" />
              <Text>Delete Contact</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {showEditForm && contactId && (
          <ContactMetadataForm
            contactId={contactId}
            currentTags={contact.tags}
            currentMeetingMetadata={contact.meetingMetadata}
            onSave={() => {
              setShowEditForm(false);
              // The contact will automatically update via the query
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

