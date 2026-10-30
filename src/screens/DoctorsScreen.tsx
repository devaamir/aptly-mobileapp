import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import DoctorCard from '../components/DoctorCard';
import FilterModal from '../components/FilterModal';
import DistancePicker from '../components/DistancePicker';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import SearchIcon from '../assets/icons/search-icon.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import { getDoctors, Doctor } from '../services/api';
import { doctorsMeta, BASE_URL } from '../utils/seo';
import { signalPrerenderReady } from '../utils/prerenderReady';
import { useLocation } from '../context/LocationContext';
import { getDistance } from '../utils/getDistance';

type Props = NativeStackScreenProps<RootStackParamList, 'Doctors'>;

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export default function DoctorsScreen({ navigation }: Props) {
  const { location: userLocation, distance, setDistance } = useLocation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [fallbackDoctors, setFallbackDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({ specialties: [], availability: [], type: [] });

  const fetchDoctors = (pageNum: number, isRefresh = false) => {
    console.log('[DoctorsScreen] fetchDoctors called', {
      pageNum,
      isRefresh,
      userLocation: userLocation
        ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
        : null,
      distance,
    });
    if (pageNum === 1) {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
    } else {
      setLoadingMore(true);
    }
    getDoctors(
      pageNum,
      20,
      userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radius: distance,
          }
        : undefined,
    )
      .then(res => {
        console.log('[DoctorsScreen] getDoctors response — count:', res.data.length, 'page:', pageNum);
        if (pageNum === 1) {
          setDoctors(res.data);
        } else {
          setDoctors(prev => [...prev, ...res.data]);
        }
        setHasMore(res.pagination.hasNextPage);
        setPage(pageNum);
        if (pageNum === 1 && res.data.length === 0) {
          console.log('[DoctorsScreen] no doctors in radius, fetching fallback list');
          getDoctors(1, 10)
            .then(fb => {
              console.log('[DoctorsScreen] fallback getDoctors response — count:', fb.data.length);
              setFallbackDoctors(fb.data);
            })
            .catch(err => {
              console.warn('[DoctorsScreen] fallback fetch error:', err);
            });
        } else if (pageNum === 1) {
          setFallbackDoctors([]);
        }
      })
      .catch(err => {
        console.warn('[DoctorsScreen] fetchDoctors error:', err);
      })
      .finally(() => {
        console.log('[DoctorsScreen] fetchDoctors complete');
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        signalPrerenderReady();
      });
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore && doctors.length > 0) {
      fetchDoctors(page + 1);
    }
  };

  useEffect(() => {
    console.log('[DoctorsScreen] location/distance changed — re-fetching', {
      userLocation: userLocation
        ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
        : null,
      distance,
    });
    setPage(1);
    setHasMore(true);
    fetchDoctors(1);
  }, [userLocation, distance]);

  return (
    <SafeAreaView style={styles.container}>
      <Helmet>
        <title>{doctorsMeta.title}</title>
        <meta name="description" content={doctorsMeta.description} />
        <meta property="og:title" content={doctorsMeta.title} />
        <meta property="og:description" content={doctorsMeta.description} />
        <link rel="canonical" href={`${BASE_URL}/Doctors`} />
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

        {/* Location + Distance container */}
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
            {userLocation ? userLocation.mainText : 'Select location'}
          </Text>
          <DownArrowGrey width={SIZE(14)} height={SIZE(14)} style={{ flexShrink: 0 }} />
          <View style={styles.locationDivider} />
          <DistancePicker value={distance} onChange={setDistance} />
        </TouchableOpacity>

        {/* Right actions */}
        <View style={styles.headerRight}>
          <FilterModal
            applied={appliedFilters}
            onApply={setAppliedFilters}
            triggerOnly
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Search')}
          >
            <SearchIcon width={SIZE(22)} height={SIZE(22)} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Applied filter chips */}
      <View style={styles.chipsContainer}>
        <FilterModal
          applied={appliedFilters}
          onApply={setAppliedFilters}
          chipsOnly
        />
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: SIZE(40) }}
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setPage(1);
                setHasMore(true);
                fetchDoctors(1, true);
              }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: SIZE(16) }}
                color={colors.primary}
              />
            ) : null
          }
          renderItem={({ item, index }) => {
            const specialty = item.specialties.map(s => s.name).join(', ');
            const hospital = item.medicalCenters[0]?.name ?? '';
            const clinicType = item.medicalCenters[0]?.type ?? '';
            const location = item.medicalCenters[0]
              ? `${item.medicalCenters[0].address}`
              : '';
            const allSchedules = item.medicalCenters.flatMap(
              mc => mc.schedules ?? [],
            );
            const today = DAYS[new Date().getDay()];
            const todaySchedule = allSchedules.find(s => s.dayOfWeek === today);
            const nextSchedule = todaySchedule ?? allSchedules[0];
            const isLastOdd = doctors.length % 2 !== 0 && index === doctors.length - 1;
            return (
              <View style={[styles.gridItem, isLastOdd && styles.gridItemHalf]}>
                <DoctorCard
                  name={item.name}
                  type={specialty}
                  hospital={hospital}
                  clinicType={clinicType}
                  location={location}
                  distance={(() => {
                    const mc = item.medicalCenters[0];
                    return userLocation && mc
                      ? getDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          mc.latitude,
                          mc.longitude,
                        )
                      : undefined;
                  })()}
                  experience={`${item.yearsOfExperience} yrs exp`}
                  image={item.profilePicture}
                  nextSchedule={nextSchedule}
                  onPress={() =>
                    navigation.navigate('DoctorDetail', { doctorId: item.id })
                  }
                  onBookPress={() =>
                    navigation.navigate('BookAppointment', {
                      doctor: item,
                      clinicId: item.medicalCenters[0]?.id,
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
                    <Text
                      allowFontScaling={false}
                      style={styles.emptyCardTitle}
                      numberOfLines={2}
                    >
                      We're Still Growing Here
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.emptyCardSubtitle}
                      numberOfLines={2}
                    >
                      No doctors within this area. Explore other available
                      doctors below.
                    </Text>
                    <View style={styles.emptyCardBtn}>
                      <Text
                        allowFontScaling={false}
                        style={styles.emptyCardBtnText}
                      >
                        Use another location
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              {fallbackDoctors.length > 0 && (
                <Text allowFontScaling={false} style={styles.fallbackHeading}>
                  Available doctors
                </Text>
              )}
              <View style={styles.fallbackGrid}>
                {fallbackDoctors.map((item, idx) => {
                  const specialty = item.specialties.map(s => s.name).join(', ');
                  const hospital = item.medicalCenters[0]?.name ?? '';
                  const clinicType = item.medicalCenters[0]?.type ?? '';
                  const location = item.medicalCenters[0]
                    ? `${item.medicalCenters[0].address}`
                    : '';
                  const allSchedules = item.medicalCenters.flatMap(
                    mc => mc.schedules ?? [],
                  );
                  const today = DAYS[new Date().getDay()];
                  const todaySchedule = allSchedules.find(
                    s => s.dayOfWeek === today,
                  );
                  const nextSchedule = todaySchedule ?? allSchedules[0];
                  const isLastOdd = fallbackDoctors.length % 2 !== 0 && idx === fallbackDoctors.length - 1;
                  return (
                    <View key={item.id} style={[styles.fallbackGridItem, isLastOdd && styles.fallbackGridItemHalf]}>
                      <DoctorCard
                        name={item.name}
                        type={specialty}
                        hospital={hospital}
                        clinicType={clinicType}
                        location={location}
                        distance={(() => {
                          const mc = item.medicalCenters[0];
                          return userLocation && mc
                            ? getDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                mc.latitude,
                                mc.longitude,
                              )
                            : undefined;
                        })()}
                        experience={`${item.yearsOfExperience} yrs exp`}
                        image={item.profilePicture}
                        nextSchedule={nextSchedule}
                        onPress={() =>
                          navigation.navigate('DoctorDetail', {
                            doctorId: item.id,
                          })
                        }
                        onBookPress={() =>
                          navigation.navigate('BookAppointment', {
                            doctor: item,
                            clinicId: item.medicalCenters[0]?.id,
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
  searchWrapper: { paddingHorizontal: SIZE(18), marginBottom: SIZE(20) },
  listContent: {
    paddingTop: SIZE(12),
    paddingBottom: SIZE(24),
    gap: SIZE(12),
    paddingHorizontal: SIZE(20),
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
  },  fallbackGrid: {
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
  chipsContainer: {
    paddingHorizontal: SIZE(20),
    paddingTop: SIZE(8),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1240,
  },
  emptyContainer: {
    paddingTop: SIZE(16),
    paddingBottom: SIZE(12),
  },
  fallbackItem: {
    marginBottom: SIZE(12),
  },
  fallbackHeading: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    paddingTop: SIZE(8),
    paddingBottom: SIZE(4),
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
    backgroundColor: colors.filterBg,
    paddingHorizontal: SIZE(8),
    paddingVertical: SIZE(8),
    borderRadius: 46,
  },
  filterText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.dark,
  },
});
