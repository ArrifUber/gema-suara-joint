import { create } from 'zustand'

export const CAPTION_SIZES = [1.25, 1.5, 1.875, 2.25] // rem

const KEY = 'gemasuara-profil'

interface ProfileState {
  name: string
  captionSize: number // indeks ke CAPTION_SIZES
  ready: boolean
  load: () => void
  setName: (n: string) => void
  setCaptionSize: (i: number) => void
}

function persist(name: string, captionSize: number) {
  try { localStorage.setItem(KEY, JSON.stringify({ name, captionSize })) } catch { /* penyimpanan diblokir */ }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  name: '',
  captionSize: 1,
  ready: false,
  load: () => {
    // Dibaca di effect (bukan saat render) supaya HTML server dan klien tetap sama.
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const d = JSON.parse(raw) as { name?: string; captionSize?: number }
        set({ name: d.name ?? '', captionSize: d.captionSize ?? 1 })
      }
    } catch { /* data rusak: pakai bawaan */ }
    set({ ready: true })
  },
  setName: (name) => { set({ name }); persist(name, get().captionSize) },
  setCaptionSize: (captionSize) => { set({ captionSize }); persist(get().name, captionSize) },
}))
