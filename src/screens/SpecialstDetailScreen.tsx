import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'; import { SafeAreaView } from 'react-native-safe-area-context';
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

const DOCTORS = [
  { id: '1', name: 'Dr. Rodger Struck', type: 'Cardiologist', hospital: 'Sunrise Hospital', clinicType: 'Multi Specialty', experience: '8 yrs exp', location: 'Bandra, Mumbai', rating: '4.8', status: 'Booking Opened' },
  { id: '2', name: 'Dr. Sarah Collins', type: 'Neurologist', hospital: 'Apollo Clinic', clinicType: 'Clinic', experience: '12 yrs exp', location: 'Andheri, Mumbai', rating: '4.9', status: 'Not Started' },
  { id: '3', name: 'Dr. James Patel', type: 'Dermatologist', hospital: 'Max Care', clinicType: 'Clinic', experience: '5 yrs exp', location: 'Powai, Mumbai', rating: '4.6', status: 'Booking Opened' },
  { id: '4', name: 'Dr. Meera Nair', type: 'Orthopaedic', hospital: 'Narayana Health', clinicType: 'Multi Specialty', experience: '10 yrs exp', location: 'Thane, Mumbai', rating: '4.7', status: 'Not Started' },
];

const CLINICS = [
  { id: '1', name: 'Apollo Clinic', type: 'Multi-specialty', location: 'Bandra, Mumbai', rating: '4.7' },
  { id: '2', name: 'Fortis Health', type: 'Cardiology', location: 'Andheri, Mumbai', rating: '4.8' },
  { id: '3', name: 'Max Care', type: 'Dermatology', location: 'Powai, Mumbai', rating: '4.5' },
  { id: '4', name: 'Narayana Health', type: 'Orthopaedics', location: 'Thane, Mumbai', rating: '4.6' },
];

type Tab = 'clinics' | 'doctors';
type Props = NativeStackScreenProps<RootStackParamList, 'specialstDetail'>;

export default function SpecialstDetailScreen({ navigation, route }: Props) {
  const { name } = route.params;
  const [tab, setTab] = useState<Tab>('clinics');

  const filteredDoctors = DOCTORS;
  const filteredClinics = CLINICS;

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
        <FlatList
          key="doctors"
          data={filteredDoctors}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, tab === 'doctors' && { paddingHorizontal: SIZE(18) }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DoctorCard
              name={item.name}
              type={item.type}
              hospital={item.hospital}
              clinicType={item.clinicType}
              experience={item.experience}
              status={item.status as 'Booking Opened' | 'Not Started'}
              onPress={() => navigation.navigate('DoctorDetail', {
                name: item.name,
                type: item.type,
                hospital: item.hospital,
                clinicType: item.clinicType,
                experience: item.experience,
                location: item.location,
                rating: item.rating,
                status: item.status,
              })}
              onBookPress={() => navigation.navigate('BookAppointment', {
                name: item.name,
                type: item.type,
                hospital: item.hospital,
              })}
            />
          )}
        />
      ) : (
        <FlatList
          key="clinics"
          data={filteredClinics}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ClinicCard
              name={item.name}
              subType={item.type}
              location={item.location}
              onPress={() => navigation.navigate('HospitalDetail', { name: item.name, specialty: item.type, location: item.location })}
            />
          )}
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
