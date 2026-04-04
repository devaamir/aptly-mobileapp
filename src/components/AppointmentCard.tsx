import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Video from 'react-native-video';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import ArrowRight from '../assets/icons/arrow-right.svg';

type Status = 'Upcoming' | 'Completed' | 'Cancelled' | 'Live';

type Props = {
  doctor: string;
  type: string;
  hospital: string;
  date: string;
  time: string;
  token: number;
  status: Status;
  avatar?: string;
};

const statusColors: Record<Status, { bg: string; dot: string }> = {
  Live: { bg: colors.successLight, dot: colors.successDot },
  Upcoming: { bg: colors.primaryLight, dot: colors.primary },
  Completed: { bg: colors.successLight, dot: colors.successDot },
  Cancelled: { bg: colors.cancelledBg, dot: colors.cancelledDot },
};

export default function AppointmentCard({ doctor, type, hospital, date, time, token, status, avatar }: Props) {
  const s = statusColors[status];
  return (
    <View style={styles.card}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <ArrowRight width={SIZE(18)} height={SIZE(18)} />
      </View>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          {avatar ? <Image source={{uri: avatar}} style={styles.avatarImg} /> : null}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.doctorName}>{hospital}</Text>
          <Text style={styles.doctorType}>{type}</Text>
        </View>
      </View>
      <View style={styles.dashedDivider} />
      <View style={styles.doctorRow}>
        <View style={styles.doctorAvatar}>
          {avatar ? <Image source={{uri: avatar}} style={styles.avatarImg} /> : null}
        </View>
        <Text style={styles.doctorName}>{doctor}</Text>
        <Text style={styles.doctorSep}>|</Text>
        <Text style={styles.doctorType}>{type}</Text>
      </View>
      {status === 'Live' && (
        <View style={styles.tokenCard}>
          <Video
            source={require('../assets/images/background-video.mp4')}
            style={{
              width: SIZE(580),
              height: SIZE(100),
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
          <Text style={[styles.tokenLabel, styles.tokenLabelLive]}>Your token number</Text>
          <View style={styles.tokenQueue}>
            <Text style={styles.tokenNextPrev}>{token - 3}</Text>
            <Text style={styles.tokenCurrent}>{token - 2}</Text>
            <Text style={styles.tokenNextPrev}>{token - 1}</Text>
            <Text style={styles.ourTokenNumber}>{token}</Text>
          </View>
        </View>
      )}
      {status === 'Upcoming' && (
        <View style={[styles.tokenCard, { backgroundColor: colors.tokenBg }]}>
          <Text style={styles.tokenLabel}>Your token number</Text>
          <Text style={styles.tokenNumber}>{token}</Text>
        </View>
      )}
      <View style={styles.appointmentTime}>
        <Text style={styles.appointmentOn}>Appointment on </Text>
        <Text style={styles.appointmentDate}>{date}, {time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(10),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(5),
    backgroundColor: colors.successLight,
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(3),
    borderRadius: SIZE(20),
  },
  liveDot: {
    width: SIZE(6),
    height: SIZE(6),
    borderRadius: SIZE(3),
    backgroundColor: colors.successDot,
  },
  liveText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(11),
    color: colors.successText,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
  },
  avatar: {
    width: SIZE(36),
    height: SIZE(36),
    borderRadius: SIZE(18),
    backgroundColor: colors.backgroundLight,
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  cardInfo: { flex: 1 },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  doctorType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
    marginTop: SIZE(4),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(5),
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(3),
    borderRadius: SIZE(20),
    borderWidth: 1,
    borderColor: colors.statusBorder,
  },
  statusDot: {
    width: SIZE(6),
    height: SIZE(6),
    borderRadius: SIZE(3),
  },
  statusText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(11),
    color: colors.statusText,
  },
  divider: { height: 1, backgroundColor: colors.cardBorder },
  dashedDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
    marginHorizontal: SIZE(14),
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(10),
  },
  doctorAvatar: {
    width: SIZE(24),
    height: SIZE(24),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
  },
  doctorSep: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textMuted,
  },
  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(10),
    marginHorizontal: SIZE(14),
    marginTop: SIZE(18),
    marginBottom: SIZE(12),
    borderRadius: SIZE(10),
    overflow: 'hidden',
  },
  tokenLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.tokenLabel,
  },
  tokenLabelLive: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(11),
    color: colors.border,
  },
  tokenNumber: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(18),
    color: colors.primaryAccent,
  },
  tokenQueue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
  },
  tokenNextPrev: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(10),
    color: colors.tokenNextPrevColor,
  },
  tokenCurrent: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.tokenWhite,
  },
  ourTokenNumber: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(23),
    color: colors.tokenWhite,
    marginLeft: SIZE(11),
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZE(14),
    paddingBottom: SIZE(14),
    marginTop: SIZE(4),
  },
  appointmentOn: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginRight: SIZE(4),
  },
  appointmentDate: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.appointmentDate,
  },
  cardBottom: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGrey,
    paddingVertical: SIZE(12),
  },
  metaItem: { flex: 1, alignItems: 'center', gap: SIZE(4) },
  metaDivider: { width: 1, backgroundColor: colors.cardBorder },
  metaLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textMuted,
  },
  metaValue: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
});
