import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, View } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function BottomModal({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1}>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'center', paddingHorizontal: SIZE(16) },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: SIZE(24),
    padding: SIZE(24),
    alignItems: 'center',
    gap: SIZE(12),
  },
});
