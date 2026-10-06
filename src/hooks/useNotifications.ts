import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  bootstrapNotifications,
  getFCMToken,
  getInitialNotificationData,
  onFCMTokenRefresh,
  registerForegroundHandler,
  registerNotifeeEventHandler,
} from '../services/NotificationService';
import { registerDeviceToken } from '../services/api';

interface UseNotificationsResult {
  fcmToken: string | null;
  initialNotificationData: Record<string, string | undefined> | null;
}

async function sendTokenToServer(token: string) {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) return; // not logged in yet — skip
    await registerDeviceToken(token, Platform.OS as 'ios' | 'android');
  } catch (e) {
    console.warn('[useNotifications] Failed to register device token:', e);
  }
}

export function useNotifications(
  onNotificationPress?: (data?: Record<string, string | undefined>) => void,
): UseNotificationsResult {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [initialNotificationData, setInitialNotificationData] = useState<
    Record<string, string | undefined> | null
  >(null);

  const onPressRef = useRef(onNotificationPress);
  onPressRef.current = onNotificationPress;

  useEffect(() => {
    let unsubForegroundFCM: (() => void) | undefined;
    let unsubNotifeeEvent: (() => void) | undefined;
    let unsubTokenRefresh: (() => void) | undefined;

    async function setup() {
      await bootstrapNotifications();

      const token = await getFCMToken();
      setFcmToken(token);
      if (token) await sendTokenToServer(token);

      unsubTokenRefresh = onFCMTokenRefresh(async newToken => {
        setFcmToken(newToken);
        await sendTokenToServer(newToken);
      });

      unsubForegroundFCM = registerForegroundHandler(data =>
        onPressRef.current?.(data),
      );

      unsubNotifeeEvent = registerNotifeeEventHandler(data =>
        onPressRef.current?.(data),
      );

      const initialData = await getInitialNotificationData();
      if (initialData) {
        setInitialNotificationData(initialData);
        onPressRef.current?.(initialData);
      }
    }

    setup().catch(err =>
      console.error('[useNotifications] Setup error:', err),
    );

    return () => {
      unsubForegroundFCM?.();
      unsubNotifeeEvent?.();
      unsubTokenRefresh?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { fcmToken, initialNotificationData };
}
