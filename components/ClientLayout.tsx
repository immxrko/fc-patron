'use client'

import Sidebar from './Sidebar'
import MobileMenuBar from './MobileMenuBar'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar />
      <div className="h-full overflow-y-auto">
        {children}
      </div>
      <MobileMenuBar />
    </>
  )
} 