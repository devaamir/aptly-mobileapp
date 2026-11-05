# Aptly Web App — SEO Progress

## Phase 1 — Get Pages Indexed ✅ COMPLETE (Oct 30 2026)

Everything needed for Google to find and index all pages is done.

| What | Status |
|---|---|
| Per-page meta tags (title, description, OG, canonical) | ✅ |
| JSON-LD structured data (Clinic, Doctor, Specialty, Breadcrumb) | ✅ |
| robots.txt + sitemap.xml | ✅ |
| Prerender.io integration (bots see real HTML, not blank JS) | ✅ |
| Dynamic sitemap — 53 URLs (14 static + 12 clinics + 27 doctors) | ✅ |
| Sitemap submitted to Google Search Console (53 pages discovered) | ✅ |
| Prerender sitemap activated (auto pre-caches all 53 pages) | ✅ |
| Homepage indexed on Google | ✅ |

Google will crawl and index clinic/doctor detail pages over the next **1–2 weeks**.

---

## Phase 2 — Grow Traffic 🔜

### 1. 🟠 Google Business Profile
Create a free listing at [business.google.com](https://business.google.com).
Shows Aptly in Google Maps and "clinic near me" searches. High impact, free.

### 2. 🟡 Bundle Size (Core Web Vitals)
JS bundle is **2.24 MB** — hurts page load speed and Google rankings.
Fix: enable code splitting in `webpack.config.js` (lazy-load heavy screens).

### 3. 🟡 Backlinks — Healthcare Directories
Each listing = a backlink + local SEO signal:
- **Practo** (highest impact for Indian healthcare)
- Justdial, Sulekha, IndiaMART, Crunchbase

### 4. 🟢 Link www.aptly.care → app.aptly.care
Add a "Book Appointment" link on the landing page.
Passes SEO authority from the already-indexed landing page to the app subdomain.

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
| Build command | `npm run web:build` (runs sitemap generator first) |
| Build output | `web-build/` |
| Deployment | Vercel (auto-deploy on push to main) |
| Prerender token env var | `PRERENDER_TOKEN` in Vercel dashboard |

### URL Patterns
| Page | URL |
|---|---|
| Clinic detail | `https://app.aptly.care/c/:id` |
| Doctor detail | `https://app.aptly.care/DoctorDetail?doctorId=:id` |
| Specialty detail | `https://app.aptly.care/SpecialstDetail?name=:name` |
