'use client'

import { useEffect, useRef, useState } from 'react'
import { namaHari } from './format'
import { useClassStore } from './store'

const kolom = 'mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 text-base text-fg outline-none focus:border-gold'

export default function ClassFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const add = useClassStore((s) => s.add)
  const namaRef = useRef<HTMLInputElement>(null)
  const [f, setF] = useState({ name: '', lecturer: '', day: new Date().getDay(), start: '08:00', end: '09:40', topic: '' })

  useEffect(() => {
    if (!open) return
    namaRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name.trim()) return
    await add({ ...f, name: f.name.trim(), lecturer: f.lecturer.trim(), topic: f.topic.trim() })
    setF({ ...f, name: '', lecturer: '', topic: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center sm:p-6" onClick={onClose}>
      <form onSubmit={simpan} role="dialog" aria-modal="true" aria-label="Tambah kelas" onClick={(e) => e.stopPropagation()}
        className="max-h-dvh w-full max-w-lg overflow-y-auto rounded-t-2xl bg-panel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl">
        <h2 className="text-xl font-semibold">Tambah kelas</h2>

        <label className="mt-4 block text-base text-mute">Nama mata kuliah
          <input ref={namaRef} required maxLength={100} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="mis. Fisika Dasar" className={kolom} />
        </label>
        <label className="mt-3 block text-base text-mute">Dosen (opsional)
          <input maxLength={100} value={f.lecturer} onChange={(e) => setF({ ...f, lecturer: e.target.value })} className={kolom} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="col-span-2 block text-base text-mute sm:col-span-1">Hari
            <select value={f.day} onChange={(e) => setF({ ...f, day: Number(e.target.value) })} className={kolom}>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>{namaHari(d)}</option>)}
            </select>
          </label>
          <label className="block text-base text-mute">Mulai
            <input type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} className={kolom} />
          </label>
          <label className="block text-base text-mute">Selesai
            <input type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} className={kolom} />
          </label>
        </div>
        <label className="mt-3 block text-base text-mute">Topik pertemuan (opsional)
          <input maxLength={100} value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} placeholder="mis. Hukum Newton" className={kolom} />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="h-12 rounded-lg border border-line bg-ink text-base font-medium">Batal</button>
          <button type="submit" disabled={!f.name.trim()} className="h-12 rounded-lg bg-gold text-base font-semibold text-ink disabled:opacity-40">Simpan kelas</button>
        </div>
      </form>
    </div>
  )
}
