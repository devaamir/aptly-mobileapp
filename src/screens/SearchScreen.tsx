import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import SearchBar from '../components/SearchBar';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import { searchAll, Doctor, Clinic } from '../services/api';

const SUGGESTIONS = ['Clinics', 'Doctors', 'Ayurveda Clinics', 'Cardio'];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Doctor | Clinic)[]>([]);
  const [loading, setLoading] = useState(false);
  const [coords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      searchAll(query).then(res => setResults(res.data)).finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

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
        loading ? (
          <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            style={{ backgroundColor: colors.backgroundGrey }}
            ListEmptyComponent={<Text allowFontScaling={false} style={styles.empty}>No results found</Text>}
            renderItem={({ item }) => {
              const isDoctor = (item as any).type === 'doctor';
              return (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => isDoctor
                    ? navigation.navigate('DoctorDetail', { doctorId: item.id })
                    : navigation.navigate('HospitalDetail', { id: item.id, name: item.name, specialty: (item as Clinic).specialties[0]?.name ?? '', location: (item as Clinic).address })
                  }>
                  <View style={[styles.itemImage, isDoctor && styles.itemImageCircle]}>
                    {(item as any).profilePicture
                      ? <Image source={{ uri: (item as any).profilePicture }} style={{ width: '100%', height: '100%' }} />
                      : null}
                  </View>
                  <View style={styles.cardContent}>
                    <Text allowFontScaling={false} style={styles.resultName}>{item.name}</Text>
                    <Text allowFontScaling={false} style={styles.meta}>
                      {isDoctor
                        ? (item as Doctor).specialties[0]?.name ?? ''
                        : (item as Clinic).specialties[0]?.name ?? (item as Clinic).type}
                    </Text>
                    <View style={styles.locationRow}>
                      <LocationIcon width={SIZE(11)} height={SIZE(11)} />
                      <Text allowFontScaling={false} style={styles.locationText} numberOfLines={1}>
                        {isDoctor
                          ? (item as Doctor).medicalCenters[0]?.name ?? (item as Doctor).address
                          : `${(item as Clinic).district}, ${(item as Clinic).state}`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : (
        <View style={styles.suggestionsBox}>
          <Text allowFontScaling={false} style={styles.suggestionsTitle}>Search suggestions</Text>
          {SUGGESTIONS.map(s => (
            <TouchableOpacity key={s} style={styles.suggestionRow} activeOpacity={0.7} onPress={() => {
              if (s.toLowerCase() === 'cardio') {
                navigation.navigate('SpecialstDetail', { name: 'Cardiologist', id: '', desc: '', clinics: 0, doctors: 0 });
              } else {
                navigation.navigate('SearchResult', { title: s, ...coords, radius: 30 });
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
    overflow: 'hidden',
  },
  itemImageCircle: { borderRadius: SIZE(28) },
  cardContent: { flex: 1, gap: SIZE(4) },
  resultName: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(14), color: colors.textPrimary },
  meta: { fontFamily: 'Manrope-Regular', fontSize: SIZE(12), color: colors.textSecondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SIZE(4), marginTop: SIZE(2) },
  locationText: { fontFamily: 'Manrope-Regular', fontSize: SIZE(11), color: colors.textMuted, flex: 1 },
  empty: { fontFamily: 'Manrope-Regular', fontSize: SIZE(14), color: colors.textMuted, textAlign: 'center', marginTop: SIZE(40) },
  suggestionsBox: {
    backgroundColor: colors.white,
    paddingHorizontal: SIZE(16),
    paddingTop: SIZE(16),
    paddingBottom: SIZE(8),
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
