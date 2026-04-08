import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { getClinic } from '../services/api';
import type { Clinic } from '../services/api';

const BANNER_HEIGHT = SIZE(254);
const SHEET_OVERLAP = SIZE(24);

type Route = RouteProp<RootStackParamList, 'HospitalDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HospitalDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { id, name, specialty, location } = params;
  const [tab, setTab] = useState<'Doctors' | 'Details'>('Doctors');
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const { top } = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getClinic(id)
      .then(res => setClinic(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const displayClinic = clinic ?? { name, about: '', phoneNumber: '', websiteUrl: '', doctors: [], specialties: [] };

  const backBtnBottom = top + SIZE(8) + SIZE(36) + SIZE(8);
  const collapsedBannerHeight = backBtnBottom;

  const marginTop = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [top + BANNER_HEIGHT - SHEET_OVERLAP, top + BANNER_HEIGHT - SHEET_OVERLAP - 160],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fixed banner — always behind everything */}
      <Image
        source={{ uri: 'https://eternisclinic.com/wp-content/uploads/2025/08/clinic.jpg' }}
        style={[styles.banner, { height: BANNER_HEIGHT + top }]}
      />

      {/* Sticky back button */}
      <View style={[styles.backBtnContainer, { top: top + SIZE(8) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={SIZE(10)}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
      </View>

      {/* ScrollView fills remaining space; sheet scrolls up but stops at collapsedBannerHeight */}
      <Animated.ScrollView
        style={[styles.scrollView, { marginTop }]}
        contentContainerStyle={[styles.sheetContent, { minHeight: Dimensions.get('window').height - collapsedBannerHeight }]}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ top: 0 }}
        contentInset={{ bottom: 0 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.sheetHandle} />
        <Text allowFontScaling={false} style={styles.clinicTitle}>{displayClinic.name}</Text>
        <Text allowFontScaling={false} style={styles.clinicSpecialty}>{specialty}</Text>
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

        {loading && <ActivityIndicator color={colors.accent} />}

        {!loading && tab === 'Doctors' && displayClinic.doctors.map(doc => (
          <View key={doc.id} style={styles.doctorCardWrapper}>
            <DoctorCard
              name={doc.name}
              type={doc.specialties[0]?.name ?? ''}
              hospital={displayClinic.name}
              clinicType={specialty}
              experience={doc.yearsOfExperience ? `${doc.yearsOfExperience} years` : ''}
              image={doc.profilePicture}
              status="Booking Opened"
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: doc.id })}
              onBookPress={() => navigation.navigate('BookAppointment', {
                name: doc.name, type: doc.specialties[0]?.name ?? '', hospital: displayClinic.name,
              })}
            />
          </View>
        ))}
        {!loading && tab === 'Doctors' && displayClinic.doctors.map(doc => (
          <View key={doc.id} style={styles.doctorCardWrapper}>
            <DoctorCard
              name={doc.name}
              type={doc.specialties[0]?.name ?? ''}
              hospital={displayClinic.name}
              clinicType={specialty}
              experience={doc.yearsOfExperience ? `${doc.yearsOfExperience} years` : ''}
              image={doc.profilePicture}
              status="Booking Opened"
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: doc.id })}
              onBookPress={() => navigation.navigate('BookAppointment', {
                name: doc.name, type: doc.specialties[0]?.name ?? '', hospital: displayClinic.name,
              })}
            />
          </View>
        ))}

        {!loading && tab === 'Details' && (
          <Text allowFontScaling={false} style={styles.detailsText}>
            {displayClinic.about || 'No details available.'}
          </Text>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    resizeMode: 'cover',
  },
  backBtnContainer: {
    position: 'absolute',
    left: SIZE(16),
    zIndex: 10,
  },
  backBtn: {
    width: SIZE(36),
    height: SIZE(36),
    borderRadius: SIZE(18),
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: SIZE(24),
    borderTopRightRadius: SIZE(24),
  },
  sheetContent: {
    padding: SIZE(18),
    gap: SIZE(16),
    paddingBottom: SIZE(40),
  },
  sheetHandle: {
    width: SIZE(40),
    height: SIZE(4),
    borderRadius: SIZE(2),
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: SIZE(4),
  },
  clinicTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(20),
    color: '#000000',
  },
  clinicSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.subText,
    marginTop: -SIZE(10),
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SIZE(4) },
  clinicLocation: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.subText,
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
});
