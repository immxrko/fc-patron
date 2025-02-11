'use client'

import { Home, Users, Trophy, CalendarDays, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileMenuBar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-sm border-t border-white/10 md:hidden">
      <nav className="h-full overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-center h-full px-4 gap-2 min-w-max mx-auto">
          <Link 
            href="/"
            className={`p-3 rounded-xl transition-colors duration-200 min-w-[48px] flex items-center justify-center
              ${isActive('/') 
                ? 'bg-red-500/20 text-red-400' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Home className="w-6 h-6" />
          </Link>
          <Link 
            href="/squad"
            className={`p-3 rounded-xl transition-colors duration-200 min-w-[48px] flex items-center justify-center
              ${isActive('/squad') 
                ? 'bg-red-500/20 text-red-400' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Users className="w-6 h-6" />
          </Link>
          <Link 
            href="/schedule"
            className={`p-3 rounded-xl transition-colors duration-200 min-w-[48px] flex items-center justify-center
              ${isActive('/schedule') 
                ? 'bg-red-500/20 text-red-400' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <CalendarDays className="w-6 h-6" />
          </Link>
          <Link 
            href="/standings"
            className={`p-3 rounded-xl transition-colors duration-200 min-w-[48px] flex items-center justify-center
              ${isActive('/standings') 
                ? 'bg-red-500/20 text-red-400' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Trophy className="w-6 h-6" />
          </Link>
          <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 min-w-[48px] flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </button>
          <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 min-w-[48px] flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  )
} 