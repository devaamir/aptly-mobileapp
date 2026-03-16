import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DownArrow from '../assets/icons/down-arrow-grey.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
};

export default function AppDatePicker({ value, onChange, placeholder = 'Select' }: Props) {
  const [show, setShow] = useState(false);

  const formatted = value
    ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.selector, show && styles.selectorFocused]} onPress={() => setShow(true)} activeOpacity={0.7}>
        <Text style={[styles.selectorText, !formatted && styles.placeholder]}>
          {formatted || placeholder}
        </Text>
        <DownArrow width={SIZE(16)} height={SIZE(16)} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShow(Platform.OS === 'ios');
            if (date) onChange(date);
            if (Platform.OS === 'android') setShow(false);
          }}
        />
      )}
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
  selectorFocused: {
    borderColor: colors.primary,
  },
  selectorText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  placeholder: { color: colors.textSecondary },
});
