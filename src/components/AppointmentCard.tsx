import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
};

const statusColors: Record<Status, { bg: string; text: string }> = {
  Live:      { bg: colors.successLight, text: colors.successText },
  Upcoming:  { bg: colors.primaryLight, text: colors.primary },
  Completed: { bg: colors.successLight, text: colors.successText },
  Cancelled: { bg: '#FEF3F2', text: '#B42318' },
};

export default function AppointmentCard({ doctor, type, hospital, date, time, token, status }: Props) {
  const s = statusColors[status];
  return (
    <View style={styles.card}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: s.text }]} />
          <Text style={[styles.statusText, { color: s.text }]}>{status}</Text>
        </View>
        <ArrowRight width={SIZE(18)} height={SIZE(18)} />
      </View>
      <View style={styles.cardTop}>
        <View style={styles.avatar} />
        <View style={styles.cardInfo}>
          <Text style={styles.doctorName}>{hospital}</Text>
          <Text style={styles.doctorType}>{type}</Text>
        </View>
      </View>
      <View style={styles.dashedDivider} />
      <View style={styles.doctorRow}>
        <View style={styles.doctorAvatar} />
        <Text style={styles.doctorName}>{doctor}</Text>
        <Text style={styles.doctorSep}>|</Text>
        <Text style={styles.doctorType}>{type}</Text>
      </View>
      <View style={styles.tokenCard}>
        <Text style={styles.tokenLabel}>Your token number</Text>
        <Text style={styles.tokenNumber}>{token}</Text>
      </View>
      <Text style={styles.appointmentTime}>Appointment on {date}, {time}</Text>
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
    backgroundColor: '#ECFDF3',
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
  },
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
  },
  statusDot: {
    width: SIZE(6),
    height: SIZE(6),
    borderRadius: SIZE(3),
  },
  statusText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(11),
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
    backgroundColor: colors.tokenBg,
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(10),
    marginHorizontal: SIZE(14),
    marginTop: SIZE(18),
    marginBottom: SIZE(12),
    borderRadius: SIZE(8),
  },
  tokenLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.tokenLabel,
  },
  tokenNumber: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(18),
    color: colors.primaryAccent,
  },
  appointmentTime: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    paddingHorizontal: SIZE(14),
    paddingBottom: SIZE(14),
    marginTop: SIZE(4),
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
