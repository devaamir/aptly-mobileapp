import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import SearchBar from '../components/SearchBar';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';

const SUGGESTIONS = ['Clinics', 'Doctors', 'Ayurveda Clinics', 'Cardio'];

const TYPE_IMAGES: Record<string, string> = {
  Specialty: 'https://placehold.co/56x56/EAF3FF/2879E4/png',
  Doctor: 'https://placehold.co/56x56/F0FFF4/22C55E/png',
  Hospital: 'https://placehold.co/56x56/FFF7ED/F97316/png',
};

type Item = {
  id: string;
  name: string;
  type: string;
  subType?: string;
  address?: string;
};

const DATA: Item[] = [
  { id: 's1', name: 'Cardiologist', type: 'Specialty' },
  { id: 's2', name: 'Dermatologist', type: 'Specialty' },
  { id: 's3', name: 'Pediatrician', type: 'Specialty' },
  { id: 's4', name: 'Orthopaedics', type: 'Specialty' },
  { id: 's5', name: 'Neurologist', type: 'Specialty' },
  { id: 's6', name: 'Gynaecologist', type: 'Specialty' },
  { id: 's7', name: 'Ophthalmologist', type: 'Specialty' },
  { id: 's8', name: 'ENT specialst', type: 'Specialty' },
  { id: 'd1', name: 'Dr. Rodger Struck', type: 'Doctor', subType: 'Cardiologist', address: 'Sunrise Hospital, Kakkanad' },
  { id: 'd2', name: 'Dr. Priya Sharma', type: 'Doctor', subType: 'Dermatologist', address: 'Sunrise Hospital, Kakkanad' },
  { id: 'd3', name: 'Dr. Anil Mehta', type: 'Doctor', subType: 'Neurologist', address: 'Sunrise Hospital, Kakkanad' },
  { id: 'd4', name: 'Dr. Sarah Khan', type: 'Doctor', subType: 'Pediatrician', address: 'Sunrise Hospital, Kakkanad' },
  { id: 'h1', name: 'Sunrise Hospital', type: 'Hospital', subType: 'Clinic', address: 'Kakkanad, Kochi - 682030' },
  { id: 'h2', name: 'Apollo Clinic', type: 'Hospital', subType: 'Clinic', address: 'Kakkanad, Kochi - 682030' },
  { id: 'h3', name: 'Fortis Health', type: 'Hospital', subType: 'Clinic', address: 'Kakkanad, Kochi - 682030' },
  { id: 'h4', name: 'Max Care Centre', type: 'Hospital', subType: 'Clinic', address: 'Kakkanad, Kochi - 682030' },
  { id: 'h5', name: 'Narayana Health', type: 'Hospital', subType: 'Clinic', address: 'Kakkanad, Kochi - 682030' },
];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? DATA.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : DATA;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrow width={SIZE(26)} height={SIZE(26)} />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder='Search for "Skin Doctor"'
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      {query.trim() ? (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          style={{ backgroundColor: colors.backgroundGrey }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <Image
                source={{ uri: TYPE_IMAGES[item.type] }}
                style={[styles.itemImage, item.type === 'Doctor' && styles.itemImageCircle]}
              />
              <View style={styles.cardContent}>
                <Text allowFontScaling={false} style={styles.resultName}>{item.name}</Text>
                {item.type === 'Hospital' || item.type === 'Doctor' ? (
                  <Text allowFontScaling={false} style={styles.meta}>
                    {item.subType}
                    <Text allowFontScaling={false} style={styles.sep}>  |  </Text>
                    {item.address}
                  </Text>
                ) : (
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text allowFontScaling={false} style={styles.viewAll}>View All</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => null}
        />
      ) : (
        <View style={styles.suggestionsBox}>
          <Text allowFontScaling={false} style={styles.suggestionsTitle}>Search suggestions</Text>
          {SUGGESTIONS.map(s => (
            <TouchableOpacity key={s} style={styles.suggestionRow} activeOpacity={0.7} onPress={() => {
              if (s.toLowerCase() === 'cardio') {
                (navigation as any).navigate('SpecialstDetail', { name: 'Cardiologist', desc: '', clinics: 0, doctors: 0 });
              } else {
                navigation.navigate('SearchResult', { title: s });
              }
            }}>
              <SearchIcon width={SIZE(18)} height={SIZE(18)} />
              <Text allowFontScaling={false} style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(12),
    gap: SIZE(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  searchWrapper: { flex: 1 },
  backBtn: { padding: SIZE(4) },
  list: { paddingHorizontal: SIZE(16), paddingBottom: SIZE(24), paddingTop: SIZE(8) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZE(10),
    paddingHorizontal: SIZE(12),
    gap: SIZE(14),
    backgroundColor: colors.white,
    borderRadius: SIZE(12),
    marginBottom: SIZE(8),
  },
  itemImage: {
    width: SIZE(56),
    height: SIZE(56),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
  },
  itemImageCircle: {
    borderRadius: SIZE(28),
  },
  cardContent: { flex: 1, gap: SIZE(4) },
  resultName: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(14), color: colors.textPrimary },
  meta: { fontFamily: 'Manrope-Regular', fontSize: SIZE(12), color: colors.textSecondary },
  sep: { color: colors.border },
  viewAll: { fontFamily: 'Manrope-Medium', fontSize: SIZE(12), color: colors.accent },
  separator: { height: 0 },
  suggestionsBox: {
    backgroundColor: colors.white,
    paddingHorizontal: SIZE(16),
    paddingTop: SIZE(16),
    paddingBottom: SIZE(8),
    marginBottom: SIZE(8),
    borderRadius: SIZE(12),
  },
  suggestionsTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: '#1C1E22',
    marginBottom: SIZE(8),
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    paddingVertical: SIZE(12),
  },
  suggestionText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: '#494F5A',
  },
});
