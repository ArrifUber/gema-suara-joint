import Link from 'next/link'
import { formatJadwal } from '@/features/class/format'
import type { ClassItem } from '@/features/class/types'
import { ChevronRight } from '@/shared/components/Icons'

export default function TodayClassItem({ c }: { c: ClassItem }) {
  return (
    <li className="border-b border-line">
      <Link href={`/kelas/${c.id}/live`} className="my-2 flex items-center gap-3 rounded-lg py-3 pl-3 pr-2 hover:bg-panel" style={{ borderLeft: `4px solid ${c.accent}` }}>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{c.name}</p>
          {c.lecturer && <p className="truncate text-sm text-mute">{c.lecturer}</p>}
          <p className={`mt-1 text-sm ${c.liveSessionId ? 'font-medium text-live' : 'text-mute'}`}>{c.liveSessionId ? 'Sesi berjalan' : formatJadwal(c)}</p>
        </div>
        {c.liveSessionId ? (
          <span className="flex items-center gap-1.5 rounded-full border border-live px-2.5 py-1 text-xs font-bold text-live">
            <span className="h-1.5 w-1.5 rounded-full bg-live pulse-dot" />LIVE
          </span>
        ) : <ChevronRight width={18} height={18} className="text-mute" />}
      </Link>
    </li>
  )
}
