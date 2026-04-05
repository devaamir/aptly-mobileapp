import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import SearchIcon from '../assets/icons/search-icon.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
};

export default function SearchBar({ placeholder = 'Search...', value, onChangeText, editable = true, autoFocus = false, style }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused, style]}>
      <TextInput allowFontScaling={false}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <TouchableOpacity style={styles.iconContainer} onPress={() => value && onChangeText?.('')}>
        {value ? (
          <Text allowFontScaling={false} style={styles.clearText}>✕</Text>
        ) : (
          <SearchIcon width={SIZE(20)} height={SIZE(20)} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: SIZE(14),
    backgroundColor: colors.white,
  },
  focused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  iconContainer: {
    paddingVertical: SIZE(8),
    paddingLeft: SIZE(12),
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: SIZE(14),
    color: colors.textSecondary,
    fontFamily: 'Manrope-Medium',
  },
});
