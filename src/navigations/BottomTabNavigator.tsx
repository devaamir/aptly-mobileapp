import React, { useState } from 'react';
import { Image, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeActive from '../assets/icons/home-active.svg';
import HomeInactive from '../assets/icons/home-inactive.svg';
import BookingsActive from '../assets/icons/bookings-active.svg';
import BookingsInactive from '../assets/icons/bookings-inactive.svg';
import ProfileActive from '../assets/icons/profile-active.svg';
import ProfileInactive from '../assets/icons/profile-inactive.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

const Tab = createBottomTabNavigator();

const ICON_SIZE = SIZE(24);

export default function BottomTabNavigator() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { fontFamily: 'Manrope-Medium', fontSize: SIZE(11) },
          tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.white, ...(Platform.OS === 'web' && { height: 80, paddingBottom: 8 }) },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) =>
              focused
                ? <HomeActive width={ICON_SIZE} height={ICON_SIZE} />
                : <HomeInactive width={ICON_SIZE} height={ICON_SIZE} />,
          }}
        />
        <Tab.Screen
          name="Appointments"
          component={AppointmentScreen}
          listeners={{
            tabPress: e => {
              if (!user) {
                // Block navigation and show the login modal instead
                e.preventDefault();
                setShowLoginModal(true);
              }
            },
          }}
          options={{
            tabBarIcon: ({ focused }) =>
              focused
                ? <BookingsActive width={ICON_SIZE} height={ICON_SIZE} />
                : <BookingsInactive width={ICON_SIZE} height={ICON_SIZE} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../assets/images/user-profile.png')}
                style={{ width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2, opacity: focused ? 1 : 0.5, borderWidth: focused ? 1 : 0, borderColor: colors.primary }}
              />
            ),
          }}
        />
      </Tab.Navigator>

      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
