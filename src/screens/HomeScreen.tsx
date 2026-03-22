import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, FlatList, Animated, StatusBar, Platform } from 'react-native';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import NotificationIcon from '../assets/icons/notification-icon-grey.svg';
import LocationIcon from '../assets/icons/location-icon.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import PhoneIcon from '../assets/icons/phone-icon.svg';
import MapIcon from '../assets/icons/map-icon.svg';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const CLINICS = [
  { id: '1', name: 'Apollo Clinic', speciality: 'Multi-speciality', location: 'Bandra, Mumbai', image: 'https://placehold.co/92x92/png' },
  { id: '2', name: 'Fortis Health', speciality: 'Cardiology', location: 'Andheri, Mumbai', image: 'https://placehold.co/92x92/png' },
  { id: '3', name: 'Max Care', speciality: 'Dermatology', location: 'Powai, Mumbai', image: 'https://placehold.co/92x92/png' },
  { id: '4', name: 'Narayana Health', speciality: 'Orthopaedics', location: 'Thane, Mumbai', image: 'https://placehold.co/92x92/png' },
];

const ListHeader = ({ onTokenPress }: { onTokenPress: () => void }) => (
  <>
    <View style={styles.bannerCard}>
      {Platform.OS === 'android' && (
        <Video
          source={require('../assets/images/background-video.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat
          muted
          disableFocus
        />
      )}
      <TouchableOpacity activeOpacity={0.7} onPress={onTokenPress}>
        <View style={styles.livebadge}>
          <View style={styles.greenDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
        <View style={styles.tokenCenter}>
          <Text style={styles.tokenLabel}>Your Token Number</Text>
          <Text style={styles.tokenNumber}>42</Text>
          <Text style={styles.tokenEst}>Estimated 2:30pm</Text>
          <View style={styles.tokenRow}>
            <View style={styles.tokenSide}>
              <Text style={styles.tokenSideNum}>38</Text>
            </View>
            <View style={styles.tokenCurrent}>
              <Text style={styles.tokenCurrentNum}>39</Text>
            </View>
            <View style={styles.tokenSide}>
              <Text style={styles.tokenSideNum}>40</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.hospitalStrip}>
        <View style={styles.hospitalTop}>
          <View style={styles.hospitalLeft}>
            <View style={styles.hospitalAvatar} />
            <View>
              <Text style={styles.hospitalName}>Sunrise Hospital</Text>
              <Text style={styles.hospitalType}>Multi Speciality</Text>
            </View>
          </View>
          <View style={styles.hospitalActions}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <PhoneIcon width={SIZE(22)} height={SIZE(22)} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <MapIcon width={SIZE(22)} height={SIZE(22)} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.hospitalBottom}>
          <Text style={styles.doctorName}>Dr. Rodger Struck</Text>
          <Text style={styles.hospitalSep}> | </Text>
          <Text style={styles.doctorSpeciality}>Cardiologist</Text>
        </View>
      </View>
    </View>
    <View style={styles.cardsRow}>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Text style={styles.cardTitle}>All specialist</Text>
        <View style={styles.iconsRow}>
          {[0, 1, 2].map(i => <View key={i} style={styles.iconBox} />)}
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Text style={styles.cardTitle}>All doctors</Text>
        <View style={styles.avatarRow}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.avatarCircle, { marginLeft: i === 0 ? 0 : -SIZE(12) }]} />
          ))}
          <Text style={styles.avatarCount}>42+</Text>
        </View>
      </TouchableOpacity>
    </View>
    {/* <View style={styles.featuredSection}> */}
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Featured</Text>
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={styles.viewAll}>See all</Text>
      </TouchableOpacity>
    </View>
    {/* </View> */}
  </>
);

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/aptly-logo.png')} style={styles.logo} />
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
          <NotificationIcon width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
      </View>

      {/* Search - stays fixed */}
      <View style={styles.searchWrapper}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Search')}>
          <SearchBar placeholder='Search for "Skin Doctor"' editable={false} />
        </TouchableOpacity>
      </View>

      {/* Everything below scrolls */}
      <FlatList
        data={CLINICS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader onTokenPress={() => navigation.navigate('TokenDetail')} />}
        // style={styles.flatList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.clinicCard} activeOpacity={0.8}>
            <Image source={{ uri: item.image }} style={styles.clinicImage} />
            <View style={styles.clinicInfo}>
              <View>
                <Text style={styles.clinicName}>{item.name}</Text>
                <Text style={styles.clinicSpeciality}>{item.speciality}</Text>
              </View>
              <View style={styles.locationRow}>
                <LocationIcon width={SIZE(14)} height={SIZE(14)} />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <ArrowRight width={SIZE(18)} height={SIZE(18)} />
            </View>
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
    paddingHorizontal: SIZE(24),
    paddingVertical: SIZE(8),
    marginBottom: SIZE(10),
  },
  logo: { width: 94, height: SIZE(32), resizeMode: 'contain' },
  notifBtn: {
    width: SIZE(22) + 12,
    height: SIZE(22) + 12,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: { paddingHorizontal: SIZE(18), marginBottom: SIZE(20) },
  bannerCard: {
    marginHorizontal: SIZE(18),
    marginBottom: SIZE(20),
    height: 323,
    borderRadius: SIZE(18),
    backgroundColor: colors.primary,
    padding: SIZE(10),
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  livebadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: SIZE(20),
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(4),
    gap: SIZE(6),
  },
  greenDot: {
    width: SIZE(8),
    height: SIZE(8),
    borderRadius: SIZE(4),
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.white,
  },
  tokenCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(6),
    paddingVertical: SIZE(8),
  },
  tokenLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.borderMuted,
  },
  tokenNumber: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(72),
    color: colors.white,
    lineHeight: SIZE(68),
  },
  tokenEst: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(10),
    color: colors.white,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
  },
  tokenSide: {
    alignItems: 'center',
    opacity: 0.6,
  },
  tokenSideNum: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.white,
  },
  tokenCurrent: {
    alignItems: 'center',
    paddingHorizontal: SIZE(4),
  },
  tokenCurrentNum: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(31),
    color: colors.white,
  },
  hospitalStrip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: SIZE(12),
    padding: SIZE(12),
    marginTop: SIZE(8),
  },
  hospitalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZE(15),
  },
  hospitalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
  },
  hospitalAvatar: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(20),
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  hospitalName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(13),
    color: colors.white,
  },
  hospitalType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: 'rgba(255,255,255,0.7)',
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: SIZE(8),
  },
  actionBtn: {
    width: SIZE(32),
    height: SIZE(32),
    borderRadius: SIZE(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  hospitalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.white,
  },
  hospitalSep: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: 'rgba(255,255,255,0.5)',
  },
  doctorSpeciality: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: 'rgba(255,255,255,0.8)',
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZE(18),
    gap: SIZE(12),
    marginBottom: SIZE(20),
  },
  card: {
    flex: 1,
    borderRadius: SIZE(22),
    padding: SIZE(18),
    backgroundColor: '#F3F5F7',
  },
  cardTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
    marginBottom: SIZE(18),
  },
  iconsRow: { flexDirection: 'row', gap: SIZE(8) },
  iconBox: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(10),
    backgroundColor: colors.white,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(20),
    backgroundColor: colors.backgroundLight,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarCount: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textSecondary,
    marginLeft: SIZE(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    // marginBottom: SIZE(12),
    backgroundColor: '#F3F5F733',
  },
  sectionTitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  viewAll: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.primary,
  },
  listContent: {
    paddingBottom: SIZE(24),
    gap: SIZE(12),
  },
  clinicCard: {
    flexDirection: 'row',
    marginHorizontal: SIZE(18),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: '#F1F2F4',
    backgroundColor: colors.white,
    padding: SIZE(4),
    gap: SIZE(12),
    alignItems: 'center',

  },
  clinicImage: {
    width: 92,
    height: 92,
    borderRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
  },
  clinicInfo: { flex: 1, justifyContent: 'space-between', alignSelf: 'stretch', paddingVertical: SIZE(7) },
  clinicName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  clinicSpeciality: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SIZE(4), marginTop: SIZE(2) },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(10),
    color: colors.textSecondary,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: SIZE(12),
  },
});
