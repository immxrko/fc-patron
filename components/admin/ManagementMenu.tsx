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
  icon: LucideIcon
  onClick: () => void
  color: string
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
      onClick: () => setSelectedSection('player-props'),
      color: "blue"
    },
    {
      title: "Manage Games",
      icon: Swords,
      onClick: () => setSelectedSection('games'),
      color: "red"
    },
    {
      title: "Manage Practice",
      icon: Dumbbell,
      onClick: () => setSelectedSection('practice'),
      color: "green"
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
    <div className="min-h-screen bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-sm p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Settings className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Management Console</h2>
              <p className="text-sm text-gray-400">Manage your team and track performance</p>
            </div>
          </div>
          <motion.button
            onClick={handleSignOut}
            className="w-full md:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
              rounded-xl text-red-400 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Out
          </motion.button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              onClick={item.onClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative h-40 sm:h-48 bg-black/20 backdrop-blur-sm rounded-2xl p-6
                border border-white/5 hover:border-red-500/20 transition-colors
                flex flex-col items-center justify-center overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br 
                  from-${item.color}-500/10 to-transparent rounded-full 
                  transform translate-x-16 -translate-y-16`} />
                
                <div className="relative flex flex-col items-center">
                  <div className="p-3 rounded-xl bg-black/20 w-fit mb-4">
                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                  </div>
                  <h2 className="text-xl font-bold text-white text-center">{item.title}</h2>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent 
                  via-red-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 
                  transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 