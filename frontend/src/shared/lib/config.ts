// Variabel NEXT_PUBLIC_* harus ditulis literal agar ditanam saat build.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '')
export const WS_URL = (process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws').replace(/\/$/, '')

const isLocal = (u: string) => /\/\/(localhost|127\.0\.0\.1)/.test(u)

/**
 * false => app langsung memakai mode demo (skenario lokal, tanpa server).
 * Dicek saat dipanggil (bukan saat modul dimuat) karena butuh `location` milik browser.
 */
export function isBackendUsable(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return false
  const https = typeof location !== 'undefined' && location.protocol === 'https:'
  // Browser memblokir http/ws dari halaman https (mixed content), kecuali localhost.
  const mixed = https && ((API_URL.startsWith('http:') && !isLocal(API_URL)) || (WS_URL.startsWith('ws:') && !isLocal(WS_URL)))
  return !mixed
}
