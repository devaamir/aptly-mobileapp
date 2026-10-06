/**
 * NotificationService
 *
 * Uses the @react-native-firebase/messaging v26 modular API.
 *
 * Handles:
 *  - Requesting notification permission
 *  - Getting / refreshing the FCM token
 *  - Displaying local notifications via Notifee
 *  - Handling FCM messages in the foreground
 *  - Detecting initial notification (cold-start from tapped notification)
 *
 * NOTE: Background FCM handler MUST be registered in index.js via:
 *   import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
 *   setBackgroundMessageHandler(getMessaging(), handler);
 */

import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification as fcmGetInitialNotification,
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { registerDeviceToken, unregisterDeviceToken } from './api';

let unsubscribeTokenRefresh: (() => void) | null = null;

// ─── Channel IDs ────────────────────────────────────────────────────────────

export const CHANNEL_ID = {
  DEFAULT: 'aptly_default',
  APPOINTMENTS: 'aptly_appointments',
  REMINDERS: 'aptly_reminders',
} as const;

// ─── Bootstrap ──────────────────────────────────────────────────────────────

/**
 * Creates Android notification channels and requests iOS permission.
 * Call once at app startup (before registering any listeners).
 */
export async function bootstrapNotifications(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID.DEFAULT,
    name: 'General',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    vibration: true,
    sound: 'default',
  });

  await notifee.createChannel({
    id: CHANNEL_ID.APPOINTMENTS,
    name: 'Appointments',
    description: 'Appointment confirmations and updates',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    vibration: true,
    sound: 'default',
  });

  await notifee.createChannel({
    id: CHANNEL_ID.REMINDERS,
    name: 'Reminders',
    description: 'Appointment reminders',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    vibration: true,
    sound: 'default',
  });

  // iOS: request permission
  await requestPermission();
}

// ─── Permission ─────────────────────────────────────────────────────────────

/**
 * Requests notification permission from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission({
    sound: true,
    badge: true,
    alert: true,
    announcement: true,
  });

  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

// ─── FCM Token ──────────────────────────────────────────────────────────────

/**
 * Returns the current FCM registration token.
 * Send this to your backend to target push notifications to this device.
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await getToken(getMessaging());
    console.log('[NotificationService] FCM Token:', token);
    return token;
  } catch (error) {
    console.error('[NotificationService] Failed to get FCM token:', error);
    return null;
  }
}

/**
 * Subscribe to FCM token refresh events.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function onFCMTokenRefresh(
  callback: (token: string) => void,
): () => void {
  return onTokenRefresh(getMessaging(), callback);
}

// ─── Display a local notification ───────────────────────────────────────────

export interface LocalNotificationOptions {
  title: string;
  body: string;
  channelId?: string;
  data?: Record<string, string>;
  badgeCount?: number;
}

/**
 * Displays a local notification immediately using Notifee.
 */
export async function displayNotification({
  title,
  body,
  channelId = CHANNEL_ID.DEFAULT,
  data,
  badgeCount,
}: LocalNotificationOptions): Promise<void> {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
    },
    ios: {
      sound: 'default',
      badgeCount,
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
  });
}

// ─── FCM Foreground Handler ──────────────────────────────────────────────────

/**
 * Displays a Notifee local notification from an FCM RemoteMessage.
 * Used for notification-type messages that arrive in the foreground.
 */
async function displayFCMMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const { notification, data } = message;
  if (!notification?.title && !notification?.body) {
    return;
  }
  await displayNotification({
    title: notification?.title ?? 'Aptly',
    body: notification?.body ?? '',
    data: data as Record<string, string> | undefined,
  });
}

/**
 * Registers the foreground FCM message handler (shows notification banner).
 * Also registers onNotificationOpenedApp for background→foreground taps.
 * Returns an unsubscribe function.
 */
export function registerForegroundHandler(
  onPress?: (data?: Record<string, string | undefined>) => void,
): () => void {
  const unsubMessage = onMessage(getMessaging(), async remoteMessage => {
    console.log('[NotificationService] Foreground message:', remoteMessage);
    await displayFCMMessage(remoteMessage);
  });

  // Fires when user taps a notification while the app is in the background
  const unsubOpened = onNotificationOpenedApp(getMessaging(), remoteMessage => {
    console.log('[NotificationService] Opened from background:', remoteMessage);
    onPress?.(remoteMessage.data as Record<string, string | undefined>);
  });

  return () => {
    unsubMessage();
    unsubOpened();
  };
}

// ─── Notifee Foreground Event Handler ───────────────────────────────────────

/**
 * Registers a Notifee foreground event handler to respond to notification
 * interactions (press, dismiss) while the app is open.
 *
 * Returns an unsubscribe function — call it on component unmount.
 */
export function registerNotifeeEventHandler(
  onPress?: (data?: Record<string, string | undefined>) => void,
): () => void {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log(
        '[NotificationService] Notification pressed:',
        detail.notification,
      );
      onPress?.(
        detail.notification?.data as Record<string, string | undefined>,
      );
    }
    if (type === EventType.DISMISSED) {
      console.log(
        '[NotificationService] Notification dismissed:',
        detail.notification?.id,
      );
    }
  });
}

// ─── Initial Notification (cold-start) ──────────────────────────────────────

/**
 * Checks whether the app was launched from a notification tap.
 * Returns the initial notification data, or null.
 */
export async function getInitialNotificationData(): Promise<Record<
  string,
  string | undefined
> | null> {
  // Notifee initial notification (local)
  const notifeeInitial = await notifee.getInitialNotification();
  if (notifeeInitial) {
    return notifeeInitial.notification.data as Record<
      string,
      string | undefined
    >;
  }

  // FCM initial notification (remote push, app opened from tray)
  const fcmInitial = await fcmGetInitialNotification(getMessaging());
  if (fcmInitial) {
    return fcmInitial.data as Record<string, string | undefined>;
  }

  return null;
}

// ─── Device Registration ─────────────────────────────────────────────────────

/**
 * Call after login and on app start when a patient is already logged in.
 * Requests permission, gets the FCM token, registers it with the backend,
 * and subscribes to token refreshes.
 */
export async function registerDevice(): Promise<void> {
  try {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) return;

    const token = await getToken(getMessaging());
    await registerDeviceToken(token, Platform.OS as 'ios' | 'android');

    unsubscribeTokenRefresh?.();
    unsubscribeTokenRefresh = onTokenRefresh(getMessaging(), async newToken => {
      await registerDeviceToken(newToken, Platform.OS as 'ios' | 'android');
    });
  } catch (error) {
    console.warn('[NotificationService] Failed to register device:', error);
  }
}

/**
 * Call on logout, BEFORE clearing the access token so the DELETE request
 * can still authenticate.
 */
export async function unregisterDevice(): Promise<void> {
  try {
    unsubscribeTokenRefresh?.();
    unsubscribeTokenRefresh = null;
    const token = await getToken(getMessaging());
    await unregisterDeviceToken(token);
  } catch (error) {
    console.warn('[NotificationService] Failed to unregister device:', error);
  }
}
