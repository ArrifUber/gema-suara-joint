'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from '@/shared/components/Icons'
import { useSessionStore } from './store'
import type { ContextItem } from './types'

const gerak = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')

export default function CaptionFeed() {
  const lines = useSessionStore((s) => s.lines)
  const interim = useSessionStore((s) => s.interim)
  const contexts = useSessionStore((s) => s.contexts)
  const jumpToNote = useSessionStore((s) => s.jumpToNote)
  const box = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  const [diBawah, setDiBawah] = useState(true)

  const perSeq = useMemo(() => {
    const m = new Map<number, ContextItem[]>()
    contexts.forEach((c) => m.set(c.sequence, [...(m.get(c.sequence) ?? []), c]))
    return m
  }, [contexts])

  useEffect(() => {
    const el = box.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [lines, interim, contexts])

  const onScroll = () => {
    const el = box.current
    if (!el) return
    const dekat = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    stick.current = dekat
    setDiBawah(dekat)
  }

  const keTerbaru = () => {
    const el = box.current
    if (!el) return
    stick.current = true
    el.scrollTo({ top: el.scrollHeight, behavior: gerak() })
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col px-5 pt-4 lg:px-8 lg:pt-6">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold tracking-wider text-mute">
        <span>CAPTION LANGSUNG</span>
        <span>ID</span>
      </div>
      <div ref={box} onScroll={onScroll} className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pb-6" role="log" aria-live="off">
        {lines.map((l, i) => (
          <div key={l.id} className="-mx-2 rounded-lg px-2 py-1">
            <p className={`caption-text ${i < lines.length - 3 ? 'text-fg/75' : 'text-fg'}`}>{l.text}</p>
            {perSeq.get(l.seq)?.map((c) => (
              <button key={c.id} onClick={() => jumpToNote(c.id)} aria-label={`Buka catatan: ${c.data.concept}`}
                className="mr-2 mt-2 inline-flex max-w-full items-center gap-2 rounded-full border border-gold-dim bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />
                <span className="truncate">{c.data.concept}{c.data.formula ? ` · ${c.data.formula}` : ''}</span>
              </button>
            ))}
          </div>
        ))}
        {interim && <p className="caption-text text-mute">{interim}</p>}
      </div>
      {!diBawah && (
        <button onClick={keTerbaru} className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-base font-semibold text-ink shadow-lg">
          <ChevronDown width={16} height={16} />Ke terbaru
        </button>
      )}
    </div>
  )
}
