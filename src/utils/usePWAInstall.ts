/**
 * Native no-op: PWA install is not applicable on iOS/Android native apps.
 */
export function usePWAInstall(): { canInstall: boolean; install: () => void } {
  return { canInstall: false, install: () => {} };
}
