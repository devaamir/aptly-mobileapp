import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DownArrow from '../assets/icons/down-arrow-grey.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  focused?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function AppDatePicker({ value, onChange, placeholder = 'Select', focused }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatted = value
    ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const maxDate = new Date().toISOString().split('T')[0];
  const inputValue = value ? value.toISOString().split('T')[0] : '';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, focused && styles.selectorFocused]}
        onPress={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
        activeOpacity={0.7}>
        <Text allowFontScaling={false} style={[styles.selectorText, !formatted && styles.placeholder]}>
          {formatted || placeholder}
        </Text>
        <DownArrow width={SIZE(16)} height={SIZE(16)} />
      </TouchableOpacity>
      {/* @ts-ignore */}
      <input
        ref={inputRef}
        type="date"
        max={maxDate}
        value={inputValue}
        onChange={e => { if (e.target.value) onChange(new Date(e.target.value)); }}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SIZE(20) },
  selector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZE(12),
    height: SIZE(52),
    paddingHorizontal: SIZE(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  selectorFocused: { borderColor: colors.primary },
  selectorText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  placeholder: { color: colors.textSecondary },
});
