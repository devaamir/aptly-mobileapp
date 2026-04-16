import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import FilterIcon from '../assets/icons/filter-black-icon.svg';
import ClinicCard from '../components/ClinicCard';
import DoctorCard from '../components/DoctorCard';
import { getClinics, getDoctors, Clinic, Doctor } from '../services/api';
import FilterModal from '../components/FilterModal';
import { useLocation } from '../context/LocationContext';
import { getDistance } from '../utils/getDistance';
import LocationSlashIcon from '../assets/icons/location-slash-icon.svg';
import PrimaryButton from '../components/PrimaryButton';
import { useMetadata } from '../context/MetadataContext';

type Tab = 'clinics' | 'doctors';
type Props = NativeStackScreenProps<RootStackParamList, 'SpecialstDetail'>;

export default function SpecialstDetailScreen({ navigation, route }: Props) {
  const { name, id } = route.params;
  const { location } = useLocation();
  const { specialties: allSpecialties, medicalSystems } = useMetadata();
  const [tab, setTab] = useState<Tab>('clinics');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({ specialties: [], availability: [], type: [] });

  useEffect(() => {
    if (!location) { setLoading(false); setClinics([]); setDoctors([]); return; }
    setLoading(true);
    const filterSpecialtyId = allSpecialties.find(s => appliedFilters.specialties?.includes(s.name))?.id;
    const medicalSystemId = medicalSystems.find(s => appliedFilters.type?.includes(s.name))?.id;
    const baseFilters = { specialtyId: filterSpecialtyId ?? id, latitude: location.latitude, longitude: location.longitude };
    Promise.all([
      getClinics(1, 20, { ...baseFilters, ...(medicalSystemId ? { medicalSystemId } : {}) }),
      getDoctors(1, 20, { ...baseFilters, ...(medicalSystemId ? { medicalSystemId } : {}) }),
    ]).then(([clinicRes, doctorRes]) => {
      setClinics(clinicRes.data);
      setDoctors(doctorRes.data);
    }).catch(() => { }).finally(() => setLoading(false));
  }, [id, location, appliedFilters]);

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
            renderItem={({ item }) => (
              <DoctorCard
                name={item.name}
                type={item.specialties[0]?.name ?? ''}
                hospital={item.medicalCenters[0]?.name ?? ''}
                clinicType={item.medicalCenters[0]?.type ?? ''}
                experience={`${item.yearsOfExperience} yrs exp`}
                image={item.profilePicture}
                distance={(() => { const mc = item.medicalCenters[0]; return (location && mc) ? getDistance(location.latitude, location.longitude, mc.latitude, mc.longitude) : undefined; })()}
                onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
                onBookPress={() => navigation.navigate('BookAppointment', { doctor: item })}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LocationSlashIcon width={SIZE(81)} height={SIZE(81)} />
                <Text allowFontScaling={false} style={styles.emptyTitle}>No doctors available here</Text>
                <Text allowFontScaling={false} style={styles.emptyMessage}>We couldn't find any doctors in this area right now. Try changing your location or adjusting filters.</Text>
                <View style={{ width: '100%', paddingHorizontal: SIZE(16), marginTop: SIZE(8) }}>
                  <PrimaryButton label="Use another location" onPress={() => navigation.navigate('LocationSearch')} />
                </View>
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
              subType={item.specialties[0]?.name ?? item.type}
              location={`${item.district}, ${item.state}`}
              image={item.profilePicture}
              distance={location ? getDistance(location.latitude, location.longitude, item.latitude, item.longitude) : undefined}
              onPress={() => navigation.navigate('HospitalDetail', { id: item.id, name: item.name, specialty: item.specialties[0]?.name ?? '', location: item.address })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LocationSlashIcon width={SIZE(81)} height={SIZE(81)} />
              <Text allowFontScaling={false} style={styles.emptyTitle}>No clinics available here</Text>
              <Text allowFontScaling={false} style={styles.emptyMessage}>We couldn't find any clinics in this area right now. Try changing your location or adjusting filters.</Text>
              <View style={{ width: '100%', paddingHorizontal: SIZE(16), marginTop: SIZE(8) }}>
                <PrimaryButton label="Use another location" onPress={() => navigation.navigate('LocationSearch')} />
              </View>
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
  emptyText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: SIZE(40),
  },
  emptyContainer: { alignItems: 'center', paddingHorizontal: SIZE(32), paddingVertical: SIZE(32), gap: SIZE(10) },
  emptyTitle: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(16), color: '#1C1E22', marginTop: SIZE(8) },
  emptyMessage: { fontFamily: 'Manrope-Regular', fontSize: SIZE(11), color: '#636A79', textAlign: 'center', lineHeight: SIZE(20) },
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
