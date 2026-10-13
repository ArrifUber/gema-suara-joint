'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GridIcon, HomeIcon, UserIcon } from './Icons'

const items = [
  { href: '/', label: 'Beranda', Icon: HomeIcon },
  { href: '/kelas', label: 'Kelas', Icon: GridIcon },
  { href: '/profil', label: 'Profil', Icon: UserIcon },
]

function useActive() {
  const pathname = usePathname()
  return (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
}

export function Logo({ large }: { large?: boolean }) {
  return <span className={`font-bold tracking-tight ${large ? 'text-3xl' : 'text-xl'}`}>Gema<span className="text-gold">Suara.</span></span>
}

/** Navigasi bawah (mobile/tablet). */
export function BottomNav() {
  const isActive = useActive()
  return (
    <nav className="sticky bottom-0 z-10 flex h-16 items-end justify-around border-t border-line bg-surface px-4 pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Menu utama">
      {items.map(({ href, label, Icon }) => {
        const active = isActive(href)
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-w-20 flex-col items-center pb-1.5 ${active ? 'text-fg' : 'text-mute'}`}>
            <span className={`grid place-items-center rounded-full transition-all ${active ? '-mt-5 mb-0.5 h-12 w-12 bg-gold text-ink shadow-[0_0_0_5px_var(--color-surface)]' : 'h-9 w-9'}`}>
              <Icon width={22} height={22} />
            </span>
            <span className={`text-sm ${active ? 'font-semibold' : 'sr-only'}`}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/** Sidebar (desktop ≥ 1024px). */
export function Sidebar() {
  const isActive = useActive()
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line bg-surface p-5 lg:flex">
      <Logo large />
      <nav aria-label="Menu utama" className="flex flex-col gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium hover:bg-panel ${active ? 'bg-panel text-gold' : 'text-mute'}`}>
              <Icon width={20} height={20} />{label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
