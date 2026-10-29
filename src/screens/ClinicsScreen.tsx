import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import ClinicCard from '../components/ClinicCard';
import FilterModal from '../components/FilterModal';
import DistancePicker from '../components/DistancePicker';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import { getClinics, Clinic } from '../services/api';
import { clinicsMeta, BASE_URL } from '../utils/seo';
import { useLocation } from '../context/LocationContext';
import { getDistance } from '../utils/getDistance';
import { useMetadata } from '../context/MetadataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Clinics'>;

export default function ClinicsScreen({ navigation }: Props) {
  const { location, distance, setDistance } = useLocation();
  const { specialties: allSpecialties, medicalSystems } = useMetadata();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [fallbackClinics, setFallbackClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({ specialties: [], availability: [], type: [] });

  const fetchClinics = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const specialtyId = allSpecialties.find(s =>
      appliedFilters.specialties?.includes(s.name),
    )?.id;
    const medicalSystemId = medicalSystems.find(s =>
      appliedFilters.type?.includes(s.name),
    )?.id;
    Promise.all([
      getClinics(1, 20, {
        ...(location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              radius: distance,
            }
          : {}),
        ...(specialtyId ? { specialtyId } : {}),
        ...(medicalSystemId ? { medicalSystemId } : {}),
      }),
      getClinics(1, 20, {
        ...(specialtyId ? { specialtyId } : {}),
        ...(medicalSystemId ? { medicalSystemId } : {}),
      }),
    ])
      .then(([nearbyRes, fallbackRes]) => {
        setClinics(nearbyRes.data);
        setFallbackClinics(fallbackRes.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchClinics();
  }, [location, distance, appliedFilters]);

  return (
    <SafeAreaView style={styles.container}>
      <Helmet>
        <title>{clinicsMeta.title}</title>
        <meta name="description" content={clinicsMeta.description} />
        <meta property="og:title" content={clinicsMeta.title} />
        <meta property="og:description" content={clinicsMeta.description} />
        <link rel="canonical" href={`${BASE_URL}/Clinics`} />
      </Helmet>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('LocationSearch')}
        >
          <LocationIcon width={SIZE(16)} height={SIZE(16)} style={{ flexShrink: 0 }} />
          <Text
            allowFontScaling={false}
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location ? location.mainText : 'Select location'}
          </Text>
          <DownArrowGrey width={SIZE(14)} height={SIZE(14)} style={{ flexShrink: 0 }} />
          <View style={styles.locationDivider} />
          <DistancePicker value={distance} onChange={setDistance} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <FilterModal applied={appliedFilters} onApply={setAppliedFilters} triggerOnly />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Search')}
          >
            <SearchIcon width={SIZE(22)} height={SIZE(22)} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chipsContainer}>
        <FilterModal applied={appliedFilters} onApply={setAppliedFilters} chipsOnly />
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: SIZE(40) }}
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchClinics(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item, index }) => {
            const isLastOdd = clinics.length % 2 !== 0 && index === clinics.length - 1;
            return (
              <View style={[styles.gridItem, isLastOdd && styles.gridItemHalf]}>
                <ClinicCard
                  name={item.name}
                  subType={item.specialties[0]?.name ?? item.type}
                  specialties={item.specialties.map((s: { name: string }) => s.name)}
                  location={item.address}
                  image={item.profilePicture}
                  distance={
                    location
                      ? getDistance(location.latitude, location.longitude, item.latitude, item.longitude)
                      : undefined
                  }
                  onPress={() =>
                    navigation.navigate('HospitalDetail', {
                      id: item.id,
                      name: item.name,
                      specialty: item.specialties[0]?.name ?? '',
                      location: item.address,
                    })
                  }
                />
              </View>
            );
          }}
          ListEmptyComponent={
            <View>
              <View style={styles.emptyContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.emptyCard}
                  onPress={() => navigation.navigate('LocationSearch')}
                >
                  <Image
                    source={require('../assets/images/location-image.png')}
                    style={styles.emptyCardImage}
                  />
                  <View style={styles.emptyCardInfo}>
                    <Text allowFontScaling={false} style={styles.emptyCardTitle} numberOfLines={2}>
                      We're Still Growing Here
                    </Text>
                    <Text allowFontScaling={false} style={styles.emptyCardSubtitle} numberOfLines={2}>
                      No clinics within {distance} km. Explore the nearest available clinics below
                    </Text>
                    <View style={styles.emptyCardBtn}>
                      <Text allowFontScaling={false} style={styles.emptyCardBtnText}>
                        Use another location
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              {fallbackClinics.length > 0 && (
                <Text allowFontScaling={false} style={styles.fallbackHeading}>Available clinics</Text>
              )}
              <View style={styles.fallbackGrid}>
                {fallbackClinics.map((item, idx) => {
                  const isLastOdd = fallbackClinics.length % 2 !== 0 && idx === fallbackClinics.length - 1;
                  return (
                    <View key={item.id} style={[styles.fallbackGridItem, isLastOdd && styles.fallbackGridItemHalf]}>
                      <ClinicCard
                        name={item.name}
                        subType={item.specialties[0]?.name ?? item.type}
                        specialties={item.specialties.map((s: { name: string }) => s.name)}
                        location={item.address}
                        image={item.profilePicture}
                        distance={
                          location
                            ? getDistance(location.latitude, location.longitude, item.latitude, item.longitude)
                            : undefined
                        }
                        onPress={() =>
                          navigation.navigate('HospitalDetail', {
                            id: item.id,
                            name: item.name,
                            specialty: item.specialties[0]?.name ?? '',
                            location: item.address,
                          })
                        }
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          }
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
    gap: SIZE(10),
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: SIZE(32) },
  locationBtn: {
    flexShrink: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZE(10),
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(7),
    backgroundColor: colors.white,
  },
  locationText: {
    flexShrink: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  locationDivider: {
    width: 1,
    height: SIZE(18),
    backgroundColor: colors.border,
    marginHorizontal: SIZE(2),
    flexShrink: 0,
  },
  headerRight: {
    flexShrink: 0,
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
  },
  chipsContainer: {
    paddingHorizontal: SIZE(20),
    paddingTop: SIZE(8),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1240,
  },
  listContent: {
    paddingBottom: SIZE(24),
    paddingHorizontal: SIZE(16),
    paddingTop: SIZE(12),
    gap: SIZE(12),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1240,
  },
  columnWrapper: {
    gap: SIZE(12),
  },
  gridItem: {
    flex: 1,
  },
  gridItemHalf: {
    flex: 0,
    flexBasis: 'calc(50% - 6px)' as any,
  },
  fallbackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZE(12),
  },
  fallbackGridItem: {
    flex: 1,
    flexBasis: 'calc(50% - 6px)' as any,
  },
  fallbackGridItemHalf: {
    flex: 0,
    flexBasis: 'calc(50% - 6px)' as any,
  },

  emptyContainer: {
    paddingTop: SIZE(16),
    paddingBottom: SIZE(12),
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorderLight,
    backgroundColor: colors.white,
  },
  emptyCardImage: {
    width: SIZE(102),
    height: SIZE(102),
    borderTopLeftRadius: SIZE(10),
    borderBottomLeftRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
    resizeMode: 'cover',
  },
  emptyCardInfo: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(6),
  },
  emptyCardTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
    marginBottom: SIZE(2),
  },
  emptyCardSubtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
    marginBottom: SIZE(6),
  },
  emptyCardBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(6),
    borderRadius: SIZE(8),
  },
  emptyCardBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(11),
    color: colors.white,
  },
  fallbackHeading: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    paddingTop: SIZE(8),
    paddingBottom: SIZE(4),
  },
  fallbackItem: {
    marginBottom: SIZE(12),
  },
});
