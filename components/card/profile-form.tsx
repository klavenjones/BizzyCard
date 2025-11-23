import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useCard } from '@/hooks/use-card';
import { isValidEmail, isValidPhone } from '@/lib/validation';
import * as React from 'react';
import { View, ScrollView } from 'react-native';

interface ProfileFormProps {
  onSuccess?: () => void;
  initialData?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    title?: string;
    company?: string;
    role?: string;
    bio?: string;
  };
}

/**
 * Profile form component for editing profile fields.
 * Includes validation for email and phone number.
 */
export function ProfileForm({ onSuccess, initialData }: ProfileFormProps) {
  const { card, updateCard, isLoading: cardLoading } = useCard();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [name, setName] = React.useState(initialData?.name || card?.name || '');
  const [email, setEmail] = React.useState(initialData?.email || card?.email || '');
  const [phoneNumber, setPhoneNumber] = React.useState(
    initialData?.phoneNumber || card?.phoneNumber || ''
  );
  const [title, setTitle] = React.useState(initialData?.title || card?.title || '');
  const [company, setCompany] = React.useState(initialData?.company || card?.company || '');
  const [role, setRole] = React.useState(initialData?.role || card?.role || '');
  const [bio, setBio] = React.useState(initialData?.bio || card?.bio || '');

  // Error state
  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    phoneNumber?: string;
  }>({});

  // Update form when card data loads
  React.useEffect(() => {
    if (card && !initialData) {
      setName(card.name || '');
      setEmail(card.email || '');
      setPhoneNumber(card.phoneNumber || '');
      setTitle(card.title || '');
      setCompany(card.company || '');
      setRole(card.role || '');
      setBio(card.bio || '');
    }
  }, [card, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (phoneNumber && !isValidPhone(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCard({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        title: title.trim() || undefined,
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update card:', error);
      if (error instanceof Error) {
        setErrors({ email: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            {errors.name && (
              <Text className="text-sm font-medium text-destructive">{errors.name}</Text>
            )}
          </View>

          <View className="gap-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email && (
              <Text className="text-sm font-medium text-destructive">{errors.email}</Text>
            )}
          </View>

          <View className="gap-1.5">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            {errors.phoneNumber && (
              <Text className="text-sm font-medium text-destructive">{errors.phoneNumber}</Text>
            )}
          </View>

          <View className="gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Software Engineer"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Acme Inc."
              value={company}
              onChangeText={setCompany}
            />
          </View>

          <View className="gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              placeholder="Senior Developer"
              value={role}
              onChangeText={setRole}
            />
          </View>

          <View className="gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Button
            className="w-full"
            onPress={handleSubmit}
            disabled={isSubmitting || cardLoading}>
            <Text>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

