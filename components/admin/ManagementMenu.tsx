'use client'

import { motion } from 'framer-motion'
import { 
  Users,
  Swords, 
  Dumbbell, 
  Settings,
  LucideIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import ManagePlayers from './ManagePlayers'
import ManagePractice from './ManagePractice'
import ManageGames from './ManageGames'

interface Player {
  ID: number
  Name: string
  Position: string
  BildURL: string
  isActive: boolean
  Fuß: string
  Geburtsdatum: string
  KM_Res_Beides: string
}

interface Practice {
  ID: number
  Date: string
  AttendanceSet: boolean
  Canceled: boolean
}

interface Attendance {
  PracticeID: number
  PlayerID: number
  Present: boolean
}

interface MenuItem {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
}

interface ManagementMenuProps {
  practices: Practice[]
  players: Player[]
  attendance: Attendance[]
  onDataUpdate: () => Promise<void>
}

export default function ManagementMenu({ practices, players, attendance, onDataUpdate }: ManagementMenuProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const menuItems: MenuItem[] = [
    {
      title: "Manage Players",
      icon: Users,
      description: "Control player status and add new players to the system",
      onClick: () => setSelectedSection('player-props')
    },
    {
      title: "Manage Games",
      icon: Swords,
      description: "Schedule matches, update results, and manage game statistics",
      onClick: () => setSelectedSection('games')
    },
    {
      title: "Manage Practice",
      icon: Dumbbell,
      description: "Schedule training sessions and track attendance",
      onClick: () => setSelectedSection('practice')
    }
  ]

  useEffect(() => {
    onDataUpdate()
    setLoading(false)
  }, [])

  const handleRefreshData = async () => {
    await onDataUpdate()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (selectedSection === 'player-props' || selectedSection === 'players') {
    return (
      <ManagePlayers 
        onBack={() => setSelectedSection(null)} 
        players={players}
        onPlayersUpdate={handleRefreshData}
      />
    )
  }

  if (selectedSection === 'practice') {
    return (
      <ManagePractice 
        onBack={() => setSelectedSection(null)}
        players={players}
        practices={practices}
        attendance={attendance}
        onDataUpdate={handleRefreshData}
      />
    )
  }

  if (selectedSection === 'games') {
    return (
      <ManageGames 
        onBack={() => setSelectedSection(null)}
        players={players}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center gap-4">
            <div className="p-2 md:p-3 bg-red-500/10 rounded-xl">
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Management Console</h2>
              <p className="text-sm md:text-base text-gray-400">Manage your team and track performance</p>
            </div>
          </div>
          <motion.button
            onClick={handleSignOut}
            className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-red-500/10 hover:bg-red-500/20 
              rounded-xl text-red-400 text-sm font-medium transition-colors
              flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Sign Out</span>
          </motion.button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                onClick={item.onClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-[3/2] md:aspect-square overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative h-full p-4 md:p-6 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/5 
                  hover:border-red-500/20 transition-all duration-300 cursor-pointer
                  flex flex-col items-center justify-center text-center">
                  <div className="p-3 md:p-4 rounded-xl bg-black/20 group-hover:bg-red-500/10 transition-colors mb-3 md:mb-4">
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-red-400 transition-colors mb-1 md:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 md:line-clamp-none">
                    {item.description}
                  </p>
                  
                  {/* Hover Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent 
                    via-red-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 
                    transition-transform duration-300" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 