'use client'

import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from './store'

const labelJenis: Record<string, string> = { formula_detected: 'Rumus', topic_changed: 'Topik baru', concept_update: 'Konsep' }

/** Catatan penting hasil context engine. Append-only: tidak ada yang hilang saat kalimat berganti. */
export default function NotesPanel() {
  const contexts = useSessionStore((s) => s.contexts)
  const focus = useSessionStore((s) => s.focus)
  const box = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  const [sorot, setSorot] = useState<string | null>(null)

  useEffect(() => {
    const el = box.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [contexts])

  // lompat dari penanda di caption ke kartu catatannya
  useEffect(() => {
    if (!focus) return
    const el = document.getElementById(`note-${focus.key}`)
    if (!el) return
    stick.current = false
    el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setSorot(focus.key)
    const id = setTimeout(() => setSorot(null), 1800)
    return () => clearTimeout(id)
  }, [focus])

  const pernahMuncul = new Set<string>()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pb-3 pt-4 lg:px-6 lg:pt-6">
        <h2 className="border-l-2 border-gold pl-2 text-xl font-semibold">Catatan penting</h2>
        <span className="text-sm text-mute">{contexts.length}</span>
      </div>
      <div
        ref={box}
        onScroll={() => { const el = box.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-6 lg:px-6"
        aria-live="polite"
      >
        {contexts.length === 0 && (
          <p className="py-6 text-base leading-relaxed text-mute">Catatan muncul di sini saat dosen menjelaskan konsep atau rumus, dan tetap tersimpan sampai sesi selesai.</p>
        )}
        {contexts.map((c) => {
          const ulang = pernahMuncul.has(c.data.concept)
          pernahMuncul.add(c.data.concept)
          const label = ulang ? 'Pembaruan' : labelJenis[c.data.type] ?? 'Catatan'
          return (
            <article key={c.id} id={`note-${c.id}`} className={`rounded-xl border bg-panel p-4 transition-colors ${sorot === c.id ? 'border-gold' : 'border-line'}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-gold">{c.data.concept}</h3>
                <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs text-mute">{label}</span>
              </div>
              <p className="mt-2 text-base leading-relaxed text-fg/90">{c.data.summary}</p>
              {c.data.formula && (
                <div className="mt-3 rounded-lg border border-gold-dim bg-ink px-4 py-3">
                  <p className="text-sm text-mute">Rumus</p>
                  <p className="mt-1 text-2xl font-semibold tracking-wide">{c.data.formula}</p>
                </div>
              )}
              {c.data.keywords?.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {c.data.keywords.map((k) => <li key={k} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">{k}</li>)}
                </ul>
              )}
              {c.source && (
                <details className="mt-3">
                  <summary className="list-none text-sm font-medium text-gold underline underline-offset-4 [&::-webkit-details-marker]:hidden">Lihat kalimat</summary>
                  <p className="mt-2 border-l-2 border-line pl-3 text-base leading-relaxed text-mute">{c.source}</p>
                </details>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
