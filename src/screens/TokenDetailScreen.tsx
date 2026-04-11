import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import DangerIcon from '../assets/icons/danger-icon.svg';
import BottomModal from '../components/BottomModal';
import AppointmentInfoCard from '../components/AppointmentInfoCard';
import { cancelAppointment } from '../services/api';
import type { Appointment } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'TokenDetail'>;

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const to12h = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2,'0')}${h >= 12 ? 'pm' : 'am'}`; };

export default function TokenDetailScreen({ navigation, route }: Props) {
  const { appointment: appt } = route.params;
  const [cancelVisible, setCancelVisible] = useState(false);

  const isLive = appt ? (() => {
    const today = new Date().toISOString().split('T')[0];
    if (appt.appointmentDate !== today || appt.tokenStatus !== 'pending') return false;
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const [sh, sm] = (appt.schedule?.startTime ?? '').split(':').map(Number);
    const [eh, em] = (appt.schedule?.stopTime ?? '').split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
  })() : false;

  const token = appt?.tokenNumber ?? 0;
  const consultMins = appt?.doctor?.estimateConsultationTime ?? 15;
  const estTime = isLive
    ? (() => { const est = new Date(Date.now() + Math.max(0, token - 1) * consultMins * 60000); const h = est.getHours(), m = est.getMinutes(); return `${h % 12 || 12}:${String(m).padStart(2,'0')}${h >= 12 ? 'pm' : 'am'}`; })()
    : appt?.schedule ? to12h(appt.schedule.startTime) : null;

  const handleCancel = async () => {
    await cancelAppointment(appt.id).catch(console.error);
    setCancelVisible(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, !isLive && { backgroundColor: colors.upcomingCardBg }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isLive ? 'light-content' : 'dark-content'} backgroundColor={isLive ? colors.primary : colors.upcomingCardBg} />
      {isLive && Platform.OS === 'android' && (
        <Video
          source={require('../assets/images/background-video.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat
          muted
          disableFocus
        />
      )}

      {/* TOP */}
      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text allowFontScaling={false} style={[styles.backText, !isLive && { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
        <View style={[styles.liveBadge, !isLive && { backgroundColor: colors.badgeBg }]}>
          <View style={[styles.greenDot, !isLive && { backgroundColor: colors.primaryAccent }]} />
          <Text allowFontScaling={false} style={[styles.liveText, !isLive && { color: colors.textPrimary }]}>{isLive ? 'Live' : 'Upcoming'}</Text>
        </View>
      </View>

      {/* CENTER */}
      <View style={styles.center}>
        <Text allowFontScaling={false} style={[styles.tokenLabel, !isLive && { color: colors.textPrimary }]}>Your Token</Text>
        <Text allowFontScaling={false} style={[styles.tokenNumber, !isLive && { color: colors.black }]}>{token || '--'}</Text>
        {estTime && <Text allowFontScaling={false} style={[styles.tokenEst, !isLive && { color: colors.textSecondary }]}>{isLive ? `Estimated ${estTime}` : 'Scheduled for'}</Text>}
        {!isLive && appt?.appointmentDate && (
          <Text allowFontScaling={false} style={styles.scheduledDate}>
            {new Date(appt.appointmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            {appt.schedule ? `, ${to12h(appt.schedule.startTime)} - ${to12h(appt.schedule.stopTime)}` : ''}
          </Text>
        )}
        {isLive && (
          <View style={styles.tokenRow}>
            <Text allowFontScaling={false} style={styles.tokenSideNum}>1</Text>
            <Text allowFontScaling={false} style={styles.tokenCurrentNum}>2</Text>
            <Text allowFontScaling={false} style={styles.tokenSideNum}>3</Text>
          </View>
        )}
      </View>

      {/* BOTTOM */}
      <View style={styles.bottom}>
        <AppointmentInfoCard
          hospital={appt?.medicalCenter?.name ?? ''}
          hospitalType={appt?.medicalCenter?.type ?? ''}
          location={appt?.medicalCenter ? `${appt.medicalCenter.district}, ${appt.medicalCenter.state}` : ''}
          doctor={appt?.doctor?.name ?? ''}
          doctorSpecialty={appt?.doctor?.specialties?.[0]?.name ?? ''}
          onCancelPress={() => setCancelVisible(true)}
          variant={isLive ? 'dark' : 'light'}
        />
      </View>

      {/* Cancel Modal */}
      <BottomModal visible={cancelVisible} onClose={() => setCancelVisible(false)}>
        <View style={styles.dangerIconWrapper}>
          <DangerIcon width={50} height={50} />
        </View>
        <Text allowFontScaling={false} style={styles.modalTitle}>Cancel Token?</Text>
        <Text allowFontScaling={false} style={styles.modalDesc}>Your position in the queue will be lost and you may need to book again.</Text>
        <View style={styles.modalBtns}>
          <TouchableOpacity style={[styles.modalBtn, styles.keepBtn]} onPress={() => setCancelVisible(false)} activeOpacity={0.8}>
            <Text allowFontScaling={false} style={styles.keepText}>Keep Token</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalBtn, styles.yesBtn]} onPress={handleCancel} activeOpacity={0.8}>
            <Text allowFontScaling={false} style={styles.yesText}>Yes, Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'space-between'
  },

  // TOP
  top: {
    paddingHorizontal: SIZE(20),
    paddingTop: SIZE(8),
    gap: SIZE(12)
  },
  backBtn: {
    width: SIZE(36),
    height: SIZE(36),
    borderRadius: SIZE(18),
    backgroundColor: colors.white20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  backText: {
    color: colors.white,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white20,
    borderRadius: SIZE(20),
    paddingHorizontal: SIZE(12),
    paddingVertical: SIZE(5),
    gap: SIZE(6),
  },
  greenDot: {
    width: SIZE(8),
    height: SIZE(8),
    borderRadius: SIZE(4),
    backgroundColor: colors.onlineIndicator,
  },
  liveText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.white
  },

  // CENTER
  center: {
    alignItems: 'center',
    gap: SIZE(8)
  },
  tokenLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.white80
  },
  tokenNumber: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(108),
    color: colors.white,
    lineHeight: SIZE(96)
  },
  tokenEst: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.white80
  },
  scheduledDate: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.scheduledText,
    backgroundColor: colors.white,
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(4),
    borderRadius: SIZE(6),
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(16),
    marginTop: SIZE(4)
  },
  tokenSideNum: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(20),
    color: colors.white,
    opacity: 0.5
  },
  tokenCurrentNum: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(40),
    color: colors.white
  },
  waitLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.white70
  },
  waitCount: {
    fontFamily: 'Manrope-Bold',
    color: colors.white
  },

  // BOTTOM
  bottom: {
    paddingHorizontal: SIZE(20),
    paddingBottom: SIZE(12),
    gap: SIZE(12)
  },
  hospitalCard: {
    backgroundColor: colors.white15,
    borderRadius: SIZE(16),
    padding: SIZE(16),
  },
  hospitalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZE(12)
  },
  hospitalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10)
  },
  hospitalAvatar: {
    width: SIZE(44),
    height: SIZE(44),
    borderRadius: SIZE(22),
    backgroundColor: colors.white30
  },
  hospitalName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(14),
    color: colors.white
  },
  hospitalType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white70
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
    marginBottom: SIZE(14),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.cardBorder,
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: SIZE(8),
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: SIZE(18)
  },
  actionBtn: {
    width: '32%',
    height: SIZE(36),
    borderRadius: SIZE(10),
    backgroundColor: colors.white20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    marginBottom: SIZE(12),
    overflow: 'hidden'
  },
  dashedLine: {
    borderWidth: 1,
    borderColor: colors.borderLowOpacity,
    borderStyle: 'dashed',
    marginBottom: -1,
  },
  hospitalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10)
  },
  doctorAvatar: {
    width: SIZE(44),
    height: SIZE(44),
    borderRadius: SIZE(22),
    backgroundColor: colors.white30
  },
  doctorInfo: {
    flex: 1
  },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.white
  },
  sep: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.white50
  },
  doctorSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white70
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: SIZE(8)
  },
  cancelText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.danger
  },
  dangerIconWrapper: {
    backgroundColor: colors.backgroundSubtle,
    borderRadius: SIZE(12),
    padding: SIZE(8),
  },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(18),
    color: colors.textPrimary
  },
  modalDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: SIZE(20),
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SIZE(12),
    marginTop: SIZE(4),
    width: '100%'
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    alignItems: 'center'
  },
  keepBtn: {
    backgroundColor: colors.primaryLight
  },
  yesBtn: {
    backgroundColor: colors.danger
  },
  keepText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.primaryAccent
  },
  yesText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.white
  },
});
