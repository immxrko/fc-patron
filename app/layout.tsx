import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '../components/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FC Patron',
  description: 'Official website of FC Patron',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ backgroundColor: 'black', color: 'white' }}>
      <body className={`${inter.className} h-[100dvh] overflow-hidden`} style={{ backgroundColor: 'black', color: 'white' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 