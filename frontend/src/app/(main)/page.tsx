import type { Metadata } from 'next'
import HomeScreen from '@/features/home/HomeScreen'

export const metadata: Metadata = { title: 'Beranda' }

export default function Page() {
  return <HomeScreen />
}
