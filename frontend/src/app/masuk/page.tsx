import type { Metadata } from 'next'
import WelcomeScreen from '@/features/welcome/WelcomeScreen'

export const metadata: Metadata = { title: 'Masuk' }

export default function Page() {
  return <WelcomeScreen />
}
