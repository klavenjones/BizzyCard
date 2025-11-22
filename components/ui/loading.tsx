/**
 * Loading indicator component
 */

import { View, ActivityIndicator } from 'react-native';
import { Text } from './text';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Loading({ message, size = 'large', fullScreen = false }: LoadingProps) {
  const containerClass = fullScreen
    ? 'flex-1 items-center justify-center bg-background'
    : 'items-center justify-center p-4';

  return (
    <View className={containerClass}>
      <ActivityIndicator size={size} color="#000" />
      {message && (
        <Text className="mt-4 text-muted-foreground text-center">{message}</Text>
      )}
    </View>
  );
}

