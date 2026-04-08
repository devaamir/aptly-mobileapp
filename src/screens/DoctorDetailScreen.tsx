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
import BottomModal from '../components/BottomModal';
import LocationIcon from '../assets/icons/location-icon.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorDetail'>;

const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

function ClinicCard({ mc, navigation, doctor }: { mc: Doctor['medicalCenters'][0]; navigation: any; doctor: Doctor }) {
  const [showHours, setShowHours] = useState(false);
  const grouped = (mc.schedules ?? []).reduce<Record<string, typeof mc.schedules>>((acc, s) => {
    (acc[s!.dayOfWeek] = acc[s!.dayOfWeek] || []).push(s);
    return acc;
  }, {});

  return (
    <View style={styles.clinicCard}>
      <TouchableOpacity style={styles.clinicCardTop} activeOpacity={0.8} onPress={() => navigation.navigate('HospitalDetail', { id: mc.id, name: mc.name, specialty: mc.type, location: mc.address })}>
        <View style={styles.hospitalImage}>
          {mc.profilePicture ? <Image source={{ uri: mc.profilePicture }} style={styles.hospitalImg} /> : null}
        </View>
        <View style={styles.hospitalInfo}>
          <Text allowFontScaling={false} style={styles.hospitalName}>{mc.name}</Text>
          <Text allowFontScaling={false} style={styles.hospitalType}>{mc.type}</Text>
          <View style={styles.locationContainer}>
            <LocationIcon width={SIZE(12)} height={SIZE(12)} />
            {mc.district ? <Text allowFontScaling={false} style={styles.hospitalLocation}>{mc.district}, {mc.state} | 2.5 km</Text> : null}
          </View>
        </View>
        <ArrowRight width={SIZE(18)} height={SIZE(18)} />
      </TouchableOpacity>

      <View style={styles.clinicActions}>
        <TouchableOpacity style={styles.hoursBtn} activeOpacity={0.7} onPress={() => setShowHours(true)}>
          <Text allowFontScaling={false} style={styles.hoursBtnText}>Working Hours</Text>
          <Text allowFontScaling={false} style={[styles.hoursBtnText, { color: colors.gold }]}>View Hours</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookClinicBtn} activeOpacity={0.8} onPress={() => navigation.navigate('BookAppointment', { doctor })}>
          <Text allowFontScaling={false} style={styles.bookClinicBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      <BottomModal visible={showHours} onClose={() => setShowHours(false)}>
        <Text allowFontScaling={false} style={styles.modalTitle}>{mc.name}</Text>
        <View style={styles.scheduleCard}>
          {Object.entries(grouped).map(([day, sessions], i, arr) => (
            <View key={day} style={[styles.scheduleRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text allowFontScaling={false} style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              <View style={styles.shiftsCol}>
                {sessions!.map(s => (
                  <Text allowFontScaling={false} key={s!.id} style={styles.shiftText}>{to12h(s!.startTime)} – {to12h(s!.stopTime)}</Text>
                ))}
              </View>
            </View>
          ))}
          {Object.keys(grouped).length === 0 && (
            <Text allowFontScaling={false} style={styles.shiftText}>No schedule available</Text>
          )}
        </View>
      </BottomModal>
    </View>
  );
}

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
  // TODO: replace with real user coords
  const USER_LAT = 11.1085, USER_LON = 76.0883;
  const distance = doctor.latitude && doctor.longitude
    ? `${getDistance(USER_LAT, USER_LON, doctor.latitude, doctor.longitude)} km`
    : null;

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

        {/* <Text allowFontScaling={false} style={styles.sectionTitle}>Consultation Fee</Text>
        <Text allowFontScaling={false} style={styles.experienceText}>₹{doctor.consultationFee}</Text> */}

        {doctor.medicalCenters.length > 0 && (
          <>
            <Text allowFontScaling={false} style={styles.sectionTitle}>Working Clinics</Text>
            {doctor.medicalCenters.map(mc => (
              <ClinicCard key={mc.id} mc={mc} navigation={navigation} doctor={doctor} />
            ))}
          </>
        )}
      </ScrollView>
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
  distanceText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.primary,
    marginTop: SIZE(4),
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
  clinicCard: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    backgroundColor: colors.backgroundLight,
  },
  clinicCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(8),
  },
  clinicActions: {
    flexDirection: 'column',
    gap: SIZE(8),
    paddingHorizontal: SIZE(10),
    paddingBottom: SIZE(10),
  },
  hoursBtn: {
    flex: 1,
    paddingVertical: SIZE(9.5),
    paddingHorizontal: SIZE(13),
    borderRadius: SIZE(40),
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZE(8),
  },
  hoursBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.textSubdued,
  },
  bookClinicBtn: {
    flex: 1,
    paddingVertical: SIZE(13),
    borderRadius: SIZE(12),
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  bookClinicBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.white,
  },
  hospitalImage: {
    width: SIZE(65),
    height: SIZE(65),
    borderRadius: SIZE(12),
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
    marginTop: SIZE(5),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZE(2),
  },
  hospitalLocation: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textMuted,
    marginTop: SIZE(2),
    marginLeft: SIZE(4),
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
    width: '100%',
  },
  modalTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    marginBottom: SIZE(12),
    alignSelf: 'flex-start',
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
