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
    'Find and book appointments with top doctors and clinics near you. Search by specialty, track your token live and get instant confirmation.',
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

const TITLE_MAX = 60; // Google shows roughly this many characters of a title
const DESCRIPTION_MAX = 155; // ...and of a description

const clampText = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, '')}…`;

/** First non-empty candidate within `max` characters, else `fallback` */
const firstThatFits = (candidates: string[], max: number, fallback: string) =>
  candidates.find(c => c && c.length <= max) ?? fallback;

/**
 * Returns title + description for a Doctor detail page.
 * @param doctorName  e.g. "Dr. Rahul Sharma"
 * @param specialty   e.g. "Cardiologist"
 */
export function doctorPageMeta(
  doctorName: string,
  specialty?: string,
  extra?: { qualifications?: string[]; experienceYears?: number; clinicName?: string; area?: string },
) {
  // Title: name + main specialty + area, i.e. what people type ("cardiologist in Manjeri")
  const mainSpec = specialty?.split(',')[0].trim();
  const area = extra?.area?.trim();
  const title = firstThatFits(
    [
      mainSpec && area ? `${doctorName} – ${mainSpec} in ${area} | Book Appointment` : '',
      mainSpec ? `${doctorName} – ${mainSpec} | Book Appointment` : '',
      mainSpec ? `${doctorName} – ${mainSpec} | Aptly` : '',
      `${doctorName} | Book Appointment on Aptly`,
      `${doctorName} | Book Appointment`,
    ],
    TITLE_MAX,
    doctorName,
  );

  // Description, most useful first: name (degree), specialties, clinic + area, experience, call to action.
  // e.g. "Dr. Amrutha P (BAMS) – Postnatal Care and more at Ayushee Ayur Clinic, Malappuram.
  //       10 years of experience. Book an appointment on Aptly."
  const quals = (extra?.qualifications ?? []).filter(Boolean).join(', ');
  // Some doctors list many specialties; name only the first few so the rest still fits
  const specs = (specialty ?? '').split(',').map(x => x.trim()).filter(Boolean);
  const specText = (n: number) =>
    specs.length ? ` – ${specs.slice(0, n).join(', ')}${specs.length > n ? ' and more' : ''}` : '';
  const at = (withClinic: boolean) =>
    withClinic && extra?.clinicName ? ` at ${extra.clinicName}${area ? `, ${area}` : ''}` : area ? ` in ${area}` : '';
  const years = extra?.experienceYears && extra.experienceYears > 0
    ? ` ${extra.experienceYears} ${extra.experienceYears === 1 ? 'year' : 'years'} of experience.`
    : '';
  const who = (n: number, withClinic = true) =>
    `${doctorName}${quals ? ` (${quals})` : ''}${specText(n)}${at(withClinic)}.`;
  const tail = ' Book an appointment and track your token live on Aptly.';
  const shortTail = ' Book an appointment on Aptly.';
  const tiny = ' Book on Aptly.';
  const description = clampText(
    firstThatFits(
      [
        who(3) + years + tail,
        who(3) + years + shortTail,
        who(2) + years + shortTail,
        who(1) + years + shortTail,
        who(1) + years + tiny,
        who(2, false) + years + shortTail,
        who(1, false) + years + shortTail,
        who(1, false) + shortTail,
        who(1, false),
      ],
      DESCRIPTION_MAX,
      who(1, false),
    ),
    DESCRIPTION_MAX,
  );

  return { title, description };
}

/**
 * Returns title + description for a Clinic / Hospital detail page.
 * @param clinicName  e.g. "City Health Clinic"
 * @param location    e.g. "Kozhikode, Kerala"
 */
// How people describe the kind of clinic when searching.
const SYSTEM_LABELS: Record<string, string> = {
  homeopathy: 'Homeopathy clinic',
  ayurveda: 'Ayurveda clinic',
  unani: 'Unani clinic',
  dentistry: 'Dental clinic',
};
const article = (word: string) => (/^[aeio]/i.test(word) ? 'an' : 'a');

/**
 * Title + description for a Clinic / Hospital detail page.
 * Title (kept within TITLE_MAX): clinic name + type of clinic + area + "Book Appointment",
 * i.e. the words people search for. The full address and specialties go in the description.
 * @param location  "address, district"; the last part is used as the area in the title
 */
export function clinicPageMeta(
  clinicName: string,
  location?: string,
  extra?: { system?: string; specialties?: string[] },
) {
  const loc = location ? ` in ${location}` : '';
  const area = location ? location.split(',').pop()!.trim() : '';

  const label = extra?.system ? SYSTEM_LABELS[extra.system.toLowerCase()] : undefined;
  const labelWord = label?.split(' ')[0].toLowerCase();
  const showLabel = !!label && !clinicName.toLowerCase().includes(labelWord!);
  const inArea = area ? ` in ${area}` : '';

  const title =
    [
      showLabel ? `${clinicName} – ${label}${inArea} | Book Appointment` : '',
      `${clinicName}${inArea} | Book Appointment`,
      `${clinicName}${area ? `, ${area}` : ''} – Book Appointment | Aptly`,
      `${clinicName}${area ? `, ${area}` : ''} – Book Appointment`,
      `${clinicName} | Book Appointment`,
      `${clinicName}${area ? `, ${area}` : ''} | Aptly`,
      `${clinicName}${area ? `, ${area}` : ''}`,
    ].find(c => c && c.length <= TITLE_MAX) ?? clinicName;

  // Description: what the clinic is and where, what it treats, then the call to action
  const specs = extra?.specialties?.filter(Boolean) ?? [];
  const specList = (n: number) =>
    specs.length ? ` Specialties: ${specs.slice(0, n).join(', ')}${specs.length > n ? ' and more' : ''}.` : '';
  // Full address first; with a long name the area alone leaves room for the specialties
  const introAt = (where: string) =>
    showLabel && label ? `${clinicName}, ${article(label)} ${label}${where}.` : `${clinicName}${where}.`;
  const intro = introAt(loc);
  const shortIntro = introAt(inArea);
  const tail = ' Book an appointment online and track your token live on Aptly.';
  const shortTail = ' Book an appointment on Aptly.';
  const description = clampText(
    firstThatFits(
      [
        intro + specList(4) + tail,
        intro + specList(3) + tail,
        intro + specList(2) + tail,
        intro + specList(3) + shortTail,
        intro + specList(2) + shortTail,
        intro + specList(1) + shortTail,
        shortIntro + specList(3) + shortTail,
        shortIntro + specList(2) + shortTail,
        shortIntro + specList(1) + shortTail,
        intro + tail,
        intro + shortTail,
      ],
      DESCRIPTION_MAX,
      `Book an appointment at ${clinicName}${loc}.`,
    ),
    DESCRIPTION_MAX,
  );

  return { title, description };
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
  const url = `${BASE_URL}/DoctorDetail?doctorId=${params.doctorId}`;
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
        urlTemplate: `${BASE_URL}/DoctorDetail?doctorId=${params.doctorId}`,
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
