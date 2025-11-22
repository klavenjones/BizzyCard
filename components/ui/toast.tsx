/**
 * Toast/notification component for user feedback
 */

import { useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Text } from './text';
import { X } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

export function Toast({ message, type = 'info', visible, duration = 3000, onDismiss }: ToastProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss, opacity]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{ opacity }}
      className="absolute top-12 left-4 right-4 z-50"
      pointerEvents="box-none"
    >
      <View className={`${typeStyles[type]} rounded-lg p-4 flex-row items-center shadow-lg`}>
        <Text className="flex-1 text-white font-medium">{message}</Text>
        <TouchableOpacity onPress={onDismiss} className="ml-2">
          <X size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

