import type { CaptionLine, ContextItem } from './types'

/** Salinan lokal sesi terakhir per kelas, supaya caption & catatan tidak hilang saat halaman dimuat ulang. */
export interface Snapshot {
  sessionId: string | null
  lines: CaptionLine[]
  contexts: ContextItem[]
  seq: number
  ended: boolean
}

const kunci = (classId: string) => `gemasuara-sesi-${classId}`

export function loadSnapshot(classId: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(kunci(classId))
    return raw ? (JSON.parse(raw) as Snapshot) : null
  } catch {
    return null
  }
}

export function saveSnapshot(classId: string, s: Snapshot) {
  try { localStorage.setItem(kunci(classId), JSON.stringify(s)) } catch { /* abaikan */ }
}

export function clearSnapshot(classId: string) {
  try { localStorage.removeItem(kunci(classId)) } catch { /* abaikan */ }
}
