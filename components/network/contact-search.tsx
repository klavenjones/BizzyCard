import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
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

interface ContactSearchProps {
  contacts: Contact[];
  onFilteredContactsChange?: (filteredContacts: Contact[]) => void;
  placeholder?: string;
}

/**
 * Contact search component for search/filter functionality.
 * Filters contacts by name, email, company, tags, and meeting metadata.
 */
export function ContactSearch({
  contacts,
  onFilteredContactsChange,
  placeholder = 'Search contacts...',
}: ContactSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filterContacts = (query: string): Contact[] => {
    if (!query.trim()) {
      return contacts;
    }

    const lowerQuery = query.toLowerCase().trim();

    return contacts.filter((contact) => {
      // Search in name
      if (contact.card.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in email
      if (contact.card.email.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in title
      if (contact.card.title?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in company
      if (contact.card.company?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in role
      if (contact.card.role?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in tags
      if (contact.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // Search in card tags
      if (contact.card.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // Search in meeting metadata location
      if (contact.meetingMetadata?.location?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in meeting metadata notes
      if (contact.meetingMetadata?.notes?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    const filtered = filterContacts(text);
    onFilteredContactsChange?.(filtered);
  };

  const filteredContacts = filterContacts(searchQuery);

  // Notify parent of filtered results
  useEffect(() => {
    onFilteredContactsChange?.(filteredContacts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, contacts.length]);

  return (
    <View className="gap-2 p-4">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={handleSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.trim() && (
        <Text variant="small" className="text-muted-foreground">
          {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
        </Text>
      )}
    </View>
  );
}

