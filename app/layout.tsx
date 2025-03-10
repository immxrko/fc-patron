import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '../components/ClientLayout'
import { AdminProvider } from '@/context/AdminContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FC Patron Wien',
  description: 'Der FC Patron ist ein aufstrebender Amateurverein aus Wien, der in der 1. Klasse B seine Heimspiele am WAF-Platz austrägt. Wir laden fußballbegeisterte Spieler herzlich zu Probetrainings ein. Gemeinsam schreiben wir Fußballgeschichte in Wien. #rotschwarzgold',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ backgroundColor: 'black', color: 'white' }}>
      <body className={`${inter.className} h-[100dvh] overflow-hidden`} style={{ backgroundColor: 'black', color: 'white' }}>
        <AdminProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AdminProvider>
      </body>
    </html>
  )
} 