import React, { createContext, useContext, useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { reverseGeocode } from '../services/api';

export interface AppLocation {
  mainText: string;       // e.g. "Panakkad"
  secondaryText: string;  // e.g. "Malappuram, Kerala, India"
  latitude: number;
  longitude: number;
  isGps: boolean;         // true = from device GPS, false = user-selected
}

interface LocationContextType {
  location: AppLocation | null;
  setLocation: (loc: AppLocation) => void;
  ready: boolean; // true once GPS attempt is complete (success or fail)
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocationState] = useState<AppLocation | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
          /* fallback to defaults */
        }
        setLocationState({ mainText, secondaryText, latitude, longitude, isGps: true });
        setReady(true);
      },
      () => setReady(true),
      { timeout: 8000, maximumAge: 0 },
    );
  }, []);

  const setLocation = (loc: AppLocation) => setLocationState(loc);

  return (
    <LocationContext.Provider value={{ location, setLocation, ready }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
