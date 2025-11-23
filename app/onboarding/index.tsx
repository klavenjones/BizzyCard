import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function OnboardingIndexScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6">
      <View className="w-full max-w-sm">
        <Card>
          <CardHeader className="items-center gap-2">
            <CardTitle className="text-center text-2xl">Welcome to BizzyCard</CardTitle>
            <CardDescription className="text-center">
              Let's create your digital business card. This will only take a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text variant="small" className="text-muted-foreground">
                You'll be able to:
              </Text>
              <View className="gap-1 pl-4">
                <Text variant="small" className="text-muted-foreground">
                  • Add your profile information
                </Text>
                <Text variant="small" className="text-muted-foreground">
                  • Link your social media profiles
                </Text>
                <Text variant="small" className="text-muted-foreground">
                  • Upload your resume (optional)
                </Text>
              </View>
            </View>
            <Button className="w-full" onPress={() => router.push('/onboarding/profile')}>
              <Text>Get Started</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

