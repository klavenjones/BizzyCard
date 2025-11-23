import { FlatList, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { ContactCard } from './contact-card';
import { Id } from '@/convex/_generated/dataModel';

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

interface ContactListProps {
  contacts: Contact[];
  onContactPress?: (contact: Contact) => void;
  onContactRemove?: (contactId: Id<'contacts'>) => void;
  isLoading?: boolean;
}

/**
 * Contact list component displaying saved contacts.
 * Shows a list of contacts with their card information.
 */
export function ContactList({
  contacts,
  onContactPress,
  onContactRemove,
  isLoading = false,
}: ContactListProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Loading contacts...</Text>
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-muted-foreground">
          No contacts yet. Start sharing cards to build your network!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <ContactCard
          contact={item}
          onPress={() => onContactPress?.(item)}
          onRemove={() => onContactRemove?.(item._id)}
        />
      )}
      contentContainerClassName="gap-4 p-4"
      showsVerticalScrollIndicator={false}
    />
  );
}

