import { Home, Users, Trophy, Calendar, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-black/40 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-8">
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
          className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <Home className="w-6 h-6" />
        </Link>
        <Link 
          href="/squad"
          className="p-3 rounded-xl text-white bg-white/10 transition-all duration-300"
        >
          <Users className="w-6 h-6" />
        </Link>
        <Link 
          href="/competitions"
          className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <Trophy className="w-6 h-6" />
        </Link>
        <Link 
          href="/calendar"
          className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <Calendar className="w-6 h-6" />
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