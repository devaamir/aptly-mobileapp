import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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

export default function AppDatePicker({ value, onChange, placeholder = 'Select', focused: externalFocused, onOpen, onClose }: Props) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const focused = externalFocused !== undefined ? externalFocused : show;

  const openPicker = () => { setShow(true); onOpen?.(); };
  const closePicker = () => { setShow(false); onClose?.(); };

  const formatted = value
    ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.selector, focused && styles.selectorFocused]} onPress={openPicker} activeOpacity={0.7}>
        <Text allowFontScaling={false} style={[styles.selectorText, !formatted && styles.placeholder]}>
          {formatted || placeholder}
        </Text>
        <DownArrow width={SIZE(16)} height={SIZE(16)} />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closePicker}>
                  <Text allowFontScaling={false} style={styles.modalBtn}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { onChange(tempDate); closePicker(); }}>
                  <Text allowFontScaling={false} style={[styles.modalBtn, styles.modalDone]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_, date) => { if (date) setTempDate(date); }}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(_, date) => { closePicker(); if (date) onChange(date); }}
          />
        )
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(20),
    paddingVertical: SIZE(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalBtn: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textSecondary,
  },
  modalDone: {
    color: colors.primary,
    fontFamily: 'Manrope-SemiBold',
  },
});
