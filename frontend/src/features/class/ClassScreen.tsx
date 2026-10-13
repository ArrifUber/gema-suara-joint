'use client'

import { useState } from 'react'
import { PlusIcon } from '@/shared/components/Icons'
import SearchField from '@/shared/components/SearchField'
import ClassCard from './ClassCard'
import ClassFormDialog from './ClassFormDialog'
import { useClassStore } from './store'

export default function ClassScreen() {
  const { classes, remove } = useClassStore()
  const [q, setQ] = useState('')
  const [dialog, setDialog] = useState(false)
  const list = classes.filter((c) => (c.name + c.lecturer).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 lg:max-w-md"><SearchField value={q} onChange={setQ} placeholder="Kelas apa nih?" /></div>
        <button onClick={() => setDialog(true)} aria-label="Tambah kelas" className="ml-auto inline-flex h-11 items-center gap-2 rounded-lg bg-gold px-4 text-base font-semibold text-ink">
          <PlusIcon width={18} height={18} /><span className="hidden sm:inline">Tambah kelas</span>
        </button>
      </div>

      <h1 className="mb-3 mt-6 border-l-2 border-gold pl-2 text-sm font-semibold text-gold">Kelasmu</h1>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <p className="text-lg font-semibold">Belum ada kelas</p>
          <p className="mt-1 text-base text-mute">Tambahkan mata kuliahmu agar caption dan catatan tersimpan per kelas.</p>
        </div>
      ) : list.length === 0 ? (
        <p className="py-6 text-base text-mute">Tidak ada kelas yang cocok. Coba kata kunci lain.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <li key={c.id}><ClassCard c={c} onDelete={() => window.confirm('Hapus kelas ini beserta caption dan catatannya?') && void remove(c.id)} /></li>
          ))}
        </ul>
      )}

      <ClassFormDialog open={dialog} onClose={() => setDialog(false)} />
    </>
  )
}
