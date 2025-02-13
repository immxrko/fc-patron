'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, UserCheck, UserX} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Player {
  ID: number
  Name: string
  Position: string
  isActive: boolean
  BildURL: string
}

export default function PlayerStatusManager() {
  const [players, setPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  // eslint-disable-next-line
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  // eslint-disable-next-line
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    // eslint-disable-next-line
    const { data, error } = await supabase
      .from('players')
      .select('ID, Name, Position, isActive, BildURL')
      .order('Name')

    if (data) setPlayers(data)
  }

  const filteredPlayers = players.filter(player =>
    player.Name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const togglePlayerStatus = async (playerId: number, currentStatus: boolean) => {
    setLoading(true)
    const { error } = await supabase
      .from('players')
      .update({ isActive: !currentStatus })
      .eq('ID', playerId)

    if (!error) {
      setPlayers(players.map(player => 
        player.ID === playerId 
          ? { ...player, isActive: !currentStatus }
          : player
      ))
      setSelectedPlayer(null)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-xl font-bold text-white">Player Status Manager</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/5 rounded-xl 
              text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <motion.div
            key={player.ID}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all
              ${player.isActive 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img
                    src={player.BildURL}
                    alt={player.Name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {player.isActive ? (
                    <UserCheck className="absolute -top-1 -right-1 w-4 h-4 text-green-400" />
                  ) : (
                    <UserX className="absolute -top-1 -right-1 w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {player.Name}
                  </h3>
                  <p className="text-xs text-gray-400">{player.Position}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePlayerStatus(player.ID, player.isActive)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${player.isActive
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {player.isActive ? 'Deactivate' : 'Activate'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 