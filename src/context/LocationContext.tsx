import React, { createContext, useContext, useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reverseGeocode } from '../services/api';
import { requestLocationPermission } from '../utils/requestLocationPermission';

export interface AppLocation {
  mainText: string;
  secondaryText: string;
  latitude: number;
  longitude: number;
  isGps: boolean;
}

interface LocationContextType {
  location: AppLocation | null;
  setLocation: (loc: AppLocation) => void;
  ready: boolean;
  loadingLocation: boolean;
  initLocation: () => void; // call this after login
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocationState] = useState<AppLocation | null>(null);
  const [ready, setReady] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const initLocation = async () => {
    setLoadingLocation(true);
    await requestLocationPermission();
    Geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        let mainText = 'Current Location';
        let secondaryText = '';
        try {
          const res = await reverseGeocode(latitude, longitude);
          mainText = res.data.name;
          secondaryText = res.data.address;
        } catch (error) {
          console.log(error, '-------');
        }
        setLocationState({ mainText, secondaryText, latitude, longitude, isGps: true });
        setLoadingLocation(false);
        setReady(true);
      },
      () => {
        setLoadingLocation(false);
        setReady(true);
      },
      { timeout: 8000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    // Only init if already logged in (returning user)
    AsyncStorage.getItem('accessToken').then(token => {
      if (token) initLocation();
      else setReady(true);
    });
  }, []);

  const setLocation = (loc: AppLocation) => setLocationState(loc);

  return (
    <LocationContext.Provider value={{ location, setLocation, ready, loadingLocation, initLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
