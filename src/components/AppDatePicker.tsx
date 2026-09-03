import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
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
  /** Prevents selecting today or any future date. Useful for date-of-birth fields. */
  disableFuture?: boolean;
};

export default function AppDatePicker({
  value,
  onChange,
  placeholder = 'Select',
  focused: externalFocused,
  onOpen,
  onClose,
  disableFuture = false,
}: Props) {
  const [show, setShow] = useState(false);
  const focused = externalFocused !== undefined ? externalFocused : show;

  const openPicker = () => {
    setShow(true);
    onOpen?.();
  };
  const closePicker = () => {
    setShow(false);
    onClose?.();
  };

  // Format for display — value is stored as local noon so dayjs formats it correctly.
  const formatted = value ? dayjs(value).format('DD MMM YYYY') : null;

  // Pass value as local noon so the ISO string stays on the correct calendar
  // day on iOS. Local midnight IST = 18:30 UTC (previous day), which causes
  // the picker to highlight the wrong date. Noon is safe for all UTC offsets.
  const pickerDate = value
    ? dayjs(`${dayjs(value).format('YYYY-MM-DD')}T12:00:00`)
    : undefined;

  // When disableFuture is true, cap the selectable range to today.
  const pickerMaxDate = disableFuture
    ? dayjs(`${dayjs().format('YYYY-MM-DD')}T12:00:00`)
    : undefined;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, focused && styles.selectorFocused]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Text
          allowFontScaling={false}
          style={[styles.selectorText, !formatted && styles.placeholder]}
        >
          {formatted || placeholder}
        </Text>
        <DownArrow width={SIZE(16)} height={SIZE(16)} />
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closePicker}>
                <Text allowFontScaling={false} style={styles.modalBtn}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              mode="single"
              date={pickerDate}
              maxDate={pickerMaxDate}
              onChange={({ date }) => {
                if (date) {
                  // The picker returns ~local midnight for the tapped date.
                  // Adding 1 hour pushes past midnight safely (handles historical
                  // IST quirk where it returns 23:55 instead of 00:00).
                  const corrected = dayjs(date as never).add(1, 'hour');
                  onChange(
                    new Date(
                      corrected.year(),
                      corrected.month(),
                      corrected.date(),
                      12,
                      0,
                      0,
                    ),
                  );
                  closePicker();
                }
              }}
              styles={{
                selected: {
                  backgroundColor: colors.primary,
                  borderRadius: SIZE(20),
                },
                selected_label: {
                  color: colors.white,
                  fontFamily: 'Manrope-SemiBold',
                },
                day_label: {
                  fontFamily: 'Manrope-Regular',
                  color: colors.textPrimary,
                },
                // Future dates are greyed out and visually muted when disableFuture is on
                disabled: {
                  opacity: 0.3,
                },
                disabled_label: {
                  fontFamily: 'Manrope-Regular',
                  color: colors.textSecondary,
                  textDecorationLine: 'line-through',
                },
                weekday_label: {
                  fontFamily: 'Manrope-Medium',
                  color: colors.textSecondary,
                },
                month_selector_label: {
                  fontFamily: 'Manrope-SemiBold',
                  color: colors.textPrimary,
                },
                year_selector_label: {
                  fontFamily: 'Manrope-SemiBold',
                  color: colors.textPrimary,
                },
                button_prev_image: {
                  tintColor: '#000000',
                },
                button_next_image: {
                  tintColor: '#000000',
                },
              }}
            />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: SIZE(16),
    borderTopRightRadius: SIZE(16),
    paddingBottom: SIZE(24),
    paddingHorizontal: SIZE(8),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(12),
    paddingVertical: SIZE(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalBtn: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textSecondary,
  },
});
