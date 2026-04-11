export interface SendOtpResponse {
  success: boolean;
  message: string;
  data: {
    expiresAt: string;
    resendWaitTime: number;
    code: number;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  verified: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string | null;
      phoneNumber: string;
      emailAddress: string;
      createdAt: string;
      updatedAt: string;
    };
    patient: {
      id: string;
      name: string;
      referenceId: string;
      phoneNumber: string;
      gender: string;
      dateOfBirth: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    } | null;
  };
}

export interface CreatePatientResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    referenceId: string;
    phoneNumber: string;
    gender: string;
    dateOfBirth: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
  };
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  stopTime: string;
  tokenLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalCenter {
  id: string;
  name: string;
  type: string;
  phoneNumber: string;
  emailAddress: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  state: string;
  country: string;
  about: string;
  alternatePhoneNumber: string;
  websiteUrl: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  schedules?: Schedule[];
}

export interface MedicalSystem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  phoneNumber: string;
  emailAddress: string;
  yearsOfExperience: number;
  advanceBookingLimit: number;
  estimateConsultationTime: number;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  state: string;
  country: string;
  about: string;
  consultationFee: number;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  specialties: Specialty[];
  medicalCenters: MedicalCenter[];
  medicalSystem: MedicalSystem;
  qualifications: {id: string; name: string; createdAt: string; updatedAt: string}[];
}

export interface Clinic {
  id: string;
  name: string;
  type: string;
  phoneNumber: string;
  emailAddress: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  state: string;
  country: string;
  about: string;
  alternatePhoneNumber: string;
  websiteUrl: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  specialties: Specialty[];
  medicalSystem: MedicalSystem;
  doctors: Doctor[];
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
}

export interface HomeData {
  specialties: Specialty[];
  doctors: Doctor[];
  totalDoctorCount: number;
  topClinics: (Clinic & { distanceInMeters?: number })[];
  appointments: Appointment[];
}

export interface Patient {
  id: string;
  name: string;
  referenceId: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}

export interface Appointment {
  id: string;
  referenceId: string;
  tokenNumber: number;
  appointmentDate: string;
  tokenStatus: string;
  creatorRole: string;
  cancellerRole: string;
  createdAt: string;
  updatedAt: string;
  doctor: Doctor;
  patient: Patient;
  creator: {id: string; name: string; phoneNumber: string; emailAddress: string; createdAt: string; updatedAt: string};
  canceller: {id: string; name: string; phoneNumber: string; emailAddress: string; createdAt: string; updatedAt: string} | null;
  schedule: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    stopTime: string;
    tokenLimit: number;
    createdAt: string;
    updatedAt: string;
  };
  medicalCenter: MedicalCenter;
  activePauses: {
    id: string;
    date: string;
    startTime: string;
    stopTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
}
