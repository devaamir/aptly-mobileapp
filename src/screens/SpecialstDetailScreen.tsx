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

type Tab = 'clinics' | 'doctors';
type Props = NativeStackScreenProps<RootStackParamList, 'SpecialstDetail'>;

export default function SpecialstDetailScreen({ navigation, route }: Props) {
  const { name, id } = route.params;
  const [tab, setTab] = useState<Tab>('clinics');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getClinics(1, 20, { specialtyId: id }),
      getDoctors(1, 20, { specialtyId: id }),
    ]).then(([clinicRes, doctorRes]) => {
      setClinics(clinicRes.data);
      setDoctors(doctorRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

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
          <Text allowFontScaling={false} style={styles.locationText}>Malappuram, Kerala</Text>
          <DownArrowGrey width={SIZE(14)} height={SIZE(14)} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <FilterIcon width={SIZE(12)} height={SIZE(12)} />
          <Text allowFontScaling={false} style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
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
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
              onBookPress={() => navigation.navigate('BookAppointment', { doctor: item })}
            />
          )}
          ListEmptyComponent={<Text allowFontScaling={false} style={styles.emptyText}>No available doctors</Text>}
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
              onPress={() => navigation.navigate('HospitalDetail', { name: item.name, specialty: item.specialties[0]?.name ?? '', location: item.address })}
            />
          )}
          ListEmptyComponent={<Text allowFontScaling={false} style={styles.emptyText}>No available clinics</Text>}
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
  locationFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(10),
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
    color: '#494F5A',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
    backgroundColor: '#F5F5F5',
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(8),
    borderRadius: 46,
  },
  filterText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: '#00001D',
  },
});
