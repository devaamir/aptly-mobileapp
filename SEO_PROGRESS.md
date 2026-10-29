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
- **`public/robots.txt`** — allows all public pages, blocks auth pages
- **`public/sitemap.xml`** — 15 URLs: home, Clinics, Doctors, specialst + 10 specialty pages
- **`public/manifest.json`** — enriched with health categories, richer description
- **`src/utils/seo.ts`** — central SEO utility with:
  - Page meta helpers (homeMeta, clinicsMeta, doctorsMeta, specialtiesMeta)
  - `buildClinicSchema()` → MedicalOrganization + LocalBusiness JSON-LD
  - `buildDoctorSchema()` → Physician JSON-LD
  - `buildSpecialtySchema()` → MedicalWebPage JSON-LD
  - `buildBreadcrumbSchema()` → BreadcrumbList JSON-LD
- **Per-page Helmet added to:**
  - `HomeScreen.tsx` — title, description, OG, canonical
  - `HospitalDetailScreen.tsx` — dynamic meta + MedicalOrganization + Breadcrumb JSON-LD
  - `DoctorDetailScreen.tsx` — dynamic meta + Physician + Breadcrumb JSON-LD
  - `SpecialstDetailScreen.tsx` — dynamic meta + MedicalWebPage + Breadcrumb JSON-LD
  - `ClinicsScreen.tsx` — meta + canonical
  - `DoctorsScreen.tsx` — meta + canonical
  - `SpecialstScreen.tsx` — meta + canonical
- **`webpack.config.js`** — copies robots.txt, sitemap.xml, Google verification file to build output
- **`App.tsx`** — wrapped in `<HelmetProvider>`

### Google Search Console
- ✅ `https://app.aptly.care` property verified
- ✅ Sitemap submitted → `https://app.aptly.care/sitemap.xml` (14 pages discovered)
- ✅ Homepage `https://app.aptly.care/` — **indexed on Google**
- ⏳ `/Clinics`, `/Doctors`, `/specialst` — discovered but not yet indexed (indexing requested)

---

## What's NOT Done Yet ❌

### 1. Pre-rendering (MOST IMPORTANT — do this first)
**Problem:** This is a client-side SPA. When Google crawls `/Clinics`, `/Doctors`, or any
clinic/doctor detail page, it sees an empty `<div id="root"></div>` until JavaScript runs.
This means Google can't read the actual content and won't rank these pages well.

**Solution:** Set up [prerender.io](https://prerender.io) — intercepts Googlebot requests
and serves pre-rendered HTML with full content.

**How to do it:**
1. Sign up at [prerender.io](https://prerender.io) (free tier available)
2. Get your token (looks like `xxxxxxxxxxxxxx`)
3. Share token → add to `vercel.json` as a middleware config
4. Deploy — done. No other code changes needed.

**Impact:** This is the single biggest remaining SEO improvement. Without it, inner pages
(clinics, doctors, specialties) will stay poorly ranked.

---

### 2. Verify Actual URL Paths
React Navigation uses screen names as URL paths. We need to confirm the exact URLs for:
- Doctor detail page — is it `/DoctorDetail/:id`?
- Clinic detail page — is it `/HospitalDetail/:id` or `/c/:id`?
- Specialty detail page — is it `/SpecialstDetail`?

Once confirmed, update `sitemap.xml` to include real clinic and doctor pages
(e.g. `https://app.aptly.care/c/some-clinic-id`).

---

### 3. Dynamic Sitemap (after pre-rendering is set up)
The current `sitemap.xml` only has 15 static URLs. Real SEO impact comes from listing
every clinic and doctor page individually.

**How to do it:**
- Write a script that calls the Aptly API (`https://api.aptly.care/api`) to fetch
  all clinics and doctors
- Generates a `sitemap.xml` with one URL per clinic (`/c/:id`) and per doctor
- Run this script as part of the build or on a schedule (e.g. weekly via GitHub Actions)

---

### 4. Google Business Profile
Create a listing at [business.google.com](https://business.google.com) for Aptly.
This makes Aptly appear in Google Maps and the local "3-pack" results for
"clinic near me" / "doctor booking near me" searches. Free and high impact.

---

### 5. Backlinks — List on Healthcare Directories
Each listing = a backlink + local SEO signal. Submit Aptly to:
- **Practo** — practo.com (highest impact for Indian healthcare)
- **Justdial** — justdial.com
- **Sulekha** — sulekha.com
- **IndiaMART** — indiamart.com
- **Crunchbase** — crunchbase.com (for brand authority)

---

### 6. Link from www.aptly.care → app.aptly.care
Add a prominent "Book Appointment" or "Open App" button on the landing page
(`www.aptly.care`) that links to `https://app.aptly.care`. This passes SEO
authority from the already-indexed landing page to the app.

---

### 7. Core Web Vitals
Check **Search Console → Experience → Core Web Vitals**.
The current bundle size is 2.24 MB which is large and will hurt page speed scores.
Consider code splitting in webpack to improve LCP (Largest Contentful Paint).

---

## Priority Order for Next Session

1. 🔴 **Pre-rendering** (prerender.io) — biggest impact, do first
2. 🟠 **Verify exact URL paths** for detail pages
3. 🟠 **Dynamic sitemap** — include all clinic and doctor pages
4. 🟡 **Google Business Profile** — free local SEO boost
5. 🟡 **Backlinks** — list on Practo, Justdial, Sulekha
6. 🟢 **Link landing page → app**
7. 🟢 **Core Web Vitals / bundle size**

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
