import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function AppInput({ value, onChangeText, placeholder }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput allowFontScaling={false}
      style={[styles.input, focused && styles.inputFocused]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZE(12),
    height: SIZE(52),
    paddingHorizontal: SIZE(16),
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    backgroundColor: colors.white,
    marginBottom: SIZE(14),
  },
  inputFocused: {
    borderColor: colors.primary,
  },
});
