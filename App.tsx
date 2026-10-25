import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation, { navigationRef } from './src/navigations/Navigation';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import { setSessionExpiredCallback } from './src/services/api';

function AppContent() {
  const { setUser } = useAuth();

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
