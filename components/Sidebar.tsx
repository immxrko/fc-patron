'use client'

import { Home, Users, Trophy, CalendarDays, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdmin()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', session.user.id)
        .single()
      setIsAdmin(!!adminData)
    } else {
      setIsAdmin(false)
    }
  }

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
        {isAdmin && (
          <Link 
            href="/admin"
            className={`p-3 rounded-xl transition-colors duration-200 
              ${isActive('/admin') 
                ? 'bg-red-500/20 text-red-400' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <LogIn className="w-6 h-6" />
          </Link>
        )}
      </div>
    </div>
  )
} 