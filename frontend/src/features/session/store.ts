import { create } from 'zustand'
import type { CaptionLine, ConnStatus, ContextItem, ContextUpdateEvent } from './types'

/**
 * Caption hanya menyimpan kalimat terbaru (seperti caption TV). Kalimat lama dibuang dari memori
 * dan dari salinan lokal; yang penting sudah dicatat permanen di `contexts`, dan server tetap
 * menyimpan seluruh transkrip. Ubah angka ini bila ingin menampilkan lebih banyak/sedikit.
 */
export const MAX_CAPTION_LINES = 12

export type Tab = 'caption' | 'notes'
export interface Focus { key: string; n: number }

interface SessionState {
  lines: CaptionLine[]
  interim: string
  contexts: ContextItem[] // append-only: catatan tidak pernah dihapus/ditimpa selama sesi
  conn: ConnStatus
  latency: number | null
  listening: boolean
  ended: boolean
  notice: string | null // pesan peringatan siap tampil (bahasa Indonesia)
  tab: Tab
  unseen: number
  focus: Focus | null
  addLine: (seq: number, text: string) => void
  setInterim: (t: string) => void
  addContext: (e: ContextUpdateEvent) => void
  hydrate: (d: { lines?: CaptionLine[]; contexts?: ContextItem[]; ended?: boolean }) => void
  setConn: (c: ConnStatus) => void
  setLatency: (ms: number) => void
  setListening: (b: boolean) => void
  setEnded: (b: boolean) => void
  setNotice: (n: string | null) => void
  setTab: (t: Tab) => void
  jumpToNote: (id: string) => void
  reset: () => void
}

const awal = {
  lines: [] as CaptionLine[],
  interim: '',
  contexts: [] as ContextItem[],
  conn: 'idle' as ConnStatus,
  latency: null as number | null,
  listening: false,
  ended: false,
  notice: null as string | null,
  tab: 'caption' as Tab,
  unseen: 0,
  focus: null as Focus | null,
}

let uid = 0
const kunciKonteks = (e: ContextUpdateEvent) => `${e.sequence}|${e.data.concept}|${e.data.formula ?? ''}`

export const useSessionStore = create<SessionState>((set, get) => ({
  ...awal,
  addLine: (seq, text) =>
    set((s) => {
      if (s.lines.some((l) => l.seq === seq)) return s
      return { lines: [...s.lines, { id: `l${seq}`, seq, text, at: Date.now() }].slice(-MAX_CAPTION_LINES) }
    }),
  setInterim: (interim) => set({ interim }),
  addContext: (e) =>
    set((s) => {
      if (s.contexts.some((c) => kunciKonteks(c) === kunciKonteks(e))) return s // dedupe (WebSocket + riwayat REST)
      const source = s.lines.find((l) => l.seq === e.sequence)?.text // simpan kalimat pemicu di catatan
      return {
        contexts: [...s.contexts, { ...e, id: `${e.sessionId}-${++uid}`, source }],
        unseen: s.tab === 'notes' ? 0 : s.unseen + 1,
      }
    }),
  hydrate: ({ lines, contexts, ended }) =>
    set((s) => ({
      lines: lines ? lines.slice(-MAX_CAPTION_LINES) : s.lines,
      contexts: contexts ?? s.contexts,
      ended: ended ?? s.ended,
      unseen: 0,
    })),
  setConn: (conn) => set({ conn }),
  setLatency: (latency) => set({ latency }),
  setListening: (listening) => set({ listening }),
  setEnded: (ended) => set({ ended }),
  setNotice: (notice) => set({ notice }),
  setTab: (tab) => set({ tab, unseen: tab === 'notes' ? 0 : get().unseen }),
  jumpToNote: (id) => set({ tab: 'notes', unseen: 0, focus: { key: id, n: ++uid } }),
  reset: () => set({ ...awal }),
}))
