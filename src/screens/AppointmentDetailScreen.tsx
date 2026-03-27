import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
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

const PATIENTS = [
  { id: '1', name: 'Alen', phone: '+91 98765 43210', age: 28, gender: 'Male' },
  { id: '2', name: 'Sara', phone: '+91 91234 56789', age: 24, gender: 'Female' },
];

type Route = RouteProp<RootStackParamList, 'AppointmentDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { doctor, type, hospital, date, time, token, status } = params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={SIZE(10)}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Details</Text>
        <View style={{ width: SIZE(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Token card */}
        {(status === 'Live' || status === 'Upcoming') && (
          <View style={[styles.liveCard, status === 'Upcoming' && { backgroundColor: colors.upcomingTokenBg }]}>
            {status === 'Live' && (
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
              <View style={[styles.statusDot, { backgroundColor: status === 'Upcoming' ? colors.upcomingDot : colors.successDot }]} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
            <View style={styles.liveRight}>
              {status === 'Live' && (
                <View style={styles.tokenQueue}>
                  <Text style={styles.tokenNextPrev}>{token - 2}</Text>
                  <Text style={styles.tokenCurrent}>{token - 1}</Text>
                  <Text style={styles.tokenNextPrev}>{token}</Text>
                </View>
              )}
              <View style={styles.liveTokenContent}>
                <Text style={[styles.liveLabel, status === 'Upcoming' && { color: colors.textMuted }]}>Your token number</Text>
                <Text style={[styles.liveToken, status === 'Upcoming' && { color: colors.textPrimary }]}>{token}</Text>
                {status === 'Live' && <Text style={styles.liveEstimated}>Estimated 2:30pm</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Clinic & Doctor Information */}
        <Text style={styles.sectionLabel}>Clinic & Doctor Information</Text>
        <AppointmentInfoCard
          hospital={hospital}
          hospitalType={type}
          location="Kakkanad, Kochi - 682030, Kerala, India."
          doctor={doctor}
          doctorSpeciality={type}
          variant="light"
          onDoctorPress={() => navigation.navigate('DoctorDetail', {
            name: doctor,
            type,
            hospital,
            clinicType: type,
            experience: '5 years',
            location: 'Kakkanad, Kochi',
            rating: '4.8',
            status: 'Booking Opened',
          })}
        />

        {/* Patient Details */}
        <Text style={[styles.sectionLabel, { marginTop: SIZE(24) }]}>Patient Details</Text>
        <PatientSelector patients={[PATIENTS[0]]} showRadio={false} />

        {/* Meta */}
        <Text style={[styles.sectionLabel, { marginTop: SIZE(24) }]}>Appointment Info</Text>
        <View style={styles.section}>
          {[
            { label: 'Appointment ID', value: '#APT-00' + token },
            { label: 'Appointment Date', value: date },
            { label: 'Session Time', value: time },
            { label: 'Booking Method', value: 'Online' },
            { label: 'Booked Date', value: date },
          ].map((item, index, arr) => (
            <View key={item.label}>
              <View style={styles.infoRow}>
                <Text style={styles.metaLabel}>{item.label}</Text>
                <Text style={styles.metaValue}>{item.value}</Text>
              </View>
              {index < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

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
});
