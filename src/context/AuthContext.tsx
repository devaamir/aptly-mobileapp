import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokenRefreshCallback } from '../services/api';

interface AuthUser {
  userId: string;
  patientId: string;
  name: string;
  phoneNumber: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  gender: string;
  dateOfBirth: string;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(['userId', 'patientId', 'name', 'phoneNumber', 'email', 'accessToken', 'refreshToken', 'gender', 'dateOfBirth'])
      .then(entries => {
        const [userId, patientId, name, phoneNumber, email, accessToken, refreshToken, gender, dateOfBirth] = entries.map(e => e[1] ?? '');
        if (accessToken) setUserState({ userId, patientId, name, phoneNumber, email, accessToken, refreshToken, gender, dateOfBirth });
      });

    setTokenRefreshCallback((accessToken, refreshToken) => {
      setUserState(prev => prev ? { ...prev, accessToken, refreshToken } : prev);
    });
  }, []);

  const setUser = (u: AuthUser | null) => setUserState(u);

  const updateUser = (partial: Partial<AuthUser>) =>
    setUserState(prev => prev ? { ...prev, ...partial } : prev);

  return <AuthContext.Provider value={{ user, setUser, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
