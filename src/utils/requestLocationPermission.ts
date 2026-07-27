import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export async function requestLocationPermission(): Promise<void> {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Allow Location Access',
        message:
          'Aptly uses your location to find doctors and clinics near you, show distances, and sort results by proximity.\n\nYour location is only used while you are using the app and is never shared with third parties.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
  } else {
    await new Promise<void>(resolve => {
      Geolocation.requestAuthorization(resolve, resolve);
      // Fallback in case callback is never called (permission already determined)
      setTimeout(resolve, 500);
    });
  }
}
