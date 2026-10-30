import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
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
const linking = {
  prefixes: ['https://qr.aptly.care', 'https://app.aptly.care', 'http://localhost:8080'],
  config: {
    screens: {
      HospitalDetail: {
        path: 'c/:id',
      },
      Clinics: 'Clinics',
      Doctors: 'Doctors',
      specialst: 'specialst',
      SpecialstDetail: 'SpecialstDetail',
      DoctorDetail: 'DoctorDetail',
      Search: 'Search',
      SearchResult: 'SearchResult',
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
            </Stack.Navigator>
          </NavigationContainer>
        </LocationProvider>
      </TrackingProvider>
    </MetadataProvider>
  );
}
