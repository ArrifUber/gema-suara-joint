import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClassItem } from '@/features/class/types'
import { useClassStore } from '@/features/class/store'
import { isBackendUsable, WS_URL } from '@/shared/lib/config'
import { ApiError, sessionApi, type ContextDto, type TranscriptDto } from './api'
import { demoScripts } from './demo-scripts'
import { contextKey, localContext } from './local-context'
import { clearSnapshot, loadSnapshot, saveSnapshot } from './snapshot'
import { SessionSocket } from './socket'
import { useSessionStore } from './store'
import { TranscriptQueue } from './transcript-queue'
import type { CaptionLine, ContextItem } from './types'
import { useSpeechRecognition } from './use-speech-recognition'

const JEDA_DEMO_MS = 3200

const PESAN = {
  micDitolak: 'Akses mikrofon ditolak. Aktifkan izin mikrofon di pengaturan browser.',
  micTidakDidukung: 'Browser ini belum mendukung pengenalan suara. Gunakan Chrome atau Edge, atau pakai Putar demo.',
  micError: 'Pengenalan suara terhenti. Periksa koneksi internet lalu coba lagi.',
  gagalKirim: 'Sebagian kalimat gagal dikirim ke server, jadi catatan untuk kalimat itu mungkin tidak muncul.',
}

const keBaris = (trs: TranscriptDto[]): CaptionLine[] =>
  [...trs].sort((a, b) => a.sequence - b.sequence).map((t) => ({ id: `l${t.sequence}`, seq: t.sequence, text: t.text, at: Date.parse(t.createdAt ?? '') || Date.now() }))

const keKonteks = (cs: ContextDto[], trs: TranscriptDto[]): ContextItem[] => {
  const teks = new Map(trs.map((t) => [t.sequence, t.text]))
  return cs.map((c) => ({
    id: c.id, event: 'context_update', sessionId: c.sessionId, sequence: c.sequence, timestamp: c.createdAt,
    data: { ...c.data, type: c.data?.type ?? c.type }, source: teks.get(c.sequence),
  }))
}

/** Satu sesi kelas (searah): mikrofon → caption langsung + catatan konteks permanen. */
export function useLiveSession(course: ClassItem) {
  const store = useSessionStore
  const setLive = useClassStore((s) => s.setLive)

  const queue = useRef<TranscriptQueue | null>(null)
  const socket = useRef<SessionSocket | null>(null)
  const sessionId = useRef<string | null>(null)
  const seq = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const ensuring = useRef<Promise<void> | null>(null)
  const [demoPlaying, setDemoPlaying] = useState(false)

  const connect = useCallback((id: string) => {
    queue.current = new TranscriptQueue(id, (ms) => store.getState().setLatency(ms), () => store.getState().setNotice(PESAN.gagalKirim))
    socket.current = new SessionSocket(`${WS_URL}/sessions/${id}`, {
      onEvent: (e) => store.getState().addContext(e),
      onStatus: (c) => store.getState().setConn(c),
    })
    socket.current.connect()
  }, [store])

  // --- pulihkan sesi saat halaman dibuka (salinan lokal dulu, lalu sinkron dari server) ---
  useEffect(() => {
    let batal = false
    const st = store.getState()
    st.reset()

    const snap = loadSnapshot(course.id)
    if (snap) {
      st.hydrate({ lines: snap.lines, contexts: snap.contexts, ended: snap.ended })
      seq.current = snap.seq
      sessionId.current = snap.ended ? null : snap.sessionId
    }

    const simpan = () => {
      const s = store.getState()
      if (!s.lines.length && !sessionId.current) return
      saveSnapshot(course.id, { sessionId: sessionId.current, lines: s.lines, contexts: s.contexts, seq: seq.current, ended: s.ended })
    }
    let t: ReturnType<typeof setTimeout> | undefined
    const unsub = store.subscribe(() => { clearTimeout(t); t = setTimeout(simpan, 300) })

    const pulihkan = async () => {
      if (!isBackendUsable()) return store.getState().setConn('demo')
      const id = sessionId.current
      if (!id) return // sesi dibuat saat murid menekan Mulai
      store.getState().setConn('connecting')
      try {
        const [sesi, trs, ctxs] = await Promise.all([sessionApi.get(id), sessionApi.getTranscripts(id), sessionApi.getContexts(id)])
        if (batal) return
        const lines = keBaris(trs ?? [])
        seq.current = Math.max(seq.current, lines.at(-1)?.seq ?? 0)
        store.getState().hydrate({ lines, contexts: keKonteks(ctxs ?? [], trs ?? []) }) // server = sumber kebenaran
        if (sesi.status !== 'active') {
          sessionId.current = null
          store.getState().setEnded(true)
          store.getState().setConn('idle')
          setLive(course.id, null)
          return
        }
        connect(id)
      } catch (e) {
        if (batal) return
        if (e instanceof ApiError && e.status === 404) sessionId.current = null
        store.getState().setConn('demo')
      }
    }
    void pulihkan()

    const tertunda = timers.current
    return () => {
      batal = true
      clearTimeout(t)
      unsub()
      simpan()
      socket.current?.close()
      socket.current = null
      queue.current = null
      tertunda.forEach(clearTimeout)
      timers.current = []
      store.getState().reset()
    }
  }, [course.id, connect, setLive, store])

  // --- buat sesi di server saat pertama kali dibutuhkan (jatuh ke mode demo bila gagal) ---
  const ensureSession = useCallback(async () => {
    if (sessionId.current || store.getState().conn === 'demo') return
    if (ensuring.current) return ensuring.current
    const run = (async () => {
      if (!isBackendUsable()) { store.getState().setConn('demo'); setLive(course.id, 'demo'); return }
      store.getState().setConn('connecting')
      try {
        const topik = course.topic || course.name
        const sesi = await sessionApi.create({ subject: course.name, topic: topik, subtopic: topik })
        sessionId.current = sesi.id
        connect(sesi.id)
        setLive(course.id, sesi.id)
      } catch {
        store.getState().setConn('demo')
        setLive(course.id, 'demo')
      }
    })()
    ensuring.current = run
    await run
    ensuring.current = null
  }, [connect, course.id, course.name, course.topic, setLive, store])

  // --- satu kalimat final dari dosen ---
  const ingest = useCallback((raw: string) => {
    const text = raw.trim()
    if (!text) return
    const n = ++seq.current
    store.getState().addLine(n, text) // caption tampil seketika, tidak menunggu server
    void ensureSession().then(() => {
      const st = store.getState()
      if (queue.current && sessionId.current && st.conn !== 'demo') {
        queue.current.push(n, text)
        return
      }
      const terakhir = st.contexts.at(-1)
      const ev = localContext(text, n, terakhir ? contextKey(terakhir.data) : '')
      if (ev) timers.current.push(setTimeout(() => store.getState().addContext(ev), 700))
    })
  }, [ensureSession, store])

  const speech = useSpeechRecognition({
    lang: 'id-ID',
    onInterim: (t) => store.getState().setInterim(t),
    onFinal: ingest,
    onError: (k) => {
      store.getState().setNotice(PESAN[k])
      store.getState().setListening(false)
    },
  })

  const toggleListening = useCallback(() => {
    const st = store.getState()
    if (!speech.supported) return st.setNotice(PESAN.micTidakDidukung)
    st.setNotice(null)
    if (st.listening) { speech.stop(); st.setListening(false) }
    else { speech.start(); st.setListening(true); void ensureSession() }
  }, [ensureSession, speech, store])

  // --- skenario demo (tanpa mikrofon) ---
  const stopDemo = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    store.getState().setInterim('')
    setDemoPlaying(false)
  }, [store])

  const playDemo = useCallback(() => {
    stopDemo()
    void ensureSession()
    const skrip = demoScripts[course.id] ?? demoScripts.fisika
    setDemoPlaying(true)
    skrip.forEach((kalimat, i) => {
      timers.current.push(setTimeout(() => {
        store.getState().setInterim(kalimat.split(' ').slice(0, 4).join(' ') + '…')
        timers.current.push(setTimeout(() => { store.getState().setInterim(''); ingest(kalimat) }, 900))
      }, i * JEDA_DEMO_MS))
    })
    timers.current.push(setTimeout(() => setDemoPlaying(false), skrip.length * JEDA_DEMO_MS + 1200))
  }, [course.id, ensureSession, ingest, stopDemo, store])

  // --- akhiri sesi: caption & catatan tetap bisa dibaca ---
  const endSession = useCallback(async () => {
    speech.stop()
    stopDemo()
    const st = store.getState()
    st.setListening(false)
    const id = sessionId.current
    const q = queue.current
    socket.current?.close()
    socket.current = null
    st.setEnded(true)
    setLive(course.id, null)
    sessionId.current = null
    if (id && id !== 'demo') {
      await q?.idle()
      sessionApi.complete(id).catch(() => {})
    }
  }, [course.id, setLive, speech, stopDemo, store])

  const startNew = useCallback(() => {
    clearSnapshot(course.id)
    store.getState().reset()
    store.getState().setConn(isBackendUsable() ? 'idle' : 'demo')
    seq.current = 0
    sessionId.current = null
    queue.current = null
  }, [course.id, store])

  return { toggleListening, playDemo, stopDemo, demoPlaying, endSession, startNew }
}
