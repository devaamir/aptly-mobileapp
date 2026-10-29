import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  Animated,
  StatusBar,
  Platform,
  RefreshControl,
  Linking,
  useWindowDimensions,
} from 'react-native';
import {
  Svg,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
} from 'react-native-svg';
import Geolocation from '@react-native-community/geolocation';
import { useLocation } from '../context/LocationContext';
import { getDistance } from '../utils/getDistance';
import { useTracking } from '../context/TrackingContext';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../navigations/Navigation';
import SearchBar from '../components/SearchBar';
import AnimatedSearchBar from '../components/AnimatedSearchBar';
import ClinicCard from '../components/ClinicCard';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import LocationIcon from '../assets/icons/location-icon.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import PhoneIcon from '../assets/icons/phone-icon.svg';
import PhoneIconBlue from '../assets/icons/phone-icon-blue.svg';
import MapIcon from '../assets/icons/map-icon.svg';
import MapIconBlue from '../assets/icons/map-icon-blue.svg';
import LocationSlashIcon from '../assets/icons/location-slash-icon.svg';
import DownArrowGrey from '../assets/icons/down-arrow-grey.svg';
import GooglePlayIcon from '../assets/icons/googleplay-icon.svg';
import AppStoreIcon from '../assets/icons/appstore-icon.svg';
import {
  getHomeData,
  IS_DEV,
  getClinics,
  Clinic,
  Appointment,
} from '../services/api';
import PrimaryButton from '../components/PrimaryButton';
import { usePWAInstall } from '../utils/usePWAInstall';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const ListHeader = ({
  onTokenPress,
  onspecialstPress,
  onDoctorsPress,
  onClinicsPress,
  spotlightAppt,
  activeAppointments,
  hasNearbyClinics,
  hasLocation,
  trackData,
  recommendedClinics,
  onClinicPress,
  userLocation,
}: {
  onTokenPress: (appt: Appointment) => void;
  onspecialstPress: () => void;
  onDoctorsPress: () => void;
  onClinicsPress: () => void;
  spotlightAppt: Appointment | null;
  activeAppointments: Appointment[];
  hasNearbyClinics: boolean;
  hasLocation: boolean;
  trackData: import('../services/api').TrackData | null;
  recommendedClinics: Clinic[];
  onClinicPress: (item: Clinic) => void;
  userLocation: { latitude: number; longitude: number } | null;
}) => {
  const { currentToken, prevToken, nextToken } = useTracking();
  const { width: screenWidth } = useWindowDimensions();
  const [completedAt, setCompletedAt] = useState<Record<string, number>>({});
  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(_now.getDate()).padStart(2, '0')}`;
  const nowMins = _now.getHours() * 60 + _now.getMinutes();
  const to12h = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}${
      h >= 12 ? 'pm' : 'am'
    }`;
  };

  useEffect(() => {
    activeAppointments.forEach(appt => {
      const live = trackData?.appointments.find(
        t => t.tokenNumber === appt.tokenNumber,
      );
      const status = live?.tokenStatus ?? appt.tokenStatus;
      if (status === 'completed' || status === 'done') {
        setCompletedAt(prev => {
          if (prev[appt.id] !== undefined) return prev;
          setTimeout(() => {
            setCompletedAt(p => {
              const next = { ...p };
              delete next[appt.id];
              return next;
            });
          }, 10000);
          return { ...prev, [appt.id]: Date.now() };
        });
      }
    });
  }, [trackData, activeAppointments]);

  const renderBannerCard = (appt: Appointment) => {
    const sseToken = trackData?.appointments.find(
      a => a.tokenNumber === appt.tokenNumber,
    );
    const isSkipped = sseToken?.tokenStatus === 'skipped';

    const apptIsLive =
      appt.appointmentDate === today &&
      (() => {
        const [sh, sm] = (appt.schedule?.startTime ?? '')
          .split(':')
          .map(Number);
        return nowMins >= sh * 60 + sm;
      })();

    const isMyTurn =
      apptIsLive && currentToken !== null && currentToken === appt.tokenNumber;
    const sseStatus = sseToken?.tokenStatus ?? appt.tokenStatus;
    const isRecentlyCompleted =
      (sseStatus === 'completed' || sseStatus === 'done') &&
      completedAt[appt.id] !== undefined;
    const apptToken = appt.tokenNumber ?? 0;
    const apptConsultMins = appt.doctor?.estimateConsultationTime ?? 15;
    const tokensAhead = apptIsLive
      ? Math.max(0, apptToken - (currentToken ?? 0))
      : 0;
    const apptEstTime = apptIsLive
      ? (() => {
          const est = new Date(
            Date.now() + tokensAhead * apptConsultMins * 60000,
          );
          const h = est.getHours(),
            m = est.getMinutes();
          return `${h % 12 || 12}:${String(m).padStart(2, '0')}${
            h >= 12 ? 'pm' : 'am'
          }`;
        })()
      : appt.schedule
      ? to12h(appt.schedule.startTime)
      : null;

    return (
      <View
        key={appt.id}
        style={[
          styles.bannerCard,
          !apptIsLive && { backgroundColor: colors.upcomingCardBg },
          activeAppointments.length > 1 && styles.bannerCardMulti,
        ]}
      >
        {apptIsLive && !isMyTurn && !isRecentlyCompleted && (
          <Video
            source={require('../assets/images/background-video.mp4')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat
            muted
            disableFocus
            pointerEvents="none"
          />
        )}
        {(isMyTurn || isRecentlyCompleted) && (
          <Svg
            style={StyleSheet.absoluteFill}
            width={screenWidth}
            height={323}
            pointerEvents="none"
          >
            <Defs>
              <SvgLinearGradient
                id={`turn-${appt.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <Stop offset="0" stopColor="#4EAD5C" stopOpacity="1" />
                <Stop offset="1" stopColor="#256B3A" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Rect
              width={screenWidth}
              height={323}
              fill={`url(#turn-${appt.id})`}
            />
          </Svg>
        )}
        {isSkipped && (
          <Image
            source={require('../assets/images/skipped-token-card.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            pointerEvents="none"
          />
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTokenPress(appt)}
          style={isRecentlyCompleted ? styles.completedTouchable : undefined}
        >
          <View
            style={[
              styles.livebadge,
              isSkipped && { backgroundColor: '#F23838' },
            ]}
          >
            <View
              style={[
                styles.greenDot,
                !apptIsLive && { backgroundColor: colors.primaryAccent },
                isSkipped && { backgroundColor: colors.white },
              ]}
            />
            <Text
              allowFontScaling={false}
              style={[styles.liveText, isSkipped && { color: colors.white }]}
            >
              {isSkipped
                ? 'Skipped'
                : isRecentlyCompleted
                ? 'Completed'
                : apptIsLive
                ? 'Live'
                : 'Upcoming'}
            </Text>
          </View>
          <View
            style={[
              styles.tokenCenter,
              isRecentlyCompleted && styles.tokenCenterCompleted,
            ]}
          >
            {isRecentlyCompleted ? (
              <>
                <Svg
                  width={SIZE(60)}
                  height={SIZE(60)}
                  viewBox="0 0 60 60"
                  pointerEvents="none"
                >
                  <Circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.2)" />
                  <Path
                    d="M18 30 L26 38 L42 22"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
                <Text allowFontScaling={false} style={styles.completedText}>
                  Consultation Completed
                </Text>
              </>
            ) : (
              <>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.tokenLabel,
                    !apptIsLive && {
                      color: colors.textPrimary,
                      marginTop: SIZE(20),
                    },
                  ]}
                >
                  Your Token
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.tokenNumber,
                    !apptIsLive && { color: colors.black },
                  ]}
                >
                  {apptToken || '--'}
                </Text>
                {apptEstTime && (
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.tokenEst,
                      !apptIsLive && { color: colors.textSecondary },
                    ]}
                  >
                    {apptIsLive ? `Estimated ${apptEstTime}` : 'Scheduled for'}
                  </Text>
                )}
                {!apptIsLive && appt.appointmentDate && (
                  <Text allowFontScaling={false} style={styles.scheduledDate}>
                    {new Date(appt.appointmentDate).toLocaleDateString(
                      'en-US',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      },
                    )}
                    {appt.schedule
                      ? `, ${to12h(appt.schedule.startTime)} - ${to12h(
                          appt.schedule.stopTime,
                        )}`
                      : ''}
                  </Text>
                )}
                {apptIsLive && (
                  <View style={styles.tokenRow}>
                    <View style={styles.tokenSide}>
                      <Text
                        allowFontScaling={false}
                        style={styles.tokenSideNum}
                      >
                        {prevToken ?? ''}
                      </Text>
                    </View>
                    <View style={styles.tokenCurrent}>
                      <Text
                        allowFontScaling={false}
                        style={styles.tokenCurrentNum}
                      >
                        {currentToken ?? ''}
                      </Text>
                    </View>
                    <View style={styles.tokenSide}>
                      <Text
                        allowFontScaling={false}
                        style={styles.tokenSideNum}
                      >
                        {nextToken ?? ''}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
        <View
          style={[
            styles.hospitalStrip,
            !apptIsLive && { backgroundColor: colors.white },
          ]}
        >
          <View style={styles.hospitalTop}>
            <View style={styles.hospitalLeft}>
              <Image
                source={{ uri: appt.medicalCenter?.profilePicture }}
                style={styles.hospitalAvatar}
              />
              <View>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.hospitalName,
                    !apptIsLive && { color: colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {appt.medicalCenter?.name ?? 'No appointment'}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.doctorName,
                    !apptIsLive && { color: colors.textSecondary },
                  ]}
                >
                  {appt.doctor?.name ?? ''}
                </Text>
              </View>
            </View>
            <View style={styles.hospitalActions}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  !apptIsLive && { backgroundColor: colors.backgroundSubtle },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  appt.medicalCenter?.phoneNumber &&
                  Linking.openURL(`tel:${appt.medicalCenter.phoneNumber}`)
                }
              >
                {apptIsLive ? (
                  <PhoneIcon width={SIZE(22)} height={SIZE(22)} />
                ) : (
                  <PhoneIconBlue width={SIZE(22)} height={SIZE(22)} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  !apptIsLive && { backgroundColor: colors.backgroundSubtle },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  appt.medicalCenter?.latitude &&
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${appt.medicalCenter.latitude},${appt.medicalCenter.longitude}`,
                  )
                }
              >
                {apptIsLive ? (
                  <MapIcon width={SIZE(22)} height={SIZE(22)} />
                ) : (
                  <MapIconBlue width={SIZE(22)} height={SIZE(22)} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.hospitalBottom}>
            {/* <Text
              allowFontScaling={false}
              style={[
                styles.doctorName,
                !apptIsLive && { color: colors.textPrimary },
              ]}
            >
              {appt.doctor?.name ?? ''}
            </Text> */}
            {/* {appt.doctor?.specialties?.[0]?.name && (
              <>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.hospitalSep,
                    !apptIsLive && { color: colors.textSecondary },
                  ]}
                >
                  {' '}
                  |{' '}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.doctorSpecialty,
                    !apptIsLive && { color: colors.textSecondary },
                  ]}
                >
                  {appt.doctor.specialties[0].name}
                </Text>
              </>
            )} */}
            <Text
              allowFontScaling={false}
              style={[
                styles.patientName,
                !apptIsLive && { color: colors.textSecondary },
              ]}
            >
              {'Patient: '}
              {appt.patient?.name ?? ''}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const isDone = (a: Appointment) => {
    const live = trackData?.appointments.find(
      t => t.tokenNumber === a.tokenNumber,
    );
    const status = live?.tokenStatus ?? a.tokenStatus;
    return (
      status === 'completed' || status === 'done' || status === 'cancelled'
    );
  };

  const now = Date.now();
  const visibleAppointments = activeAppointments.filter(a => {
    if (!isDone(a)) return true;
    const doneAt = completedAt[a.id];
    return doneAt !== undefined && now - doneAt < 10000;
  });
  const visibleSpotlight = spotlightAppt
    ? isDone(spotlightAppt)
      ? completedAt[spotlightAppt.id] !== undefined &&
        now - completedAt[spotlightAppt.id] < 10000
        ? spotlightAppt
        : null
      : spotlightAppt
    : null;

  return (
    <>
      {Platform.OS !== 'web' && visibleAppointments.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SIZE(361 + 16)}
          decelerationRate="fast"
          contentContainerStyle={styles.bannerScroll}
        >
          {visibleAppointments.map(renderBannerCard)}
        </ScrollView>
      ) : Platform.OS !== 'web' && visibleAppointments.length === 1 ? (
        renderBannerCard(visibleAppointments[0])
      ) : screenWidth < 768 ? (
        <View style={styles.mobilePromoBanner}>
          <Svg
            style={StyleSheet.absoluteFill}
            width="100%"
            height="100%"
            pointerEvents="none"
          >
            <Defs>
              <SvgLinearGradient id="promo-mobile" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#4C6EF5" stopOpacity="1" />
                <Stop offset="1" stopColor="#1E3A8A" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              fill="url(#promo-mobile)"
              rx={18}
            />
          </Svg>
          <View style={styles.promoBadge}>
            <View style={styles.promoGreenDot} />
            <Text allowFontScaling={false} style={styles.promoBadgeText}>
              Live token
            </Text>
          </View>
          <Text allowFontScaling={false} style={styles.promoTitle}>
            Track your token{'\n'}live in the Aptly app
          </Text>
          <Text allowFontScaling={false} style={styles.promoDesc}>
            Your token number, estimated time and queue status update in real
            time, and they are accurate only in the mobile app.
          </Text>
          <View style={styles.promoButtons}>
            <TouchableOpacity
              style={styles.promoBtn}
              activeOpacity={0.8}
              onPress={() =>
                Linking.openURL(
                  'https://apps.apple.com/in/app/aptly-care/id6798915670',
                )
              }
            >
              <AppStoreIcon width={20} height={20} />
              <Text allowFontScaling={false} style={styles.promoBtnText}>
                App Store
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promoBtn}
              activeOpacity={0.8}
              onPress={() =>
                Linking.openURL(
                  'https://play.google.com/store/apps/details?id=com.aptly.aptlycareapp',
                )
              }
            >
              <GooglePlayIcon width={20} height={20} />
              <Text allowFontScaling={false} style={styles.promoBtnText}>
                Google Play
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : Platform.OS !== 'web' && visibleSpotlight ? (
        renderBannerCard(visibleSpotlight)
      ) : null}
      <View style={screenWidth >= 768 ? styles.desktopLayout : undefined}>
        <View style={screenWidth >= 768 ? styles.desktopCardsGrid : undefined}>
          <View
            style={[
              styles.cardsRow,
              screenWidth >= 768 && { paddingHorizontal: 0 },
            ]}
          >
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={onspecialstPress}
            >
              <Text allowFontScaling={false} style={styles.cardTitle}>
                Specialties
              </Text>
              <Text allowFontScaling={false} style={styles.viewAllText}>
                View all
              </Text>
              <Image
                source={require('../assets/images/specialties-image.png')}
                style={styles.cardImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={onDoctorsPress}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SIZE(4),
                }}
              >
                <Text allowFontScaling={false} style={styles.cardTitle}>
                  Doctors
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.viewAllText}>
                View all
              </Text>
              <Image
                source={require('../assets/images/doctor-image.png')}
                style={styles.cardImage}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.cardsRow,
              { marginBottom: 0 },
              screenWidth >= 768 && { paddingHorizontal: 0 },
            ]}
          >
            <TouchableOpacity style={styles.card} activeOpacity={1}>
              <Text allowFontScaling={false} style={styles.cardTitle}>
                Facilities
              </Text>
              <Text allowFontScaling={false} style={styles.comingSoonText}>
                Coming soon
              </Text>
              <Image
                source={require('../assets/images/facilities-image.png')}
                style={styles.cardImageShifted}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} activeOpacity={1}>
              <Text allowFontScaling={false} style={styles.cardTitle}>
                Labs & Scans
              </Text>
              <Text allowFontScaling={false} style={styles.comingSoonText}>
                Coming soon
              </Text>
              <Image
                source={require('../assets/images/labs-icon.png')}
                style={styles.cardImageShifted}
              />
            </TouchableOpacity>
          </View>
        </View>
        {screenWidth >= 768 && (
          <View style={styles.desktopPromoBanner}>
            <Svg
              style={StyleSheet.absoluteFill}
              width="100%"
              height="100%"
              pointerEvents="none"
            >
              <Defs>
                <SvgLinearGradient
                  id="promo-desktop"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0" stopColor="#4C6EF5" stopOpacity="1" />
                  <Stop offset="1" stopColor="#1E3A8A" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Rect
                width="100%"
                height="100%"
                fill="url(#promo-desktop)"
                rx={22}
              />
            </Svg>
            <View style={styles.promoBadge}>
              <View style={styles.promoGreenDot} />
              <Text allowFontScaling={false} style={styles.promoBadgeText}>
                Live token
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.promoTitle}>
              Track your token{'\n'}live in the Aptly app
            </Text>
            <Text allowFontScaling={false} style={styles.promoDesc}>
              Your token number, estimated time and queue status update in real
              time, and they are accurate only in the mobile app.
            </Text>
            <View style={styles.promoButtons}>
              <TouchableOpacity
                style={styles.promoBtn}
                activeOpacity={0.8}
                onPress={() =>
                  Linking.openURL(
                    'https://apps.apple.com/in/app/aptly-care/id6798915670',
                  )
                }
              >
                <AppStoreIcon width={20} height={20} />
                <Text allowFontScaling={false} style={styles.promoBtnText}>
                  App Store
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.promoBtn}
                activeOpacity={0.8}
                onPress={() =>
                  Linking.openURL(
                    'https://play.google.com/store/apps/details?id=com.aptly.aptlycareapp',
                  )
                }
              >
                <GooglePlayIcon width={20} height={20} />
                <Text allowFontScaling={false} style={styles.promoBtnText}>
                  Google Play
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      {/* Recommended for You section — temporarily disabled
      <>
        <View style={styles.sectionHeader}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>
            Recommended for You
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onClinicsPress}>
            <Text allowFontScaling={false} style={styles.viewAll}>
              See all
            </Text>
          </TouchableOpacity>
        </View>
        {recommendedClinics.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedScroll}
          >
            {recommendedClinics.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.recommendedCard}
                activeOpacity={0.8}
                onPress={() => onClinicPress(item)}
              >
                <Image
                  source={
                    item.profilePicture
                      ? { uri: item.profilePicture }
                      : require('../assets/images/aptly-logo2.png')
                  }
                  style={styles.recommendedCardImage}
                />
                <View style={styles.recommendedCardInfo}>
                  <Text
                    allowFontScaling={false}
                    style={styles.recommendedCardName}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={styles.recommendedCardSpecialty}
                    numberOfLines={1}
                  >
                    {item.specialties[0]?.name ?? item.type}
                  </Text>
                  <View style={styles.recommendedCardLocationRow}>
                    <LocationIcon width={SIZE(11)} height={SIZE(11)} />
                    <Text
                      allowFontScaling={false}
                      style={styles.recommendedCardLocation}
                      numberOfLines={1}
                    >
                      {item.address}
                    </Text>
                    {userLocation && (
                      <Text
                        allowFontScaling={false}
                        style={styles.recommendedCardDistance}
                        numberOfLines={1}
                      >
                        {getDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          item.latitude,
                          item.longitude,
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </>
      */}
      {hasLocation && (
        <View
          style={[
            styles.sectionHeader,
            screenWidth >= 768 && styles.sectionHeaderDesktop,
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[
              styles.sectionTitle,
              screenWidth >= 768 && styles.sectionTitleDesktop,
            ]}
          >
            Near by Clinics
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onClinicsPress}>
            <Text allowFontScaling={false} style={styles.viewAll}>
              See all
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

function SkeletonScreen() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const S = ({ style }: { style: any }) => (
    <Animated.View
      style={[
        style,
        {
          opacity,
          backgroundColor: colors.backgroundMuted,
          borderRadius: SIZE(10),
        },
      ]}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.mainContainer}>
        <S style={styles.height60Loader} />
        <S style={styles.height60Loader} />
        <S style={styles.height200Loader} />
        <View style={styles.rowView}>
          <S style={styles.width50Loader} />
          <S style={styles.width50Loader} />
        </View>
        <S style={styles.height200Loader} />
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const navigation = useNavigation<HomeNavProp>();
  const { location, ready, loadingLocation, distance } = useLocation();
  const { startTracking, stopTracking, trackData } = useTracking();
  const { user } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [spotlightAppt, setSpotlightAppt] = useState<Appointment | null>(null);
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [fallbackClinics, setFallbackClinics] = useState<Clinic[]>([]);
  const activeTabName = useNavigationState(state => {
    const mainRoute = state?.routes?.find(r => r.name === 'Main');
    const tabState = mainRoute?.state;
    if (!tabState) return 'Home';
    const idx = tabState.index ?? 0;
    return (tabState.routes[idx]?.name as string) ?? 'Home';
  });
  const fetchData = (isRefresh = false, trigger: string = 'unknown') => {
    if (isRefresh) {
      setRefreshing(true);
      setLoading(true);
    }
    if (IS_DEV)
      console.log('[HomeScreen] fetchData START', {
        trigger,
        isRefresh,
        location: location
          ? { lat: location.latitude, lon: location.longitude }
          : null,
        distance,
      });
    const nearbyPromise = location
      ? (() => {
          if (IS_DEV)
            console.log('[HomeScreen] getClinics (nearby) REQUEST', {
              lat: location.latitude,
              lon: location.longitude,
              radius: distance,
            });
          return getClinics(1, 20, {
            latitude: location.latitude,
            longitude: location.longitude,
            radius: distance,
          }).then(res => {
            if (IS_DEV)
              console.log('[HomeScreen] getClinics (nearby) RESPONSE', {
                count: res.data.length,
              });
            return res.data;
          });
        })()
      : Promise.resolve([] as Clinic[]);
    if (IS_DEV)
      console.log('[HomeScreen] getHomeData REQUEST', {
        lat: location?.latitude,
        lon: location?.longitude,
      });
    if (IS_DEV)
      console.log('[HomeScreen] getClinics (fallback) REQUEST', {
        page: 1,
        limit: 20,
      });
    Promise.allSettled([
      getHomeData(location?.latitude, location?.longitude),
      nearbyPromise,
      getClinics(1, 20).then(res => {
        if (IS_DEV)
          console.log('[HomeScreen] getClinics (fallback) RESPONSE', {
            count: res.data.length,
          });
        return res.data;
      }),
    ])
      .then(([homeResult, nearbyResult, fallbackResult]) => {
        if (homeResult.status === 'fulfilled') {
          if (IS_DEV)
            console.log('[HomeScreen] getHomeData RESPONSE', {
              appointmentsCount: homeResult.value.data.appointments?.length,
            });
          handleAppointments(homeResult.value.data.appointments ?? []);
        } else {
          if (IS_DEV)
            console.error('[HomeScreen] getHomeData ERROR', homeResult.reason);
        }
        if (nearbyResult.status === 'fulfilled') {
          setClinics(nearbyResult.value);
        } else {
          if (IS_DEV)
            console.error(
              '[HomeScreen] getClinics (nearby) ERROR',
              nearbyResult.reason,
            );
        }
        if (fallbackResult.status === 'fulfilled') {
          setFallbackClinics(fallbackResult.value);
        } else {
          if (IS_DEV)
            console.error(
              '[HomeScreen] getClinics (fallback) ERROR',
              fallbackResult.reason,
            );
        }
        if (IS_DEV)
          console.log('[HomeScreen] fetchData SETTLED', {
            trigger,
            homeOk: homeResult.status === 'fulfilled',
            nearbyOk: nearbyResult.status === 'fulfilled',
            fallbackOk: fallbackResult.status === 'fulfilled',
          });
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const handleAppointments = (appointments: Appointment[]) => {
    if (IS_DEV)
      console.log('[HomeScreen] getHomeData RESPONSE', {
        appointmentsCount: appointments.length,
      });
    const _nt = new Date();
    const today = `${_nt.getFullYear()}-${String(_nt.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(_nt.getDate()).padStart(2, '0')}`;
    const nowMins = _nt.getHours() * 60 + _nt.getMinutes();
    const active = (appointments ?? []).filter(
      a => a.tokenStatus === 'pending' || a.tokenStatus === 'ongoing',
    );
    const live = active.find(a => {
      if (a.appointmentDate !== today) return false;
      const [sh, sm] = (a.schedule?.startTime ?? '').split(':').map(Number);
      return nowMins >= sh * 60 + sm;
    });
    const sorted = active.sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    );
    setActiveAppointments(
      live ? [live, ...sorted.filter(a => a.id !== live.id)] : sorted,
    );
    setSpotlightAppt(live ?? sorted[0] ?? null);
  };

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      fetchData(false, 'useEffect[ready/location/distance]');
    }, 300);
    return () => clearTimeout(timer);
  }, [ready, location?.latitude, location?.longitude, distance]);

  useEffect(() => {
    if (!spotlightAppt) {
      stopTracking();
      return;
    }
    const _ns = new Date();
    const today = `${_ns.getFullYear()}-${String(_ns.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(_ns.getDate()).padStart(2, '0')}`;
    const nowMins = _ns.getHours() * 60 + _ns.getMinutes();
    const [sh, sm] = (spotlightAppt.schedule?.startTime ?? '')
      .split(':')
      .map(Number);
    const isLive =
      spotlightAppt.appointmentDate === today && nowMins >= sh * 60 + sm;
    if (isLive) startTracking(spotlightAppt.id);
    else stopTracking();
  }, [spotlightAppt]);
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);
  const distanceRef = useRef(distance);
  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(
    () =>
      navigation.addListener('focus', () => {
        if (!ready) return;
        const loc = locationRef.current;
        const dist = distanceRef.current;
        if (IS_DEV)
          console.log('[HomeScreen] focus refresh START', {
            location: loc ? { lat: loc.latitude, lon: loc.longitude } : null,
            distance: dist,
          });
        const nearbyPromise = loc
          ? (() => {
              if (IS_DEV)
                console.log('[HomeScreen] getClinics (nearby/focus) REQUEST', {
                  lat: loc.latitude,
                  lon: loc.longitude,
                  radius: dist,
                });
              return getClinics(1, 20, {
                latitude: loc.latitude,
                longitude: loc.longitude,
                radius: dist,
              }).then(res => {
                if (IS_DEV)
                  console.log(
                    '[HomeScreen] getClinics (nearby/focus) RESPONSE',
                    { count: res.data.length },
                  );
                return res.data;
              });
            })()
          : Promise.resolve([] as Clinic[]);
        if (IS_DEV)
          console.log('[HomeScreen] getHomeData (focus) REQUEST', {
            lat: loc?.latitude,
            lon: loc?.longitude,
          });
        if (IS_DEV)
          console.log('[HomeScreen] getClinics (fallback/focus) REQUEST', {
            page: 1,
            limit: 20,
          });
        Promise.allSettled([
          getHomeData(loc?.latitude, loc?.longitude),
          nearbyPromise,
          getClinics(1, 20).then(res => {
            if (IS_DEV)
              console.log('[HomeScreen] getClinics (fallback/focus) RESPONSE', {
                count: res.data.length,
              });
            return res.data;
          }),
        ])
          .then(([homeResult, nearbyResult, fallbackResult]) => {
            if (homeResult.status === 'fulfilled') {
              if (IS_DEV)
                console.log('[HomeScreen] getHomeData (focus) RESPONSE', {
                  appointmentsCount: homeResult.value.data.appointments?.length,
                });
              handleAppointments(homeResult.value.data.appointments ?? []);
            } else {
              if (IS_DEV)
                console.error(
                  '[HomeScreen] getHomeData (focus) ERROR',
                  homeResult.reason,
                );
            }
            if (nearbyResult.status === 'fulfilled') {
              setClinics(nearbyResult.value);
            } else {
              if (IS_DEV)
                console.error(
                  '[HomeScreen] getClinics (nearby/focus) ERROR',
                  nearbyResult.reason,
                );
            }
            if (fallbackResult.status === 'fulfilled') {
              setFallbackClinics(fallbackResult.value);
            } else {
              if (IS_DEV)
                console.error(
                  '[HomeScreen] getClinics (fallback/focus) ERROR',
                  fallbackResult.reason,
                );
            }
            if (IS_DEV)
              console.log('[HomeScreen] focus refresh SETTLED', {
                homeOk: homeResult.status === 'fulfilled',
                nearbyOk: nearbyResult.status === 'fulfilled',
                fallbackOk: fallbackResult.status === 'fulfilled',
              });
          })
          .finally(() => {
            setLoading(false);
            setRefreshing(false);
          });
      }),
    [navigation, ready],
  );

  if (loading) {
    return <SkeletonScreen />;
  } else {
    return (
      <>
        <Helmet>
          <title>Aptly – Book Doctor &amp; Clinic Appointments Near You</title>
          <meta
            name="description"
            content="Find and book appointments with top doctors and clinics near you. Search by specialty — cardiologist, dermatologist, dentist, and more. Instant confirmation, real-time token tracking."
          />
          <meta property="og:title" content="Aptly – Book Doctor & Clinic Appointments Near You" />
          <meta
            property="og:description"
            content="Find clinics and doctors near you. Book appointments in seconds with real-time token tracking."
          />
          <link rel="canonical" href="https://aptly.care/" />
        </Helmet>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <Svg
            style={StyleSheet.absoluteFill}
            width={screenWidth}
            height={screenHeight}
            pointerEvents="none"
          >
            <Defs>
              <SvgLinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
                <Stop offset="1" stopColor="#F5F5F6" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Rect width={screenWidth} height={screenHeight} fill="url(#bg)" />
          </Svg>
          <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {screenWidth >= 768 && (
                <Image
                  source={require('../assets/images/aptly-logo3.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                style={styles.locationBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('LocationSearch')}
              >
                <LocationIcon
                  width={SIZE(19)}
                  height={SIZE(19)}
                  style={styles.locationIcon}
                />
                <View style={{ maxWidth: SIZE(150) }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: SIZE(4),
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.locationText}
                      numberOfLines={1}
                    >
                      {loadingLocation
                        ? 'Loading...'
                        : location
                        ? location.mainText
                        : 'Select your location'}
                    </Text>
                    <DownArrowGrey width={SIZE(16)} height={SIZE(16)} />
                  </View>
                  {location?.secondaryText ? (
                    <Text
                      allowFontScaling={false}
                      style={styles.locationSub}
                      numberOfLines={1}
                    >
                      {location.secondaryText}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            </View>
            {screenWidth >= 768 && (
              <View style={styles.headerCenter}>
                {(['Home', 'Appointments'] as const).map(tab => {
                  const isActive = activeTabName === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      activeOpacity={0.7}
                      style={styles.headerTab}
                      onPress={() => {
                        if (tab === 'Appointments' && !user) {
                          setShowLoginModal(true);
                          return;
                        }
                        (navigation as any).navigate('Main', { screen: tab });
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.headerTabText,
                          isActive && styles.headerTabTextActive,
                        ]}
                      >
                        {tab}
                      </Text>
                      {isActive && <View style={styles.headerTabIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={styles.headerRight}>
              {screenWidth >= 768 && (
                <TouchableOpacity
                  style={styles.headerSearchWrapper}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Search')}
                >
                  <AnimatedSearchBar style={{ height: SIZE(34) }} />
                </TouchableOpacity>
              )}
              {Platform.OS === 'web' && !isInstalled && (
                <TouchableOpacity
                  style={styles.installBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    canInstall ? install() : setShowInstallModal(true)
                  }
                >
                  <Text allowFontScaling={false} style={styles.installBtnText}>
                    Install App
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search - mobile only */}
          {screenWidth < 768 && (
            <View style={styles.searchWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Search')}
              >
                <AnimatedSearchBar />
              </TouchableOpacity>
            </View>
          )}

          {/* Everything below scrolls */}
          {screenWidth >= 768 ? (
            // Desktop: custom 2-column grid with ScrollView
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchData(true, 'pull-to-refresh')}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            >
              <ListHeader
                onTokenPress={appt =>
                  navigation.navigate('TokenDetail', { appointment: appt })
                }
                onspecialstPress={() => navigation.navigate('specialst')}
                onDoctorsPress={() => navigation.navigate('Doctors')}
                onClinicsPress={() => navigation.navigate('Clinics')}
                spotlightAppt={spotlightAppt}
                activeAppointments={activeAppointments}
                hasNearbyClinics={clinics.length > 0}
                hasLocation={!!location}
                trackData={trackData}
                recommendedClinics={location ? clinics : fallbackClinics}
                onClinicPress={item =>
                  navigation.navigate('HospitalDetail', {
                    id: item.id,
                    name: item.name,
                    specialty: item.specialties[0]?.name ?? '',
                    location: item.address,
                  })
                }
                userLocation={
                  location
                    ? {
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }
                    : null
                }
              />
              {/* Clinic grid */}
              {(location ? clinics : []).length === 0 ? (
                // Empty state
                <View style={styles.desktopClinicSection}>
                  <View
                    style={[styles.emptyContainer, { paddingHorizontal: 0 }]}
                  >
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
                          No clinics within {distance} km. Explore the nearest
                          available clinics below
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
                  {(() => {
                    const rows: Clinic[][] = [];
                    for (let i = 0; i < fallbackClinics.length; i += 2)
                      rows.push(fallbackClinics.slice(i, i + 2));
                    return rows.map((row, ri) => (
                      <View key={ri} style={styles.clinicGridRow}>
                        {row.map(item => (
                          <ClinicCard
                            key={item.id}
                            name={item.name}
                            subType={item.medicalSystem?.name ?? item.type}
                            specialties={item.specialties.map(
                              (s: { name: string }) => s.name,
                            )}
                            location={item.address}
                            image={item.profilePicture}
                            distance={
                              location
                                ? getDistance(
                                    location.latitude,
                                    location.longitude,
                                    item.latitude,
                                    item.longitude,
                                  )
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
                            style={styles.clinicGridCard}
                          />
                        ))}
                        {row.length === 1 && (
                          <View style={styles.clinicGridCardEmpty} />
                        )}
                      </View>
                    ));
                  })()}
                </View>
              ) : (
                // Nearby clinics 2-column grid
                <View style={styles.desktopClinicSection}>
                  {(() => {
                    const rows: Clinic[][] = [];
                    for (let i = 0; i < clinics.length; i += 2)
                      rows.push(clinics.slice(i, i + 2));
                    return rows.map((row, ri) => (
                      <View key={ri} style={styles.clinicGridRow}>
                        {row.map(item => (
                          <ClinicCard
                            key={item.id}
                            name={item.name}
                            subType={item.medicalSystem?.name ?? item.type}
                            specialties={item.specialties.map(
                              (s: { name: string }) => s.name,
                            )}
                            location={item.address}
                            image={item.profilePicture}
                            distance={
                              location
                                ? getDistance(
                                    location.latitude,
                                    location.longitude,
                                    item.latitude,
                                    item.longitude,
                                  )
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
                            style={styles.clinicGridCard}
                          />
                        ))}
                        {row.length === 1 && (
                          <View style={styles.clinicGridCardEmpty} />
                        )}
                      </View>
                    ));
                  })()}
                </View>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={location ? clinics : []}
              keyExtractor={item => item.id}
              extraData={trackData}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchData(true, 'pull-to-refresh')}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              ListFooterComponent={null}
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
                          No clinics within {distance} km. Explore the nearest
                          available clinics below
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
                  {fallbackClinics.map(item => (
                    <ClinicCard
                      key={item.id}
                      name={item.name}
                      subType={item.medicalSystem?.name ?? item.type}
                      specialties={item.specialties.map(
                        (s: { name: string }) => s.name,
                      )}
                      location={item.address}
                      image={item.profilePicture}
                      distance={
                        location
                          ? getDistance(
                              location.latitude,
                              location.longitude,
                              item.latitude,
                              item.longitude,
                            )
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
                      style={styles.clinicCard}
                    />
                  ))}
                </View>
              }
              ListHeaderComponent={
                <ListHeader
                  onTokenPress={appt =>
                    navigation.navigate('TokenDetail', { appointment: appt })
                  }
                  onspecialstPress={() => navigation.navigate('specialst')}
                  onDoctorsPress={() => navigation.navigate('Doctors')}
                  onClinicsPress={() => navigation.navigate('Clinics')}
                  spotlightAppt={spotlightAppt}
                  activeAppointments={activeAppointments}
                  hasNearbyClinics={clinics.length > 0}
                  hasLocation={!!location}
                  trackData={trackData}
                  recommendedClinics={location ? clinics : fallbackClinics}
                  onClinicPress={item =>
                    navigation.navigate('HospitalDetail', {
                      id: item.id,
                      name: item.name,
                      specialty: item.specialties[0]?.name ?? '',
                      location: item.address,
                    })
                  }
                  userLocation={
                    location
                      ? {
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }
                      : null
                  }
                />
              }
              renderItem={({ item }) => {
                return (
                  <ClinicCard
                    name={item.name}
                    subType={item.medicalSystem?.name ?? item.type}
                    specialties={item.specialties.map(
                      (s: { name: string }) => s.name,
                    )}
                    location={item.address}
                    image={item.profilePicture}
                    distance={
                      location
                        ? getDistance(
                            location.latitude,
                            location.longitude,
                            item.latitude,
                            item.longitude,
                          )
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
                    style={
                      screenWidth >= 768 ? styles.clinicGridCard : undefined
                    }
                  />
                );
              }}
            />
          )}

          {/* PWA Install Instructions Modal */}
          {showInstallModal &&
            (() => {
              const ua =
                typeof navigator !== 'undefined' ? navigator.userAgent : '';
              const isSafari =
                /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua);
              const isFirefox = /Firefox|FxiOS/i.test(ua);
              const isChromeiOS = /CriOS/i.test(ua);

              type Step = { icon: string; text: React.ReactNode };
              const steps: Step[] = isSafari
                ? [
                    {
                      icon: '1',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap the{' '}
                          <Text style={styles.installStepBold}>Share</Text>{' '}
                          button <Text style={styles.installStepBold}>⎙</Text>{' '}
                          at the bottom of Safari
                        </Text>
                      ),
                    },
                    {
                      icon: '2',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Scroll down and tap{' '}
                          <Text style={styles.installStepBold}>
                            "Add to Home Screen"
                          </Text>
                        </Text>
                      ),
                    },
                    {
                      icon: '3',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap <Text style={styles.installStepBold}>Add</Text> in
                          the top-right corner
                        </Text>
                      ),
                    },
                  ]
                : isFirefox
                ? [
                    {
                      icon: '1',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap the{' '}
                          <Text style={styles.installStepBold}>⋮ menu</Text> at
                          the top-right
                        </Text>
                      ),
                    },
                    {
                      icon: '2',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap{' '}
                          <Text style={styles.installStepBold}>"Install"</Text>{' '}
                          or{' '}
                          <Text style={styles.installStepBold}>
                            "Add to Home Screen"
                          </Text>
                        </Text>
                      ),
                    },
                    {
                      icon: '3',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap <Text style={styles.installStepBold}>Add</Text> to
                          confirm
                        </Text>
                      ),
                    },
                  ]
                : isChromeiOS
                ? [
                    {
                      icon: '1',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap the{' '}
                          <Text style={styles.installStepBold}>Share</Text>{' '}
                          button <Text style={styles.installStepBold}>⎙</Text>{' '}
                          at the bottom
                        </Text>
                      ),
                    },
                    {
                      icon: '2',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap{' '}
                          <Text style={styles.installStepBold}>
                            "Add to Home Screen"
                          </Text>
                        </Text>
                      ),
                    },
                    {
                      icon: '3',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap <Text style={styles.installStepBold}>Add</Text> to
                          confirm
                        </Text>
                      ),
                    },
                  ]
                : [
                    // Chrome / Edge on Android or desktop
                    {
                      icon: '1',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap the{' '}
                          <Text style={styles.installStepBold}>⋮ menu</Text> at
                          the top-right of Chrome
                        </Text>
                      ),
                    },
                    {
                      icon: '2',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap{' '}
                          <Text style={styles.installStepBold}>
                            "Add to Home Screen"
                          </Text>{' '}
                          or{' '}
                          <Text style={styles.installStepBold}>
                            "Install App"
                          </Text>
                        </Text>
                      ),
                    },
                    {
                      icon: '3',
                      text: (
                        <Text
                          allowFontScaling={false}
                          style={styles.installStepText}
                        >
                          Tap{' '}
                          <Text style={styles.installStepBold}>Install</Text> to
                          confirm
                        </Text>
                      ),
                    },
                  ];

              return (
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowInstallModal(false)}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.installModal}
                    onPress={() => {}}
                  >
                    <View style={styles.installModalHeader}>
                      <Text
                        allowFontScaling={false}
                        style={styles.installModalTitle}
                      >
                        Install Aptly
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowInstallModal(false)}
                        style={styles.installModalClose}
                      >
                        <Text
                          allowFontScaling={false}
                          style={styles.installModalCloseText}
                        >
                          ✕
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text
                      allowFontScaling={false}
                      style={styles.installModalDesc}
                    >
                      Add Aptly to your home screen for quick access — it works
                      just like a native app.
                    </Text>
                    {steps.map((step, i) => (
                      <View key={i} style={styles.installStep}>
                        <View style={styles.installStepNum}>
                          <Text
                            allowFontScaling={false}
                            style={styles.installStepNumText}
                          >
                            {step.icon}
                          </Text>
                        </View>
                        {step.text}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.installModalBtn}
                      activeOpacity={0.8}
                      onPress={() => setShowInstallModal(false)}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.installModalBtnText}
                      >
                        Got it
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })()}
        </SafeAreaView>
        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(24),
    paddingVertical: SIZE(8),
    marginBottom: SIZE(10),
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(16),
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -100 }],
  },
  headerTab: {
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(8),
    alignItems: 'center',
    position: 'relative',
  },
  headerTabText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textSecondary,
  },
  headerTabTextActive: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.primary,
  },
  headerTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: SIZE(14),
    right: SIZE(14),
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  headerLogo: {
    height: 38,
    width: 100,
  },
  logo: {
    width: 94,
    height: SIZE(32),
    resizeMode: 'contain',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZE(4),
  },
  locationIcon: {
    marginTop: SIZE(8),
  },
  locationText: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(16),
    color: colors.dark,
  },
  locationSub: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
    marginTop: SIZE(1),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
  },
  headerSearchWrapper: {
    width: 412,
    height: SIZE(34),
  },
  installBtn: {
    height: SIZE(34),
    paddingHorizontal: SIZE(10),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  installBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.primary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  installModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: SIZE(20),
    borderTopRightRadius: SIZE(20),
    padding: SIZE(24),
    paddingBottom: SIZE(36),
    gap: SIZE(14),
  },
  installModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  installModalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
  },
  installModalClose: {
    width: SIZE(32),
    height: SIZE(32),
    borderRadius: SIZE(16),
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  installModalCloseText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSubdued,
  },
  installModalDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    lineHeight: SIZE(20),
  },
  installStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZE(12),
  },
  installStepNum: {
    width: SIZE(24),
    height: SIZE(24),
    borderRadius: SIZE(12),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZE(1),
  },
  installStepNumText: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(12),
    color: colors.primary,
  },
  installStepText: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textPrimary,
    lineHeight: SIZE(22),
  },
  installStepBold: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.textPrimary,
  },
  installModalBtn: {
    backgroundColor: colors.primary,
    borderRadius: SIZE(12),
    paddingVertical: SIZE(14),
    alignItems: 'center',
    marginTop: SIZE(4),
  },
  installModalBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.white,
  },
  searchWrapper: {
    paddingHorizontal: SIZE(18),
    marginBottom: SIZE(20),
  },
  bannerCard: {
    marginHorizontal: SIZE(18),
    marginBottom: SIZE(18),
    ...(Platform.OS !== 'web' && { height: 323 }),
    borderRadius: SIZE(18),
    backgroundColor: colors.primary,
    padding: SIZE(10),
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  bannerCardMulti: {
    marginHorizontal: SIZE(8),
    width: SIZE(361),
    overflow: 'hidden',
  },
  bannerScroll: {
    paddingHorizontal: SIZE(10),
    // paddingBottom: SIZE(20),
  },
  livebadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: SIZE(20),
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(4),
    gap: SIZE(6),
  },
  greenDot: {
    width: SIZE(8),
    height: SIZE(8),
    borderRadius: SIZE(4),
    backgroundColor: colors.onlineIndicator,
  },
  liveText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.black,
  },
  tokenCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(6),
    paddingVertical: SIZE(8),
  },
  completedTouchable: {
    flex: 1,
    justifyContent: 'center',
  },
  tokenCenterCompleted: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  tokenLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.borderMuted,
  },
  completedText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.white,
    marginTop: SIZE(8),
  },
  tokenNumber: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(72),
    color: colors.white,
    lineHeight: Platform.OS === 'android' ? SIZE(68) : SIZE(80),
  },
  tokenEst: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.white,
  },
  scheduledDate: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.scheduledText,
    backgroundColor: colors.white,
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(4),
    borderRadius: SIZE(6),
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
    backgroundColor: colors.white15,
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
    backgroundColor: colors.white30,
  },
  hospitalName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(13),
    color: colors.white,
    width: SIZE(150),
  },
  doctorName: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.white70,
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: SIZE(8),
  },
  actionBtn: {
    width: SIZE(32),
    height: SIZE(32),
    borderRadius: SIZE(8),
    backgroundColor: colors.white20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalDivider: {
    height: 1,
    backgroundColor: colors.white20,
  },
  hospitalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorName: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.white,
  },
  hospitalSep: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white50,
  },
  doctorSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white80,
  },
  patientName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(11),
    color: colors.white,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZE(18),
    gap: SIZE(12),
    marginBottom: SIZE(8),
  },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: SIZE(20),
    // gap: SIZE(16),
    marginBottom: SIZE(8),
    justifyContent: 'space-between',
  },
  desktopCardsGrid: {
    // flex: 1,
    width: '59%',
  },
  desktopPromoBanner: {
    width: '39%',
    borderRadius: SIZE(22),
    padding: SIZE(20),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  mobilePromoBanner: {
    marginHorizontal: SIZE(18),
    marginBottom: SIZE(18),
    borderRadius: SIZE(18),
    padding: SIZE(20),
    gap: SIZE(12),
    overflow: 'hidden',
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: SIZE(20),
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(5),
    gap: SIZE(6),
  },
  promoGreenDot: {
    width: SIZE(8),
    height: SIZE(8),
    borderRadius: SIZE(4),
    backgroundColor: '#22C55E',
  },
  promoBadgeText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.textPrimary,
  },
  promoTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(20),
    color: colors.white,
    lineHeight: SIZE(28),
  },
  promoDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: 'rgba(255,255,255,0.8)',
    lineHeight: SIZE(20),
  },
  promoButtons: {
    flexDirection: 'row',
    gap: SIZE(10),
    flexWrap: 'wrap',
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
    backgroundColor: colors.white,
    borderRadius: SIZE(12),
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
  },
  promoBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
  card: {
    flex: 1,
    height: SIZE(116),
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: SIZE(22),
    padding: SIZE(18),
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  cardImage: {
    width: SIZE(92),
    height: SIZE(92),
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cardImageShifted: {
    width: SIZE(92),
    height: SIZE(92),
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    right: -10,
  },
  leftView: {
    width: '60%',
    justifyContent: 'space-between',
    gap: SIZE(8),
    // backgroundColor: '#00f',
  },
  rightView: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '40%',
    // backgroundColor: '#f00',
  },
  viewAllText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.accent,
  },
  comingSoonText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.subText,
    opacity: 0.5,
  },
  cardTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: SIZE(8),
  },
  iconBox: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(10),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImg: {
    width: SIZE(28),
    height: SIZE(28),
    resizeMode: 'contain',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
  },
  avatarCircle: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(20),
    backgroundColor: colors.backgroundLight,
    borderWidth: 2,
    borderColor: colors.white,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: SIZE(20),
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
    marginTop: SIZE(12),
    backgroundColor: colors.surfaceLightFaded,
  },
  sectionHeaderDesktop: {
    paddingHorizontal: SIZE(18),
    paddingTop: SIZE(20),
    // paddingBottom: SIZE(12),
    marginBottom: SIZE(4),
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  sectionTitleDesktop: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(20),
  },
  viewAll: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(13),
    color: colors.accent,
  },
  listContent: {
    paddingBottom: SIZE(24),
    gap: SIZE(12),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1240,
  },
  listContentDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZE(12),
  },
  desktopClinicSection: {
    paddingHorizontal: SIZE(18),
  },
  clinicGridRow: {
    flexDirection: 'row',
    gap: SIZE(12),
    marginBottom: SIZE(12),
  },
  clinicGridCard: {
    flex: 1,
    marginHorizontal: 0,
  },
  clinicGridCardEmpty: {
    width: '50%',
  },
  emptyContainer: {
    paddingHorizontal: SIZE(18),
    paddingTop: SIZE(0),
    paddingBottom: SIZE(12),
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: SIZE(12),
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
  emptyTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: '#1C1E22',
    marginTop: SIZE(16),
    marginBottom: SIZE(8),
    textAlign: 'center',
  },
  emptyMessage: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: '#636A79',
    textAlign: 'center',
    lineHeight: SIZE(15),
    maxWidth: SIZE(260),
    marginBottom: SIZE(8),
  },

  clinicCard: {
    flexDirection: 'row',
    marginHorizontal: SIZE(18),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorderLight,
    backgroundColor: colors.white,
    padding: SIZE(4),
    gap: SIZE(12),
    alignItems: 'center',
    marginBottom: SIZE(6),
  },
  clinicImage: {
    width: 92,
    height: 92,
    borderRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
  },
  clinicInfo: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: SIZE(7),
  },
  clinicName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  clinicSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
    marginTop: SIZE(2),
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: SIZE(12),
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: SIZE(12),
    paddingHorizontal: SIZE(18),
    gap: SIZE(12),
  },
  height60Loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SIZE(60),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
  },
  height200Loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SIZE(300),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
    marginVertical: SIZE(12),
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZE(12),
  },
  width50Loader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    height: SIZE(100),
    borderRadius: SIZE(12),
    backgroundColor: colors.backgroundLight,
  },
  // Recommended for You horizontal cards
  recommendedScroll: {
    paddingHorizontal: SIZE(18),
    paddingBottom: SIZE(8),
    gap: SIZE(12),
  },
  recommendedCard: {
    width: SIZE(206),
    height: SIZE(190),
    borderRadius: SIZE(14),
    borderWidth: 1,
    borderColor: colors.cardBorderLight,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  recommendedCardImage: {
    width: '100%',
    height: SIZE(110),
    resizeMode: 'cover',
    backgroundColor: colors.backgroundLight,
  },
  recommendedCardInfo: {
    flex: 1,
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(8),
    justifyContent: 'space-between',
  },
  recommendedCardName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
  recommendedCardSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  recommendedCardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(3),
  },
  recommendedCardLocation: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(10),
    color: colors.textSecondary,
    flex: 1,
  },
  recommendedCardDistance: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(10),
    color: colors.primary,
  },
});
