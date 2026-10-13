import Link from 'next/link'
import { TrashIcon, UserIcon } from '@/shared/components/Icons'
import { formatJadwal } from './format'
import type { ClassItem } from './types'

const pola = (warna: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='160' height='90' fill='#fff3e0'/><path d='M-10 20c30-30 50 10 80-10s40 30 100 0v40c-40 30-60-10-90 10S20 80-10 60z' fill='${warna}'/><circle cx='130' cy='70' r='16' fill='${warna}'/></svg>`,
  )}")`

export default function ClassCard({ c, onDelete }: { c: ClassItem; onDelete: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white text-ink">
      <div className="relative h-24 bg-cover" style={{ backgroundImage: pola(c.accent) }}>
        {c.liveSessionId && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-live">
            <span className="h-1.5 w-1.5 rounded-full bg-live pulse-dot" />LIVE
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h2 className="text-lg font-semibold leading-snug">{c.name}</h2>
        {c.lecturer && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><UserIcon width={14} height={14} />{c.lecturer}</p>}
        <p className="mt-0.5 text-sm text-slate-600">{formatJadwal(c)}</p>
        {c.topic && <p className="mt-0.5 text-sm text-slate-600">{c.topic}</p>}
        <div className="mt-3 flex items-center justify-between pt-1">
          <button onClick={onDelete} aria-label={`Hapus kelas: ${c.name}`} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><TrashIcon width={18} height={18} /></button>
          <Link href={`/kelas/${c.id}/live`} className="rounded-md bg-slate-800 px-5 py-2 text-base font-medium text-white">Buka</Link>
        </div>
      </div>
    </article>
  )
}
