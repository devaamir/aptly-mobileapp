import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import LocationIcon from '../assets/icons/location-icon.svg';

const DOCTORS = [
  { id: '1', name: 'Dr. Rodger Struck', experience: '8 yrs exp', location: 'Bandra, Mumbai', rating: '4.8' },
  { id: '2', name: 'Dr. Sarah Collins', experience: '12 yrs exp', location: 'Andheri, Mumbai', rating: '4.9' },
  { id: '3', name: 'Dr. James Patel', experience: '5 yrs exp', location: 'Powai, Mumbai', rating: '4.6' },
  { id: '4', name: 'Dr. Meera Nair', experience: '10 yrs exp', location: 'Thane, Mumbai', rating: '4.7' },
];

const CLINICS = [
  { id: '1', name: 'Apollo Clinic', type: 'Multi-speciality', location: 'Bandra, Mumbai', rating: '4.7' },
  { id: '2', name: 'Fortis Health', type: 'Cardiology', location: 'Andheri, Mumbai', rating: '4.8' },
  { id: '3', name: 'Max Care', type: 'Dermatology', location: 'Powai, Mumbai', rating: '4.5' },
  { id: '4', name: 'Narayana Health', type: 'Orthopaedics', location: 'Thane, Mumbai', rating: '4.6' },
];

type Tab = 'clinics' | 'doctors';
type Props = NativeStackScreenProps<RootStackParamList, 'SpecialistDetail'>;

export default function SpecialistDetailScreen({ navigation, route }: Props) {
  const { name } = route.params;
  const [tab, setTab] = useState<Tab>('clinics');
  const [query, setQuery] = useState('');

  const filteredDoctors = DOCTORS.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));
  const filteredClinics = CLINICS.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder={`Search ${tab}...`}
          value={query}
          onChangeText={setQuery}
          style={{ borderWidth: 0 }}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['clinics', 'doctors'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => { setTab(t); setQuery(''); }} activeOpacity={0.8}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {tab === 'doctors' ? (
        <FlatList
          key="doctors"
          data={filteredDoctors}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <View style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.primaryText}>{item.name}</Text>
                <Text style={styles.secondaryText}>{item.experience}</Text>
                <View style={styles.locationRow}>
                  <LocationIcon width={SIZE(12)} height={SIZE(12)} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating}</Text>
              </View>
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <View style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.primaryText}>{item.name}</Text>
                <Text style={styles.secondaryText}>{item.type}</Text>
                <View style={styles.locationRow}>
                  <LocationIcon width={SIZE(12)} height={SIZE(12)} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating}</Text>
              </View>
            </TouchableOpacity>
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
    marginBottom: SIZE(16),
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
    borderColor: '#F1F2F4',
  },
  avatar: {
    width: SIZE(52),
    height: SIZE(52),
    borderRadius: SIZE(26),
    backgroundColor: colors.backgroundLight,
  },
  info: { flex: 1 },
  primaryText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  secondaryText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
    marginTop: SIZE(4),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  ratingBadge: {
    backgroundColor: colors.backgroundLight,
    borderRadius: SIZE(8),
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(4),
  },
  ratingText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.textPrimary,
  },
});
