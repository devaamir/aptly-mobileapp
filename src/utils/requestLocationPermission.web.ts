export async function requestLocationPermission(): Promise<void> {
  if (!navigator.geolocation) return;

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    if (status.state === 'denied') {
      window.alert(
        'Location access is blocked.\n\nOn iPhone: Settings → Safari → Location → Allow\n\nOn Android: Settings → Apps → Browser → Permissions → Location → Allow\n\nThen refresh this page.'
      );
    }
  } catch {
    // permissions API not supported, browser will handle it natively
  }
}
