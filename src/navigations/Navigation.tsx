import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { NavigationContainer, NavigationContainerRef, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneNumberScreen from '../screens/PhoneNumberScreen';
import OtpScreen from '../screens/OtpScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import FamilyMembersScreen from '../screens/FamilyMembersScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import BottomTabNavigator from './BottomTabNavigator';
import TokenDetailScreen from '../screens/TokenDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultScreen from '../screens/SearchResultScreen';
import LocationSearchScreen from '../screens/LocationSearchScreen';
import SpecialstScreen from '../screens/SpecialstScreen';
import SpecialstDetailScreen from '../screens/SpecialstDetailScreen';
import DoctorsScreen from '../screens/DoctorsScreen';
import DoctorDetailScreen from '../screens/DoctorDetailScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import BookingConfirmedScreen from '../screens/BookingConfirmedScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import HospitalDetailScreen from '../screens/HospitalDetailScreen';
import ClinicsScreen from '../screens/ClinicsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { Doctor, Appointment } from '../services/api';
import { MetadataProvider } from '../context/MetadataContext';
import { TrackingProvider } from '../context/TrackingContext';
import { LocationProvider } from '../context/LocationContext';
import AppUpdateModal from '../components/AppUpdateModal';
import { useAppUpdate } from '../hooks/useAppUpdate';
import { parseClinicUrl, navigateToClinic } from '../utils/deepLinkHandler';

// Android-only: Play Install Referrer (no-op on iOS)
let PlayInstallReferrer: any = null;
if (Platform.OS === 'android') {
  try {
    PlayInstallReferrer = require('react-native-play-install-referrer').PlayInstallReferrer;
  } catch {
    // Module unavailable (e.g. web build) – fail gracefully.
  }
}

/** AsyncStorage key used to track whether the install referrer has been read. */
const INSTALL_REFERRER_KEY = 'install-referrer-read';

export type RootStackParamList = {
  PhoneNumber: undefined;
  Otp: { phone: string; code: number };
  CreateProfile: undefined;
  EditProfile: undefined;
  FamilyMembers: undefined;
  AccountSettings: undefined;
  Main: undefined;
  TokenDetail: { appointment: Appointment };
  Search: undefined;
  SearchResult: { title: string; latitude?: number; longitude?: number; radius?: number; initialFilters?: Record<string, string[]> };
  LocationSearch: undefined;
  specialst: undefined;
  SpecialstDetail: { name: string; id: string; desc: string; clinics: number; doctors: number };
  Doctors: undefined;
  DoctorDetail: { doctorId: string };
  BookAppointment: { doctor: Doctor; clinicId?: string };
  BookingConfirmed: { token: number; doctorName: string; hospital: string; date: string };
  AppointmentDetail: { id: string; doctor: string; type: string; hospital: string; date: string; time: string; token: number; status: string };
  /**
   * `name`, `specialty`, and `location` are shown while the screen fetches
   * the full clinic from the API. They are optional so that deep-link
   * navigation only needs to supply `id`.
   */
  HospitalDetail: { id: string; name?: string; specialty?: string; location?: string };
  Clinics: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * A module-level navigation ref so that deep-link handlers outside the
 * component tree can trigger navigation imperatively.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// ---------------------------------------------------------------------------
// React Navigation linking configuration
// ---------------------------------------------------------------------------
// Maps incoming Universal Link / App Link URLs to navigator routes.
// React Navigation handles both cold-start (getInitialURL) and foreground
// (url event) URLs automatically when this config is provided.
//
// Incoming:  https://qr.aptly.care/c/<uuid>
// Maps to:   Stack screen "HospitalDetail" with { id: <uuid> }
// ---------------------------------------------------------------------------
const linking = {
  prefixes: ['https://qr.aptly.care'],
  config: {
    screens: {
      HospitalDetail: {
        // /c/:id  →  HospitalDetail screen
        path: 'c/:id',
      },
    },
  },
  // Custom getInitialURL so that we can log / intercept if needed, while
  // still letting React Navigation do the actual routing.
  async getInitialURL(): Promise<string | null | undefined> {
    const url = await Linking.getInitialURL();
    return url ?? null;
  },
  // Custom subscribe so that we can keep one canonical listener.
  subscribe(listener: (url: string) => void) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });
    return () => subscription.remove();
  },
};

// ---------------------------------------------------------------------------
// Install-referrer helper (Android only)
// ---------------------------------------------------------------------------
/**
 * Reads the Google Play Install Referrer exactly once per install.
 * Only called when there is no direct incoming URL (direct URL takes priority).
 */
async function handleInstallReferrer(): Promise<void> {
  if (Platform.OS !== 'android' || !PlayInstallReferrer) {
    return;
  }

  const alreadyRead = await AsyncStorage.getItem(INSTALL_REFERRER_KEY);
  if (alreadyRead) {
    return;
  }

  // Mark as read immediately to prevent double-processing on fast re-launches.
  await AsyncStorage.setItem(INSTALL_REFERRER_KEY, '1');

  return new Promise<void>(resolve => {
    PlayInstallReferrer.getInstallReferrerInfo((info: any, error: any) => {
      if (error || !info?.installReferrer) {
        resolve();
        return;
      }

      try {
        const params = new URLSearchParams(info.installReferrer);
        const clinicId = params.get('clinicId');

        if (clinicId && navigationRef.isReady()) {
          navigateToClinic(navigationRef, clinicId);
        }
      } catch {
        // Ignore parse errors
      }

      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Navigation component
// ---------------------------------------------------------------------------
export default function Navigation() {
  const [initialRoute, setInitialRoute] = useState<'PhoneNumber' | 'CreateProfile' | 'Main' | null>(null);
  const { visible, mandatory, latestVersion, handleSkip, handleUpdate } = useAppUpdate();

  // Determine initial auth route
  useEffect(() => {
    AsyncStorage.multiGet(['accessToken', 'name', 'skipped']).then(([tokenEntry, nameEntry, skippedEntry]) => {
      const token = tokenEntry[1];
      const name = nameEntry[1];
      const skipped = skippedEntry[1];
      if (!token && skipped === 'true') { setInitialRoute('Main'); }
      else if (!token) { setInitialRoute('PhoneNumber'); }
      else if (!name) { setInitialRoute('CreateProfile'); }
      else { setInitialRoute('Main'); }
    });
  }, []);

  // Handle install referrer ONLY when there is no direct incoming URL.
  // Direct QR URL (Universal Link / App Link) takes priority.
  useEffect(() => {
    if (Platform.OS !== 'android') { return; }

    (async () => {
      const directUrl = await Linking.getInitialURL();
      const clinicId = directUrl ? parseClinicUrl(directUrl) : null;

      if (clinicId) {
        // A direct URL is present — React Navigation's linking config will
        // handle it. Do NOT process the install referrer.
        return;
      }

      // No direct URL: check if we came from a Play Store install referral.
      await handleInstallReferrer();
    })();
  // Run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initialRoute === null) { return null; }

  return (
    <MetadataProvider>
      <TrackingProvider>
        <LocationProvider>
          <NavigationContainer ref={navigationRef} linking={linking}>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{ headerShown: false }}>
              <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
              <Stack.Screen name="Otp" component={OtpScreen} />
              <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
              <Stack.Screen name="EditProfile" component={CreateProfileScreen} />
              <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
              <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
              <Stack.Screen name="Main" component={BottomTabNavigator} />
              <Stack.Screen
                name="TokenDetail"
                component={TokenDetailScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="SearchResult" component={SearchResultScreen} />
              <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
              <Stack.Screen name="specialst" component={SpecialstScreen} />
              <Stack.Screen name="SpecialstDetail" component={SpecialstDetailScreen} />
              <Stack.Screen name="Doctors" component={DoctorsScreen} />
              <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
              <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
              <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
              <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
              <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
              <Stack.Screen name="Clinics" component={ClinicsScreen} />
              <Stack.Screen name="Notifications" component={NotificationScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <AppUpdateModal
            visible={visible}
            mandatory={mandatory}
            latestVersion={latestVersion}
            storeUrl=""
            onUpdate={handleUpdate}
            onSkip={handleSkip}
          />
        </LocationProvider>
      </TrackingProvider>
    </MetadataProvider>
  );
}
