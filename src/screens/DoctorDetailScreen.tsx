import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import { getDoctor, Doctor } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorDetail'>;

const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function DoctorDetailScreen({ navigation, route }: Props) {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getDoctor(doctorId).then(res => setDoctor(res.data));
  }, [doctorId]);

  if (!doctor) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  const hospital = doctor.medicalCenters[0];
  const specialty = doctor.specialties[0]?.name ?? '';
  const qualifications = doctor.qualifications.map(q => q.name).join(', ');
  const aboutFull = doctor.about ?? '';
  const aboutShort = aboutFull.slice(0, 160) + (aboutFull.length > 160 ? '...' : '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>Doctor Details</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {doctor.profilePicture ? <Image source={{ uri: doctor.profilePicture }} style={styles.avatarImg} /> : null}
          </View>
          <View style={styles.profileInfo}>
            <Text allowFontScaling={false} style={styles.doctorName}>{doctor.name}</Text>
            {qualifications ? <Text allowFontScaling={false} style={styles.qualification}>{qualifications}</Text> : null}
            <Text allowFontScaling={false} style={styles.doctorType}>{specialty}</Text>
          </View>
        </View>

        {hospital && (
          <>
            <Text allowFontScaling={false} style={styles.sectionTitle}>Working Hospital</Text>
            <TouchableOpacity style={styles.hospitalCard} activeOpacity={0.8} onPress={() => navigation.navigate('HospitalDetail', { name: hospital.name, specialty: hospital.type, location: hospital.address })}>
              <View style={styles.hospitalImage}>
                {hospital.profilePicture ? <Image source={{ uri: hospital.profilePicture }} style={styles.hospitalImg} /> : null}
              </View>
              <View style={styles.hospitalInfo}>
                <Text allowFontScaling={false} style={styles.hospitalName}>{hospital.name}</Text>
                <Text allowFontScaling={false} style={styles.hospitalType}>{hospital.type}</Text>
              </View>
              <ArrowRight width={SIZE(18)} height={SIZE(18)} />
            </TouchableOpacity>
          </>
        )}

        {aboutFull ? (
          <>
            <Text allowFontScaling={false} style={styles.sectionTitle}>About</Text>
            <Text allowFontScaling={false} style={styles.aboutText}>
              {expanded ? aboutFull : aboutShort}{' '}
              {aboutFull.length > 160 && (
                <Text allowFontScaling={false} style={styles.readMore} onPress={() => setExpanded(!expanded)}>
                  {expanded ? 'read less' : 'read more'}
                </Text>
              )}
            </Text>
          </>
        ) : null}

        <Text allowFontScaling={false} style={styles.sectionTitle}>Experience</Text>
        <Text allowFontScaling={false} style={styles.experienceText}>{doctor.yearsOfExperience} years</Text>

        <Text allowFontScaling={false} style={styles.sectionTitle}>Consultation Fee</Text>
        <Text allowFontScaling={false} style={styles.experienceText}>₹{doctor.consultationFee}</Text>

        {hospital?.schedules && hospital.schedules.length > 0 && (
          <>
            <Text allowFontScaling={false} style={styles.sectionTitle}>Sessions</Text>
            <View style={styles.scheduleCard}>
              {Object.entries(
                hospital.schedules.reduce<Record<string, typeof hospital.schedules>>((acc, s) => {
                  (acc[s.dayOfWeek] = acc[s.dayOfWeek] || []).push(s);
                  return acc;
                }, {})
              ).map(([day, sessions], i, arr) => (
                <View key={day} style={[styles.scheduleRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text allowFontScaling={false} style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                  <View style={styles.shiftsCol}>
                    {sessions.map(s => (
                      <Text allowFontScaling={false} key={s.id} style={styles.shiftText}>{to12h(s.startTime)} – {to12h(s.stopTime)}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={() => navigation.navigate('BookAppointment', { doctor })}>
          <Text allowFontScaling={false} style={styles.bookBtnText}>Book Appointment</Text>
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
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
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
    overflow: 'hidden',
  },
  hospitalImg: {
    width: '100%',
    height: '100%',
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
