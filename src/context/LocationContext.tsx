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
  distance: number;
  setDistance: (d: number) => void;
  ready: boolean;
  loadingLocation: boolean;
  initLocation: () => void; // call this after login
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocationState] = useState<AppLocation | null>(null);
  const [distance, setDistance] = useState(25);
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
          const cached = await AsyncStorage.getItem('gps_location_cache');
          if (cached) {
            const parsed = JSON.parse(cached);
            const latDiff = Math.abs(parsed.latitude - latitude);
            const lonDiff = Math.abs(parsed.longitude - longitude);
            if (latDiff < 0.01 && lonDiff < 0.01) {
              mainText = parsed.mainText;
              secondaryText = parsed.secondaryText;
              setLocationState({ mainText, secondaryText, latitude, longitude, isGps: true });
              setLoadingLocation(false);
              setReady(true);
              return;
            }
          }
          const res = await reverseGeocode(latitude, longitude);
          mainText = res.data.name;
          secondaryText = res.data.address;
          await AsyncStorage.setItem('gps_location_cache', JSON.stringify({ latitude, longitude, mainText, secondaryText }));
        } catch {
          // use defaults if geocode fails or cache is corrupt
        }
        setLocationState({ mainText, secondaryText, latitude, longitude, isGps: true });
        setLoadingLocation(false);
        setReady(true);
      },
      () => {
        setLoadingLocation(false);
        setReady(true);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  useEffect(() => {
    // Init for logged-in users and users who skipped login
    AsyncStorage.multiGet(['accessToken', 'skipped']).then(([tokenEntry, skippedEntry]) => {
      const token = tokenEntry[1];
      const skipped = skippedEntry[1];
      if (token || skipped === 'true') initLocation();
      else setReady(true);
    });
  }, []);

  const setLocation = (loc: AppLocation) => {
    if (!loc.isGps) AsyncStorage.removeItem('gps_location_cache');
    setLocationState(loc);
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, distance, setDistance, ready, loadingLocation, initLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
