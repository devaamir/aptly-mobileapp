/**
 * deepLinkHandler.ts
 *
 * Parses incoming QR deep-link URLs and navigates to the appropriate screen.
 *
 * Incoming URL format:  https://qr.aptly.care/c/<clinic-uuid>
 * App route:            HospitalDetail  { id: <clinic-uuid> }
 *
 * Only URLs from https://qr.aptly.care with paths matching /c/<uuid> are handled.
 * All other URLs are silently ignored.
 */

import type { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../navigations/Navigation';

/** Expected host for QR deep links. */
const QR_HOST = 'qr.aptly.care';

/**
 * UUID v4 pattern (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
 * We accept any 8-4-4-4-12 hex segment to be forward-compatible.
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parses a QR deep-link URL and returns the clinic UUID, or null if the
 * URL does not match the expected format.
 *
 * @example
 * parseClinicUrl('https://qr.aptly.care/c/00000000-0000-0000-0000-000000000000')
 * // => '00000000-0000-0000-0000-000000000000'
 */
export function parseClinicUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only handle our QR domain.
    if (parsed.hostname !== QR_HOST) {
      return null;
    }

    // Path must be exactly /c/<uuid>
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length !== 2 || parts[0] !== 'c') {
      return null;
    }

    const id = parts[1];
    if (!UUID_PATTERN.test(id)) {
      return null;
    }

    return id;
  } catch {
    // new URL() throws for malformed strings
    return null;
  }
}

/**
 * Navigates to the HospitalDetail screen for the given clinic UUID.
 *
 * The HospitalDetailScreen fetches the clinic's name and specialty from the
 * API using the id, so only the id is required for navigation.
 */
export function navigateToClinic(
  navigationRef: NavigationContainerRef<RootStackParamList>,
  clinicId: string,
): void {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate('HospitalDetail', {
    id: clinicId,
    // These fields are displayed while the screen fetches the full clinic
    // object from the API. Providing empty strings is safe – the screen
    // overwrites them once the API response arrives.
    name: '',
    specialty: '',
    location: '',
  });
}
