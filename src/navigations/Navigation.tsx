import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneNumberScreen from '../screens/PhoneNumberScreen';
import OtpScreen from '../screens/OtpScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import BottomTabNavigator from './BottomTabNavigator';
import TokenDetailScreen from '../screens/TokenDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import SpecialistScreen from '../screens/SpecialistScreen';
import SpecialistDetailScreen from '../screens/SpecialistDetailScreen';
import DoctorsScreen from '../screens/DoctorsScreen';
import DoctorDetailScreen from '../screens/DoctorDetailScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import BookingConfirmedScreen from '../screens/BookingConfirmedScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import HospitalDetailScreen from '../screens/HospitalDetailScreen';

export type RootStackParamList = {
  PhoneNumber: undefined;
  Otp: { phone: string; code: number };
  CreateProfile: undefined;
  Main: undefined;
  TokenDetail: undefined;
  Search: undefined;
  Specialist: undefined;
  SpecialistDetail: { name: string; desc: string; clinics: number; doctors: number };
  Doctors: undefined;
  DoctorDetail: { name: string; type: string; hospital: string; clinicType: string; experience: string; location: string; rating: string; status: string };
  BookAppointment: { name: string; type: string; hospital: string };
  BookingConfirmed: { token: number; doctorName: string; hospital: string; date: string };
  AppointmentDetail: { doctor: string; type: string; hospital: string; date: string; time: string; token: number; status: string };
  HospitalDetail: { name: string; speciality: string; location: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const [initialRoute, setInitialRoute] = useState<'PhoneNumber' | 'CreateProfile' | 'Main' | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(['accessToken', 'name']).then(([tokenEntry, nameEntry]) => {
      const token = tokenEntry[1];
      const name = nameEntry[1];
      if (!token) setInitialRoute('PhoneNumber');
      else if (!name) setInitialRoute('CreateProfile');
      else setInitialRoute('Main');
    });
  }, []);

  if (initialRoute === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen
          name="TokenDetail"
          component={TokenDetailScreen}
          options={{animation: 'slide_from_bottom'}}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{animation: 'fade'}}
        />
        <Stack.Screen name="Specialist" component={SpecialistScreen} />
        <Stack.Screen name="SpecialistDetail" component={SpecialistDetailScreen} />
        <Stack.Screen name="Doctors" component={DoctorsScreen} />
        <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
        <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
        <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
