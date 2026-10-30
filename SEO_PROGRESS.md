# Aptly Web App — SEO Progress

## What's Done ✅

### Code Changes (all committed & deployed)
- **`react-helmet-async`** installed — enables per-page dynamic meta tags
- **`public/index.html`** — enriched with:
  - Meta description, keywords
  - Open Graph tags (og:title, og:description, og:image, og:url)
  - Twitter Card tags
  - Geo/local SEO tags (geo.region, geo.placename, ICBM)
  - Canonical URL → `https://app.aptly.care/`
  - Robots meta → `index, follow`
  - Global JSON-LD structured data (Organization + WebSite schema)
  - `window.prerenderReady = false` set synchronously in `<head>` before bundle loads
- **`public/robots.txt`** — allows all public pages, blocks auth pages
- **`public/sitemap.xml`** — 15 URLs: home, Clinics, Doctors, specialst + 10 specialty pages
- **`public/manifest.json`** — enriched with health categories, richer description
- **`src/utils/seo.ts`** — central SEO utility with:
  - Page meta helpers (homeMeta, clinicsMeta, doctorsMeta, specialtiesMeta)
  - `buildClinicSchema()` → MedicalOrganization + LocalBusiness JSON-LD
  - `buildDoctorSchema()` → Physician JSON-LD
  - `buildSpecialtySchema()` → MedicalWebPage JSON-LD
  - `buildBreadcrumbSchema()` → BreadcrumbList JSON-LD
- **`src/utils/prerenderReady.ts`** — `signalPrerenderReady()` helper called by screens after data loads
- **Per-page Helmet added to:**
  - `HomeScreen.tsx` — title, description, OG, canonical
  - `HospitalDetailScreen.tsx` — dynamic meta + MedicalOrganization + Breadcrumb JSON-LD
  - `DoctorDetailScreen.tsx` — dynamic meta + Physician + Breadcrumb JSON-LD
  - `SpecialstDetailScreen.tsx` — dynamic meta + MedicalWebPage + Breadcrumb JSON-LD
  - `ClinicsScreen.tsx` — meta + canonical + `signalPrerenderReady()` after API load
  - `DoctorsScreen.tsx` — meta + canonical + `signalPrerenderReady()` after API load
  - `SpecialstScreen.tsx` — meta + canonical + `signalPrerenderReady()` after API load
- **`webpack.config.js`** — copies robots.txt, sitemap.xml, Google verification file to build output
- **`App.tsx`** — wrapped in `<HelmetProvider>`

### Pre-rendering (prerender.io) ✅ FULLY WORKING
- **`api/prerender.js`** — Vercel serverless function that proxies bot requests to prerender.io
- **`vercel.json`** — `has: user-agent` rewrite routes crawlers → `/api/prerender`, browsers → `/index.html`
- **`src/navigations/Navigation.tsx`** — deep-link prefixes include `https://app.aptly.care` and `http://localhost:8080`; all public screen paths mapped in linking config
- **Root cause fixed (Oct 30 2026):** `prerender` was in the Vercel bot UA regex, causing prerender.io's own rendering Chromium to be routed back through the middleware — infinite loop, 362-byte empty response every time. Removed `prerender` from both `vercel.json` and `api/prerender.js` bot lists.

**Verified rendered output (Oct 30 2026):**
| Page | Prerendered size | Title |
|---|---|---|
| `/Clinics` | 55,439 bytes ✅ | Clinics |
| `/Doctors` | 198,478 bytes ✅ | Doctors |
| `/specialst` | 122,757 bytes ✅ | specialst |
| `/` | 9,633 bytes (stale cache) | PhoneNumber — recache queued |

### Google Search Console
- ✅ `https://app.aptly.care` property verified
- ✅ Sitemap submitted → `https://app.aptly.care/sitemap.xml` (14 pages discovered)
- ✅ Homepage `https://app.aptly.care/` — **indexed on Google**
- ⏳ `/Clinics`, `/Doctors`, `/specialst` — discovered, indexing requested; should index now that pre-rendering works

---

## What's Next 🔜

### 1. ✅ Dynamic Sitemap — DONE (Oct 30 2026)
`scripts/generate-sitemap.js` written and wired into the build.

**What was built:**
- Paginates through `/api/clinics` and `/api/doctors` (100 per page) to fetch every record
- Writes `public/sitemap.xml` with proper `<lastmod>` dates from `updatedAt`
- **53 URLs** total: 14 static + 12 clinics + 27 doctors
- Runs automatically before every production build via the updated `web:build` script:
  `"web:build": "node scripts/generate-sitemap.js && webpack ..."`

**URL patterns used:**
- Clinic detail: `https://app.aptly.care/c/:id` (path slug in Navigation linking config)
- Doctor detail: `https://app.aptly.care/DoctorDetail?doctorId=:id` (no slug in linking config — query param used)
- Specialty detail: `https://app.aptly.care/SpecialstDetail?name=:name` (same reason)

**Next step after deploying:** Re-submit sitemap in Google Search Console (the URL is the same, GSC will re-crawl it automatically within a few days).

---

### 2. ✅ Verify Detail Page URL Paths — DONE (Oct 30 2026)
Confirmed from `Navigation.tsx` linking config:
- `HospitalDetail` → `c/:id` (has ID slug ✅)
- `DoctorDetail` → `DoctorDetail` (no ID slug — query param approach used in sitemap)
- `SpecialstDetail` → `SpecialstDetail` (no ID slug — query param approach used in sitemap)

---

### 3. 🟡 Core Web Vitals / Bundle Size
The bundle is **2.24 MB** — this will hurt LCP (Largest Contentful Paint) and Google's page experience score.

**Options:**
- Enable code splitting in `webpack.config.js` (dynamic `import()` for heavy screens)
- Check Search Console → Experience → Core Web Vitals for current scores
- Lazy-load screens that aren't on the initial route

---

### 4. 🟡 Google Business Profile
Create a listing at [business.google.com](https://business.google.com) for Aptly.
Appears in Google Maps and the local "3-pack" for "clinic near me" searches. Free, high impact.

---

### 5. 🟡 Backlinks — Healthcare Directories
Each listing = a backlink + local SEO signal:
- **Practo** — practo.com (highest impact for Indian healthcare)
- **Justdial** — justdial.com
- **Sulekha** — sulekha.com
- **IndiaMART** — indiamart.com
- **Crunchbase** — crunchbase.com (brand authority)

---

### 6. 🟢 Link www.aptly.care → app.aptly.care
Add a "Book Appointment" / "Open App" link on the landing page. Passes SEO authority from the already-indexed landing page to the app subdomain.

---

## Key Details

| Item | Value |
|---|---|
| Web app URL | `https://app.aptly.care` |
| Landing page | `https://www.aptly.care` |
| API base | `https://api.aptly.care/api` |
| Deep link prefix | `https://qr.aptly.care/c/:id` |
| Search Console property | `https://app.aptly.care` |
| Sitemap | `https://app.aptly.care/sitemap.xml` |
| Google verification file | `public/googleeb3d314c65429943.html` |
| BASE_URL in code | `https://app.aptly.care` (in `src/utils/seo.ts`) |
| Build command | `npm run web:build` |
| Build output | `web-build/` |
| Deployment | Vercel (auto-deploy on push to main) |
| Prerender token env var | `PRERENDER_TOKEN` in Vercel dashboard |
