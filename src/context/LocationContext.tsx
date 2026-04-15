import React, { createContext, useContext, useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';

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
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocationState] = useState<AppLocation | null>(null);

  // On mount: get GPS coords (session only — no persistence)
  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationState({
          mainText: 'Current Location',
          secondaryText: '',
          latitude: coords.latitude,
          longitude: coords.longitude,
          isGps: true,
        });
      },
      () => { /* no GPS — leave null, user can select manually */ },
      { timeout: 8000, maximumAge: 0 },
    );
  }, []);

  const setLocation = (loc: AppLocation) => setLocationState(loc);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
