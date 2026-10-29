/**
 * SEO utilities for Aptly.
 *
 * Provides helpers to build JSON-LD structured data for different entity types
 * (Clinic / MedicalOrganization, Doctor / Physician, Specialty page).
 *
 * Usage:
 *   import { buildClinicSchema, buildDoctorSchema } from '../utils/seo';
 *   // then inject via <Helmet><script type="application/ld+json">{JSON.stringify(schema)}</script></Helmet>
 */

export const SITE_NAME = 'Aptly';
export const BASE_URL = 'https://app.aptly.care';
export const DEFAULT_OG_IMAGE = `${BASE_URL}/icon-512.png`;

// ─── Page-level meta helpers ─────────────────────────────────────────────────

/** Returns title + description for the Home / landing page */
export const homeMeta = {
  title: 'Aptly – Book Doctor & Clinic Appointments Near You',
  description:
    'Find and book appointments with top doctors and clinics near you. Search by specialty — cardiologist, dermatologist, dentist, and more. Instant confirmation, real-time token tracking.',
};

/** Returns title + description for the Clinics listing page */
export const clinicsMeta = {
  title: 'Clinics Near You – Book Now | Aptly',
  description:
    'Browse clinics near you on Aptly. Filter by specialty, distance, and availability. Book an appointment instantly — no waiting on the phone.',
};

/** Returns title + description for the Doctors listing page */
export const doctorsMeta = {
  title: 'Doctors Near You – Book an Appointment | Aptly',
  description:
    'Find top-rated doctors near you on Aptly. Search by specialty, location, and availability. Book in seconds with real-time token tracking.',
};

/** Returns title + description for the Specialties listing page */
export const specialtiesMeta = {
  title: 'Medical Specialties – Find the Right Doctor | Aptly',
  description:
    'Browse all medical specialties on Aptly. Find the right doctor or clinic — cardiologist, dermatologist, pediatrician, orthopedic, and more.',
};

/**
 * Returns title + description for a Specialty detail page.
 * @param specialtyName  e.g. "Cardiology"
 */
export function specialtyPageMeta(specialtyName: string) {
  return {
    title: `${specialtyName} Doctors & Clinics Near You | Aptly`,
    description: `Find the best ${specialtyName} doctors and clinics near you on Aptly. Book an appointment instantly with real-time token tracking.`,
  };
}

/**
 * Returns title + description for a Doctor detail page.
 * @param doctorName  e.g. "Dr. Rahul Sharma"
 * @param specialty   e.g. "Cardiologist"
 */
export function doctorPageMeta(doctorName: string, specialty?: string) {
  const spec = specialty ? ` – ${specialty}` : '';
  return {
    title: `${doctorName}${spec} | Book Appointment on Aptly`,
    description: `Book an appointment with ${doctorName}${specialty ? `, ${specialty},` : ''} on Aptly. View clinic locations, working hours, and available slots.`,
  };
}

/**
 * Returns title + description for a Clinic / Hospital detail page.
 * @param clinicName  e.g. "City Health Clinic"
 * @param location    e.g. "Kozhikode, Kerala"
 */
export function clinicPageMeta(clinicName: string, location?: string) {
  const loc = location ? ` in ${location}` : '';
  return {
    title: `${clinicName}${loc} – Book Appointment | Aptly`,
    description: `Book an appointment at ${clinicName}${loc} on Aptly. View doctors, specialties, working hours, and get real-time queue updates.`,
  };
}

// ─── JSON-LD Structured Data builders ────────────────────────────────────────

export interface ClinicSchemaParams {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  specialties?: string[];
  image?: string;
  openingHours?: string[]; // e.g. ["Mo-Fr 09:00-17:00"]
}

/**
 * Builds a schema.org MedicalOrganization + LocalBusiness JSON-LD for a clinic.
 * This is the primary signal for "clinic near me" queries.
 */
export function buildClinicSchema(params: ClinicSchemaParams): object {
  const url = `${BASE_URL}/c/${params.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalOrganization', 'LocalBusiness'],
    '@id': url,
    name: params.name,
    url,
    ...(params.image ? { image: params.image } : {}),
    ...(params.phone ? { telephone: params.phone } : {}),
    ...(params.website ? { sameAs: [params.website] } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address ?? '',
      addressLocality: params.city ?? '',
      addressRegion: params.state ?? '',
      addressCountry: 'IN',
    },
    ...(params.latitude && params.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: params.latitude,
            longitude: params.longitude,
          },
        }
      : {}),
    ...(params.specialties && params.specialties.length > 0
      ? {
          medicalSpecialty: params.specialties,
        }
      : {}),
    ...(params.openingHours && params.openingHours.length > 0
      ? { openingHours: params.openingHours }
      : {}),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: url,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: 'Book Appointment',
      },
    },
  };
}

export interface DoctorSchemaParams {
  doctorId: string;
  name: string;
  specialty?: string;
  image?: string;
  hospital?: { name: string; address?: string; id?: string };
}

/**
 * Builds a schema.org Physician JSON-LD for a doctor profile.
 * Signals for "cardiologist near me" type queries.
 */
export function buildDoctorSchema(params: DoctorSchemaParams): object {
  const url = `${BASE_URL}/doctor/${params.doctorId}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': url,
    name: params.name,
    url,
    ...(params.image ? { image: params.image } : {}),
    ...(params.specialty
      ? { medicalSpecialty: params.specialty }
      : {}),
    ...(params.hospital
      ? {
          hospitalAffiliation: {
            '@type': 'MedicalOrganization',
            name: params.hospital.name,
            ...(params.hospital.address ? { address: params.hospital.address } : {}),
            ...(params.hospital.id
              ? { '@id': `${BASE_URL}/c/${params.hospital.id}` }
              : {}),
          },
        }
      : {}),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/doctor/${params.doctorId}`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: 'Book Appointment',
      },
    },
  };
}

/**
 * Builds a schema.org MedicalWebPage JSON-LD for a specialty listing page.
 */
export function buildSpecialtySchema(specialtyName: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${specialtyName} Doctors & Clinics Near You`,
    url: `${BASE_URL}/specialties/${specialtyName.toLowerCase()}`,
    specialty: specialtyName,
    description: `Find the best ${specialtyName} doctors and clinics near you. Book an appointment on Aptly.`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
  };
}

/**
 * Builds a BreadcrumbList JSON-LD.
 * @param items  Array of { name, url } from root to current page.
 */
export function buildBreadcrumbSchema(
  items: { name: string; url: string }[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Serialises a schema object to an inline <script> JSON string.
 * Use inside Helmet:
 *   <script type="application/ld+json">{schemaToString(schema)}</script>
 */
export function schemaToString(schema: object): string {
  return JSON.stringify(schema);
}
