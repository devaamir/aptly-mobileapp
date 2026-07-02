/**
 * Native no-op: PWA install is not applicable on iOS/Android native apps.
 */
export function usePWAInstall(): {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
} {
  return { canInstall: false, isInstalled: false, install: async () => {} };
}
