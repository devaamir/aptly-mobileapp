import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SendOtpResponse,
  VerifyOtpResponse,
  CreatePatientResponse,
  Speciality,
  Doctor,
  Clinic,
  Pagination,
  HomeData,
} from '../types/api.types';

export type {
  SendOtpResponse,
  VerifyOtpResponse,
  CreatePatientResponse,
  Speciality,
  Doctor,
  Clinic,
  Pagination,
  HomeData,
};

const api = axios.create({
  baseURL: 'https://aptly-server.onrender.com/api',
  headers: {'Content-Type': 'application/json'},
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response.data,
  async error => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const res = await axios.post(
          'https://aptly-server.onrender.com/api/auth/refresh-token',
          {refreshToken},
        );
        const {accessToken, refreshToken: newRefresh} = res.data.data;
        await AsyncStorage.multiSet([['accessToken', accessToken], ['refreshToken', newRefresh]]);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        return Promise.reject(error?.response?.data || error);
      }
    }
    return Promise.reject(error?.response?.data || error);
  },
);

export default api;

// Auth
export const sendOtp = (phoneNumber: string): Promise<SendOtpResponse> =>
  api.post('/auth/send-otp', {phoneNumber});

export const verifyOtp = (phoneNumber: string, code: string): Promise<VerifyOtpResponse> =>
  api.post('/auth/verify-otp', {phoneNumber, code});

// Patients
export const createPatient = (
  name: string, phoneNumber: string, gender: string, dateOfBirth: string,
): Promise<CreatePatientResponse> =>
  api.post('/patients', {name, phoneNumber, gender, dateOfBirth});

// Specialities
export const getSpecialities = (): Promise<{success: boolean; data: Speciality[]}> =>
  api.get('/specialities');

// Doctors
export const getDoctors = (page = 1, limit = 20): Promise<{success: boolean; data: Doctor[]; pagination: Pagination}> =>
  api.get(`/doctors?page=${page}&limit=${limit}`);

// Clinics
export const getClinics = (page = 1, limit = 20): Promise<{success: boolean; data: Clinic[]; pagination: Pagination}> =>
  api.get(`/clinics?page=${page}&limit=${limit}`);

// Home
export const getHomeData = (): Promise<{success: boolean; data: HomeData}> =>
  api.get('/ui/home');
