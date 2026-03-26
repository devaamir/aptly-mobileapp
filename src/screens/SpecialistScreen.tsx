import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';

const SPECIALISTS = [
  { id: '1', name: 'Cardiologist', desc: 'For heart-related, Pre and Post nutrition', clinics: 20, doctors: 45 },
  { id: '2', name: 'Dermatologist', desc: 'Skin, hair & nails', clinics: 15, doctors: 30 },
  { id: '3', name: 'Neurologist', desc: 'Brain & nervous system', clinics: 12, doctors: 28 },
  { id: '4', name: 'Orthopaedic', desc: 'Bones & joints', clinics: 18, doctors: 40 },
  { id: '5', name: 'Paediatrician', desc: 'Child health', clinics: 22, doctors: 50 },
  { id: '6', name: 'Gynaecologist', desc: 'Women\'s health', clinics: 16, doctors: 35 },
  { id: '7', name: 'Ophthalmologist', desc: 'Eyes & vision', clinics: 10, doctors: 22 },
  { id: '8', name: 'ENT Specialist', desc: 'Ear, nose & throat', clinics: 14, doctors: 32 },
  { id: '9', name: 'Psychiatrist', desc: 'Mental health', clinics: 8, doctors: 18 },
  { id: '10', name: 'Urologist', desc: 'Urinary tract', clinics: 11, doctors: 24 },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Specialist'>;

export default function SpecialistScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const filtered = SPECIALISTS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text style={styles.title}>All Specialists</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchBar placeholder="Search specialists..." value={query} onChangeText={setQuery} style={{ borderWidth: 0 }} />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('SpecialistDetail', { name: item.name, desc: item.desc, clinics: item.clinics, doctors: item.doctors })}>
            <Image source={require('../assets/images/heart.png')} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
              <Text style={styles.meta}>{item.clinics}+ Clinics  •  {item.doctors}+ Doctors</Text>
            </View>
            <ArrowRight width={SIZE(18)} height={SIZE(18)} />
          </TouchableOpacity>
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
    marginBottom: SIZE(12),
  },
  listContent: {
    paddingHorizontal: SIZE(18),
    paddingBottom: SIZE(24),
    gap: SIZE(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(14),
    padding: SIZE(14),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
  },
  avatar: {
    width: SIZE(52),
    height: SIZE(52),
    borderRadius: SIZE(26),
  },
  info: { flex: 1 },
  name: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  desc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  meta: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(11),
    color: colors.gold,
    marginTop: SIZE(12),
  },
});
