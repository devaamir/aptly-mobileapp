import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import LocationIcon from '../assets/icons/location-black-icon.svg';
import FilterIcon from '../assets/icons/filter-black-icon.svg';
import ClinicCard from '../components/ClinicCard';
import DoctorCard from '../components/DoctorCard';
import { getClinics, getDoctors, Clinic, Doctor } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResult'>;

const DOCTOR_TITLES = ['doctors'];

export default function SearchResultScreen({ navigation, route }: Props) {
  const { title, latitude, longitude, radius } = route.params;
  const isDoctor = DOCTOR_TITLES.includes(title.toLowerCase());
  const [activeFilter, setActiveFilter] = useState<string | null>(
    title.toLowerCase() !== 'clinics' && title.toLowerCase() !== 'doctors' ? title : null
  );
  const [location, setLocation] = useState('Malappuram, Kerala');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = isDoctor
      ? getDoctors(1, 20, { latitude, longitude, radius }).then(res => setDoctors(res.data))
      : getClinics(1, 20, { latitude, longitude, radius }).then(res => setClinics(res.data));
    fetch.finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>{isDoctor ? title : 'Clinics'}</Text>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Search' as never)}>
          <SearchIcon width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.locationBox} activeOpacity={0.8} onPress={() => navigation.navigate('LocationSearch' as never)}>
        <View style={styles.locationIconContainer}>
          <LocationIcon width={SIZE(20)} height={SIZE(20)} />
        </View>
        <Text allowFontScaling={false} style={styles.locationInput} numberOfLines={1}>{location}</Text>
        <Text allowFontScaling={false} style={styles.distanceText}>2.5 km</Text>
      </TouchableOpacity>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <FilterIcon width={SIZE(12)} height={SIZE(12)} />
          <Text allowFontScaling={false} style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
        {activeFilter && (
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} onPress={() => setActiveFilter(null)}>
            <Text allowFontScaling={false} style={styles.filterText}>{activeFilter}</Text>
            <Text allowFontScaling={false} style={styles.filterText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
      ) : (
        <FlatList
          data={isDoctor ? doctors : clinics}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => isDoctor ? (
            <DoctorCard
              name={(item as Doctor).name}
              type={(item as Doctor).specialties[0]?.name ?? ''}
              hospital={(item as Doctor).medicalCenters[0]?.name ?? ''}
              clinicType={(item as Doctor).medicalCenters[0]?.type ?? ''}
              experience={`${(item as Doctor).yearsOfExperience} yrs exp`}
              image={(item as Doctor).profilePicture}
              onPress={() => navigation.navigate('DoctorDetail' as never, { doctorId: item.id } as never)}
              onBookPress={() => navigation.navigate('BookAppointment' as never, { doctor: item } as never)}
            />
          ) : (
            <ClinicCard
              name={(item as Clinic).name}
              subType={(item as Clinic).specialties[0]?.name ?? (item as Clinic).type}
              location={`${(item as Clinic).district}, ${(item as Clinic).state}`}
              image={(item as Clinic).profilePicture}
              onPress={() => navigation.navigate('HospitalDetail', { id: (item as Clinic).id, name: (item as Clinic).name, specialty: (item as Clinic).specialties[0]?.name ?? '', location: (item as Clinic).address })}
              style={{ marginHorizontal: 0 }}
            />
          )}
          ListEmptyComponent={<Text allowFontScaling={false} style={styles.emptyText}>No results found</Text>}
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
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
  },
  backBtn: { width: SIZE(32) },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
  },
  divider: { height: 1, backgroundColor: colors.border },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(8),
    marginHorizontal: SIZE(18),
    marginVertical: SIZE(8),
    backgroundColor: colors.white,
  },
  locationInput: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    marginLeft: SIZE(10),
  }, locationIconContainer: {
    paddingVertical: SIZE(8),
    paddingRight: SIZE(12),
    borderRightWidth: 1,
    borderRightColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: SIZE(18), gap: SIZE(12), paddingBottom: SIZE(24) },
  emptyText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: SIZE(40),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
    paddingHorizontal: SIZE(18),
    marginBottom: SIZE(12),
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
    alignSelf: 'flex-start',
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
  distanceText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.primary,
    paddingLeft: SIZE(8),
  },
});
