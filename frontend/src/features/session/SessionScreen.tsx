'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useClassStore } from '@/features/class/store'
import type { ClassItem } from '@/features/class/types'
import { BackIcon, MicIcon, PauseIcon } from '@/shared/components/Icons'
import CaptionFeed from './CaptionFeed'
import NotesPanel from './NotesPanel'
import { useSessionStore } from './store'
import { useLiveSession } from './use-live-session'

export default function SessionScreen({ id }: { id: string }) {
  const router = useRouter()
  const course = useClassStore((s) => s.classes.find((c) => c.id === id))

  useEffect(() => {
    if (!course) router.replace('/kelas')
  }, [course, router])

  return course ? <Live course={course} /> : null
}

function Live({ course }: { course: ClassItem }) {
  const router = useRouter()
  const { conn, latency, listening, ended, notice, hasLines, tab, unseen } = useSessionStore(
    useShallow((s) => ({ conn: s.conn, latency: s.latency, listening: s.listening, ended: s.ended, notice: s.notice, hasLines: s.lines.length > 0, tab: s.tab, unseen: s.unseen })),
  )
  const setTab = useSessionStore((s) => s.setTab)
  const live = useLiveSession(course)

  const teksKoneksi =
    conn === 'online' ? `Koneksi stabil${latency ? ` · ${latency} ms` : ''}`
    : conn === 'demo' ? 'Mode demo (tanpa server)'
    : conn === 'reconnecting' ? 'Menyambung ulang…'
    : conn === 'connecting' ? 'Menyambungkan…'
    : 'Siap dimulai'
  const warnaKoneksi = conn === 'reconnecting' || conn === 'connecting' ? 'text-gold' : 'text-mute'

  const kembali = () => (window.history.length > 1 ? router.back() : router.push('/'))

  const tombolTab = (id: 'caption' | 'notes', label: string, lencana?: number) => (
    <button role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative flex-1 py-3 text-base font-semibold ${tab === id ? 'text-gold' : 'text-mute'}`}>
      {label}
      {!!lencana && <span className="ml-2 rounded-full bg-gold px-1.5 py-0.5 text-xs font-bold text-ink">{lencana}</span>}
      {tab === id && <span className="absolute inset-x-6 bottom-0 h-0.5 bg-gold" />}
    </button>
  )

  return (
    <div className="flex h-dvh flex-col bg-ink">
      <header className="border-b border-line bg-surface px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-start gap-3">
          <button onClick={kembali} aria-label="Kembali" className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-gold hover:bg-panel"><BackIcon width={22} height={22} /></button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wider text-gold-dim">{ended ? 'SESI SELESAI' : 'SESI BERJALAN'}</p>
            <h1 className="truncate text-2xl font-bold">{course.name}</h1>
            <div className="mt-1.5 flex items-center justify-between gap-2 lg:justify-start lg:gap-4">
              <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${listening ? 'border-live text-live' : 'border-line text-mute'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${listening ? 'bg-live pulse-dot' : 'bg-mute'}`} />
                {listening ? 'Mendengarkan…' : 'Jeda'}
              </span>
              <span className={`text-sm ${warnaKoneksi}`} role="status">{teksKoneksi}</span>
            </div>
          </div>
        </div>
      </header>

      {notice && <p role="alert" className="border-b border-alert/40 bg-alert/10 px-5 py-2 text-base text-alert">{notice}</p>}

      <div role="tablist" className="flex border-b border-line bg-surface lg:hidden">
        {tombolTab('caption', 'Caption')}
        {tombolTab('notes', 'Catatan', tab !== 'notes' ? unseen : 0)}
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section className={`${tab === 'caption' ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-1 flex-col lg:flex`}>
          {!hasLines ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-panel text-gold"><MicIcon width={28} height={28} /></span>
              <h2 className="mt-4 text-xl font-semibold">{listening ? 'Mendengarkan…' : 'Mulai mendengarkan kelas'}</h2>
              <p className="mt-2 max-w-sm text-base text-mute">{listening ? 'Mendengarkan… kalimat pertama akan muncul di sini.' : 'Izinkan akses mikrofon, lalu letakkan perangkat dekat dosen.'}</p>
            </div>
          ) : (
            <CaptionFeed />
          )}
        </section>
        <aside className={`${tab === 'notes' ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-1 flex-col lg:flex lg:border-l lg:border-line`}>
          <NotesPanel />
        </aside>
      </div>

      <div className="border-t border-line bg-surface px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2">
          {ended ? (
            <>
              <p className="min-w-0 flex-1 basis-60 text-base text-mute">Sesi selesai. Caption dan catatan tetap tersimpan di perangkat ini.</p>
              <button onClick={live.startNew} className="h-12 flex-1 rounded-lg bg-gold px-6 text-base font-semibold text-ink sm:flex-none">Mulai sesi baru</button>
            </>
          ) : (
            <>
              <button onClick={live.toggleListening} aria-pressed={listening} className="flex h-12 min-w-48 flex-1 items-center justify-center gap-2 rounded-lg bg-gold px-6 text-base font-semibold text-ink lg:flex-none">
                {listening ? <PauseIcon width={18} height={18} /> : <MicIcon width={18} height={18} />}
                {listening ? 'Jeda mendengarkan' : hasLines ? 'Lanjutkan mendengarkan' : 'Mulai mendengarkan'}
              </button>
              <button onClick={live.demoPlaying ? live.stopDemo : live.playDemo} className="h-12 rounded-lg border border-line px-4 text-base font-medium">{live.demoPlaying ? 'Hentikan demo' : 'Putar demo'}</button>
              {(hasLines || listening) && (
                <button onClick={() => window.confirm('Akhiri sesi ini? Caption dan catatan tetap bisa dibaca.') && void live.endSession()} className="h-12 rounded-lg px-4 text-base font-medium text-alert">Akhiri sesi</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
