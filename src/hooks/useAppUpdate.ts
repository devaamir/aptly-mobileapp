import { useEffect, useState } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VersionCheck from 'react-native-version-check';

const SKIP_KEY = 'skipped_version';

// Semver comparison: returns true if storeVersion is newer than currentVersion
function isNewer(current: string, store: string): boolean {
  const toNum = (v: string) => v.split('.').map(Number);
  const [cMajor, cMinor, cPatch] = toNum(current);
  const [sMajor, sMinor, sPatch] = toNum(store);
  if (sMajor !== cMajor) return sMajor > cMajor;
  if (sMinor !== cMinor) return sMinor > cMinor;
  return sPatch > cPatch;
}

// Major version bump = mandatory, minor/patch = optional
function updateType(current: string, store: string): 'mandatory' | 'optional' {
  const [cMajor] = current.split('.').map(Number);
  const [sMajor] = store.split('.').map(Number);
  return sMajor > cMajor ? 'mandatory' : 'optional';
}

export interface UpdateInfo {
  mandatory: boolean;
  latestVersion: string;
  storeUrl: string;
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const currentVersion = VersionCheck.getCurrentVersion();
        const storeVersion = await VersionCheck.getLatestVersion({
          provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
        });

        if (!storeVersion || !isNewer(currentVersion, storeVersion)) return;

        const mandatory =
          updateType(currentVersion, storeVersion) === 'mandatory';

        // For optional updates, skip if user already dismissed this version
        if (!mandatory) {
          const skipped = await AsyncStorage.getItem(SKIP_KEY);
          if (skipped === storeVersion) return;
        }

        const storeUrl = await VersionCheck.getStoreUrl({
          provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
        });

        setUpdateInfo({ mandatory, latestVersion: storeVersion, storeUrl });
        setVisible(true);
      } catch {
        // Silently ignore — don't block the user if store check fails
      }
    };

    check();
  }, []);

  const handleSkip = async () => {
    if (updateInfo && !updateInfo.mandatory) {
      await AsyncStorage.setItem(SKIP_KEY, updateInfo.latestVersion);
    }
    setVisible(false);
  };

  const handleUpdate = () => {
    if (updateInfo?.storeUrl) Linking.openURL(updateInfo.storeUrl);
  };

  return {
    visible,
    mandatory: updateInfo?.mandatory ?? false,
    latestVersion: updateInfo?.latestVersion ?? '',
    storeUrl: updateInfo?.storeUrl ?? '',
    handleSkip,
    handleUpdate,
  };
}
