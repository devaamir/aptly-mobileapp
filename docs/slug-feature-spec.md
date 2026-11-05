# Backend Spec — Clinic & Doctor URL Slugs

**Date:** Oct 30 2026  
**Author:** Aptly Engineering  
**Purpose:** Add human-readable slugs to clinic and doctor URLs for better Google ranking.

---

## Why

Current URLs look like this:
```
https://app.aptly.care/c/36a68f3b-5b63-4bf0-95f4-61765d0b7dca
```

Google gets zero keyword signal from a UUID. With slugs:
```
https://app.aptly.care/c/life-care-mediclinic-hajiyarpadi
```

Google sees the clinic name and location right in the URL — ranks significantly better.

---

## Important Constraint — QR Codes

QR codes are already printed and distributed to clinics. They point to:
```
https://app.aptly.care/c/UUID
```
These must **never break**. The API must continue to accept both UUID and slug forever.

---

## Slug Format

### Rules
- Lowercase only
- Spaces replaced with hyphens `-`
- Special characters removed (keep only `a-z`, `0-9`, `-`)
- Format: `{clinic-name}-{district}`
- If duplicate exists: append `-2`, `-3` etc.

### Examples

| Clinic Name | District | Slug |
|---|---|---|
| Life Care Mediclinic | Hajiyarpadi | `life-care-mediclinic-hajiyarpadi` |
| Apollo Clinic | Malappuram | `apollo-clinic-malappuram` |
| Apollo Clinic | Malappuram (duplicate) | `apollo-clinic-malappuram-2` |
| St. Mary's Hospital | Kochi | `st-marys-hospital-kochi` |

---

## Database Changes

### `medical_centers` table
Add one column:

```sql
ALTER TABLE medical_centers
ADD COLUMN slug VARCHAR(255) UNIQUE;
```

- Type: `string`
- Unique: `true`
- Nullable: `false` (after migration)
- Indexed: `true` (for fast lookup)

### `doctors` table
Add one column:

```sql
ALTER TABLE doctors
ADD COLUMN slug VARCHAR(255) UNIQUE;
```

Same rules as above.

Doctor slug format: `{doctor-name}-{district}`

| Doctor Name | District | Slug |
|---|---|---|
| Dr. Arun Kumar | Malappuram | `dr-arun-kumar-malappuram` |
| Dr. Arun Kumar | Malappuram (duplicate) | `dr-arun-kumar-malappuram-2` |

---

## Migration

On first deploy, auto-generate slugs for all existing clinics and doctors.

### Pseudocode
```
for each clinic in medical_centers:
  base = lowercase(clinic.name + "-" + clinic.district)
  base = replace spaces with "-"
  base = remove special characters
  slug = base
  counter = 2
  while slug exists in DB:
    slug = base + "-" + counter
    counter++
  clinic.slug = slug
  save()
```

Run the same logic for doctors.

---

## API Changes

### 1. Clinic endpoints — accept ID or slug

**Current:**
```
GET /clinics/:id        ← only UUID works
```

**New:**
```
GET /clinics/:idOrSlug  ← UUID or slug both work
```

### Resolution logic (backend):
```
if param matches UUID format:
  lookup by id
else:
  lookup by slug
```

UUID format check: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/`

### 2. Doctor endpoints — same pattern

```
GET /doctors/:idOrSlug  ← UUID or slug both work
```

### 3. Add `slug` field to all list and detail responses

**Clinic response (add slug field):**
```json
{
  "success": true,
  "data": {
    "id": "36a68f3b-5b63-4bf0-95f4-61765d0b7dca",
    "slug": "life-care-mediclinic-hajiyarpadi",
    "name": "Life Care Mediclinic",
    "district": "Hajiyarpadi",
    ...
  }
}
```

**Doctor response (add slug field):**
```json
{
  "success": true,
  "data": {
    "id": "13dce01d-73aa-4444-8a85-50586def01f5",
    "slug": "dr-arun-kumar-malappuram",
    "name": "Dr. Arun Kumar",
    "district": "Malappuram",
    ...
  }
}
```

This applies to:
- `GET /clinics` (list)
- `GET /clinics/:idOrSlug` (detail)
- `GET /doctors` (list)
- `GET /doctors/:idOrSlug` (detail)
- `GET /ui/home` (topClinics and doctors arrays)

---

## What Frontend Will Do (after backend ships)

1. Use `slug` from API response to build URLs instead of `id`
2. Update sitemap generator to use slug URLs
3. Update Navigation linking config to pass slug in the URL path

QR code links (`/c/UUID`) will still work because the API accepts both.

---

## Checklist for Backend Dev

- [ ] Add `slug` column to `medical_centers` table
- [ ] Add `slug` column to `doctors` table
- [ ] Write slug generation utility (name + district, deduplication)
- [ ] Run migration — generate slugs for all existing records
- [ ] Auto-generate slug on new clinic/doctor creation
- [ ] Update `GET /clinics/:id` to accept UUID or slug
- [ ] Update `GET /doctors/:id` to accept UUID or slug
- [ ] Add `slug` field to all clinic API responses
- [ ] Add `slug` field to all doctor API responses
- [ ] Add `slug` field to home API response (topClinics, doctors)
- [ ] Write tests for duplicate slug deduplication

---

## Questions / Decisions Needed

1. **Slug on update** — if a clinic changes its name, should the slug update? Recommendation: **No** — keep original slug forever, Google has already indexed it. Optionally add a `redirect` from new slug → old slug.
2. **Specialty slugs** — do we want slugs for `SpecialstDetail` pages too? Currently they use `?name=Cardiology` which is readable enough.

