/**
 * Compact, reversible encoding of UUIDs for short links (e.g. poster QR codes).
 * A UUID (36 chars) becomes 22 base62 chars; nothing is stored, the id is just re-encoded.
 */
import { BASE_URL } from './seo';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SHORT_LEN = 22; // 62^22 > 2^128
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Long division on digit arrays (no BigInt needed, works on every JS engine)
function convertBase(digits: number[], from: number, to: number): number[] {
  let num = digits.slice();
  const out: number[] = [];
  while (num.length > 0) {
    const next: number[] = [];
    let rem = 0;
    for (const d of num) {
      const acc = rem * from + d;
      const q = Math.floor(acc / to);
      rem = acc % to;
      if (next.length > 0 || q > 0) next.push(q);
    }
    out.unshift(rem);
    num = next;
  }
  return out;
}

export function uuidToShort(uuid: string): string {
  if (!UUID_RE.test(uuid)) return uuid;
  const hex = uuid.replace(/-/g, '').toLowerCase().split('').map(c => parseInt(c, 16));
  const s = convertBase(hex, 16, 62).map(d => ALPHABET[d]).join('');
  return s.padStart(SHORT_LEN, '0');
}

/** Returns the UUID, or null when the code is not a valid short id (or UUID) */
export function shortToUuid(code: string): string | null {
  if (UUID_RE.test(code)) return code.toLowerCase(); // full UUIDs are accepted too
  if (!/^[0-9A-Za-z]{1,22}$/.test(code)) return null;
  const digits = code.split('').map(c => ALPHABET.indexOf(c));
  const hexDigits = convertBase(digits, 62, 16);
  if (hexDigits.length > 32) return null;
  const hex = hexDigits.map(d => d.toString(16)).join('').padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Short link that opens the booking page for one doctor at one clinic */
export function bookingShortUrl(doctorId: string, clinicId?: string): string {
  return `${BASE_URL}/b/${uuidToShort(doctorId)}${clinicId ? `/${uuidToShort(clinicId)}` : ''}`;
}
