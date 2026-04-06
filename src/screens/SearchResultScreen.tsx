import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from 'react-native';
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

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResult'>;

const DOCTOR_TITLES = ['doctors'];

const DUMMY_DOCTORS = [
  { id: 'd1', name: 'Dr. Rodger Struck', specialty: 'Cardiologist', hospital: 'Sunrise Hospital', clinicType: 'Clinic', experience: '8 yrs exp' },
  { id: 'd2', name: 'Dr. Priya Sharma', specialty: 'Dermatologist', hospital: 'Apollo Clinic', clinicType: 'Clinic', experience: '5 yrs exp' },
  { id: 'd3', name: 'Dr. Anil Mehta', specialty: 'Neurologist', hospital: 'Fortis Health', clinicType: 'Hospital', experience: '12 yrs exp' },
  { id: 'd4', name: 'Dr. Sarah Khan', specialty: 'Pediatrician', hospital: 'Max Care Centre', clinicType: 'Clinic', experience: '6 yrs exp' },
];

const DUMMY_CLINICS = [
  { id: 'c1', name: 'Sunrise Hospital', subType: 'Multi Specialty', location: 'Kakkanad, Kochi' },
  { id: 'c2', name: 'Apollo Clinic', subType: 'General', location: 'Edapally, Kochi' },
  { id: 'c3', name: 'Fortis Health', subType: 'Cardiology', location: 'MG Road, Kochi' },
  { id: 'c4', name: 'Max Care Centre', subType: 'Pediatrics', location: 'Thrissur, Kerala' },
];

export default function SearchResultScreen({ navigation, route }: Props) {
  const { title } = route.params;
  const isDoctor = DOCTOR_TITLES.includes(title.toLowerCase());
  const [activeFilter, setActiveFilter] = useState<string | null>(
    title.toLowerCase() !== 'clinics' && title.toLowerCase() !== 'doctors' ? title : null
  );
  const [location, setLocation] = useState('Malappuram, Kerala');
  const data = isDoctor ? DUMMY_DOCTORS : DUMMY_CLINICS;

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

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => isDoctor ? (
          <DoctorCard
            name={(item as typeof DUMMY_DOCTORS[0]).name}
            type={(item as typeof DUMMY_DOCTORS[0]).specialty}
            hospital={(item as typeof DUMMY_DOCTORS[0]).hospital}
            clinicType={(item as typeof DUMMY_DOCTORS[0]).clinicType}
            experience={(item as typeof DUMMY_DOCTORS[0]).experience}
            onPress={() => { }}
            onBookPress={() => { }}
          />
        ) : (
          <ClinicCard
            name={(item as typeof DUMMY_CLINICS[0]).name}
            subType={(item as typeof DUMMY_CLINICS[0]).subType}
            location={(item as typeof DUMMY_CLINICS[0]).location}
            style={{ marginHorizontal: 0 }}
          />
        )}
      />
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
