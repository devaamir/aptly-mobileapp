import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SendOtpResponse,
  VerifyOtpResponse,
  VerifyFirebaseTokenResponse,
  CreatePatientResponse,
  Specialty,
  MedicalSystem,
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
  VerifyFirebaseTokenResponse,
  CreatePatientResponse,
  Specialty,
  MedicalSystem,
  Doctor,
  Clinic,
  Pagination,
  HomeData,
  Appointment,
  Schedule,
  Patient,
};

// const baseURL = 'https://aptly-server.onrender.com/api'; // dev
const baseURL = 'https://api.aptly.care/api'; // prod
export const IS_DEV = baseURL.includes('onrender.com');

// Phone numbers that receive OTP auto-fill even in production (bypassed numbers)
const BYPASS_PHONES = ['7736221905']; // add your test numbers here
export const isBypassPhone = (phone: string) =>
  IS_DEV || BYPASS_PHONES.includes(phone.replace(/\D/g, ''));

const api = axios.create({
  // baseURL: 'https://aptly-server.onrender.com/api', // dev
  baseURL: baseURL, // prod
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Called by AuthContext to keep tokens in sync after refresh
let onTokenRefreshed:
  | ((accessToken: string, refreshToken: string) => void)
  | null = null;
export const setTokenRefreshCallback = (cb: typeof onTokenRefreshed) => {
  onTokenRefreshed = cb;
};

// Queue for requests that arrive while a token refresh is in progress
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response.data,
  async error => {
    const original = error.config;

    if (error?.response?.status === 401 && !original._retry) {
      // Another refresh is already in flight — queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        // No refresh token stored — bail out immediately
        if (!refreshToken) {
          processQueue(error, null);
          return Promise.reject(error?.response?.data || error);
        }

        const res = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefresh } = res.data.data;

        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRefresh],
        ]);
        onTokenRefreshed?.(accessToken, newRefresh);
        processQueue(null, accessToken);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error?.response?.data || error);
  },
);

export default api;

// Auth
export const sendOtp = (phoneNumber: string): Promise<SendOtpResponse> =>
  api.post('/auth/send-otp', { phoneNumber });

export const verifyOtp = (
  phoneNumber: string,
  code: string,
): Promise<VerifyOtpResponse> =>
  api.post('/auth/verify-otp', { phoneNumber, code });

export const verifyFirebaseToken = (
  idToken: string,
): Promise<VerifyFirebaseTokenResponse> =>
  api.post('/auth/verify-firebase-token', { idToken });

export const deleteAccount = (): Promise<{
  success: boolean;
  message: string;
}> => api.delete('/auth/account');

// Patients
export const createPatient = (
  name: string,
  gender: string,
  dateOfBirth: string,
): Promise<CreatePatientResponse> =>
  api.put('/patients/me', { name, gender, dateOfBirth });

export const addPatient = (
  name: string,
  phoneNumber: string,
  gender: string,
  dateOfBirth: string,
): Promise<{ success: boolean; data: Patient }> =>
  api.post('/patients', { name, phoneNumber, gender, dateOfBirth });

export const updatePatient = (
  patientId: string,
  name: string,
  gender: string,
  dateOfBirth: string,
): Promise<{ success: boolean; data: Patient }> =>
  api.patch(`/patients/${patientId}`, { name, gender, dateOfBirth });

export const getPatients = (): Promise<{ success: boolean; data: Patient[] }> =>
  api.get('/patients');

// specialties
export const getspecialties = (): Promise<{
  success: boolean;
  data: Specialty[];
}> => api.get('/metadata/specialties');

export const getDoctorSchedule = (
  id: string,
  date: string,
  medicalCenterId?: string,
): Promise<{ success: boolean; data: Schedule[] }> =>
  api.get(`/doctors/${id}/schedule`, {
    params: { date, ...(medicalCenterId ? { medicalCenterId } : {}) },
  });

export const getMedicalSystems = (): Promise<{
  success: boolean;
  data: MedicalSystem[];
}> => api.get('/metadata/medical-systems');

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
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters) {
    Object.entries(filters).forEach(
      ([k, v]) => v !== undefined && params.append(k, String(v)),
    );
  }
  return api.get(`/doctors?${params.toString()}`);
};

export const getDoctor = (
  id: string,
): Promise<{ success: boolean; data: Doctor }> => api.get(`/doctors/${id}`);

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
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters) {
    Object.entries(filters).forEach(
      ([k, v]) => v !== undefined && params.append(k, String(v)),
    );
  }
  return api.get(`/clinics?${params.toString()}`);
};

export const getClinic = (
  id: string,
): Promise<{ success: boolean; data: Clinic }> => api.get(`/clinics/${id}`);

// Home
export const getHomeData = (
  latitude?: number,
  longitude?: number,
): Promise<{ success: boolean; data: HomeData }> =>
  api.get('/ui/home', { params: { latitude, longitude } });

export const searchLocations = (
  q: string,
): Promise<{
  success: boolean;
  data: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    mainText: string;
    secondaryText: string;
    types: string[];
  }[];
}> => api.get(`/ui/locations?q=${encodeURIComponent(q)}`);

export const reverseGeocode = (
  latitude: number,
  longitude: number,
): Promise<{
  success: boolean;
  data: { address: string; name: string; placeId: string; types: string[] };
}> => api.get(`/ui/reverse-geocode`, { params: { latitude, longitude } });

export const searchAll = (
  q: string,
): Promise<{ success: boolean; data: (Doctor | Clinic)[] }> =>
  api.get(`/ui/search?q=${encodeURIComponent(q)}`);

// Appointments
export const getAppointments = (
  page = 1,
  limit = 20,
): Promise<{ success: boolean; data: Appointment[] }> =>
  api.get(`/appointments?page=${page}&limit=${limit}`);

export const getAppointment = (
  id: string,
): Promise<{ success: boolean; data: Appointment }> =>
  api.get(`/appointments/${id}`);

export const createAppointment = (
  appointmentDate: string,
  doctorScheduleId: string,
  patientId: string,
): Promise<{ success: boolean; data: Appointment }> =>
  api.post('/appointments', { appointmentDate, doctorScheduleId, patientId });

export const cancelAppointment = (id: string): Promise<{ success: boolean }> =>
  api.patch(`/appointments/${id}/status`, { tokenStatus: 'cancelled' });

export type TrackData = {
  appointments: {
    id: string;
    tokenNumber: number;
    tokenStatus: string;
    createdAt: string;
    updatedAt: string;
    patient: {
      name: string;
      phoneNumber: string;
      gender: string;
      dateOfBirth: string;
    };
    doctor: { estimateConsultationTime: number };
  }[];
  activePauses: {
    id: string;
    date: string;
    startTime: string;
    stopTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

export function trackAppointment(
  id: string,
  onData: (data: TrackData) => void,
  onError?: (err: unknown) => void,
): () => void {
  let es: any = null;

  AsyncStorage.getItem('accessToken').then(token => {
    const EventSource = require('react-native-sse').default;
    es = new EventSource(`${baseURL}/appointments/${id}/track`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    es.addEventListener('message', (e: any) => {
      console.log('[SSE] message:', e.data);
      try {
        onData(JSON.parse(e.data));
      } catch {}
    });
    es.addEventListener('error', (e: any) => {
      console.log('[SSE] error:', e);
      onError?.(e);
    });
  });

  return () => {
    es?.close();
  };
}
