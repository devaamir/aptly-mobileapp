import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation, { navigationRef } from './src/navigations/Navigation';
import { AuthProvider } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';

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
  useNotifications(data => {
    const appointmentId = data?.appointmentId;
    if (appointmentId) openAppointment(appointmentId);
  });

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
