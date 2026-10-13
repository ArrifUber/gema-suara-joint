import type { Metadata } from 'next'
import ClassScreen from '@/features/class/ClassScreen'

export const metadata: Metadata = { title: 'Kelas' }

export default function Page() {
  return <ClassScreen />
}
