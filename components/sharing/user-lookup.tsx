import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/use-auth';
import { useCard } from '@/hooks/use-card';
import { Mail, Phone, Send } from 'lucide-react-native';

/**
 * User lookup component for finding users by email or phone number.
 * Allows in-app sharing by looking up users and sending cards.
 */
export function UserLookup() {
  const [lookupType, setLookupType] = useState<'email' | 'phone'>('email');
  const [lookupValue, setLookupValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { convexUser } = useAuth();
  const { card } = useCard();
  const sendCard = useMutation(api.sharing.sendCard);

  // Query user by email or phone
  const foundUser = useQuery(
    lookupType === 'email' && lookupValue.trim()
      ? api.users.getByEmail
      : lookupType === 'phone' && lookupValue.trim()
      ? api.users.getByPhone
      : 'skip',
    lookupType === 'email'
      ? { email: lookupValue.trim() }
      : { phoneNumber: lookupValue.trim() }
  );

  const handleLookup = () => {
    if (!lookupValue.trim()) {
      Alert.alert('Error', `Please enter a ${lookupType === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }

    setIsSearching(true);
    // The query will automatically run when lookupValue changes
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleSendCard = async () => {
    if (!foundUser || !card) {
      return;
    }

    // Prevent sending to self
    if (foundUser._id === convexUser?._id) {
      Alert.alert('Error', 'You cannot send your card to yourself.');
      return;
    }

    try {
      setIsSending(true);
      await sendCard({ recipientUserId: foundUser._id });
      Alert.alert('Success', 'Card sent successfully!');
      setLookupValue('');
    } catch (error) {
      console.error('Error sending card:', error);
      Alert.alert('Error', 'Failed to send card. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    return /^\d{10,15}$/.test(cleaned);
  };

  const isInputValid = lookupType === 'email' 
    ? isValidEmail(lookupValue.trim())
    : isValidPhone(lookupValue.trim());

  return (
    <Card>
      <CardHeader>
        <Text variant="h3">Share with App User</Text>
        <Text variant="muted">
          Find and share your card with another app user by email or phone
        </Text>
      </CardHeader>
      <CardContent className="gap-4">
        {/* Lookup Type Toggle */}
        <View className="flex-row gap-2">
          <Button
            variant={lookupType === 'email' ? 'default' : 'outline'}
            onPress={() => {
              setLookupType('email');
              setLookupValue('');
            }}
            className="flex-1">
            <Mail className="size-4" />
            <Text>Email</Text>
          </Button>
          <Button
            variant={lookupType === 'phone' ? 'default' : 'outline'}
            onPress={() => {
              setLookupType('phone');
              setLookupValue('');
            }}
            className="flex-1">
            <Phone className="size-4" />
            <Text>Phone</Text>
          </Button>
        </View>

        {/* Input */}
        <View className="gap-2">
          <Input
            placeholder={lookupType === 'email' ? 'Enter email address' : 'Enter phone number'}
            value={lookupValue}
            onChangeText={setLookupValue}
            keyboardType={lookupType === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            onPress={handleLookup}
            disabled={!isInputValid || isSearching}
            variant="outline">
            <Text>Search</Text>
          </Button>
        </View>

        {/* Results */}
        {isSearching && (
          <Text className="text-center text-muted-foreground">Searching...</Text>
        )}

        {!isSearching && lookupValue.trim() && isInputValid && foundUser === null && (
          <View className="rounded-md bg-muted/50 p-3">
            <Text className="text-center text-muted-foreground">
              No user found with this {lookupType === 'email' ? 'email' : 'phone number'}.
            </Text>
          </View>
        )}

        {foundUser && (
          <View className="gap-3 rounded-md border border-border bg-card p-4">
            <Text variant="h4">{foundUser.email}</Text>
            {foundUser.phoneNumber && (
              <Text variant="muted">{foundUser.phoneNumber}</Text>
            )}
            <Button
              onPress={handleSendCard}
              disabled={isSending || !card}
              className="w-full">
              <Send className="size-4" />
              <Text>{isSending ? 'Sending...' : 'Send Card'}</Text>
            </Button>
          </View>
        )}

        {!card && (
          <Text variant="small" className="text-center text-muted-foreground">
            You need to create a card before sharing.
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

