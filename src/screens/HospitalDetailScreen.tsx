import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import PhoneIcon from '../assets/icons/phone-icon-blue.svg';
import MapIcon from '../assets/icons/map-icon-blue.svg';
import WebIcon from '../assets/icons/web-icon-blue.svg';
import DoctorCard from '../components/DoctorCard';

type Route = RouteProp<RootStackParamList, 'HospitalDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HospitalDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { name, speciality, location } = params;
  const [tab, setTab] = useState<'Doctors' | 'Details'>('Doctors');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hospital banner with back button overlay */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://eternisclinic.com/wp-content/uploads/2025/08/clinic.jpg' }}
            style={styles.banner}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={SIZE(10)}>
            <BackArrow width={SIZE(22)} height={SIZE(22)} />
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={styles.sheet}>
          <Text allowFontScaling={false} style={styles.clinicTitle}>{name}</Text>
          <Text allowFontScaling={false} style={styles.clinicSpeciality}>{speciality}</Text>
          <View style={styles.locationRow}>
            <LocationIcon width={SIZE(12)} height={SIZE(12)} />
            <Text allowFontScaling={false} style={styles.clinicLocation}>{location}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <PhoneIcon width={SIZE(22)} height={SIZE(22)} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <MapIcon width={SIZE(22)} height={SIZE(22)} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <WebIcon width={SIZE(22)} height={SIZE(22)} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setTab('Doctors')} style={styles.tab} activeOpacity={0.8}>
              <Text allowFontScaling={false} style={[styles.tabText, tab === 'Doctors' && styles.tabTextActive]}>Doctors</Text>
              {tab === 'Doctors' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('Details')} style={styles.tab} activeOpacity={0.8}>
              <Text allowFontScaling={false} style={[styles.tabText, tab === 'Details' && styles.tabTextActive]}>Details</Text>
              {tab === 'Details' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          </View>

          {tab === 'Doctors' && [
            { name: 'Dr. Rodger Struck', type: 'Cardiologist' },
            { name: 'Dr. Sarah Collins', type: 'Neurologist' },
          ].map((doc, i) => (
            <View key={i} style={styles.doctorCardWrapper}>
              <DoctorCard
                name={doc.name}
                type={doc.type}
                hospital={name}
                clinicType={speciality}
                experience="5 years"
                status="Booking Opened"
                onPress={() => navigation.navigate('DoctorDetail', {
                  name: doc.name, type: doc.type, hospital: name,
                  clinicType: speciality, experience: '5 years',
                  location, rating: '4.8', status: 'Booking Opened',
                })}
                onBookPress={() => navigation.navigate('BookAppointment', {
                  name: doc.name, type: doc.type, hospital: name,
                })}
              />
            </View>
          ))}

          {tab === 'Details' && (
            <Text allowFontScaling={false} style={styles.detailsText}>Hospital details coming soon.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: SIZE(24) },
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: SIZE(254),
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    top: SIZE(48),
    left: SIZE(16),
    width: SIZE(36),
    height: SIZE(36),
    borderRadius: SIZE(18),
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: SIZE(24),
    borderTopRightRadius: SIZE(24),
    marginTop: -SIZE(24),
    padding: SIZE(18),
    gap: SIZE(16),
  },
  clinicTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(20),
    color: '#000000',
  },
  clinicSpeciality: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.subText,
    marginTop: -SIZE(10),
  },
  clinicLocation: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(10),
    color: colors.subText,
  },
  card: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: SIZE(14),
    gap: SIZE(14),
  },
  row: { flexDirection: 'row', gap: SIZE(12) },
  avatar: {
    width: SIZE(56),
    height: SIZE(56),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundSubtle,
  },
  info: { flex: 1, gap: SIZE(4) },
  hospitalName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  speciality: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SIZE(4) },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  actions: { flexDirection: 'row', gap: SIZE(8) },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(6),
    paddingVertical: SIZE(10),
    borderRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
  },
  actionText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.primaryAccent,
  },
  sectionLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    gap: SIZE(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: -SIZE(20),
    paddingHorizontal: SIZE(20),
  },
  tab: {},
  tabText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.subText,
  },
  tabTextActive: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  tabUnderline: {
    height: SIZE(4),
    backgroundColor: colors.accent,
    borderRadius: SIZE(2),
    marginTop: SIZE(6),
    marginBottom: -1,
  },
  doctorCardWrapper: {
    marginHorizontal: -SIZE(2),
  },
  detailsText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(12),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  doctorAvatar: {
    width: SIZE(44),
    height: SIZE(44),
    borderRadius: SIZE(22),
    backgroundColor: colors.backgroundSubtle,
  },
  doctorInfo: { flex: 1 },
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
});
