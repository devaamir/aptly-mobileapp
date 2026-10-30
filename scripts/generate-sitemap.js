#!/usr/bin/env node
/**
 * generate-sitemap.js
 *
 * Fetches all clinics and doctors from the Aptly API (paginating through
 * every page) and writes public/sitemap.xml with:
 *   - Static pages (home, Clinics, Doctors, specialst, specialty detail pages)
 *   - One <url> per clinic  → https://app.aptly.care/c/:id
 *   - One <url> per doctor  → https://app.aptly.care/DoctorDetail?doctorId=:id
 *     (DoctorDetail has no :id slug in the React Navigation linking config,
 *      so we use the query-param form that the app already handles)
 *
 * Usage:
 *   node scripts/generate-sitemap.js
 *
 * Run automatically before every production build by adding it as a
 * pre-step in the web:build npm script:
 *   "web:build": "node scripts/generate-sitemap.js && webpack --config webpack.config.js --mode production"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://app.aptly.care';
const API_BASE = 'https://api.aptly.care/api';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const PAGE_SIZE = 100; // maximum per request to minimise round-trips

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple HTTPS GET that returns parsed JSON. */
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error for ${url}: ${e.message}\nBody: ${data.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

/** Fetch every page of a paginated endpoint and return the combined items. */
async function fetchAll(endpoint) {
  const items = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${API_BASE}${endpoint}?page=${page}&limit=${PAGE_SIZE}`;
    console.log(`  GET ${url}`);
    const json = await get(url);

    if (!json.success) {
      throw new Error(`API returned success=false for ${url}: ${JSON.stringify(json)}`);
    }

    items.push(...(json.data || []));
    totalPages = json.pagination?.totalPages ?? 1;
    page++;
  }

  return items;
}

/** Escape XML special characters. */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Build a single <url> block. */
function urlEntry({ loc, changefreq = 'weekly', priority = '0.7', lastmod }) {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ];
  return lines.filter(Boolean).join('\n');
}

/** ISO-8601 date (YYYY-MM-DD) from a timestamp string, or today if falsy. */
function toDate(ts) {
  const d = ts ? new Date(ts) : new Date();
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Static pages
// ---------------------------------------------------------------------------

const STATIC_PAGES = [
  { loc: `${BASE_URL}/`,          changefreq: 'daily',  priority: '1.0' },
  { loc: `${BASE_URL}/Clinics`,   changefreq: 'daily',  priority: '0.9' },
  { loc: `${BASE_URL}/Doctors`,   changefreq: 'daily',  priority: '0.9' },
  { loc: `${BASE_URL}/specialst`, changefreq: 'weekly', priority: '0.8' },
  // Specialty landing pages (high-intent keywords)
  { loc: `${BASE_URL}/SpecialstDetail?name=Cardiology`,       changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=Dermatology`,      changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=Dentistry`,        changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=Pediatrics`,       changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=Orthopedics`,      changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=Gynecology`,       changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=Neurology`,        changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=Ophthalmology`,    changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=General-Practice`, changefreq: 'weekly', priority: '0.75' },
  { loc: `${BASE_URL}/SpecialstDetail?name=ENT`,              changefreq: 'weekly', priority: '0.75' },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🗺  Generating sitemap…\n');

  // Fetch clinics and doctors in parallel
  console.log('Fetching clinics…');
  const [clinics, doctors] = await Promise.all([
    fetchAll('/clinics'),
    fetchAll('/doctors'),
  ]);

  console.log(`\n✔  ${clinics.length} clinics, ${doctors.length} doctors fetched`);

  // Build URL entries
  const staticEntries = STATIC_PAGES.map(urlEntry);

  const clinicEntries = clinics.map((c) =>
    urlEntry({
      loc: `${BASE_URL}/c/${c.id}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: toDate(c.updatedAt),
    })
  );

  const doctorEntries = doctors.map((d) =>
    urlEntry({
      loc: `${BASE_URL}/DoctorDetail?doctorId=${d.id}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: toDate(d.updatedAt),
    })
  );

  const totalUrls = staticEntries.length + clinicEntries.length + doctorEntries.length;

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '',
    '  <!-- ================================================================ -->',
    '  <!-- Static pages                                                      -->',
    '  <!-- ================================================================ -->',
    ...staticEntries,
    '',
    `  <!-- ================================================================ -->`,
    `  <!-- Clinic detail pages (${clinics.length})                          -->`,
    `  <!-- ================================================================ -->`,
    ...clinicEntries,
    '',
    `  <!-- ================================================================ -->`,
    `  <!-- Doctor detail pages (${doctors.length})                          -->`,
    `  <!-- ================================================================ -->`,
    ...doctorEntries,
    '',
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');

  console.log(`\n✅  Sitemap written to ${OUTPUT_PATH}`);
  console.log(`   Total URLs: ${totalUrls}`);
  console.log(`   • Static:  ${staticEntries.length}`);
  console.log(`   • Clinics: ${clinicEntries.length}`);
  console.log(`   • Doctors: ${doctorEntries.length}`);
}

main().catch((err) => {
  console.error('\n❌  Sitemap generation failed:', err.message);
  process.exit(1);
});
