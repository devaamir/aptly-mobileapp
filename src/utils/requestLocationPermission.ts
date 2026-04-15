import { PermissionsAndroid, Platform } from 'react-native';

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
  }
  // iOS: permission is requested automatically on first Geolocation use
}
