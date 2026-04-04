import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  name: string;
  type: string;
  hospital: string;
  clinicType: string;
  experience: string;
  image?: string;
  status?: 'Booking Opened' | 'Not Started';
  bookingTime?: string;
  onPress?: () => void;
  onBookPress?: () => void;
};

const statusConfig = {
  'Booking Opened': {
    bg: colors.successLight,
    text: colors.successText,
    dot: colors.successDot,
  },
  'Not Started': {
    bg: colors.warningLight,
    text: colors.warningText,
    dot: colors.warningDot,
  },
};

const DoctorCard = ({ name, type, hospital, clinicType, experience, image, status = 'Booking Opened', bookingTime, onPress, onBookPress }: Props) => {
  const s = statusConfig[status];
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.topCard}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            {image ? <Image source={{uri: image}} style={styles.avatarImg} /> : null}
          </View>
          <View style={styles.cardTopInfo}>
            <Text style={styles.primaryText}>{name}</Text>
            <Text style={styles.secondaryText}>{type}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.hospitalText}>{hospital}</Text>
          <Text style={styles.clinicTypeText}>{clinicType}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardCenter}>
          <View>
            <Text style={styles.expYears}>{experience.replace(' exp', '')}</Text>
            <Text style={styles.expLabel}>Experience</Text>
          </View>
          <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={onBookPress}>
            <Text style={styles.bookBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.bookingTime}>{bookingTime ?? 'No sessions today'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusText, { color: s.text }]}>{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    borderRadius: SIZE(12),
    backgroundColor: colors.cardBorder,
  },
  topCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZE(12),
    padding: SIZE(14),
    backgroundColor: colors.white,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
  },
  avatar: {
    width: SIZE(56),
    height: SIZE(56),
    borderRadius: SIZE(28),
    backgroundColor: colors.backgroundLight,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  cardTopInfo: { flex: 1 },
  primaryText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  secondaryText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  hospitalText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.textSubdued,
  },
  clinicTypeText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  cardBottom: {
    marginTop: SIZE(12),
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
    marginTop: SIZE(12),
  },
  cardCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZE(12),
  },
  expYears: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.textSubdued,
  },
  expLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(8),
    borderRadius: SIZE(8),
  },
  bookBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.white,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBorder,
    paddingVertical: SIZE(8),
    paddingHorizontal: SIZE(14),
    borderBottomLeftRadius: SIZE(12),
    borderBottomRightRadius: SIZE(12),
  },
  bookingTime: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
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
});

export default DoctorCard;
