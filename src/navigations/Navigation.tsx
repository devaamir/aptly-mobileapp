import React, { useEffect, useState } from 'react';
import { Linking, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
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
import ShortBookingLinkScreen from '../screens/ShortBookingLinkScreen';
import NoIndex from '../components/NoIndex';
import { Doctor, Appointment } from '../services/api';
import { MetadataProvider } from '../context/MetadataContext';
import { TrackingProvider } from '../context/TrackingContext';
import { LocationProvider } from '../context/LocationContext';

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
  // `doctor` is passed in-app; on a refresh / shared link only `doctorId` (from the URL) is there
  BookAppointment: { doctor?: Doctor; doctorId?: string; clinicId?: string };
  // Short poster / QR link: d = doctor, c = clinic (see utils/shortId)
  ShortBooking: { d: string; c?: string };
  BookingConfirmed: { token: number; doctorName: string; hospital: string; date: string };
  AppointmentDetail: { id: string; doctor: string; type: string; hospital: string; date: string; time: string; token: number; status: string };
  /**
   * `name`, `specialty`, and `location` are shown while the screen fetches
   * the full clinic from the API. They are optional so that deep-link
   * navigation only needs to supply `id`.
   */
  HospitalDetail: { id: string; name?: string; specialty?: string; location?: string };
  Clinics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screens search engines should index. Every other screen (login, profile, booking,
// search …) is private or a utility page and gets `noindex`.
// "Main" is the tab container: Home is indexable, the other tabs opt out in BottomTabNavigator.
const INDEXABLE_ROUTES = new Set<string>([
  'Main',
  'HospitalDetail',
  'Clinics',
  'Doctors',
  'specialst',
  'SpecialstDetail',
  'DoctorDetail',
]);

/**
 * A module-level navigation ref so that deep-link handlers outside the
 * component tree can trigger navigation imperatively.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// ---------------------------------------------------------------------------
// React Navigation linking configuration
// ---------------------------------------------------------------------------
const linking = {
  prefixes: ['https://qr.aptly.care', 'https://app.aptly.care', 'http://localhost:8080'],
  config: {
    screens: {
      // Home tab lives at "/" (was /Main/Home, which differed from the canonical URL)
      Main: {
        path: '',
        screens: {
          Home: '',
          Appointments: 'Appointments',
          Profile: 'Profile',
        },
      },
      HospitalDetail: {
        path: 'c/:id',
        // name/specialty/location only fill the page while it loads; keeping them out of
        // the URL makes it the same as the canonical (/c/:id)
        stringify: {
          name: () => undefined as unknown as string,
          specialty: () => undefined as unknown as string,
          location: () => undefined as unknown as string,
        },
      },
      Clinics: 'Clinics',
      Doctors: 'Doctors',
      specialst: 'specialst',
      SpecialstDetail: 'SpecialstDetail',
      DoctorDetail: 'DoctorDetail',
      Search: 'Search',
      SearchResult: 'SearchResult',
      // Only ids go in the URL (the doctor object would show as [object Object])
      ShortBooking: 'b/:d/:c?',
      BookAppointment: {
        path: 'BookAppointment',
        stringify: { doctor: () => undefined as unknown as string },
      },
    },
  },
  async getInitialURL(): Promise<string | null | undefined> {
    const url = await Linking.getInitialURL();
    return url ?? null;
  },
  subscribe(listener: (url: string) => void) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });
    return () => subscription.remove();
  },
};

// ---------------------------------------------------------------------------
// Navigation component
// ---------------------------------------------------------------------------
export default function Navigation() {
  const [initialRoute, setInitialRoute] = useState<'PhoneNumber' | 'CreateProfile' | 'Main' | null>(null);
  const { width } = useWindowDimensions();
  // On wide web screens the location picker is a modal over the screen it was opened from
  const isWideWeb = Platform.OS === 'web' && width >= 768;

  // Determine initial auth route
  useEffect(() => {
    AsyncStorage.multiGet(['accessToken', 'name', 'skipped']).then(([tokenEntry, nameEntry, skippedEntry]) => {
      const token = tokenEntry[1];
      const name = nameEntry[1];
      const skipped = skippedEntry[1];
      // On the web, visitors browse as guests first; login opens only when needed
      if (!token && (skipped === 'true' || Platform.OS === 'web')) { setInitialRoute('Main'); }
      else if (!token) { setInitialRoute('PhoneNumber'); }
      else if (!name) { setInitialRoute('CreateProfile'); }
      else { setInitialRoute('Main'); }
    });
  }, []);

  if (initialRoute === null) { return null; }

  return (
    <MetadataProvider>
      <TrackingProvider>
        <LocationProvider>
          {/* documentTitle off: each screen sets its own SEO title via react-helmet; the default overwrote it with the route name ("Clinics", "specialst") */}
          <NavigationContainer ref={navigationRef} linking={linking} documentTitle={{ enabled: false }}>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{ headerShown: false }}
              screenLayout={({ route, children }) =>
                INDEXABLE_ROUTES.has(route.name) ? children : (
                  <>
                    <NoIndex />
                    {children}
                  </>
                )
              }>
              <Stack.Screen
                name="PhoneNumber"
                component={PhoneNumberScreen}
                options={isWideWeb ? { presentation: 'transparentModal', animation: 'fade' } : undefined}
              />
              <Stack.Screen
                name="Otp"
                component={OtpScreen}
                options={isWideWeb ? { presentation: 'transparentModal', animation: 'fade' } : undefined}
              />
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
              <Stack.Screen
                name="LocationSearch"
                component={LocationSearchScreen}
                options={isWideWeb ? { presentation: 'transparentModal', animation: 'fade' } : undefined}
              />
              <Stack.Screen name="specialst" component={SpecialstScreen} />
              <Stack.Screen name="SpecialstDetail" component={SpecialstDetailScreen} />
              <Stack.Screen name="Doctors" component={DoctorsScreen} />
              <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
              <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
              <Stack.Screen name="ShortBooking" component={ShortBookingLinkScreen} />
              <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
              <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
              <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
              <Stack.Screen name="Clinics" component={ClinicsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </LocationProvider>
      </TrackingProvider>
    </MetadataProvider>
  );
}
