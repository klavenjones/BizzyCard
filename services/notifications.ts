import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notifications service for push notification setup and delivery.
 * Handles notification permissions, token registration, and notification handling.
 */

/**
 * Configure notification handler behavior.
 */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions.
 * @returns true if permission granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Get Expo push token for the current device.
 * @returns Expo push token string, or null if unavailable
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return null;
    }

    const projectId = process.env.EXPO_PROJECT_ID;
    if (!projectId) {
      console.warn('EXPO_PROJECT_ID not set. Push notifications may not work.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}

/**
 * Configure Android notification channel (required for Android 8.0+).
 */
export async function configureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/**
 * Schedule a local notification.
 * @param title - Notification title
 * @param body - Notification body text
 * @param data - Additional data to attach to notification
 * @param trigger - When to show the notification (default: immediate)
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  trigger?: Notifications.NotificationTriggerInput
) {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Cannot schedule notification: permission not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null means show immediately
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel a specific notification by ID.
 * @param notificationId - ID of notification to cancel
 */
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Get all notification permissions status.
 * @returns Permission status object
 */
export async function getNotificationPermissions() {
  return await Notifications.getPermissionsAsync();
}

/**
 * Initialize notifications service.
 * Should be called when app starts.
 */
export async function initializeNotifications() {
  configureNotifications();
  await configureAndroidChannel();
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    const token = await getExpoPushToken();
    if (token) {
      // TODO: Send token to backend to register for push notifications
      console.log('Expo push token:', token);
    }
  }
  
  return hasPermission;
}

