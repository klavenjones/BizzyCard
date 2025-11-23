import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useCard } from '@/hooks/use-card';
import { isValidEmail, isValidPhone } from '@/lib/validation';
import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, View, Alert } from 'react-native';

export default function OnboardingProfileScreen() {
  const { createCard, isLoading } = useCard();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [role, setRole] = React.useState('');
  const [bio, setBio] = React.useState('');

  // Error state
  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    phoneNumber?: string;
  }>({});

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
      await createCard({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        title: title.trim() || undefined,
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      // Navigate to social links screen
      router.push('/onboarding/social-links');
    } catch (error) {
      console.error('Failed to create card:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create your card. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="p-4 py-8 sm:py-4 sm:p-6">
      <View className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Let's start with the basics. You can always edit this later.
            </CardDescription>
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
              disabled={isSubmitting || isLoading}>
              <Text>{isSubmitting ? 'Creating...' : 'Continue'}</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

