import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import AppGate from '@/shared/components/AppGate'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'GemaSuara', template: '%s · GemaSuara' },
  description: 'Caption langsung dan catatan konsep untuk mahasiswa tunarungu.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b141c',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppGate>{children}</AppGate>
      </body>
    </html>
  )
}
