'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Save, Search, User, Users, Footprints, Shield, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Player {
  ID: number
  isActive: boolean
  Name: string
  Position: string
  BildURL: string
  Fuß: string
  Geburtsdatum: string
  KM_Res_Beides: string
}

interface ManagePlayersProps {
  onBack: () => void
  players: Player[]
  onPlayersUpdate: () => Promise<void>
}

// Add default values for a new player
const defaultPlayer: Omit<Player, 'ID'> = {
  isActive: false,
  Name: '',
  Position: '',
  BildURL: '',
  Fuß: '',
  Geburtsdatum: '',
  KM_Res_Beides: ''
}

export default function ManagePlayers({ 
  onBack, 
  players: initialPlayers,
  // eslint-disable-next-line
  onPlayersUpdate 
}: ManagePlayersProps) {
  const [players, setPlayers] = useState(initialPlayers)
  // Initialize selectedPlayer with defaultPlayer values
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const positions = ['GK', 'DEF', 'MID', 'ATT']

  useEffect(() => {
    fetchPlayers()

    // Set up real-time subscription
    const channel = supabase
      .channel('players_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players' }, 
        () => {
          fetchPlayers()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
      
      if (error) {
        console.error('Error fetching players:', error)
        return
      }

      if (data) {
        setPlayers(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddNew = () => {
    setSelectedPlayer({
      ...defaultPlayer,
      ID: Date.now() // Temporary ID until saved
    } as Player)
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!selectedPlayer) return
    
    setLoading(true)
    try {
      if (isAddingNew) {
        // Create new player - omit the ID field completely
        const newPlayer = {
          isActive: selectedPlayer.isActive,
          Name: selectedPlayer.Name,
          Position: selectedPlayer.Position,
          BildURL: selectedPlayer.BildURL || '',
          Fuß: selectedPlayer.Fuß || '',
          Geburtsdatum: selectedPlayer.Geburtsdatum || '',
          KM_Res_Beides: selectedPlayer.KM_Res_Beides || '',
        }

        const { data, error } = await supabase
          .from('players')
          .insert([newPlayer])
          .select()

        if (error) {
          console.error('🔴 Error creating player:', error)
          return
        }

        console.log('✅ New player added:', data)
      } else {
        // Update existing player
        const { error } = await supabase
          .from('players')
          .update({
            isActive: selectedPlayer.isActive,
            Name: selectedPlayer.Name,
            Position: selectedPlayer.Position,
            BildURL: selectedPlayer.BildURL || '',
            Fuß: selectedPlayer.Fuß || '',
            Geburtsdatum: selectedPlayer.Geburtsdatum || '',
            KM_Res_Beides: selectedPlayer.KM_Res_Beides || '',
          })
          .eq('ID', selectedPlayer.ID)

        if (error) {
          console.error('🔴 Error updating player:', error)
          return
        }
      }

      await fetchPlayers()
      setSelectedPlayer(null)
      setIsAddingNew(false)
      console.log('✅ Player saved successfully')
    } catch (error) {
      console.error('🔴 Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update the player selection to ensure all fields are defined
  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer({
      ...defaultPlayer,
      ...player
    })
    setIsAddingNew(false)  // Reset isAddingNew when selecting an existing player
  }

  const filteredPlayers = players
    .filter(player =>
      player.Name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by active status
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1
      }
      // Then sort alphabetically within each group
      return a.Name.localeCompare(b.Name)
    })

  // Add this helper function to get player counts
  const getPlayerCounts = () => {
    const active = players.filter(p => p.isActive).length
    const inactive = players.filter(p => !p.isActive).length
    return { active, inactive }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="px-4 py-2 bg-black/20 hover:bg-black/40 
              rounded-xl text-gray-400 text-sm font-medium transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-white">Player Management</h2>
          </div>
        </div>
        {/* Keep only this Add Player button */}
        <div className="flex items-center gap-3">
          {selectedPlayer ? (
            <>
              {/* Cancel button */}
              <motion.button
                onClick={() => {
                  setSelectedPlayer(null)
                  setIsAddingNew(false)
                }}
                className="px-4 py-2 bg-black/20 hover:bg-black/40 
                  rounded-xl text-gray-400 text-sm font-medium transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              {/* Save/Update button */}
              <motion.button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                  rounded-xl text-red-400 text-sm font-medium transition-colors flex items-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {isAddingNew ? 'Add Player' : 'Update Player'}
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={handleAddNew}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                rounded-xl text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-4 h-4" />
              Add Player
            </motion.button>
          )}
        </div>
      </div>

      {/* Make grid stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Player List - adjust height for mobile */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          {/* Status summary - make it scroll horizontally if needed */}
          <div className="flex items-center mb-4 px-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-4 min-w-max">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-400">
                  Active ({getPlayerCounts().active})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-gray-400">
                  Inactive ({getPlayerCounts().inactive})
                </span>
              </div>
            </div>
          </div>

          {/* Make player list shorter on mobile */}
          <div className="space-y-2 max-h-[300px] md:max-h-[600px] overflow-y-auto 
            scrollbar-thin scrollbar-thumb-red-500/20 hover:scrollbar-thumb-red-500/30 scrollbar-track-transparent">
            <div className="relative mb-4">
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
            {filteredPlayers.map((player) => (
              <motion.div
                key={player.ID}
                onClick={() => handlePlayerSelect(player)}
                className={`p-3 rounded-lg cursor-pointer transition-all
                  ${selectedPlayer?.ID === player.ID 
                    ? 'bg-red-500/10 border border-red-500/20' 
                    : 'bg-black/20 border border-white/5 hover:bg-black/40'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                    alt={player.Name}
                    className="w-12 h-12 rounded-lg object-cover bg-black/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{player.Name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{player.Position}</span>
                      <span>•</span>
                      <span>{player.KM_Res_Beides}</span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${player.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Edit Form - already responsive with grid-cols-1 md:grid-cols-2 */}
        {selectedPlayer ? (
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-medium text-white">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={selectedPlayer.Name || ''}
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, Name: e.target.value})}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Birthday</label>
                  <input
                    type="date"
                    value={selectedPlayer.Geburtsdatum || ''}
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, Geburtsdatum: e.target.value})}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Player Status Card */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-medium text-white">Player Status</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
                  <select
                    value={selectedPlayer.Position || ''}
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, Position: e.target.value})}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Team</label>
                  <select
                    value={selectedPlayer.KM_Res_Beides || ''}
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, KM_Res_Beides: e.target.value})}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select team</option>
                    <option value="KM">First Team</option>
                    <option value="RES">Reserve</option>
                    <option value="Beides">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={(selectedPlayer.isActive ?? false).toString()}
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Footprints className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-medium text-white">Additional Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Foot</label>
                  <select
                    value={selectedPlayer.Fuß || ''}
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, Fuß: e.target.value})}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select foot</option>
                    <option value="L">Left</option>
                    <option value="R">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={selectedPlayer.BildURL || ''}
                    onChange={(e) => setSelectedPlayer({...selectedPlayer, BildURL: e.target.value})}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 
            p-6 flex items-center justify-center min-h-[200px] md:min-h-0">
            <div className="text-gray-400 text-center">Select a player to edit their properties</div>
          </div>
        )}
      </div>
    </div>
  )
} 