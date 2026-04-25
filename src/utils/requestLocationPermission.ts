import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export async function requestLocationPermission(): Promise<void> {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Aptly needs your location to show nearby doctors and clinics.',
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
