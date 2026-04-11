import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, View } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'center' | 'bottom';
};

export default function BottomModal({ visible, onClose, children, variant = 'center' }: Props) {
  return (
    <Modal visible={visible} transparent animationType={variant === 'bottom' ? 'slide' : 'fade'} onRequestClose={onClose}>
      <TouchableOpacity style={[styles.overlay, variant === 'bottom' && styles.overlayBottom]} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={[styles.sheet, variant === 'bottom' && styles.sheetBottom]} activeOpacity={1}>
          {variant === 'bottom' && <View style={styles.handle} />}
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'center', paddingHorizontal: SIZE(16) },
  overlayBottom: { justifyContent: 'flex-end', paddingHorizontal: 0 },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: SIZE(24),
    padding: SIZE(24),
    alignItems: 'center',
    gap: SIZE(12),
  },
  sheetBottom: {
    borderRadius: 0,
    borderTopLeftRadius: SIZE(24),
    borderTopRightRadius: SIZE(24),
    width: '100%',
    height: '65%',
    paddingBottom: SIZE(40),
    justifyContent: 'space-between',
  },
  handle: {
    width: SIZE(40),
    height: SIZE(4),
    borderRadius: SIZE(2),
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: SIZE(8),
  },
});
