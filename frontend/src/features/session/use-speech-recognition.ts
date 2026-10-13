import { useCallback, useEffect, useRef, useState } from 'react'

interface Opts {
  lang: string
  onInterim: (text: string) => void
  onFinal: (text: string) => void
  onError: (kind: 'micDitolak' | 'micError') => void
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const getCtor = (): any =>
  typeof window === 'undefined' ? undefined : (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition

/** Pembungkus Web Speech API: continuous + interim, otomatis menyala lagi selama masih aktif. */
export function useSpeechRecognition({ lang, onInterim, onFinal, onError }: Opts) {
  const recRef = useRef<any>(null)
  const wantRef = useRef(false)
  const cb = useRef({ onInterim, onFinal, onError })
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    cb.current = { onInterim, onFinal, onError }
  })
  useEffect(() => setSupported(!!getCtor()), [])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor || wantRef.current) return
    wantRef.current = true
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) cb.current.onFinal(r[0].transcript)
        else interim += r[0].transcript
      }
      cb.current.onInterim(interim)
    }
    rec.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      wantRef.current = false
      cb.current.onError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'micDitolak' : 'micError')
    }
    rec.onend = () => {
      if (wantRef.current) setTimeout(() => { try { rec.start() } catch { /* sudah berjalan */ } }, 250)
      else cb.current.onInterim('')
    }
    recRef.current = rec
    try { rec.start() } catch { wantRef.current = false }
  }, [lang])

  const stop = useCallback(() => {
    wantRef.current = false
    recRef.current?.stop()
    cb.current.onInterim('')
  }, [])

  useEffect(() => () => { wantRef.current = false; recRef.current?.abort() }, [])

  return { supported, start, stop }
}
