import { Stack } from 'expo-router';

const SCREEN_OPTIONS = {
  headerShown: true,
  headerBackTitleVisible: false,
};

export default function OnboardingLayout() {
  return <Stack screenOptions={SCREEN_OPTIONS} />;
}

