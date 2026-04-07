import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Platform, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import CalendarIcon from '../assets/icons/calendar-icon.svg';
import SwipeToBook from '../components/SwipeToBook';
import PatientSelector from '../components/PatientSelector';
import { createAppointment, getPatients, Patient } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'BookAppointment'>;

const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dateMonth: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
    full: d,
  };
});

const WEEK_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function BookAppointmentScreen({ navigation, route }: Props) {
  const { doctor } = route.params;
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(() => {
    const todayName = WEEK_DAYS[new Date().getDay()];
    const first = doctor.medicalCenters.flatMap(mc => mc.schedules ?? []).find(s => s.dayOfWeek === todayName);
    return first?.id ?? null;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    getPatients().then(res => {
      const valid = res.data.filter(p => !!p.name);
      setPatients(valid);
      if (valid.length > 0) setSelectedPatient(valid[0].id);
    });
  }, []);

  const handleGetToken = async () => {
    if (!selectedPatient || !selectedSession) return;
    try {
      setLoading(true);
      const appointmentDate = DAYS[selectedDay].full.toISOString().split('T')[0];
      console.log(appointmentDate, selectedSession, selectedPatient);
      const res = await createAppointment(appointmentDate, selectedSession, selectedPatient);
      navigation.navigate('BookingConfirmed', {
        token: res.data.tokenNumber,
        doctorName: doctor.name,
        hospital: doctor.medicalCenters[0]?.name ?? '',
        date: DAYS[selectedDay].dateMonth,
      });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };


  const selectedDayName = WEEK_DAYS[DAYS[selectedDay].full.getDay()];
  const todaySessions = doctor.medicalCenters
    .flatMap(mc => mc.schedules ?? [])
    .filter(s => s.dayOfWeek === selectedDayName)
    .filter((s, i, arr) => arr.findIndex(x => x.startTime === s.startTime && x.stopTime === s.stopTime) === i);
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const isOpen = todaySessions.some(s => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.stopTime.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
  });

  useEffect(() => {
    setSelectedSession(todaySessions[0]?.id ?? null);
  }, [selectedDay]);

  const onDateChange = (_: any, date?: Date) => {
    setShowCalendar(Platform.OS === 'ios');
    if (date) {
      const idx = DAYS.findIndex(d => d.full.toDateString() === date.toDateString());
      if (idx !== -1) setSelectedDay(idx);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <BackArrow width={SIZE(26)} height={SIZE(26)} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            {doctor.profilePicture ? <Image source={{ uri: doctor.profilePicture }} style={styles.avatarImg} /> : null}
          </View>
          <View>
            <Text allowFontScaling={false} style={styles.title}>{doctor.name}</Text>
            {doctor.medicalCenters[0]?.name ? <Text allowFontScaling={false} style={styles.headerSubtitle}>{doctor.medicalCenters[0].name}</Text> : null}
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusBar}>
          <Text allowFontScaling={false} style={styles.bookingTime}>
            {todaySessions.length ? `Available: ${todaySessions.map(s => `${to12h(s.startTime)} - ${to12h(s.stopTime)}`).join(', ')}` : 'No sessions this day'}
          </Text>
          <View style={styles.statusRight}>
            <View style={[styles.statusBadge, !isOpen && { backgroundColor: colors.warningLight }]}>
              <View style={[styles.statusDot, !isOpen && { backgroundColor: colors.warningDot }]} />
              <Text allowFontScaling={false} style={[styles.statusText, !isOpen && { color: colors.warningText }]}>{isOpen ? 'Booking Opened' : 'Not Started'}</Text>
            </View>
            <DownArrowGrey width={SIZE(20)} height={SIZE(20)} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date picker */}
          <View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>Select Date</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowCalendar(true)}>
              <CalendarIcon width={SIZE(20)} height={SIZE(20)} />
            </TouchableOpacity>
          </View>
          {showCalendar && (
            <DateTimePicker
              value={DAYS[selectedDay].full}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={DAYS[0].full}
              maximumDate={DAYS[DAYS.length - 1].full}
              onChange={onDateChange}
            />
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayChip, selectedDay === i && styles.dayChipActive]}
                onPress={() => setSelectedDay(i)}
                activeOpacity={0.8}>
                <Text allowFontScaling={false} style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{d.weekday}</Text>
                <Text allowFontScaling={false} style={[styles.dayDate, selectedDay === i && styles.dayLabelActive]}>{d.dateMonth}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {todaySessions.length > 0 ? (
            todaySessions.length === 1 ? (
              <View style={styles.slotCard}>
                <Text allowFontScaling={false} style={styles.slotTime}>{to12h(todaySessions[0].startTime)} - {to12h(todaySessions[0].stopTime)}</Text>
                <Text allowFontScaling={false} style={styles.slotTickets}>{todaySessions[0].tokenLimit} tokens available</Text>
              </View>
            ) : (
              <View style={styles.sessionList}>
                {todaySessions.map(s => (
                  <TouchableOpacity key={s.id} style={styles.sessionRow} activeOpacity={0.8} onPress={() => setSelectedSession(s.id)}>
                    <View style={[styles.radio, selectedSession === s.id && styles.radioActive]}>
                      {selectedSession === s.id && <View style={styles.radioDot} />}
                    </View>
                    <View>
                      <Text allowFontScaling={false} style={styles.slotTime}>{to12h(s.startTime)} - {to12h(s.stopTime)}</Text>
                      <Text allowFontScaling={false} style={styles.slotTickets}>{s.tokenLimit} tokens available</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )
          ) : (
            <View style={styles.slotCard}>
              <Text allowFontScaling={false} style={styles.slotTime}>No sessions</Text>
              <Text allowFontScaling={false} style={styles.slotTickets}>Doctor is not available this day</Text>
            </View>
          )}

          {/* Select patient */}
          <Text allowFontScaling={false} style={styles.sectionTitle}>Select Patient</Text>
          <PatientSelector
            patients={patients.map(p => ({ id: p.id, name: p.name, phone: p.phoneNumber, age: 0, gender: p.gender }))}
            selectedId={selectedPatient}
            onSelect={setSelectedPatient}
            showRadio
            onAddMember={() => { }}
          />
        </ScrollView>

        <View style={styles.stickyFooter}>
          {/* <SwipeToBook
            disabled={!selectedPatient}
            onSwipeComplete={() => {
              navigation.navigate('BookingConfirmed', {
                token: Math.floor(Math.random() * 90) + 10,
                doctorName: name,
                hospital,
                date: DAYS[selectedDay].dateMonth,
              });
            }}
          /> */}
          <TouchableOpacity
            style={[styles.getTokenBtn, (!selectedPatient || loading) && styles.getTokenBtnDisabled]}
            disabled={!selectedPatient || loading}
            activeOpacity={0.8}
            onPress={handleGetToken}>
            <Text allowFontScaling={false} style={styles.getTokenBtnText}>{loading ? 'Booking...' : 'Get Token'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  backBtn: { width: SIZE(26) },
  headerAvatar: {
    width: SIZE(42),
    height: SIZE(42),
    borderRadius: SIZE(21),
    backgroundColor: colors.backgroundLight,
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(20),
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(1),
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
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  doctorMeta: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
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
  sessionList: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
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
  getTokenBtn: {
    backgroundColor: colors.primary,
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    alignItems: 'center',
  },
  getTokenBtnDisabled: { opacity: 0.5 },
  getTokenBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.white,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: SIZE(10),
    paddingHorizontal: SIZE(10),
    borderRadius: SIZE(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.white,
    textAlign: 'center',
  },
});
