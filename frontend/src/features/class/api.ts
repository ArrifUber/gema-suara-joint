import { clearSnapshot } from '@/features/session/snapshot'
import type { ClassItem, NewClass } from './types'

/**
 * Lapisan data kelas. Saat ini disimpan di localStorage.
 * Nanti cukup ganti isi tiap fungsi dengan fetch ke endpoint backend
 * (mis. GET/POST /classes). UI tidak perlu diubah karena semuanya async.
 */
const KEY = 'gemasuara-kelas'
const ACCENTS = ['#e5534b', '#f2b63d', '#2fbf71', '#4aa3ff', '#b07cff', '#ff8a3d']

function contoh(): ClassItem[] {
  const hariIni = new Date().getDay()
  const dasar = { liveSessionId: null, createdAt: Date.now() }
  return [
    { ...dasar, id: 'fisika', name: 'Fisika Dasar', lecturer: 'Dr. Rina Wulandari', day: hariIni, start: '08:00', end: '09:40', topic: 'Hukum Newton', accent: ACCENTS[0] },
    { ...dasar, id: 'kualitatif', name: 'Metodologi Penelitian Kualitatif', lecturer: 'Prof. Andi Pratama', day: (hariIni + 1) % 7, start: '10:00', end: '11:40', topic: 'Wawancara', accent: ACCENTS[1] },
  ]
}

function tulis(list: ClassItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* penyimpanan penuh/diblokir */ }
}

function baca(): ClassItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ClassItem[]
  } catch { /* data rusak: mulai ulang dengan kelas contoh */ }
  const awal = contoh()
  tulis(awal)
  return awal
}

export const classApi = {
  async list(): Promise<ClassItem[]> {
    return baca()
  },
  async create(input: NewClass): Promise<ClassItem> {
    const list = baca()
    const item: ClassItem = {
      ...input,
      id: crypto.randomUUID?.() ?? `c${Date.now()}`,
      accent: ACCENTS[list.length % ACCENTS.length],
      liveSessionId: null,
      createdAt: Date.now(),
    }
    tulis([...list, item])
    return item
  },
  async remove(id: string): Promise<void> {
    tulis(baca().filter((c) => c.id !== id))
    clearSnapshot(id)
  },
  async setLive(id: string, sessionId: string | null): Promise<void> {
    tulis(baca().map((c) => (c.id === id ? { ...c, liveSessionId: sessionId } : c)))
  },
}
