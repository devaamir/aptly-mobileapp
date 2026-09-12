import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import ClinicCard from '../components/ClinicCard';
import DoctorCard from '../components/DoctorCard';
import { getClinics, getDoctors, getDoctor, Clinic, Doctor } from '../services/api';
import FilterModal from '../components/FilterModal';
import { useLocation } from '../context/LocationContext';
import { getDistance } from '../utils/getDistance';
import { useMetadata } from '../context/MetadataContext';

type Tab = 'clinics' | 'doctors';
type Props = NativeStackScreenProps<RootStackParamList, 'SpecialstDetail'>;

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function SpecialstDetailScreen({ navigation, route }: Props) {
  const { name, id } = route.params;
  const { location, distance } = useLocation();
  const { specialties: allSpecialties, medicalSystems } = useMetadata();
  const [tab, setTab] = useState<Tab>('clinics');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [fallbackClinics, setFallbackClinics] = useState<Clinic[]>([]);
  const [fallbackDoctors, setFallbackDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({ specialties: [], availability: [], type: [] });

  useEffect(() => {
    if (!location) { setLoading(false); setClinics([]); setDoctors([]); return; }
    setLoading(true);
    const filterSpecialtyId = allSpecialties.find(s => appliedFilters.specialties?.includes(s.name))?.id;
    const medicalSystemId = medicalSystems.find(s => appliedFilters.type?.includes(s.name))?.id;
    const baseFilters = { specialtyId: filterSpecialtyId ?? id, latitude: location.latitude, longitude: location.longitude, radius: distance };
    Promise.all([
      getClinics(1, 20, { ...baseFilters, ...(medicalSystemId ? { medicalSystemId } : {}) }),
      getDoctors(1, 20, { ...baseFilters, ...(medicalSystemId ? { medicalSystemId } : {}) }),
    ]).then(([clinicRes, doctorRes]) => {
      setClinics(clinicRes.data);
      if (clinicRes.data.length === 0) {
        getClinics(1, 20).then(r => setFallbackClinics(r.data)).catch(() => {});
      } else {
        setFallbackClinics([]);
      }
      return Promise.all(doctorRes.data.map(d => getDoctor(d.id).then(r => r.data)));
    }).then(fullDoctors => {
      setDoctors(fullDoctors);
      if (fullDoctors.length === 0) {
        getDoctors(1, 20)
          .then(r => Promise.all(r.data.map(d => getDoctor(d.id).then(x => x.data))))
          .then(setFallbackDoctors)
          .catch(() => {});
      } else {
        setFallbackDoctors([]);
      }
    }).catch(() => { }).finally(() => setLoading(false));
  }, [id, location, distance, appliedFilters]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>{name}</Text>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Search')}>
          <SearchIcon width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['clinics', 'doctors'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text allowFontScaling={false} style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Location & Filter bar */}
      <View style={styles.locationFilterRow}>
        <TouchableOpacity style={styles.locationLeft} activeOpacity={0.7} onPress={() => navigation.navigate('LocationSearch')}>
          <LocationIcon width={SIZE(14)} height={SIZE(14)} />
          <Text allowFontScaling={false} style={styles.locationText}>{location ? location.mainText : 'Select location'}</Text>
          <DownArrowGrey width={SIZE(14)} height={SIZE(14)} />
        </TouchableOpacity>
        <FilterModal applied={appliedFilters} onApply={setAppliedFilters} triggerOnly />
      </View>
      <View style={styles.chipsRow}>
        <FilterModal applied={appliedFilters} onApply={setAppliedFilters} chipsOnly />
      </View>

      {/* List */}
      {tab === 'doctors' ? (
        loading ? <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} /> :
          <FlatList
            key="doctors"
            data={doctors}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.listContent, { paddingHorizontal: SIZE(18) }]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const allSchedules = item.medicalCenters.flatMap(mc => (mc.schedules ?? []));
              const today = DAYS[new Date().getDay()];
              const todaySchedule = allSchedules.find(s => s.dayOfWeek.toLowerCase() === today);
              const derivedSchedule = item.nextSchedule ?? todaySchedule ?? allSchedules[0];
              return (
              <DoctorCard
                name={item.name}
                type={item.specialties[0]?.name ?? ''}
                hospital={item.medicalCenters[0]?.name ?? ''}
                clinicType={item.medicalSystem?.name ?? ''}
                experience={`${item.yearsOfExperience} yrs exp`}
                image={item.profilePicture}
                nextSchedule={derivedSchedule}
                distance={(() => { const mc = item.medicalCenters[0]; return (location && mc) ? getDistance(location.latitude, location.longitude, mc.latitude, mc.longitude) : undefined; })()}
                onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
                onBookPress={() => navigation.navigate('BookAppointment', { doctor: item, clinicId: item.medicalCenters[0]?.id })}
              />
              );
            }}
            ListEmptyComponent={
              <View style={{ marginHorizontal: -SIZE(18) }}>
                <View style={styles.emptyContainer}>
                  <TouchableOpacity activeOpacity={0.8} style={styles.emptyCard} onPress={() => navigation.navigate('LocationSearch')}>
                    <Image source={require('../assets/images/location-image.png')} style={styles.emptyCardImage} />
                    <View style={styles.emptyCardInfo}>
                      <Text allowFontScaling={false} style={styles.emptyCardTitle} numberOfLines={2}>We're Still Growing Here</Text>
                      <Text allowFontScaling={false} style={styles.emptyCardSubtitle} numberOfLines={2}>No doctors within this area. Explore other available doctors below.</Text>
                      <View style={styles.emptyCardBtn}>
                        <Text allowFontScaling={false} style={styles.emptyCardBtnText}>Use another location</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                {fallbackDoctors.length > 0 && (
                  <Text allowFontScaling={false} style={styles.fallbackHeading}>Available doctors</Text>
                )}
                {fallbackDoctors.map(item => {
                  const allSchedules = item.medicalCenters.flatMap(mc => (mc.schedules ?? []));
                  const today = DAYS[new Date().getDay()];
                  const todaySchedule = allSchedules.find(s => s.dayOfWeek.toLowerCase() === today);
                  const derivedSchedule = item.nextSchedule ?? todaySchedule ?? allSchedules[0];
                  return (
                    <View key={item.id} style={styles.fallbackItem}>
                      <DoctorCard
                        name={item.name}
                        type={item.specialties[0]?.name ?? ''}
                        hospital={item.medicalCenters[0]?.name ?? ''}
                        clinicType={item.medicalSystem?.name ?? ''}
                        experience={`${item.yearsOfExperience} yrs exp`}
                        image={item.profilePicture}
                        nextSchedule={derivedSchedule}
                        distance={(() => { const mc = item.medicalCenters[0]; return (location && mc) ? getDistance(location.latitude, location.longitude, mc.latitude, mc.longitude) : undefined; })()}
                        onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
                        onBookPress={() => navigation.navigate('BookAppointment', { doctor: item, clinicId: item.medicalCenters[0]?.id })}
                      />
                    </View>
                  );
                })}
              </View>
            }
          />
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
      ) : (
        <FlatList
          key="clinics"
          data={clinics}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ClinicCard
              name={item.name}
              subType={item.medicalSystem?.name ?? item.type}
              specialties={item.specialties.map((s: { name: string }) => s.name)}
              location={`${item.district}, ${item.state}`}
              image={item.profilePicture}
              distance={location ? getDistance(location.latitude, location.longitude, item.latitude, item.longitude) : undefined}
              onPress={() => navigation.navigate('HospitalDetail', { id: item.id, name: item.name, specialty: item.specialties[0]?.name ?? '', location: item.address })}
            />
          )}
          ListEmptyComponent={
            <View>
              <View style={styles.emptyContainer}>
                <TouchableOpacity activeOpacity={0.8} style={styles.emptyCard} onPress={() => navigation.navigate('LocationSearch')}>
                  <Image source={require('../assets/images/location-image.png')} style={styles.emptyCardImage} />
                  <View style={styles.emptyCardInfo}>
                    <Text allowFontScaling={false} style={styles.emptyCardTitle} numberOfLines={2}>We're Still Growing Here</Text>
                    <Text allowFontScaling={false} style={styles.emptyCardSubtitle} numberOfLines={2}>No clinics within this area. Explore other available clinics below.</Text>
                    <View style={styles.emptyCardBtn}>
                      <Text allowFontScaling={false} style={styles.emptyCardBtnText}>Use another location</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              {fallbackClinics.length > 0 && (
                <Text allowFontScaling={false} style={styles.fallbackHeading}>Available clinics</Text>
              )}
              {fallbackClinics.map(item => (
                <View key={item.id} style={styles.fallbackItem}>
                  <ClinicCard
                    name={item.name}
                    subType={item.medicalSystem?.name ?? item.type}
                    specialties={item.specialties.map((s: { name: string }) => s.name)}
                    location={`${item.district}, ${item.state}`}
                    image={item.profilePicture}
                    distance={location ? getDistance(location.latitude, location.longitude, item.latitude, item.longitude) : undefined}
                    onPress={() => navigation.navigate('HospitalDetail', { id: item.id, name: item.name, specialty: item.specialties[0]?.name ?? '', location: item.address })}
                    style={{ marginHorizontal: 0 }}
                  />
                </View>
              ))}
            </View>
          }
        />
      )}
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
  backBtn: {
    width: SIZE(36),
    height: SIZE(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  searchWrapper: {
    paddingHorizontal: SIZE(18),
    marginBottom: SIZE(8),
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: SIZE(18),
    marginTop: SIZE(10),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabActive: {},
  tabText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.accent,
  },
  tabUnderline: {
    height: 4,
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 20,
    marginTop: SIZE(6),
  },
  listContent: {
    paddingBottom: SIZE(24),
    gap: SIZE(12),
  },
  emptyContainer: { paddingHorizontal: SIZE(18), paddingTop: SIZE(16), paddingBottom: SIZE(12) },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorderLight,
    backgroundColor: colors.white,
  },
  emptyCardImage: {
    width: SIZE(102),
    height: SIZE(102),
    borderTopLeftRadius: SIZE(10),
    borderBottomLeftRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
    resizeMode: 'cover',
  },
  emptyCardInfo: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(6),
  },
  emptyCardTitle: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(15), color: colors.textPrimary, marginBottom: SIZE(2) },
  emptyCardSubtitle: { fontFamily: 'Manrope-Regular', fontSize: SIZE(11), color: colors.textSecondary, marginBottom: SIZE(6) },
  emptyCardBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(6),
    borderRadius: SIZE(8),
  },
  emptyCardBtnText: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(11), color: colors.white },
  fallbackHeading: { fontFamily: 'Manrope-Regular', fontSize: SIZE(12), color: colors.textSecondary, paddingTop: SIZE(8), paddingBottom: SIZE(4), paddingHorizontal: SIZE(18) },
  fallbackItem: { marginBottom: SIZE(12), paddingHorizontal: SIZE(18) },
  locationFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(10),
    marginBottom: SIZE(4),
  },
  chipsRow: {
    paddingHorizontal: SIZE(18),
    marginBottom: SIZE(8),
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSubdued,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
    backgroundColor: colors.filterBg,
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(8),
    borderRadius: 46,
  },
  filterText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.dark,
  },
});
