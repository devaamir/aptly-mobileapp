import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  ScrollView,
  Linking,
  Alert,
  useWindowDimensions,
} from 'react-native';
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
import { getClinic, getDoctor } from '../services/api';
import type { Clinic } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { getDistance } from '../utils/getDistance';

type RouteT = RouteProp<RootStackParamList, 'HospitalDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const BEFORE_YOU_VISIT = [
  'Carry previous medical reports',
  'Appointment confirmation required',
  'Bring a valid ID proof',
  'Emergency cases handled separately',
];

const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function HospitalDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteT>();
  const { id, name, specialty, location } = params;
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 768;
  const { location: userLocation } = useLocation();

  const [tab, setTab] = useState<'Doctors' | 'Facilities' | 'Details'>('Doctors');
  const [specialtiesExpanded, setSpecialtiesExpanded] = useState(false);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinic(id)
      .then(res => setClinic(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const displayClinic = clinic ?? {
    name: name ?? '',
    type: '',
    about: '',
    phoneNumber: '',
    websiteUrl: '',
    doctors: [],
    specialties: [],
    medicalSystem: null,
  };

  const distance = userLocation && clinic
    ? getDistance(userLocation.latitude, userLocation.longitude, clinic.latitude, clinic.longitude)
    : null;

  const callClinic = () => {
    const phone = clinic?.phoneNumber;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert('Not available', 'No phone number found for this clinic.');
  };

  const openMaps = () => {
    const lat = clinic?.latitude;
    const lng = clinic?.longitude;
    if (lat && lng) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    } else {
      const query = encodeURIComponent(location ?? '');
      if (query) Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      else Alert.alert('Not available', 'No location found for this clinic.');
    }
  };

  const openWebsite = () => {
    const url = clinic?.websiteUrl;
    if (url) Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    else Alert.alert('Not available', 'No website found for this clinic.');
  };

  // Left column: image + clinic name/info + tabs + tab content
  const leftColumn = (
    <View style={styles.leftColumn}>
      {/* Clinic image */}
      <View style={styles.imageContainer}>
        {clinic?.profilePicture ? (
          <Image source={{ uri: clinic.profilePicture }} style={styles.clinicImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Image source={require('../assets/images/aptly-logo2.png')} style={styles.placeholderLogo} resizeMode="contain" />
          </View>
        )}
      </View>

      {/* Clinic title row */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text allowFontScaling={false} style={styles.clinicTitle}>{displayClinic.name}</Text>
          <Text allowFontScaling={false} style={styles.clinicType}>
            {displayClinic.medicalSystem?.name
              ? `${displayClinic.type ?? ''} • ${displayClinic.medicalSystem.name}`
              : displayClinic.type ?? ''}
          </Text>
          <View style={styles.locationRow}>
            <LocationIcon width={SIZE(12)} height={SIZE(12)} />
            <Text allowFontScaling={false} style={styles.locationText}>
              {clinic?.address ?? location}
              {distance ? (
                <Text allowFontScaling={false} style={styles.distanceText}>{'  '}{distance}</Text>
              ) : null}
            </Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      {displayClinic.specialties?.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSpecialtiesExpanded(e => !e)}
          style={styles.specialtiesRow}
        >
          {specialtiesExpanded
            ? displayClinic.specialties.map((s: { id: string; name: string }) => (
                <View key={s.id} style={styles.specialtyChip}>
                  <Text allowFontScaling={false} style={styles.specialtyChipText}>{s.name}</Text>
                </View>
              ))
            : <>
                {displayClinic.specialties.slice(0, 3).map((s: { id: string; name: string }) => (
                  <View key={s.id} style={styles.specialtyChip}>
                    <Text allowFontScaling={false} style={styles.specialtyChipText} numberOfLines={1}>{s.name}</Text>
                  </View>
                ))}
                {displayClinic.specialties.length > 3 && (
                  <View style={[styles.specialtyChip, styles.specialtyChipMore]}>
                    <Text allowFontScaling={false} style={styles.specialtyChipText}>
                      +{displayClinic.specialties.length - 3}
                    </Text>
                  </View>
                )}
              </>
          }
        </TouchableOpacity>
      )}

      {/* Mobile action buttons */}
      {!isDesktop && (
        <View style={styles.mobileActions}>
          <TouchableOpacity style={styles.mobileActionBtn} activeOpacity={0.7} onPress={callClinic}>
            <PhoneIcon width={SIZE(20)} height={SIZE(20)} />
            <Text allowFontScaling={false} style={styles.mobileActionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mobileActionBtn} activeOpacity={0.7} onPress={openMaps}>
            <MapIcon width={SIZE(20)} height={SIZE(20)} />
            <Text allowFontScaling={false} style={styles.mobileActionText}>Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mobileActionBtn} activeOpacity={0.7} onPress={openWebsite}>
            <WebIcon width={SIZE(20)} height={SIZE(20)} />
            <Text allowFontScaling={false} style={styles.mobileActionText}>Website</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['Doctors', 'Facilities', 'Details'] as const).map(t => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text allowFontScaling={false} style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {loading && <ActivityIndicator style={{ marginTop: SIZE(24) }} color={colors.primary} />}

      {!loading && tab === 'Doctors' && (
        <View style={styles.tabContent}>
          {displayClinic.doctors.length === 0
            ? <Text allowFontScaling={false} style={styles.emptyText}>No doctors listed.</Text>
            : (
              <View style={isDesktop ? styles.doctorsGrid : styles.doctorsList}>
                {displayClinic.doctors.map(doc => (
                  <DoctorCard
                    key={doc.id}
                    name={doc.name}
                    type={doc.specialties.map((s: { name: string }) => s.name).join(', ')}
                    experience={doc.yearsOfExperience ? `${doc.yearsOfExperience} years` : ''}
                    image={doc.profilePicture}
                    nextSchedule={doc.nextSchedule}
                    style={isDesktop ? styles.doctorGridItem : undefined}
                    onPress={() => navigation.navigate('DoctorDetail', { doctorId: doc.id })}
                    onBookPress={async () => {
                      const res = await getDoctor(doc.id);
                      navigation.navigate('BookAppointment', { doctor: res.data, clinicId: clinic?.id });
                    }}
                  />
                ))}
              </View>
            )
          }
        </View>
      )}

      {!loading && tab === 'Details' && (
        <View style={styles.tabContent}>
          {/* About */}
          {displayClinic.about ? (
            <>
              <Text allowFontScaling={false} style={styles.sectionTitle}>About the Clinic</Text>
              <Text allowFontScaling={false} style={styles.aboutText}>{displayClinic.about}</Text>
            </>
          ) : null}

          {/* Clinic Information grid */}
          <Text allowFontScaling={false} style={styles.sectionTitle}>Clinic Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text allowFontScaling={false} style={styles.infoCellLabel}>Clinic Type</Text>
              <Text allowFontScaling={false} style={styles.infoCellValue}>{displayClinic.type || '—'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text allowFontScaling={false} style={styles.infoCellLabel}>System of Medicine</Text>
              <Text allowFontScaling={false} style={styles.infoCellValue}>{displayClinic.medicalSystem?.name || '—'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text allowFontScaling={false} style={styles.infoCellLabel}>Established</Text>
              <Text allowFontScaling={false} style={styles.infoCellValue}>
                {clinic?.createdAt ? new Date(clinic.createdAt).getFullYear() : '—'}
              </Text>
            </View>
            <View style={styles.infoCell}>
              <Text allowFontScaling={false} style={styles.infoCellLabel}>Doctors</Text>
              <Text allowFontScaling={false} style={styles.infoCellValue}>
                {displayClinic.doctors.length > 0 ? `${displayClinic.doctors.length}+` : '—'}
              </Text>
            </View>
          </View>

          {/* Before You Visit */}
          <View style={styles.beforeVisitCard}>
            <Text allowFontScaling={false} style={styles.beforeVisitTitle}>Before You Visit</Text>
            {BEFORE_YOU_VISIT.map((item, i) => (
              <View key={i} style={styles.beforeVisitRow}>
                <Text allowFontScaling={false} style={styles.checkmark}>✓</Text>
                <Text allowFontScaling={false} style={styles.beforeVisitText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!loading && tab === 'Facilities' && (
        <View style={[styles.tabContent, styles.comingSoonContainer]}>
          <Text allowFontScaling={false} style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text allowFontScaling={false} style={styles.comingSoonSubtitle}>
            Facilities information will be available here soon.
          </Text>
        </View>
      )}
    </View>
  );

  // Right column: clinic info card
  const rightColumn = (
    <View style={styles.rightColumn}>
      <View style={styles.infoCard}>
        <Text allowFontScaling={false} style={styles.infoCardTitle}>Clinic info</Text>
        <View style={styles.infoCardLocationRow}>
          <LocationIcon width={SIZE(14)} height={SIZE(14)} />
          <Text allowFontScaling={false} style={styles.infoCardAddress} numberOfLines={2}>
            {clinic?.address ?? location}
          </Text>
          {distance ? (
            <Text allowFontScaling={false} style={styles.infoCardDistance}>{distance}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.infoActionBtn} activeOpacity={0.7} onPress={callClinic}>
          <PhoneIcon width={SIZE(18)} height={SIZE(18)} />
          <Text allowFontScaling={false} style={styles.infoActionText}>Call clinic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoActionBtn} activeOpacity={0.7} onPress={openMaps}>
          <MapIcon width={SIZE(18)} height={SIZE(18)} />
          <Text allowFontScaling={false} style={styles.infoActionText}>Open in maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoActionBtn} activeOpacity={0.7} onPress={openWebsite}>
          <WebIcon width={SIZE(18)} height={SIZE(18)} />
          <Text allowFontScaling={false} style={styles.infoActionText}>Website</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header — full width */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.headerTitle}>
          {name ?? displayClinic.name}
        </Text>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageLayout, isDesktop && styles.pageLayoutDesktop]}>
          {leftColumn}
          {isDesktop && rightColumn}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    gap: SIZE(10),
  },
  backBtn: { width: SIZE(32) },
  headerTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    flex: 1,
  },
  headerDivider: { height: 1, backgroundColor: colors.border },

  // Scroll
  scrollContent: {
    paddingBottom: SIZE(40),
  },
  scrollContentDesktop: {
    alignItems: 'center',
  },
  pageLayout: {
    width: '100%',
  },
  pageLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZE(24),
    maxWidth: 1240,
    paddingHorizontal: SIZE(24),
    paddingTop: SIZE(24),
  },

  // Left column
  leftColumn: {
    flex: 1,
    minWidth: 0,
  },

  // Image
  imageContainer: {
    marginHorizontal: SIZE(18),
    marginTop: SIZE(16),
    borderRadius: SIZE(16),
    overflow: 'hidden',
    height: SIZE(220),
    backgroundColor: colors.backgroundLight,
  },
  clinicImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
  },
  placeholderLogo: {
    width: SIZE(80),
    height: SIZE(80),
    opacity: 0.3,
  },

  // Clinic title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SIZE(18),
    paddingTop: SIZE(16),
    paddingBottom: SIZE(8),
    gap: SIZE(8),
  },
  clinicTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(20),
    color: colors.textPrimary,
    marginBottom: SIZE(4),
  },
  clinicType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    marginBottom: SIZE(8),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
  },
  distanceText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.primary,
  },

  // Specialties
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZE(8),
    paddingHorizontal: SIZE(18),
    paddingTop: SIZE(12),
  },
  specialtyChip: {
    backgroundColor: colors.specialtyChipBg,
    borderRadius: SIZE(20),
    paddingHorizontal: SIZE(12),
    paddingVertical: SIZE(5),
  },
  specialtyChipMore: {
    backgroundColor: colors.specialtyChipBg,
  },
  specialtyChipText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.specialtyChipText,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: SIZE(18),
    marginTop: SIZE(8),
    gap: SIZE(20),
  },
  tab: {},
  tabText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textSecondary,
    paddingBottom: SIZE(10),
  },
  tabTextActive: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.textPrimary,
  },
  tabUnderline: {
    height: SIZE(3),
    backgroundColor: colors.accent,
    borderRadius: SIZE(2),
    marginTop: -SIZE(3),
    marginBottom: -1,
  },

  // Tab content
  tabContent: {
    paddingHorizontal: SIZE(18),
    paddingTop: SIZE(20),
    gap: SIZE(16),
  },
  emptyText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
  },

  // Doctors layout
  doctorsList: {
    gap: SIZE(16),
  },
  doctorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZE(16),
  },
  doctorGridItem: {
    // Each card takes roughly half the available width minus the gap
    flexBasis: '47%',
    flexGrow: 1,
    maxWidth: '49%',
  },

  // Details tab
  sectionTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
    marginBottom: SIZE(4),
  },
  aboutText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    lineHeight: SIZE(20),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZE(12),
    overflow: 'hidden',
  },
  infoCell: {
    width: '50%',
    padding: SIZE(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  infoCellLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
    marginBottom: SIZE(4),
  },
  infoCellValue: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },

  // Before You Visit
  beforeVisitCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: SIZE(12),
    padding: SIZE(16),
    gap: SIZE(8),
  },
  beforeVisitTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: '#92400E',
    marginBottom: SIZE(4),
  },
  beforeVisitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZE(8),
  },
  checkmark: {
    fontSize: SIZE(13),
    color: '#92400E',
    marginTop: SIZE(1),
  },
  beforeVisitText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: '#92400E',
    flex: 1,
    lineHeight: SIZE(20),
  },

  // Coming soon
  comingSoonContainer: {
    alignItems: 'center',
    paddingTop: SIZE(40),
  },
  comingSoonTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
    opacity: 0.6,
    marginBottom: SIZE(6),
  },
  comingSoonSubtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: SIZE(18),
  },

  // Mobile action buttons
  mobileActions: {
    flexDirection: 'row',
    gap: SIZE(8),
    paddingHorizontal: SIZE(18),
    paddingTop: SIZE(16),
    paddingBottom: SIZE(4),
  },
  mobileActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(6),
    paddingVertical: SIZE(10),
    borderRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
  },
  mobileActionText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.primary,
  },

  // Right column (desktop)
  rightColumn: {
    width: SIZE(280),
    flexShrink: 0,
  },
  infoCard: {
    borderRadius: SIZE(16),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: SIZE(20),
    gap: SIZE(12),
  },
  infoCardTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    marginBottom: SIZE(4),
  },
  infoCardLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZE(6),
    marginBottom: SIZE(4),
  },
  infoCardAddress: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    flex: 1,
  },
  infoCardDistance: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.primary,
    flexShrink: 0,
  },
  infoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(8),
    paddingVertical: SIZE(11),
    borderRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
  },
  infoActionText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.primary,
  },
});
