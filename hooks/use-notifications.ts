import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Custom hook for managing push notifications.
 * 
 * Provides:
 * - Notification permissions
 * - Notification registration
 * - Notification handling
 * 
 * Note: This is a basic implementation. Full notification integration
 * will require backend setup and notification service implementation.
 */
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Check permission status
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status);
    });

    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification responses (user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      setNotification(response.notification);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  /**
   * Request notification permissions.
   */
  const requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus !== 'granted') {
      return false;
    }

    // Get push token after permission granted
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
    }

    return true;
  };

  return {
    expoPushToken,
    notification,
    permissionStatus,
    requestPermissions,
    hasPermission: permissionStatus === Notifications.PermissionStatus.GRANTED,
  };
}

/**
 * Register for push notifications and return the Expo push token.
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const projectId = process.env.EXPO_PROJECT_ID;
    if (!projectId) {
      console.warn('EXPO_PROJECT_ID not set. Push notifications may not work.');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }

  return token;
}

