import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  visible: boolean;
  mandatory: boolean;
  latestVersion: string;
  message?: string;
  storeUrl: string;
  onUpdate: () => void;
  onSkip: () => void;
};

export default function AppUpdateModal({
  visible,
  mandatory,
  latestVersion,
  message,
  onUpdate,
  onSkip,
}: Props) {
  const handleUpdate = () => {
    onUpdate();
  };

  // Block hardware back on mandatory updates
  React.useEffect(() => {
    if (!visible || !mandatory) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [visible, mandatory]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={mandatory ? undefined : onSkip}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🚀</Text>
          </View>

          <Text allowFontScaling={false} style={styles.title}>
            {mandatory ? 'Update Required' : 'Update Available'}
          </Text>

          <Text allowFontScaling={false} style={styles.version}>
            Version {latestVersion}
          </Text>

          <Text allowFontScaling={false} style={styles.message}>
            {message ||
              (mandatory
                ? 'This update is required to continue using the app. Please update to the latest version.'
                : 'A new version of Aptly is available with improvements and bug fixes.')}
          </Text>

          <TouchableOpacity
            style={styles.updateBtn}
            activeOpacity={0.8}
            onPress={handleUpdate}>
            <Text allowFontScaling={false} style={styles.updateBtnText}>
              Update Now
            </Text>
          </TouchableOpacity>

          {!mandatory && (
            <TouchableOpacity
              style={styles.skipBtn}
              activeOpacity={0.7}
              onPress={onSkip}>
              <Text allowFontScaling={false} style={styles.skipBtnText}>
                Skip for now
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZE(28),
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: SIZE(20),
    paddingHorizontal: SIZE(24),
    paddingTop: SIZE(32),
    paddingBottom: SIZE(24),
    alignItems: 'center',
  },
  iconContainer: {
    width: SIZE(72),
    height: SIZE(72),
    borderRadius: SIZE(36),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZE(20),
  },
  iconText: {
    fontSize: SIZE(32),
  },
  title: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: SIZE(20),
    color: colors.textPrimary,
    marginBottom: SIZE(6),
    textAlign: 'center',
  },
  version: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.primary,
    marginBottom: SIZE(16),
  },
  message: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: SIZE(21),
    marginBottom: SIZE(28),
  },
  updateBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    alignItems: 'center',
    marginBottom: SIZE(12),
  },
  updateBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.white,
  },
  skipBtn: {
    paddingVertical: SIZE(8),
  },
  skipBtnText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textSecondary,
  },
});
