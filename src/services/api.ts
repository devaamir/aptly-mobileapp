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

// Called by AuthContext to keep tokens in sync after refresh
let onTokenRefreshed: ((accessToken: string, refreshToken: string) => void) | null = null;
export const setTokenRefreshCallback = (cb: typeof onTokenRefreshed) => { onTokenRefreshed = cb; };

api.interceptors.response.use(
  response => response.data,
  async error => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        console.log("refresh token", refreshToken);

        const res = await axios.post(
          'https://aptly-server.onrender.com/api/auth/refresh-token',
          { refreshToken },
        );
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        await AsyncStorage.multiSet([['accessToken', accessToken], ['refreshToken', newRefresh]]);
        onTokenRefreshed?.(accessToken, newRefresh);
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

export const addPatient = (
  name: string, phoneNumber: string, gender: string, dateOfBirth: string,
): Promise<{ success: boolean; data: Patient }> =>
  api.post('/patients', { name, phoneNumber, gender, dateOfBirth });

export const updatePatient = (
  patientId: string, name: string, gender: string, dateOfBirth: string,
): Promise<{ success: boolean; data: Patient }> =>
  api.patch(`/patients/${patientId}`, { name, gender, dateOfBirth });

export const getPatients = (): Promise<{ success: boolean; data: Patient[] }> =>
  api.get('/patients');

// specialties
export const getspecialties = (): Promise<{ success: boolean; data: Specialty[] }> =>
  api.get('/metadata/specialties');

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

export const getClinic = (id: string): Promise<{ success: boolean; data: Clinic }> =>
  api.get(`/clinics/${id}`);

// Home
export const getHomeData = (latitude?: number, longitude?: number): Promise<{ success: boolean; data: HomeData }> =>
  api.get('/ui/home', { params: { latitude, longitude } });

export const searchLocations = (q: string): Promise<{ success: boolean; data: { description: string; placeId: string; latitude: number; longitude: number; mainText: string; secondaryText: string; types: string[] }[] }> =>
  api.get(`/ui/locations?q=${encodeURIComponent(q)}`);

export const searchAll = (q: string): Promise<{ success: boolean; data: (Doctor | Clinic)[] }> =>
  api.get(`/ui/search?q=${encodeURIComponent(q)}`);

// Appointments
export const getAppointments = (page = 1, limit = 20): Promise<{ success: boolean; data: Appointment[] }> =>
  api.get(`/appointments?page=${page}&limit=${limit}`);

export const getAppointment = (id: string): Promise<{ success: boolean; data: Appointment }> =>
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
  appointments: { tokenNumber: number; tokenStatus: string; createdAt: string; updatedAt: string }[];
  activePauses: { id: string; date: string; startTime: string; stopTime: string; status: string; createdAt: string; updatedAt: string }[];
};

export function trackAppointment(
  id: string,
  onData: (data: TrackData) => void,
  onError?: (err: unknown) => void,
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`https://aptly-server.onrender.com/api/appointments/${id}/track`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try { onData(JSON.parse(line.slice(5).trim())); } catch {}
          }
        }
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') onError?.(err);
    }
  })();

  return () => controller.abort();
}
