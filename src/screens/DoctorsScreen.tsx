import React, { useEffect, useState } from 'react';
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
import { getDoctors, getDoctor, Doctor } from '../services/api';
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
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({ specialties: [], availability: [], type: [] });

  const fetchDoctors = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    getDoctors(
      1,
      20,
      userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radius: distance,
          }
        : undefined,
    )
      .then(res =>
        Promise.all(res.data.map(d => getDoctor(d.id).then(r => r.data))),
      )
      .then(results => {
        setDoctors(results);
        if (results.length === 0) {
          // Fetch all doctors without location filter as fallback
          getDoctors(1, 20)
            .then(res =>
              Promise.all(res.data.map(d => getDoctor(d.id).then(r => r.data))),
            )
            .then(setFallbackDoctors)
            .catch(() => {});
        } else {
          setFallbackDoctors([]);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, [userLocation, distance]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>
          Doctors
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}
        >
          <SearchIcon width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
      </View>

      {/* Location & Filter */}
      <TouchableOpacity
        style={styles.locationBox}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('LocationSearch')}
      >
        <View style={styles.locationIconContainer}>
          <LocationIcon width={SIZE(20)} height={SIZE(20)} />
        </View>
        <Text
          allowFontScaling={false}
          style={styles.locationText}
          numberOfLines={1}
        >
          {userLocation ? userLocation.mainText : 'Select location'}
        </Text>
        <DistancePicker value={distance} onChange={setDistance} />
      </TouchableOpacity>
      <View style={styles.filterRow}>
        <FilterModal applied={appliedFilters} onApply={setAppliedFilters} />
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDoctors(true)} colors={[colors.primary]} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const specialty = item.specialties[0]?.name ?? '';
            const hospital = item.medicalCenters[0]?.name ?? '';
            const clinicType = item.medicalCenters[0]?.type ?? '';
            const location = item.medicalCenters[0]
              ? `${item.medicalCenters[0].address}`
              : '';
            const allSchedules = item.medicalCenters.flatMap(mc => mc.schedules ?? []);
            const today = DAYS[new Date().getDay()];
            const todaySchedule = allSchedules.find(s => s.dayOfWeek === today);
            const nextSchedule = todaySchedule ?? allSchedules[0];
            return (
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
                  navigation.navigate('BookAppointment', { doctor: item, clinicId: item.medicalCenters[0]?.id })
                }
              />
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
              {fallbackDoctors.map(item => {
                const specialty = item.specialties[0]?.name ?? '';
                const hospital = item.medicalCenters[0]?.name ?? '';
                const clinicType = item.medicalCenters[0]?.type ?? '';
                const location = item.medicalCenters[0]
                  ? `${item.medicalCenters[0].address}`
                  : '';
                const allSchedules = item.medicalCenters.flatMap(mc => mc.schedules ?? []);
                const today = DAYS[new Date().getDay()];
                const todaySchedule = allSchedules.find(s => s.dayOfWeek === today);
                const nextSchedule = todaySchedule ?? allSchedules[0];
                return (
                  <View key={item.id} style={styles.fallbackItem}>
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
              })}
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
  searchWrapper: { paddingHorizontal: SIZE(18), marginBottom: SIZE(20) },
  listContent: {
    paddingBottom: SIZE(24),
    gap: SIZE(12),
    paddingHorizontal: SIZE(20),
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(8),
    marginHorizontal: SIZE(18),
    marginVertical: SIZE(8),
    backgroundColor: colors.white,
  },
  locationIconContainer: {
    paddingVertical: SIZE(8),
    paddingRight: SIZE(12),
    borderRightWidth: 1,
    borderRightColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textPrimary,
    marginLeft: SIZE(10),
  },
  filterRow: {
    paddingHorizontal: SIZE(18),
    marginBottom: SIZE(8),
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
