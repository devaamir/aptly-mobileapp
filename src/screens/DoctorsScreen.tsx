import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import DoctorCard from '../components/DoctorCard';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';

const DOCTORS = [
  { id: '1', name: 'Dr. Rodger Struck', type: 'Cardiologist', hospital: 'Sunrise Hospital', clinicType: 'Multi Speciality', experience: '8 yrs exp', status: 'Booking Opened' },
  { id: '2', name: 'Dr. Sarah Collins', type: 'Neurologist', hospital: 'Apollo Clinic', clinicType: 'Clinic', experience: '12 yrs exp', status: 'Not Started' },
  { id: '3', name: 'Dr. James Patel', type: 'Dermatologist', hospital: 'Max Care', clinicType: 'Clinic', experience: '5 yrs exp', status: 'Booking Opened' },
  { id: '4', name: 'Dr. Meera Nair', type: 'Orthopaedic', hospital: 'Narayana Health', clinicType: 'Multi Speciality', experience: '10 yrs exp', status: 'Not Started' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Doctors'>;

export default function DoctorsScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const filtered = DOCTORS.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.type.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text style={styles.title}>Doctors</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.searchWrapper}>
        <SearchBar placeholder="Search doctors..." value={query} onChangeText={setQuery} style={{ borderWidth: 0 }} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DoctorCard
            name={item.name}
            type={item.type}
            hospital={item.hospital}
            clinicType={item.clinicType}
            experience={item.experience}
            status={item.status as 'Booking Opened' | 'Not Started'}
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
  searchWrapper: { paddingHorizontal: SIZE(18), marginBottom: SIZE(20), },
  listContent: { paddingBottom: SIZE(24), gap: SIZE(12) },
});
