import type { ReactNode } from 'react'
import { BottomNav, Logo, Sidebar } from './Nav'

/** Kerangka halaman utama: sidebar di desktop, navigasi bawah di mobile. */
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))] lg:px-10 lg:pt-10">
          <div className="mb-4 lg:hidden"><Logo /></div>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
