import React, { useEffect, useRef, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, FlatList, Animated, StatusBar, Platform, RefreshControl } from 'react-native';
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
import { getHomeData, getAppointments, Specialty, Doctor, Clinic, Appointment } from '../services/api';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const ListHeader = ({ onTokenPress, onspecialstPress, onDoctorsPress, onClinicsPress, specialties, doctors, totalDoctorCount, spotlightAppt }: { onTokenPress: () => void; onspecialstPress: () => void; onDoctorsPress: () => void; onClinicsPress: () => void; specialties: Specialty[]; doctors: Doctor[]; totalDoctorCount: number; spotlightAppt: Appointment | null }) => {
  const today = new Date().toISOString().split('T')[0];
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const isLive = spotlightAppt
    ? spotlightAppt.appointmentDate === today && (() => {
      const [sh, sm] = (spotlightAppt.schedule?.startTime ?? '').split(':').map(Number);
      const [eh, em] = (spotlightAppt.schedule?.stopTime ?? '').split(':').map(Number);
      return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
    })()
    : false;
  const token = spotlightAppt?.tokenNumber ?? 0;
  const to12h = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`; };
  const consultMins = spotlightAppt?.doctor?.estimateConsultationTime ?? 15;
  const estTime = spotlightAppt && isLive
    ? (() => { const est = new Date(Date.now() + Math.max(0, token - 1) * consultMins * 60000); const h = est.getHours(), m = est.getMinutes(); return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`; })()
    : spotlightAppt?.schedule ? to12h(spotlightAppt.schedule.startTime) : null;

  return (
    <>
      {spotlightAppt && <View style={[styles.bannerCard, !isLive && { backgroundColor: colors.upcomingCardBg }]}>
        {isLive && Platform.OS === 'android' && (
          <Video
            source={require('../assets/images/background-video.mp4')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat
            muted
            disableFocus
          />
        )}
        <TouchableOpacity activeOpacity={0.7} onPress={onTokenPress}>
          <View style={[styles.livebadge, !isLive && { backgroundColor: colors.badgeBg }]}>
            <View style={[styles.greenDot, !isLive && { backgroundColor: colors.primaryAccent }]} />
            <Text allowFontScaling={false} style={[styles.liveText, !isLive && { color: colors.textPrimary }]}>{isLive ? 'Live' : 'Upcoming'}</Text>
          </View>
          <View style={styles.tokenCenter}>
            <Text allowFontScaling={false} style={[styles.tokenLabel, !isLive && { color: colors.textPrimary, marginTop: SIZE(20) }]}>Your Token</Text>
            <Text allowFontScaling={false} style={[styles.tokenNumber, !isLive && { color: colors.black }]}>{token || '--'}</Text>
            {estTime && <Text allowFontScaling={false} style={[styles.tokenEst, !isLive && { color: colors.textSecondary }]}>{isLive ? `Estimated ${estTime}` : 'Scheduled for'}</Text>}
            {!isLive && spotlightAppt?.appointmentDate && (
              <Text allowFontScaling={false} style={styles.scheduledDate}>
                {new Date(spotlightAppt.appointmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                {spotlightAppt.schedule ? `, ${to12h(spotlightAppt.schedule.startTime)} - ${to12h(spotlightAppt.schedule.stopTime)}` : ''}
              </Text>
            )}
            {isLive && (
              <View style={styles.tokenRow}>
                <View style={styles.tokenSide}><Text allowFontScaling={false} style={styles.tokenSideNum}>1</Text></View>
                <View style={styles.tokenCurrent}><Text allowFontScaling={false} style={styles.tokenCurrentNum}>2</Text></View>
                <View style={styles.tokenSide}><Text allowFontScaling={false} style={styles.tokenSideNum}>3</Text></View>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={[styles.hospitalStrip, !isLive && { backgroundColor: colors.white }]}>
          <View style={styles.hospitalTop}>
            <View style={styles.hospitalLeft}>
              <View style={styles.hospitalAvatar} />
              <View>
                <Text allowFontScaling={false} style={[styles.hospitalName, !isLive && { color: colors.textPrimary }]}>{spotlightAppt?.medicalCenter?.name ?? 'No appointment'}</Text>
                <Text allowFontScaling={false} style={[styles.hospitalType, !isLive && { color: colors.textSecondary }]}>{spotlightAppt?.medicalCenter?.type ?? ''}</Text>
              </View>
            </View>
            <View style={styles.hospitalActions}>
              <TouchableOpacity style={[styles.actionBtn, !isLive && { backgroundColor: colors.backgroundSubtle }]} activeOpacity={0.7}>
                {isLive ? <PhoneIcon width={SIZE(22)} height={SIZE(22)} /> : <PhoneIconBlue width={SIZE(22)} height={SIZE(22)} />}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, !isLive && { backgroundColor: colors.backgroundSubtle }]} activeOpacity={0.7}>
                {isLive ? <MapIcon width={SIZE(22)} height={SIZE(22)} /> : <MapIconBlue width={SIZE(22)} height={SIZE(22)} />}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.hospitalBottom}>
            <Text allowFontScaling={false} style={[styles.doctorName, !isLive && { color: colors.textPrimary }]}>{spotlightAppt?.doctor?.name ?? ''}</Text>
            {spotlightAppt?.doctor?.specialties?.[0]?.name && <>
              <Text allowFontScaling={false} style={[styles.hospitalSep, !isLive && { color: colors.textSecondary }]}> | </Text>
              <Text allowFontScaling={false} style={[styles.doctorSpecialty, !isLive && { color: colors.textSecondary }]}>{spotlightAppt.doctor.specialties[0].name}</Text>
            </>}
          </View>
        </View>
      </View>}
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
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [totalDoctorCount, setTotalDoctorCount] = useState(0);
  const [spotlightAppt, setSpotlightAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeDataLoaded, setHomeDataLoaded] = useState(false);
  const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) { setRefreshing(true); setLoading(true); }
    let hDone = false, aDone = false;
    const checkDone = () => { if (hDone && aDone) { setLoading(false); setRefreshing(false); } };

    getHomeData().then(res => {
      setSpecialties(res.data.specialties);
      setDoctors(res.data.doctors as Doctor[]);
      setClinics(res.data.topClinics);
      setTotalDoctorCount(res.data.totalDoctorCount);
    }).catch(() => { }).finally(() => { hDone = true; checkDone(); });

    getAppointments().then(res => {
      const today = new Date().toISOString().split('T')[0];
      const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
      const active = res.data.filter(a => a.tokenStatus === 'pending');
      const live = active.find(a => {
        if (a.appointmentDate !== today) return false;
        const [sh, sm] = (a.schedule?.startTime ?? '').split(':').map(Number);
        const [eh, em] = (a.schedule?.stopTime ?? '').split(':').map(Number);
        return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
      });
      setSpotlightAppt(live ?? active.sort((a, b) =>
        new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      )[0] ?? null);
    }).catch(() => { }).finally(() => { aDone = true; checkDone(); });
  };

  useEffect(() => { fetchData(); }, []);

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
                <Text allowFontScaling={false} style={styles.locationText}>Bangalore</Text>
                <DownArrowGrey width={SIZE(16)} height={SIZE(16)} />
              </View>
              <Text allowFontScaling={false} style={styles.locationSub}>Malappuram, Kerala</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
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
          ListHeaderComponent={<ListHeader onTokenPress={() => spotlightAppt && navigation.navigate('TokenDetail', { appointment: spotlightAppt })} onspecialstPress={() => navigation.navigate('specialst')} onDoctorsPress={() => navigation.navigate('Doctors')} onClinicsPress={() => navigation.navigate('Clinics')} specialties={specialties} doctors={doctors} totalDoctorCount={totalDoctorCount} spotlightAppt={spotlightAppt} />}
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
