import { Tabs } from 'expo-router';
import { HomeIcon, ShareIcon, UsersIcon } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tabs.Screen
        name="my-card"
        options={{
          title: 'My Card',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'Share',
          tabBarIcon: ({ color, size }) => (
            <ShareIcon size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'Network',
          tabBarIcon: ({ color, size }) => (
            <UsersIcon size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

