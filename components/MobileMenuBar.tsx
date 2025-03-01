'use client'

import { Home, Users, Trophy, CalendarDays, LogIn, FileText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MobileMenuBar() {
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
            href="/records"
            className={`p-3 rounded-xl transition-colors duration-200 min-w-[48px] flex items-center justify-center
              ${isActive('/records') 
                ? 'bg-red-500/20 text-red-400' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Trophy className="w-6 h-6" />
          </Link>

          {/* Separator */}
          <div className="h-8 w-px bg-white/10 mx-1" />

          {/* Imprint Link */}
          <Link 
            href="/imprint"
            className={`p-3 rounded-xl transition-colors duration-200 min-w-[48px] flex items-center justify-center
              ${isActive('/imprint') 
                ? 'bg-red-500/20 text-red-400' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FileText className="w-6 h-6" />
          </Link>
       
          {isAdmin && (
            <Link 
              href="/admin"
              className={`p-3 rounded-xl transition-colors duration-200 min-w-[48px] flex items-center justify-center
                ${isActive('/admin') 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <LogIn className="w-6 h-6" />
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
} 