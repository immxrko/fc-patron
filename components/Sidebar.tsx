'use client'

import { Home, Users, Trophy, CalendarDays, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-black/40 backdrop-blur-sm border-r border-white/10 flex-col items-center py-8 hidden md:flex z-50">
      <div className="mb-8">
        <img
          src="https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
          alt="Logo"
          className="w-12 h-12 rounded-xl"
        />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-4">
        <Link 
          href="/"
          className={`p-3 rounded-xl transition-colors duration-200 
            ${isActive('/') 
              ? 'bg-red-500/20 text-red-400' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Home className="w-6 h-6" />
        </Link>
        <Link 
          href="/squad"
          className={`p-3 rounded-xl transition-colors duration-200 
            ${isActive('/squad') 
              ? 'bg-red-500/20 text-red-400' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Users className="w-6 h-6" />
        </Link>
        <Link 
          href="/schedule"
          className={`p-3 rounded-xl transition-colors duration-200 
            ${isActive('/schedule') 
              ? 'bg-red-500/20 text-red-400' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <CalendarDays className="w-6 h-6" />
        </Link>
        <Link 
          href="/records"
          className={`p-3 rounded-xl transition-colors duration-200 
            ${isActive('/records') 
              ? 'bg-red-500/20 text-red-400' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Trophy className="w-6 h-6" />
        </Link>
      </nav>

      <div className="flex flex-col items-center gap-4">
        <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
          <Settings className="w-6 h-6" />
        </button>
        <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
} 