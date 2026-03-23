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

export type RootStackParamList = {
  PhoneNumber: undefined;
  Otp: undefined;
  CreateProfile: undefined;
  Main: undefined;
  TokenDetail: undefined;
  Search: undefined;
  Specialist: undefined;
  SpecialistDetail: { name: string; desc: string; clinics: number; doctors: number };
  Doctors: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('isLoggedIn').then(val => setIsLoggedIn(val === 'true'));
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Main' : 'PhoneNumber'}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
