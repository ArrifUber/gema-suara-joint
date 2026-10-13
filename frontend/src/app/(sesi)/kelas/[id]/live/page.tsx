import type { Metadata } from 'next'
import SessionScreen from '@/features/session/SessionScreen'

export const metadata: Metadata = { title: 'Sesi kelas' }

// Di Next.js terbaru `params` berupa Promise, dibaca di server lalu dikirim sebagai prop.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SessionScreen id={id} />
}
