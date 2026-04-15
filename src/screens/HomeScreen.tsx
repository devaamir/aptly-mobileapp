import React, { useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Text, FlatList, Animated, StatusBar, Platform, RefreshControl } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useLocation } from '../context/LocationContext';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import ClinicCard from '../components/ClinicCard';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import NotificationIcon from '../assets/icons/notification-icon-grey.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import PhoneIcon from '../assets/icons/phone-icon.svg';
import PhoneIconBlue from '../assets/icons/phone-icon-blue.svg';
import MapIcon from '../assets/icons/map-icon.svg';
import MapIconBlue from '../assets/icons/map-icon-blue.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import { getHomeData, Specialty, Doctor, Clinic, Appointment } from '../services/api';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const ListHeader = ({ onTokenPress, onspecialstPress, onDoctorsPress, onClinicsPress, specialties, doctors, totalDoctorCount, spotlightAppt, activeAppointments }: { onTokenPress: (appt: Appointment) => void; onspecialstPress: () => void; onDoctorsPress: () => void; onClinicsPress: () => void; specialties: Specialty[]; doctors: Doctor[]; totalDoctorCount: number; spotlightAppt: Appointment | null; activeAppointments: Appointment[] }) => {
  const today = new Date().toISOString().split('T')[0];
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const to12h = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`; };

  const renderBannerCard = (appt: Appointment) => {
    const apptIsLive = appt.appointmentDate === today && (() => {
      const [sh, sm] = (appt.schedule?.startTime ?? '').split(':').map(Number);
      const [eh, em] = (appt.schedule?.stopTime ?? '').split(':').map(Number);
      return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
    })();
    const apptToken = appt.tokenNumber ?? 0;
    const apptConsultMins = appt.doctor?.estimateConsultationTime ?? 15;
    const apptEstTime = apptIsLive
      ? (() => { const est = new Date(Date.now() + Math.max(0, apptToken - 1) * apptConsultMins * 60000); const h = est.getHours(), m = est.getMinutes(); return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`; })()
      : appt.schedule ? to12h(appt.schedule.startTime) : null;

    return (
      <View
        key={appt.id}
        style={[styles.bannerCard, !apptIsLive && { backgroundColor: colors.upcomingCardBg }, activeAppointments.length > 1 && styles.bannerCardMulti]}>
        {apptIsLive && Platform.OS === 'android' && (
          <Video
            source={require('../assets/images/background-video.mp4')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat
            muted
            disableFocus
          />
        )}
        <TouchableOpacity activeOpacity={0.7} onPress={() => onTokenPress(appt)}>
          <View style={[styles.livebadge, !apptIsLive && { backgroundColor: colors.badgeBg }]}>
            <View style={[styles.greenDot, !apptIsLive && { backgroundColor: colors.primaryAccent }]} />
            <Text allowFontScaling={false} style={[styles.liveText, !apptIsLive && { color: colors.textPrimary }]}>{apptIsLive ? 'Live' : 'Upcoming'}</Text>
          </View>
          <View style={styles.tokenCenter}>
            <Text allowFontScaling={false} style={[styles.tokenLabel, !apptIsLive && { color: colors.textPrimary, marginTop: SIZE(20) }]}>Your Token</Text>
            <Text allowFontScaling={false} style={[styles.tokenNumber, !apptIsLive && { color: colors.black }]}>{apptToken || '--'}</Text>
            {apptEstTime && <Text allowFontScaling={false} style={[styles.tokenEst, !apptIsLive && { color: colors.textSecondary }]}>{apptIsLive ? `Estimated ${apptEstTime}` : 'Scheduled for'}</Text>}
            {!apptIsLive && appt.appointmentDate && (
              <Text allowFontScaling={false} style={styles.scheduledDate}>
                {new Date(appt.appointmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                {appt.schedule ? `, ${to12h(appt.schedule.startTime)} - ${to12h(appt.schedule.stopTime)}` : ''}
              </Text>
            )}
            {apptIsLive && (
              <View style={styles.tokenRow}>
                <View style={styles.tokenSide}><Text allowFontScaling={false} style={styles.tokenSideNum}>1</Text></View>
                <View style={styles.tokenCurrent}><Text allowFontScaling={false} style={styles.tokenCurrentNum}>2</Text></View>
                <View style={styles.tokenSide}><Text allowFontScaling={false} style={styles.tokenSideNum}>3</Text></View>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={[styles.hospitalStrip, !apptIsLive && { backgroundColor: colors.white }]}>
          <View style={styles.hospitalTop}>
            <View style={styles.hospitalLeft}>
              <Image source={{ uri: appt.medicalCenter?.profilePicture }} style={styles.hospitalAvatar} />
              <View>
                <Text allowFontScaling={false} style={[styles.hospitalName, !apptIsLive && { color: colors.textPrimary }]}>{appt.medicalCenter?.name ?? 'No appointment'}</Text>
                <Text allowFontScaling={false} style={[styles.hospitalType, !apptIsLive && { color: colors.textSecondary }]}>{appt.medicalCenter?.type ?? ''}</Text>
              </View>
            </View>
            <View style={styles.hospitalActions}>
              <TouchableOpacity style={[styles.actionBtn, !apptIsLive && { backgroundColor: colors.backgroundSubtle }]} activeOpacity={0.7}>
                {apptIsLive ? <PhoneIcon width={SIZE(22)} height={SIZE(22)} /> : <PhoneIconBlue width={SIZE(22)} height={SIZE(22)} />}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, !apptIsLive && { backgroundColor: colors.backgroundSubtle }]} activeOpacity={0.7}>
                {apptIsLive ? <MapIcon width={SIZE(22)} height={SIZE(22)} /> : <MapIconBlue width={SIZE(22)} height={SIZE(22)} />}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.hospitalBottom}>
            <Text allowFontScaling={false} style={[styles.doctorName, !apptIsLive && { color: colors.textPrimary }]}>{appt.doctor?.name ?? ''}</Text>
            {appt.doctor?.specialties?.[0]?.name && <>
              <Text allowFontScaling={false} style={[styles.hospitalSep, !apptIsLive && { color: colors.textSecondary }]}> | </Text>
              <Text allowFontScaling={false} style={[styles.doctorSpecialty, !apptIsLive && { color: colors.textSecondary }]}>{appt.doctor.specialties[0].name}</Text>
            </>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      {activeAppointments.length > 1
        ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerScroll}>
          {activeAppointments.map(renderBannerCard)}
        </ScrollView>
        : spotlightAppt && renderBannerCard(spotlightAppt)
      }
      <View style={styles.cardsRow}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onspecialstPress}>
          <Text allowFontScaling={false} style={styles.cardTitle}>All specialst</Text>
          <View style={styles.iconsRow}>
            {specialties.slice(0, 3).map(s => (
              <View key={s.id} style={styles.iconBox}>
                <Image source={{ uri: s.icon }} style={styles.iconImg} />
              </View>
            ))}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onDoctorsPress}>
          <Text allowFontScaling={false} style={styles.cardTitle}>All doctors</Text>
          <View style={styles.avatarRow}>
            {doctors.slice(0, 3).map((d, i) => (
              <View key={d.id} style={[styles.avatarCircle, { marginLeft: i === 0 ? 0 : -SIZE(12) }]}>
                {d.profilePicture ? (
                  <Image source={{ uri: d.profilePicture }} style={styles.avatarImg} />
                ) : null}
              </View>
            ))}
            {totalDoctorCount > 3 && (
              <Text allowFontScaling={false} style={styles.avatarCount}>{totalDoctorCount - 3}+</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionHeader}>
        <Text allowFontScaling={false} style={styles.sectionTitle}>Near by Clinics</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onClinicsPress}>
          <Text allowFontScaling={false} style={styles.viewAll}>See all</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

function SkeletonScreen() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  const S = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity, backgroundColor: colors.backgroundMuted, borderRadius: SIZE(10) }]} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.mainContainer}>
        <S style={styles.height60Loader} />
        <S style={styles.height60Loader} />
        <S style={styles.height200Loader} />
        <View style={styles.rowView}>
          <S style={styles.width50Loader} />
          <S style={styles.width50Loader} />
        </View>
        <S style={styles.height200Loader} />
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { location } = useLocation();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [totalDoctorCount, setTotalDoctorCount] = useState(0);
  const [spotlightAppt, setSpotlightAppt] = useState<Appointment | null>(null);
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) { setRefreshing(true); setLoading(true); }
    if (location) {
      getHomeData(location.latitude, location.longitude).then(handleHomeData).catch(() => { }).finally(() => { setLoading(false); setRefreshing(false); });
    } else {
      Geolocation.getCurrentPosition(
        ({ coords }) => getHomeData(coords.latitude, coords.longitude).then(handleHomeData).catch(() => { }).finally(() => { setLoading(false); setRefreshing(false); }),
        () => getHomeData().then(handleHomeData).catch(() => { }).finally(() => { setLoading(false); setRefreshing(false); }),
        { timeout: 5000, maximumAge: 60000 },
      );
    }
  };

  const handleHomeData = (res: { success: boolean; data: any }) => {
    console.log(res.data);

      setSpecialties(res.data.specialties);
      setDoctors(res.data.doctors as Doctor[]);
      setClinics(res.data.topClinics);
      setTotalDoctorCount(res.data.totalDoctorCount);
      const today = new Date().toISOString().split('T')[0];
      const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
      const active = (res.data.appointments ?? []).filter(a => a.tokenStatus === 'pending');
      const live = active.find(a => {
        if (a.appointmentDate !== today) return false;
        const [sh, sm] = (a.schedule?.startTime ?? '').split(':').map(Number);
        const [eh, em] = (a.schedule?.stopTime ?? '').split(':').map(Number);
        return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
      });
      const sorted = active.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
      setActiveAppointments(live ? [live, ...sorted.filter(a => a.id !== live.id)] : sorted);
      setSpotlightAppt(live ?? sorted[0] ?? null);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => navigation.addListener('focus', () => fetchData()), [navigation]);
  useEffect(() => { if (location) fetchData(); }, [location]);

  if (loading) {
    return <SkeletonScreen />;
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationBtn} activeOpacity={0.7} onPress={() => navigation.navigate('LocationSearch')}>
            <LocationIcon width={SIZE(19)} height={SIZE(19)} style={styles.locationIcon} />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SIZE(4) }}>
                <Text allowFontScaling={false} style={styles.locationText} numberOfLines={1}>
                  {location ? location.mainText : 'Select your location'}
                </Text>
                <DownArrowGrey width={SIZE(16)} height={SIZE(16)} />
              </View>
              {location?.secondaryText ? (
                <Text allowFontScaling={false} style={styles.locationSub} numberOfLines={1}>{location.secondaryText}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Notifications')}>
            <NotificationIcon width={SIZE(22)} height={SIZE(22)} />
          </TouchableOpacity>
        </View>

        {/* Search - stays fixed */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Search')}>
            <SearchBar placeholder='Search for "Skin Doctor"' editable={false} />
          </TouchableOpacity>
        </View>

        {/* Everything below scrolls */}
        <FlatList
          data={clinics}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[colors.primary]} tintColor={colors.primary} />}
          ListHeaderComponent={<ListHeader onTokenPress={(appt) => navigation.navigate('TokenDetail', { appointment: appt })} onspecialstPress={() => navigation.navigate('specialst')} onDoctorsPress={() => navigation.navigate('Doctors')} onClinicsPress={() => navigation.navigate('Clinics')} specialties={specialties} doctors={doctors} totalDoctorCount={totalDoctorCount} spotlightAppt={spotlightAppt} activeAppointments={activeAppointments} />}
          renderItem={({ item }) => (
            <ClinicCard
              name={item.name}
              subType={item.specialties[0]?.name ?? item.type}
              location={`${item.district}, ${item.state}`}
              image={item.profilePicture}
              onPress={() => navigation.navigate('HospitalDetail', { id: item.id, name: item.name, specialty: item.specialties[0]?.name ?? '', location: item.address })}
            />
          )}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(24),
    paddingVertical: SIZE(8),
    marginBottom: SIZE(10),
  },
  logo: {
    width: 94,
    height: SIZE(32),
    resizeMode: 'contain'
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZE(4),
  },
  locationIcon: {
    marginTop: SIZE(8),
  },
  locationText: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(18),
    color: colors.dark,
  },
  locationSub: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(1),
  },
  notifBtn: {
    width: SIZE(22) + 12,
    height: SIZE(22) + 12,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: SIZE(18),
    marginBottom: SIZE(20)
  },
  bannerCard: {
    marginHorizontal: SIZE(18),
    marginBottom: SIZE(20),
    height: 323,
    borderRadius: SIZE(18),
    backgroundColor: colors.primary,
    padding: SIZE(10),
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  bannerCardMulti: {
    marginHorizontal: SIZE(8),
    width: SIZE(361),
  },
  bannerScroll: {
    paddingHorizontal: SIZE(10),
    paddingBottom: SIZE(20),
  },
  livebadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white20,
    borderRadius: SIZE(20),
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(4),
    gap: SIZE(6),
  },
  greenDot: {
    width: SIZE(8),
    height: SIZE(8),
    borderRadius: SIZE(4),
    backgroundColor: colors.onlineIndicator,
  },
  liveText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.white,
  },
  tokenCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(6),
    paddingVertical: SIZE(8),
  },
  tokenLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.borderMuted,
  },
  tokenNumber: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(72),
    color: colors.white,
    lineHeight: SIZE(68),
  },
  tokenEst: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.white,
  },
  scheduledDate: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.scheduledText,
    backgroundColor: colors.white,
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(4),
    borderRadius: SIZE(6),
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
  },
  tokenSide: {
    alignItems: 'center',
    opacity: 0.6,
  },
  tokenSideNum: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.white,
  },
  tokenCurrent: {
    alignItems: 'center',
    paddingHorizontal: SIZE(4),
  },
  tokenCurrentNum: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(31),
    color: colors.white,
  },
  hospitalStrip: {
    backgroundColor: colors.white15,
    borderRadius: SIZE(12),
    padding: SIZE(12),
    marginTop: SIZE(8),
  },
  hospitalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZE(15),
  },
  hospitalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
  },
  hospitalAvatar: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(20),
    backgroundColor: colors.white30,
  },
  hospitalName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(13),
    color: colors.white,
  },
  hospitalType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.white70,
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: SIZE(8),
  },
  actionBtn: {
    width: SIZE(32),
    height: SIZE(32),
    borderRadius: SIZE(8),
    backgroundColor: colors.white20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalDivider: {
    height: 1,
    backgroundColor: colors.white20,
  },
  hospitalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.white,
  },
  hospitalSep: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white50,
  },
  doctorSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white80,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZE(18),
    gap: SIZE(12),
    marginBottom: SIZE(20),
  },
  card: {
    flex: 1,
    borderRadius: SIZE(22),
    padding: SIZE(18),
    backgroundColor: colors.surfaceLight,
  },
  cardTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
    marginBottom: SIZE(18),
  },
  iconsRow: {
    flexDirection: 'row',
    gap: SIZE(8)
  },
  iconBox: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(10),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImg: {
    width: SIZE(28),
    height: SIZE(28),
    resizeMode: 'contain',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarCircle: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(20),
    backgroundColor: colors.backgroundLight,
    borderWidth: 2,
    borderColor: colors.white,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: SIZE(20),
  },
  avatarCount: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textSecondary,
    marginLeft: SIZE(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    // marginBottom: SIZE(12),
    backgroundColor: colors.surfaceLightFaded,
  },
  sectionTitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  viewAll: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.primary,
  },
  listContent: {
    paddingBottom: SIZE(24),
    gap: SIZE(12),
  },
  clinicCard: {
    flexDirection: 'row',
    marginHorizontal: SIZE(18),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    padding: SIZE(4),
    gap: SIZE(12),
    alignItems: 'center',

  },
  clinicImage: {
    width: 92,
    height: 92,
    borderRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
  },
  clinicInfo: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: SIZE(7)
  },
  clinicName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  clinicSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
    marginTop: SIZE(2)
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: SIZE(12),
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: SIZE(12),
    paddingHorizontal: SIZE(18),
    gap: SIZE(12),
  },
  height60Loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SIZE(60),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
  },
  height200Loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SIZE(300),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
    marginVertical: SIZE(12),
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZE(12),
  },
  width50Loader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    height: SIZE(100),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
  },
});
