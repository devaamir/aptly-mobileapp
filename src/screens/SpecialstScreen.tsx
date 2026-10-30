import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Image, ActivityIndicator } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import { useMetadata } from '../context/MetadataContext';
import { specialtiesMeta, BASE_URL } from '../utils/seo';
import { signalPrerenderReady } from '../utils/prerenderReady';

type Props = NativeStackScreenProps<RootStackParamList, 'specialst'>;

export default function SpecialstScreen({ navigation }: Props) {
  const { specialties } = useMetadata();
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Signal prerender.io once specialties have loaded from the API
  useEffect(() => {
    if (specialties.length > 0) {
      signalPrerenderReady();
    }
  }, [specialties.length]);

  const filtered = specialties.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Helmet>
        <title>{specialtiesMeta.title}</title>
        <meta name="description" content={specialtiesMeta.description} />
        <meta property="og:title" content={specialtiesMeta.title} />
        <meta property="og:description" content={specialtiesMeta.description} />
        <link rel="canonical" href={`${BASE_URL}/specialst`} />
      </Helmet>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <BackArrow width={SIZE(22)} height={SIZE(22)} />
          </TouchableOpacity>
          {!showSearch && (
            <Text allowFontScaling={false} style={styles.title}>All Specialties</Text>
          )}
        </View>

        {showSearch && (
          <SearchBar
            placeholder="Search specialties..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={styles.headerSearch}
          />
        )}

        <TouchableOpacity
          style={styles.searchBtn}
          activeOpacity={0.7}
          onPress={() => {
            setShowSearch(v => !v);
            if (showSearch) setQuery('');
          }}
        >
          {showSearch
            ? <Text allowFontScaling={false} style={styles.cancelText}>Cancel</Text>
            : <SearchIcon width={SIZE(22)} height={SIZE(22)} />
          }
        </TouchableOpacity>
      </View>

      {/* List */}
      {specialties.length === 0 ? (
        <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isLastOdd = filtered.length % 2 !== 0 && index === filtered.length - 1;
            return (
              <View style={[styles.gridItem, isLastOdd && styles.gridItemHalf]}>
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('SpecialstDetail', {
                    name: item.name,
                    id: item.id,
                    desc: item.description,
                    clinics: 0,
                    doctors: 0,
                  })}
                >
                  {item.icon?.toLowerCase().endsWith('.svg') ? (
                    <SvgUri uri={item.icon} width={SIZE(52)} height={SIZE(52)} style={styles.avatar} />
                  ) : (
                    <Image source={{ uri: item.icon }} style={styles.avatar} />
                  )}
                  <View style={styles.info}>
                    <Text allowFontScaling={false} style={styles.name}>{item.name}</Text>
                    <Text allowFontScaling={false} style={styles.desc}>{item.description}</Text>
                  </View>
                  <ArrowRight width={SIZE(18)} height={SIZE(18)} />
                </TouchableOpacity>
              </View>
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
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: SIZE(8),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
    flex: 1,
  },
  backBtn: {
    width: SIZE(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSearch: {
    flex: 1,
    height: SIZE(48),
  },
  searchBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.primary,
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: SIZE(16),
    paddingTop: SIZE(12),
    paddingBottom: SIZE(24),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1240,
    gap: SIZE(12),
  },
  columnWrapper: {
    gap: SIZE(12),
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(14),
    padding: SIZE(14),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorderLight,
    backgroundColor: colors.white,
  },
  gridItem: {
    flex: 1,
  },
  gridItemHalf: {
    flex: 0,
    flexBasis: 'calc(50% - 6px)' as any,
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
