import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import DoctorCard from '../components/DoctorCard';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import FilterIcon from '../assets/icons/filter-black-icon.svg';
import { getDoctors, getDoctor, Doctor } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Doctors'>;

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getBookingStatus(doctor: Doctor): 'Booking Opened' | 'Not Started' {
  const today = DAYS[new Date().getDay()];
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const schedules = doctor.medicalCenters.flatMap(mc => mc.schedules ?? []);
  const todaySchedules = schedules.filter(s => s.dayOfWeek === today);
  const isOpen = todaySchedules.some(s => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.stopTime.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
  });
  return isOpen ? 'Booking Opened' : 'Not Started';
}

const to12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${ampm}`;
};

function getBookingTime(doctor: Doctor): string {
  const today = DAYS[new Date().getDay()];
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const schedules = doctor.medicalCenters.flatMap(mc => mc.schedules ?? []);
  const current = schedules.find(s => {
    if (s.dayOfWeek !== today) return false;
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.stopTime.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
  });
  if (!current) return 'No active session';
  return `Booking available at ${to12h(current.startTime)} - ${to12h(current.stopTime)}`;
}

export default function DoctorsScreen({ navigation }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors()
      .then(res => Promise.all(res.data.map(d => getDoctor(d.id).then(r => r.data))))
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>Doctors</Text>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Search')}>
          <SearchIcon width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
      </View>

      {/* Location & Filter */}
      <TouchableOpacity style={styles.locationBox} activeOpacity={0.8} onPress={() => navigation.navigate('LocationSearch')}>
        <View style={styles.locationIconContainer}>
          <LocationIcon width={SIZE(20)} height={SIZE(20)} />
        </View>
        <Text allowFontScaling={false} style={styles.locationText} numberOfLines={1}>Malappuram, Kerala</Text>
        <Text allowFontScaling={false} style={styles.distanceText}>2.5 km</Text>
      </TouchableOpacity>
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <FilterIcon width={SIZE(12)} height={SIZE(12)} />
          <Text allowFontScaling={false} style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const specialty = item.specialties[0]?.name ?? '';
            const hospital = item.medicalCenters[0]?.name ?? '';
            const clinicType = item.medicalCenters[0]?.type ?? '';
            const location = item.medicalCenters[0] ? `${item.medicalCenters[0].district}, ${item.medicalCenters[0].state}` : '';
            return (
              <DoctorCard
                name={item.name}
                type={specialty}
                hospital={hospital}
                clinicType={clinicType}
                location={location}
                experience={`${item.yearsOfExperience} yrs exp`}
                image={item.profilePicture}
                status={getBookingStatus(item)}
                bookingTime={getBookingTime(item)}
                onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
                onBookPress={() => navigation.navigate('BookAppointment', { doctor: item })}
              />
            );
          }}
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
  searchWrapper: { paddingHorizontal: SIZE(18), marginBottom: SIZE(20), },
  listContent: { paddingBottom: SIZE(24), gap: SIZE(12), paddingHorizontal: SIZE(20) },
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
  locationIconContainer: {
    paddingVertical: SIZE(8),
    paddingRight: SIZE(12),
    borderRightWidth: 1,
    borderRightColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textPrimary,
    marginLeft: SIZE(10),
  },
  filterRow: {
    paddingHorizontal: SIZE(18),
    marginBottom: SIZE(8),
  },
  distanceText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.primary,
    paddingLeft: SIZE(8),
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
});
