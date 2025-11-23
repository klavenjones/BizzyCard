import { ProfileForm } from '@/components/card/profile-form';
import { SocialLinksForm } from '@/components/card/social-links-form';
import { FileUpload } from '@/components/card/file-upload';
import { useCard } from '@/hooks/use-card';
import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function CardEditScreen() {
  const { card } = useCard();

  React.useEffect(() => {
    if (!card) {
      router.back();
    }
  }, [card]);

  if (!card) {
    return null;
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4 gap-6">
        {/* Profile Section */}
        <ProfileForm />

        {/* Social Links Section */}
        <SocialLinksForm />

        {/* Profile Photo Section */}
        <FileUpload type="profilePhoto" currentFileUrl={null} />

        {/* Resume Section */}
        <FileUpload type="resume" currentFileUrl={null} />
      </View>
    </ScrollView>
  );
}

