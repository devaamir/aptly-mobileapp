import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation, { navigationRef } from './src/navigations/Navigation';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
import { setSessionExpiredCallback } from './src/services/api';

// Appointment ID that arrived before navigation was ready (cold-start)
let pendingAppointmentId: string | null = null;

function openAppointment(appointmentId: string) {
  if (!appointmentId) return;
  if (navigationRef.isReady()) {
    navigationRef.navigate('AppointmentDetail', { id: appointmentId } as any);
  } else {
    pendingAppointmentId = appointmentId;
  }
}

function AppContent() {
  const { setUser } = useAuth();

  useNotifications(data => {
    const appointmentId = data?.appointmentId;
    if (appointmentId) openAppointment(appointmentId);
  });

  // Force logout when the refresh token is expired/invalid
  React.useEffect(() => {
    setSessionExpiredCallback(async () => {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'patientId', 'name', 'phoneNumber', 'email']);
      setUser(null);
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'PhoneNumber' as never }] });
      }
    });
  }, []);

  // Flush any appointment that arrived before navigation was ready
  React.useEffect(() => {
    if (pendingAppointmentId && navigationRef.isReady()) {
      navigationRef.navigate('AppointmentDetail', { id: pendingAppointmentId } as any);
      pendingAppointmentId = null;
    }
  });

  return <Navigation />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
