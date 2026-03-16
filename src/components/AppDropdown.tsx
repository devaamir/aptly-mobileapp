import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DownArrow from '../assets/icons/down-arrow-grey.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
};

export default function AppDropdown({ options, value, onSelect, placeholder = 'Select' }: Props) {
  const [focused, setFocused] = useState(false);
  const data = options.map(o => ({ label: o, value: o }));

  return (
    <Dropdown
      style={[styles.selector, focused && styles.selectorFocused]}
      placeholderStyle={styles.placeholder}
      selectedTextStyle={styles.selectedText}
      itemTextStyle={styles.itemText}
      containerStyle={styles.dropdown}
      activeColor={colors.backgroundLight}
      data={data}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value}
      onChange={item => onSelect(item.value)}
      renderRightIcon={() => <DownArrow width={SIZE(16)} height={SIZE(16)} />}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onBlur={() => setFocused(false)}
    />
  );
}

const styles = StyleSheet.create({
  selector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZE(12),
    height: SIZE(52),
    paddingHorizontal: SIZE(14),
    backgroundColor: colors.white,
    marginBottom: SIZE(24),
  },
  selectorFocused: {
    borderColor: colors.primary,
  },
  placeholder: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textSecondary,
  },
  selectedText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  itemText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  dropdown: {
    borderRadius: SIZE(12),
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
