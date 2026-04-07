import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SendOtpResponse,
  VerifyOtpResponse,
  CreatePatientResponse,
  Specialty,
  Doctor,
  Clinic,
  Pagination,
  HomeData,
  Appointment,
  Schedule,
  Patient,
} from '../types/api.types';

export type {
  SendOtpResponse,
  VerifyOtpResponse,
  CreatePatientResponse,
  Specialty,
  Doctor,
  Clinic,
  Pagination,
  HomeData,
  Appointment,
  Schedule,
  Patient,
};

const api = axios.create({
  baseURL: 'https://aptly-server.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
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
          { refreshToken },
        );
        const { accessToken, refreshToken: newRefresh } = res.data.data;
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
  api.post('/auth/send-otp', { phoneNumber });

export const verifyOtp = (phoneNumber: string, code: string): Promise<VerifyOtpResponse> =>
  api.post('/auth/verify-otp', { phoneNumber, code });

// Patients
export const createPatient = (
  name: string, gender: string, dateOfBirth: string,
): Promise<CreatePatientResponse> =>
  api.put('/patients/me', { name, gender, dateOfBirth });

export const getPatients = (): Promise<{ success: boolean; data: Patient[] }> =>
  api.get('/patients');

// specialties
export const getspecialties = (): Promise<{ success: boolean; data: Specialty[] }> =>
  api.get('/specialties');

// Doctors
export const getDoctors = (
  page = 1,
  limit = 20,
  filters?: {
    specialtyId?: string;
    search?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    medicalSystemId?: string;
  },
): Promise<{ success: boolean; data: Doctor[]; pagination: Pagination }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
  }
  return api.get(`/doctors?${params.toString()}`);
};

export const getDoctor = (id: string): Promise<{ success: boolean; data: Doctor }> =>
  api.get(`/doctors/${id}`);

// Clinics
export const getClinics = (
  page = 1,
  limit = 20,
  filters?: {
    specialtyId?: string;
    search?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    medicalSystemId?: string;
  },
): Promise<{ success: boolean; data: Clinic[]; pagination: Pagination }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
  }
  return api.get(`/clinics?${params.toString()}`);
};

// Home
export const getHomeData = (): Promise<{ success: boolean; data: HomeData }> =>
  api.get('/ui/home');

export const searchAll = (q: string): Promise<{ success: boolean; data: (Doctor | Clinic)[] }> =>
  api.get(`/ui/search?q=${encodeURIComponent(q)}`);

// Appointments
export const getAppointments = (): Promise<{ success: boolean; data: Appointment[] }> =>
  api.get('/appointments');

export const createAppointment = (
  appointmentDate: string,
  doctorScheduleId: string,
  patientId: string,
): Promise<{ success: boolean; data: Appointment }> =>
  api.post('/appointments', { appointmentDate, doctorScheduleId, patientId });
