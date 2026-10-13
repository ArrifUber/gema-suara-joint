'use client'

import Link from 'next/link'
import { useState } from 'react'
import ClassFormDialog from '@/features/class/ClassFormDialog'
import { useClassStore } from '@/features/class/store'
import { useProfileStore } from '@/features/profile/store'
import { PlusIcon } from '@/shared/components/Icons'
import SearchField from '@/shared/components/SearchField'
import TodayClassItem from './TodayClassItem'

export default function HomeScreen() {
  const name = useProfileStore((s) => s.name)
  const classes = useClassStore((s) => s.classes)
  const [q, setQ] = useState('')
  const [dialog, setDialog] = useState(false)

  const hariIni = new Date().getDay()
  const list = classes
    .filter((c) => c.day === hariIni && c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(!!b.liveSessionId) - Number(!!a.liveSessionId) || a.start.localeCompare(b.start))

  const kosong = classes.length === 0 ? 'Tambahkan mata kuliahmu agar caption dan catatan tersimpan per kelas.' : q ? 'Tidak ada kelas yang cocok. Coba kata kunci lain.' : 'Belum ada kelas hari ini.'

  return (
    <>
      <h1 className="text-4xl font-bold leading-tight lg:text-5xl">Halo, <span className="text-gold">{name}!</span></h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-mute lg:text-lg">Dengar lewat teks. Tak ada materi yang terlewat, tak ada penjelasan yang tertinggal.</p>

      <div className="mt-5 max-w-xl"><SearchField value={q} onChange={setQ} placeholder="Kelas apa nih?" /></div>

      <div className="mb-2 mt-8 flex items-center justify-between">
        <h2 className="border-l-2 border-gold pl-2 text-sm font-semibold text-gold">Kelas hari ini</h2>
        <Link href="/kelas" className="text-sm text-mute underline underline-offset-4">Lihat semua kelas</Link>
      </div>

      {list.length === 0 && (
        <div className="rounded-xl border border-dashed border-line p-6 text-center">
          <p className="text-base text-mute">{kosong}</p>
          <button onClick={() => setDialog(true)} className="mt-3 inline-flex h-12 items-center gap-2 rounded-lg bg-gold px-5 text-base font-semibold text-ink"><PlusIcon width={18} height={18} />Tambah kelas</button>
        </div>
      )}

      <ul className="grid gap-x-8 lg:grid-cols-2">
        {list.map((c) => <TodayClassItem key={c.id} c={c} />)}
      </ul>

      <ClassFormDialog open={dialog} onClose={() => setDialog(false)} />
    </>
  )
}
