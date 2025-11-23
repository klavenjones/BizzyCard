import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { ContactList } from '@/components/network/contact-list';
import { ContactSearch } from '@/components/network/contact-search';
import { useContacts } from '@/hooks/use-contacts';
import { router } from 'expo-router';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Network tab screen displaying saved contacts with search functionality.
 * Shows contact list and allows filtering/searching contacts.
 */
export default function NetworkScreen() {
  const { contacts, isLoading, removeContact } = useContacts();
  const [filteredContacts, setFilteredContacts] = useState(contacts);

  const handleContactPress = (contact: any) => {
    // Navigate to contact detail screen
    router.push(`/card/${contact._id}`);
  };

  const handleContactRemove = async (contactId: Id<'contacts'>) => {
    try {
      await removeContact(contactId);
      // Update filtered contacts
      setFilteredContacts((prev) => prev.filter((c) => c._id !== contactId));
    } catch (error) {
      console.error('Error removing contact:', error);
      // TODO: Show error toast/alert
    }
  };

  // Update filtered contacts when contacts change
  useEffect(() => {
    setFilteredContacts(contacts);
  }, [contacts]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search Component */}
      <ContactSearch
        contacts={contacts}
        onFilteredContactsChange={setFilteredContacts}
      />

      {/* Contact List */}
      <ContactList
        contacts={filteredContacts}
        onContactPress={handleContactPress}
        onContactRemove={handleContactRemove}
        isLoading={isLoading}
      />
    </View>
  );
}
