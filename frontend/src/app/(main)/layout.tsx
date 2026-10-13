import type { ReactNode } from 'react'
import Shell from '@/shared/components/Shell'

export default function MainLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>
}
