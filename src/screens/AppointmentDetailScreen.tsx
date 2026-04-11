import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, Pressable, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import AppointmentInfoCard from '../components/AppointmentInfoCard';
import PatientSelector from '../components/PatientSelector';
import { cancelAppointment, getAppointment } from '../services/api';
import type { Appointment } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Route = RouteProp<RootStackParamList, 'AppointmentDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { id, doctor, type, hospital, date, time, token, status } = params;
  const { user } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    getAppointment(id).then(res => { console.log("appointment", res.data); setAppointment(res.data) }).catch(console.error);

  }, [id]);

  const appt = appointment;
  const displayDoctor = appt?.doctor.name ?? doctor;
  const displayHospital = appt?.medicalCenter.name ?? hospital;
  const displayType = appt?.doctor.specialties[0]?.name ?? type;
  const displayLocation = appt ? `${appt.medicalCenter.district}, ${appt.medicalCenter.state}` : '';
  const displayDate = appt
    ? new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : date;
  const to12h = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`;
  };
  const displayTime = appt ? `${to12h(appt.schedule.startTime)} - ${to12h(appt.schedule.stopTime)}` : time;
  const displayToken = appt?.tokenNumber ?? token;
  const statusMap: Record<string, string> = { pending: 'Upcoming', active: 'Live', completed: 'Completed', cancelled: 'Cancelled' };

  const computeStatus = (): string => {
    if (!appt) return status;
    if (appt.tokenStatus !== 'pending') return statusMap[appt.tokenStatus] ?? appt.tokenStatus;
    const today = new Date().toISOString().split('T')[0];
    if (appt.appointmentDate !== today) return 'Upcoming';
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = appt.schedule.startTime.split(':').map(Number);
    const [eh, em] = appt.schedule.stopTime.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em ? 'Live' : 'Upcoming';
  };

  const displayStatus = computeStatus();

  const estimatedTime = (() => {
    if (!appt || displayStatus !== 'Live') return null;
    const consultMins = appt.doctor.estimateConsultationTime ?? 15;
    const tokensAhead = Math.max(0, displayToken - 1);
    const est = new Date(Date.now() + tokensAhead * consultMins * 60 * 1000);
    const h = est.getHours(), m = est.getMinutes();
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`;
  })();
  const displayPatient = appt?.patient ?? null;

  const patientForSelector = displayPatient ? [{
    id: displayPatient.id,
    name: displayPatient.name,
    phone: displayPatient.phoneNumber,
    age: displayPatient.dateOfBirth ? new Date().getFullYear() - new Date(displayPatient.dateOfBirth).getFullYear() : 0,
    gender: displayPatient.gender,
  }] : user ? [{
    id: user.patientId,
    name: user.name,
    phone: user.phoneNumber,
    age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 0,
    gender: user.gender ?? '',
  }] : [];

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelAppointment(id);
      setConfirmVisible(false);
      navigation.goBack();
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={SIZE(10)}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>Appointment Details</Text>
        <View style={{ width: SIZE(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Token card */}
        {(displayStatus === 'Live' || displayStatus === 'Upcoming') && (
          <View style={[styles.liveCard, displayStatus === 'Upcoming' && { backgroundColor: colors.upcomingTokenBg }]}>
            {displayStatus === 'Live' && (
              <Video
                source={require('../assets/images/background-video.mp4')}
                style={{
                  width: SIZE(600),
                  height: SIZE(150),
                  borderRadius: SIZE(10),
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                }}
                resizeMode="cover"
                repeat
                muted
              />
            )}
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: displayStatus === 'Upcoming' ? colors.upcomingDot : colors.successDot }]} />
              <Text allowFontScaling={false} style={styles.statusText}>{displayStatus}</Text>
            </View>
            <View style={styles.liveRight}>
              {displayStatus === 'Live' && displayToken > 1 && (
                <View style={styles.tokenQueue}>
                  <Text allowFontScaling={false} style={styles.tokenNextPrev}>{displayToken - 1}</Text>
                  <Text allowFontScaling={false} style={styles.tokenCurrent}>{displayToken}</Text>
                  <Text allowFontScaling={false} style={styles.tokenNextPrev}>{displayToken + 1}</Text>
                </View>
              )}
              <View style={styles.liveTokenContent}>
                <Text allowFontScaling={false} style={[styles.liveLabel, displayStatus === 'Upcoming' && { color: colors.textMuted }]}>Your Token</Text>
                <Text allowFontScaling={false} style={[styles.liveToken, displayStatus === 'Upcoming' && { color: colors.textPrimary }]}>{displayToken}</Text>
                {displayStatus === 'Live' && estimatedTime && (
                  <Text allowFontScaling={false} style={styles.liveEstimated}>Estimated {estimatedTime}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Clinic & Doctor Information */}
        <Text allowFontScaling={false} style={styles.sectionLabel}>Clinic & Doctor Information</Text>
        <AppointmentInfoCard
          hospital={displayHospital}
          hospitalType={displayType}
          location={displayLocation}
          doctor={displayDoctor}
          doctorSpecialty={displayType}
          variant="light"
          onDoctorPress={() => appt && navigation.navigate('DoctorDetail', { doctorId: appt.doctor.id })}
        />

        {/* Patient Details */}
        <Text allowFontScaling={false} style={[styles.sectionLabel, { marginTop: SIZE(24) }]}>Patient Details</Text>
        <PatientSelector patients={patientForSelector} showRadio={false} />

        {/* Meta */}
        <Text allowFontScaling={false} style={[styles.sectionLabel, { marginTop: SIZE(24) }]}>Appointment Info</Text>
        <View style={styles.section}>
          {[
            { label: 'Appointment ID', value: appt ? `#${appt.referenceId}` : '#APT-00' + displayToken },
            { label: 'Appointment Date', value: displayDate },
            { label: 'Session Time', value: displayTime },
            { label: 'Booking Method', value: 'Online' },
            { label: 'Booked Date', value: displayDate },
          ].map((item, index, arr) => (
            <View key={item.label}>
              <View style={styles.infoRow}>
                <Text allowFontScaling={false} style={styles.metaLabel}>{item.label}</Text>
                <Text allowFontScaling={false} style={styles.metaValue}>{item.value}</Text>
              </View>
              {index < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Cancel button */}
        {displayStatus !== 'Completed' && displayStatus !== 'Cancelled' && (
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => setConfirmVisible(true)}>
            <Text allowFontScaling={false} style={styles.cancelBtnText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Confirmation modal */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setConfirmVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <Text allowFontScaling={false} style={styles.modalTitle}>Cancel Appointment</Text>
            <Text allowFontScaling={false} style={styles.modalBody}>Are you sure you want to cancel this appointment? This action cannot be undone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalKeepBtn} activeOpacity={0.8} onPress={() => setConfirmVisible(false)}>
                <Text allowFontScaling={false} style={styles.modalKeepText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.8} onPress={handleCancel} disabled={cancelling}>
                {cancelling
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text allowFontScaling={false} style={styles.modalCancelText}>Yes, Cancel</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(20),
    paddingVertical: SIZE(12),
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  content: { padding: SIZE(20), gap: SIZE(16) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  liveCard: {
    height: SIZE(120),
    borderRadius: SIZE(12),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(16),
    marginBottom: SIZE(14),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
    borderWidth: 1,
    borderColor: colors.statusBorder,
    backgroundColor: colors.badgeBg,
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(5),
    borderRadius: SIZE(20),
  },
  statusDot: {
    width: SIZE(7),
    height: SIZE(7),
    borderRadius: SIZE(4),
    backgroundColor: colors.successDot,
  },
  statusText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(11),
    color: colors.statusText,
  },
  liveRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
  },
  liveTokenContent: { alignItems: 'flex-end' },
  tokenQueue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
  },
  tokenNextPrev: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.tokenNextPrevColor,
  },
  tokenCurrent: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(28),
    color: colors.tokenWhite,
  },
  liveEstimated: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.border,
    marginTop: SIZE(2),
  },
  liveLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(11),
    color: colors.border,
  },
  liveToken: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(36),
    color: colors.tokenWhite,
  },
  avatar: {
    width: SIZE(48),
    height: SIZE(48),
    borderRadius: SIZE(24),
    backgroundColor: colors.backgroundLight,
  },
  hospitalName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  subText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  section: {
    padding: SIZE(14),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  sectionLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: SIZE(10) },
  doctorAvatar: {
    width: SIZE(36),
    height: SIZE(36),
    borderRadius: SIZE(18),
    backgroundColor: colors.backgroundLight,
  },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZE(12),
  },
  metaItem: { width: '45%' },
  metaLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textMuted,
  },
  metaValue: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZE(12),
  },
  cancelBtn: {
    marginTop: SIZE(8),
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.error,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: SIZE(16),
    padding: SIZE(20),
    gap: SIZE(12),
  },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  modalBody: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    lineHeight: SIZE(20),
  },
  modalActions: {
    flexDirection: 'row',
    gap: SIZE(10),
    marginTop: SIZE(4),
  },
  modalKeepBtn: {
    flex: 1,
    paddingVertical: SIZE(12),
    borderRadius: SIZE(10),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalKeepText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: SIZE(12),
    borderRadius: SIZE(10),
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.white,
  },
});
