import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import CalendarIcon from '../assets/icons/calendar-icon.svg';
import AddIconBlue from '../assets/icons/add-icon-blue.svg';
import ArrowRightBlue from '../assets/icons/arrow-right-blue.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'BookAppointment'>;

const PATIENTS = [
  { id: '1', name: 'Alen', phone: '+91 98765 43210', age: 28, gender: 'Male' },
  { id: '2', name: 'Sara', phone: '+91 91234 56789', age: 24, gender: 'Female' },
];

['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dateMonth: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
    full: d,
  };
});

export default function BookAppointmentScreen({ navigation, route }: Props) {
  const { name, type, hospital } = route.params;
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(26)} height={SIZE(26)} />
        </TouchableOpacity>
        <View style={styles.headerAvatar} />
        <Text style={styles.title}>{name}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statusBar}>
        <Text style={styles.bookingTime}>Booking available at 7:00am - 6:30 pm</Text>
        <View style={styles.statusRight}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Booking Opened</Text>
          </View>
          <DownArrowGrey width={SIZE(20)} height={SIZE(20)} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date picker */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <CalendarIcon width={SIZE(20)} height={SIZE(20)} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayChip, selectedDay === i && styles.dayChipActive]}
              onPress={() => { setSelectedDay(i); setSelectedSlot(null); }}
              activeOpacity={0.8}>
              <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{d.weekday}</Text>
              <Text style={[styles.dayDate, selectedDay === i && styles.dayLabelActive]}>{d.dateMonth}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.slotCard}>
          <Text style={styles.slotTime}>8:00am - 11:30am</Text>
          <Text style={styles.slotTickets}>110 tickets available</Text>
        </View>

        {/* Select patient */}
        <Text style={styles.sectionTitle}>Select Patient</Text>
        <View style={styles.patientsContainer}>
          {PATIENTS.map((p, index) => (
            <View key={p.id}>
              <TouchableOpacity
                style={styles.patientCard}
                onPress={() => setSelectedPatient(p.id)}
                activeOpacity={0.8}>
                <View style={[styles.radio, selectedPatient === p.id && styles.radioActive]}>
                  {selectedPatient === p.id && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={styles.patientName}>{p.name}</Text>
                  <View style={styles.patientMeta}>
                    <Text style={styles.metaText}>{p.phone}</Text>
                    <Text style={styles.metaDot}>|</Text>
                    <Text style={styles.metaText}>Age: {p.age}</Text>
                    <Text style={styles.metaDot}>|</Text>
                    <Text style={styles.metaText}>Gender: {p.gender}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              {index < PATIENTS.length - 1 && <View style={styles.patientDivider} />}
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.addMemberBtn} activeOpacity={0.7}>
          <AddIconBlue width={SIZE(18)} height={SIZE(18)} />
          <Text style={styles.addMemberText}>Add new member</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.confirmBtn, !selectedPatient && styles.confirmBtnDisabled]}
          activeOpacity={0.8}
          disabled={!selectedPatient}>
          <View style={styles.swipeIcon}>
            <ArrowRightBlue width={SIZE(26)} height={SIZE(26)} />
          </View>
          <Text style={styles.confirmBtnText}>Swipe to Book</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    gap: SIZE(10),
  },
  backBtn: { width: SIZE(32) },
  headerAvatar: {
    width: SIZE(22),
    height: SIZE(22),
    borderRadius: SIZE(11),
    backgroundColor: colors.backgroundLight,
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  headerType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(1),
  },
  divider: { height: 1, backgroundColor: colors.border },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBorder,
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(10),
  },
  bookingTime: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
    backgroundColor: colors.successLight,
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(4),
    borderRadius: SIZE(20),
  },
  statusDot: {
    width: SIZE(6),
    height: SIZE(6),
    borderRadius: SIZE(3),
    backgroundColor: colors.successDot,
  },
  statusText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(11),
    color: colors.successText,
  },
  content: { padding: SIZE(18), gap: SIZE(16) },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatar: {
    width: SIZE(56),
    height: SIZE(56),
    borderRadius: SIZE(28),
    backgroundColor: colors.backgroundLight,
  },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  doctorType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  doctorHospital: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textMuted,
    marginTop: SIZE(2),
  },
  sectionTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotCard: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: SIZE(14),
  },
  slotTime: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  slotTickets: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.available,
    marginTop: SIZE(4),
  },
  patientsContainer: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
  },
  patientCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  patientDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: SIZE(14),
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SIZE(8),
    paddingVertical: SIZE(10),
    paddingHorizontal: SIZE(13),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  addMemberText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.primaryAccent,
  },
  patientName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
    marginTop: SIZE(-2),
  },
  radio: {
    width: SIZE(20),
    height: SIZE(20),
    borderRadius: SIZE(10),
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: SIZE(10),
    height: SIZE(10),
    borderRadius: SIZE(5),
    backgroundColor: colors.primary,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
  },
  metaText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
  },
  metaDot: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.cardBorder,
  },
  daysRow: {
    flexDirection: 'row',
    gap: SIZE(8),
  },
  dayChip: {
    alignItems: 'center',
    paddingVertical: SIZE(10),
    paddingHorizontal: SIZE(12),
    borderRadius: SIZE(10),
    backgroundColor: colors.inputBg,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
  },
  dayLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  dayDate: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
    marginTop: SIZE(2),
  },
  dayLabelActive: { color: colors.white },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZE(10),
  },
  slotChip: {
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(10),
    borderRadius: SIZE(8),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  slotChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
  slotTextActive: { color: colors.white },
  stickyFooter: {
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: SIZE(10),
    paddingHorizontal: SIZE(10),
    borderRadius: SIZE(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(10),
  },
  swipeIcon: {
    width: SIZE(36),
    height: SIZE(36),
    borderRadius: SIZE(8),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.white,
  },
});
