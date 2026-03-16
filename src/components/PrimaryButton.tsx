import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import colors from '../themes/colors';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export default function PrimaryButton({label, onPress, disabled, icon}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}>
      <Text style={[styles.buttonText, disabled && styles.buttonDisabledText]}>
        {label}
      </Text>
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundMuted,
  },
  buttonText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  buttonDisabledText: {
    color: colors.textMuted,
  },
});
