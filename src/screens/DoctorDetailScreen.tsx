import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorDetail'>;

export default function DoctorDetailScreen({ navigation, route }: Props) {
  const { name, type, hospital, clinicType, experience, location, rating, status } = route.params;
  const [expanded, setExpanded] = useState(false);

  const fullText = `${name} is a dedicated ${type} with years of clinical experience at ${hospital}. Known for a patient-first approach, they specialize in accurate diagnosis and personalized treatment plans. Committed to staying updated with the latest medical advancements to deliver the best care possible.`;
  const shortText = fullText.slice(0, 160) + '...';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text style={styles.title}>Doctor Details</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.doctorName}>{name}</Text>
            <Text style={styles.qualification}>MBBS, MD</Text>
            <Text style={styles.doctorType}>{type}</Text>
          </View>
        </View>

        {/* Info rows */}
        <Text style={styles.sectionTitle}>Working Hospital</Text>
        <TouchableOpacity style={styles.hospitalCard} activeOpacity={0.8}>
          <View style={styles.hospitalImage} />
          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName}>{hospital}</Text>
            <Text style={styles.hospitalType}>{clinicType}</Text>
          </View>
          <ArrowRight width={SIZE(18)} height={SIZE(18)} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          {expanded ? fullText : shortText}{' '}
          <Text style={styles.readMore} onPress={() => setExpanded(!expanded)}>
            {expanded ? 'read less' : 'read more'}
          </Text>
        </Text>

        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.experienceText}>{experience}</Text>

        <Text style={styles.sectionTitle}>Working Time</Text>
        <View style={styles.scheduleCard}>
          {SCHEDULE.map(({ day, shifts, isLeave }) => (
            <View key={day} style={styles.scheduleRow}>
              <Text style={[styles.dayText, isLeave && styles.leaveDay]}>{day}</Text>
              <View style={styles.shiftsCol}>
                {isLeave
                  ? <Text style={styles.leaveText}>Leave</Text>
                  : shifts.map((s, i) => <Text key={i} style={styles.shiftText}>{s}</Text>)
                }
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={() => navigation.navigate('BookAppointment', { name, type, hospital })}>
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const SCHEDULE = [
  { day: 'Monday', shifts: ['8:00am - 11:30am', '3:00pm - 6:30pm'], isLeave: false },
  { day: 'Tuesday', shifts: ['8:00am - 11:30am', '3:00pm - 6:30pm'], isLeave: false },
  { day: 'Wednesday', shifts: ['3:00pm - 6:30pm'], isLeave: false },
  { day: 'Thursday', shifts: ['8:00am - 11:30am', '3:00pm - 6:30pm'], isLeave: false },
  { day: 'Friday', shifts: ['8:00am - 11:30am'], isLeave: false },
  { day: 'Saturday', shifts: [], isLeave: true },
  { day: 'Sunday', shifts: [], isLeave: true },
];

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
  },
  backBtn: { width: SIZE(32) },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
  },
  content: { padding: SIZE(18), gap: SIZE(16) },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    paddingTop: SIZE(16),
    borderRadius: SIZE(12),
    backgroundColor: colors.white,
  },
  avatar: {
    width: SIZE(106),
    height: SIZE(106),
    borderRadius: SIZE(53),
    backgroundColor: colors.backgroundLight,
  },
  profileInfo: { flex: 1 },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  doctorType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  qualification: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textMuted,
    marginTop: SIZE(2),
  },
  sectionTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(8),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  hospitalImage: {
    width: SIZE(46),
    height: SIZE(46),
    borderRadius: SIZE(8),
    backgroundColor: colors.backgroundLight,
  },
  hospitalInfo: { flex: 1 },
  hospitalName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  hospitalType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  aboutText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    lineHeight: SIZE(20),
  },
  readMore: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.primary,
  },
  experienceText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textSubdued,
  },
  scheduleCard: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  dayText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.textPrimary,
    width: SIZE(90),
  },
  leaveDay: { color: colors.textMuted },
  shiftsCol: { flex: 1, gap: SIZE(4), alignItems: 'flex-end' },
  shiftText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
  },
  leaveText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.danger,
  },
  ratingBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(4),
    borderRadius: SIZE(8),
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.primary,
  },
  infoCard: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  infoLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
  },
  infoValue: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
  stickyFooter: {
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    alignItems: 'center',
  },
  bookBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.white,
  },
});
