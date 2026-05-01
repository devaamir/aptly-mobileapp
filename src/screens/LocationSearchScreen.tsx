import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, TextInput, ActivityIndicator, Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import LocationIcon from '../assets/icons/location-black-icon.svg';
import GpsIcon from '../assets/icons/gps-icon.svg';
import { searchLocations, reverseGeocode } from '../services/api';
import { useLocation } from '../context/LocationContext';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from '../utils/requestLocationPermission';

const POPULAR_PLACES = [
  'Manjeri',
  'Perinthalmanna',
  'Tirur',
  'Kondotty',
  'Malappuram Town',
  'Ponnani',
  'Kottakkal',
  'Nilambur',
  'Wandoor',
  'Tanur',
];

type Props = NativeStackScreenProps<RootStackParamList, 'LocationSearch'>;
type Location = { description: string; placeId: string; latitude: number; longitude: number; mainText: string; secondaryText: string };

export default function LocationSearchScreen({ navigation }: Props) {
  const { setLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleSelect = (item: Location) => {
    console.log(item);

    setLocation({ mainText: item.mainText, secondaryText: item.secondaryText, latitude: item.latitude, longitude: item.longitude, isGps: false });
    navigation.goBack();
  };

  const handleGps = async () => {
    if (Platform.OS === 'web') {
      await requestLocationPermission();
    } else if (Platform.OS === 'android') {
      const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (!status) {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location permission in Settings to use this feature.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
          return;
        }
      }
    }
    setGpsLoading(true);
    Geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        let mainText = 'Current Location';
        let secondaryText = '';
        try {
          const res = await reverseGeocode(latitude, longitude);
          mainText = res.data.name;
          secondaryText = res.data.address;
        } catch { /* fallback to defaults */ }
        setLocation({ mainText, secondaryText, latitude, longitude, isGps: true });
        setGpsLoading(false);
        navigation.goBack();
      },
      () => { setGpsLoading(false); },
      { timeout: 8000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      searchLocations(query)
        .then(res => setResults(res.data))
        .catch(() => { })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <LocationIcon width={SIZE(18)} height={SIZE(18)} />
          <TextInput
            allowFontScaling={false}
            style={styles.input}
            placeholder="Search location..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={loading ? [] : results}
        keyExtractor={item => item.placeId}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Current Location Button */}
            <TouchableOpacity style={styles.currentLocationBtn} activeOpacity={0.7} onPress={handleGps} disabled={gpsLoading}>
              {gpsLoading
                ? <ActivityIndicator size={SIZE(18)} color={colors.primary} />
                : <GpsIcon width={SIZE(18)} height={SIZE(18)} />}
              <Text allowFontScaling={false} style={styles.currentLocationText}>Choose your current location</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Popular Places — only show when not searching */}
            {!query.trim() && (
              <>
                <Text allowFontScaling={false} style={styles.sectionTitle}>Popular Places</Text>
                {POPULAR_PLACES.map(place => (
                  <TouchableOpacity key={place} style={styles.row} activeOpacity={0.7} disabled={!!popularLoading} onPress={() => {
                    setPopularLoading(place);
                    searchLocations(place)
                      .then(res => { if (res.data[0]) handleSelect(res.data[0]); })
                      .catch(() => { })
                      .finally(() => setPopularLoading(null));
                  }}>
                    {popularLoading === place
                      ? <ActivityIndicator size={SIZE(16)} color={colors.primary} />
                      : <LocationIcon width={SIZE(16)} height={SIZE(16)} />}
                    <View style={{ flex: 1 }}>
                      <Text allowFontScaling={false} style={styles.rowText}>{place}</Text>
                      <Text allowFontScaling={false} style={styles.rowSub}>Malappuram, Kerala</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Separator before search results */}
            {results.length > 0 && <View style={styles.separator} />}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => handleSelect(item)}>
            <LocationIcon width={SIZE(16)} height={SIZE(16)} />
            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.rowText}>{item.mainText}</Text>
              <Text allowFontScaling={false} style={styles.rowSub}>{item.secondaryText}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={null}
        ListEmptyComponent={loading && query.trim() ? <ActivityIndicator style={{ marginTop: SIZE(20) }} color={colors.primary} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: SIZE(4)
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: SIZE(14),
    backgroundColor: colors.white,
    height: SIZE(48),
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: SIZE(18),
    paddingTop: SIZE(8),
    paddingBottom: SIZE(24)
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    paddingTop: SIZE(8),
    paddingBottom: SIZE(12),
  },
  currentLocationText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.primaryAccent,
  },
  sectionTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    marginTop: SIZE(12),
    marginBottom: SIZE(4),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    paddingVertical: SIZE(14),
  },
  rowText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  rowSub: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.subText,
    marginTop: SIZE(2),
  },
  separator: { height: 1, backgroundColor: colors.border },
});
