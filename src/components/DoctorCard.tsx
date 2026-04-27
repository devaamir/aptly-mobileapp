import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ViewStyle, StyleProp } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import LocationIcon from '../assets/icons/location-icon.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import type { Schedule } from '../types/api.types';

type Props = {
  name: string;
  type: string;
  hospital: string;
  clinicType: string;
  experience: string;
  image?: string;
  location?: string;
  distance?: string;
  nextSchedule?: Schedule;
  onPress?: () => void;
  onBookPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getScheduleInfo(schedule?: Schedule): { label: string; status: 'live' | 'booking_open' } {
  if (!schedule) return { label: 'No session today', status: 'booking_open' };

  const today = DAYS[new Date().getDay()];
  const isToday = schedule.dayOfWeek.toLowerCase() === today;
  const start = formatTime(schedule.startTime);
  const end = formatTime(schedule.stopTime);

  let status: 'live' | 'booking_open' = 'booking_open';
  if (isToday) {
    const now = new Date();
    const [sh, sm] = schedule.startTime.split(':').map(Number);
    const [eh, em] = schedule.stopTime.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (nowMins >= sh * 60 + sm && nowMins < eh * 60 + em) status = 'live';
  }

  if (isToday) {
    return { label: `Session time: ${start} - ${end}`, status };
  }

  // Not today — show day + date
  const dayName = schedule.dayOfWeek.charAt(0).toUpperCase() + schedule.dayOfWeek.slice(1);
  // Find next occurrence date
  const todayIdx = new Date().getDay();
  const schedIdx = DAYS.indexOf(schedule.dayOfWeek.toLowerCase());
  const diff = (schedIdx - todayIdx + 7) % 7 || 7;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + diff);
  const dateStr = nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return { label: `${dayName}, ${dateStr} · ${start} - ${end}`, status };
}

const statusConfig = {
  live: { bg: colors.successLight, text: colors.successText, dot: colors.successDot, label: 'Live' },
  booking_open: { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB', label: 'Booking Open' },
};

const DoctorCard = ({ name, type, hospital, clinicType, experience, image, location, distance, nextSchedule, onPress, onBookPress, style }: Props) => {
  const { label, status } = getScheduleInfo(nextSchedule);
  const s = statusConfig[status];
  return (
    <TouchableOpacity style={[styles.card, style]} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.topCard}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            {image ? <Image source={{ uri: image }} style={styles.avatarImg} /> : null}
          </View>
          <View style={styles.cardTopInfo}>
            <Text allowFontScaling={false} style={styles.primaryText}>{name}</Text>
            <Text allowFontScaling={false} style={styles.secondaryText}>{type}</Text>
          </View>
          <ArrowRight width={SIZE(18)} height={SIZE(18)} />
        </View>
        <View style={styles.cardBottom}>
          <Text allowFontScaling={false} style={styles.hospitalText}>{hospital}</Text>
          <Text allowFontScaling={false} style={styles.clinicTypeText}>{clinicType}</Text>
          {location ? (
            <View style={styles.locationRow}>
              <LocationIcon width={SIZE(11)} height={SIZE(11)} />
              <Text allowFontScaling={false} style={styles.locationText} numberOfLines={1}>{location}{distance ? ` | ${distance}` : ''}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.divider} />
        <View style={styles.cardCenter}>
          <View>
            <Text allowFontScaling={false} style={styles.expYears}>{experience.replace(' exp', '')}</Text>
            <Text allowFontScaling={false} style={styles.expLabel}>Experience</Text>
          </View>
          <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={onBookPress}>
            <Text allowFontScaling={false} style={styles.bookBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text allowFontScaling={false} style={styles.bookingTime}>{label}</Text>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
          <Text allowFontScaling={false} style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(3),
    marginTop: SIZE(4),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSubdued,
    flex: 1,
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
    paddingHorizontal: SIZE(20),
    paddingVertical: SIZE(16),
    borderRadius: SIZE(12),
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
    color: colors.textPrimary,
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
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.successText,
  },
});

export default DoctorCard;
