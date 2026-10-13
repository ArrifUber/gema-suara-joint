'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/shared/components/Nav'
import { useProfileStore } from '@/features/profile/store'

export default function WelcomeScreen() {
  const router = useRouter()
  const setName = useProfileStore((s) => s.setName)
  const [value, setValue] = useState('')

  const lanjut = () => {
    if (!value.trim()) return
    setName(value.trim())
    router.replace('/')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <Logo large />
      <h1 className="mt-8 text-2xl font-bold">Selamat datang di GemaSuara</h1>
      <p className="mt-2 text-base text-mute">Siapa namamu? Nama hanya disimpan di perangkat ini.</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && lanjut()}
        placeholder="Nama panggilan"
        aria-label="Nama panggilan"
        autoFocus
        className="mt-6 h-12 rounded-lg border border-line bg-panel px-4 text-base outline-none focus:border-gold"
      />
      <button onClick={lanjut} disabled={!value.trim()} className="mt-3 h-12 rounded-lg bg-gold text-base font-semibold text-ink disabled:opacity-40">Lanjut</button>
    </div>
  )
}
