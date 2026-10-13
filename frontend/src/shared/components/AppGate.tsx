'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { useClassStore } from '@/features/class/store'
import { CAPTION_SIZES, useProfileStore } from '@/features/profile/store'
import { Logo } from './Nav'

/**
 * Data profil & kelas tersimpan di browser (localStorage), jadi dimuat di sisi klien.
 * Selama belum siap hanya logo yang tampil, sehingga HTML server dan klien tetap cocok.
 */
export default function AppGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { name, ready: profilSiap, captionSize, load: muatProfil } = useProfileStore()
  const { ready: kelasSiap, load: muatKelas } = useClassStore()

  useEffect(() => { muatProfil(); void muatKelas() }, [muatProfil, muatKelas])

  useEffect(() => {
    document.documentElement.style.setProperty('--caption-size', `${CAPTION_SIZES[captionSize]}rem`)
  }, [captionSize])

  const siap = profilSiap && kelasSiap
  const perluNama = siap && !name && pathname !== '/masuk'

  useEffect(() => { if (perluNama) router.replace('/masuk') }, [perluNama, router])

  if (!siap || perluNama) return <div className="grid min-h-dvh place-items-center"><Logo large /></div>
  return <>{children}</>
}
