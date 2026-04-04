import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import { getSpecialities, Speciality } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Specialist'>;

export default function SpecialistScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpecialities()
      .then(res => setSpecialities(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = specialities.filter(s =>
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
        <Text allowFontScaling={false} style={styles.title}>All Specialists</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchBar placeholder="Search specialists..." value={query} onChangeText={setQuery} style={{ borderWidth: 0 }} />
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('SpecialistDetail', { name: item.name, desc: item.description, clinics: 0, doctors: 0 })}>
              <Image source={{ uri: item.icon }} style={styles.avatar} />
              <View style={styles.info}>
                <Text allowFontScaling={false} style={styles.name}>{item.name}</Text>
                <Text allowFontScaling={false} style={styles.desc}>{item.description}</Text>
              </View>
              <ArrowRight width={SIZE(18)} height={SIZE(18)} />
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
