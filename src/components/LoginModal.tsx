import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function LoginModal({ visible, onClose }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = () => {
    onClose();
    navigation.navigate('PhoneNumber');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.card} activeOpacity={1} onPress={() => {}}>
          <Text allowFontScaling={false} style={styles.title}>
            Login Required
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            Please login to view your appointments.
          </Text>
          <PrimaryButton label="Login" onPress={handleLogin} />
          <TouchableOpacity onPress={onClose}>
            <Text allowFontScaling={false} style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZE(24),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: SIZE(20),
    padding: SIZE(24),
    width: '100%',
    gap: SIZE(12),
  },
  title: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    marginBottom: SIZE(4),
  },
  cancelText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textMuted,
    textAlign: 'center',
  },
});
