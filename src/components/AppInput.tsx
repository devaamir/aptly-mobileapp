import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  prefix?: string;
};

export default function AppInput({ value, onChangeText, placeholder, prefix, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  if (prefix) {
    return (
      <View style={[styles.input, styles.row, focused && styles.inputFocused]}>
        <Text allowFontScaling={false} style={styles.prefix}>{prefix}</Text>
        <View style={styles.separator} />
        <TextInput
          allowFontScaling={false}
          style={styles.prefixInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
    );
  }

  return (
    <TextInput allowFontScaling={false}
      style={[styles.input, focused && styles.inputFocused]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...rest}
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
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 },
  prefix: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    paddingHorizontal: SIZE(16),
  },
  separator: { width: 1, height: SIZE(24), backgroundColor: colors.border },
  prefixInput: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    paddingHorizontal: SIZE(12),
  },
});
