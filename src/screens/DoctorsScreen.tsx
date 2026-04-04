import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import DoctorCard from '../components/DoctorCard';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
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
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors()
      .then(res => Promise.all(res.data.map(d => getDoctor(d.id).then(r => r.data))))
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.specialities.some(s => s.name.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>Doctors</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.searchWrapper}>
        <SearchBar placeholder="Search doctors..." value={query} onChangeText={setQuery} style={{ borderWidth: 0 }} />
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const speciality = item.specialities[0]?.name ?? '';
            const hospital = item.medicalCenters[0]?.name ?? '';
            const clinicType = item.medicalCenters[0]?.type ?? '';
            return (
              <DoctorCard
                name={item.name}
                type={speciality}
                hospital={hospital}
                clinicType={clinicType}
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
});
