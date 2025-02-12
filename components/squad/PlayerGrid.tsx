'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface Player {
  ID: number
  isActive: boolean
  Name: string
  Position: string
  BildURL: string
  Gesamt_Total_S: number
  Gesamt_Total_T: number
  Gesamt_Total_A: number
}

interface PlayerGridProps {
  searchQuery: string;
}

export default function PlayerGrid({ searchQuery }: PlayerGridProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlayers() {
      console.log('🔄 Starting fetch from table: players')
      
      const { data, error } = await supabase
      .from('players')
      .select(`
        "ID",
        "isActive",
        "Name",
        "Position",
        "BildURL",
        "Gesamt_Total_S",
        "Gesamt_Total_T",
        "Gesamt_Total_A"
      `)
      .eq("isActive", true)
    
      
      if (error) {
        console.error('🔴 Error fetching players:', error)
        return
      }

      setPlayers(data || [])
      setLoading(false)
    }

    fetchPlayers()
  }, [])

  // Group and sort players by position
  const positionOrder = ['GK', 'DEF', 'MID', 'ATT']
  const groupedPlayers = positionOrder.map(pos => ({
    position: pos,
    players: players.filter(p => p.Position === pos)
  })).filter(group => group.players.length > 0)

  const filteredGroups = groupedPlayers.map(group => ({
    position: group.position,
    players: group.players.filter(player => {
      const searchTerm = searchQuery.toLowerCase()
      return (
        player.Name.toLowerCase().includes(searchTerm) ||
        player.Position.toLowerCase().includes(searchTerm)
      )
    })
  })).filter(group => group.players.length > 0)

  if (loading) {
    return <div>Loading...</div>
  }

  // Position labels mapping
  const positionLabels = {
    GK: 'Goalkeepers',
    DEF: 'Defenders',
    MID: 'Midfielders',
    ATT: 'Attackers'
  }

  return (
    <>
      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGroups.flatMap(group => group.players).map(player => (
          <div key={player.ID} className="group">
            <div className="bg-black/20 rounded-2xl shadow-lg shadow-black/[0.03] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="relative h-[400px] w-full">
                <img
                  src={player.BildURL}
                  alt={player.Name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                  <div>
                    {(() => {
                      const nameParts = player.Name.split(' ')
                      const lastName = nameParts.pop() // Get the last name
                      const firstNames = nameParts.join(' ') // Join all other parts as first names
                      return (
                        <>
                          <h3 className="text-2xl font-bold text-white leading-tight">{firstNames}</h3>
                          <h3 className="text-2xl font-bold text-white/90">{lastName}</h3>
                        </>
                      )
                    })()}
                  </div>
                  <span className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs font-bold text-red-400">
                    {player.Position}
                  </span>
                </div>
                <div className="absolute bottom-6 inset-x-0 px-6">
                  <div className="flex justify-between items-center bg-black/40 backdrop-blur-md rounded-xl p-3">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{player.Gesamt_Total_S}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Games</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10" />

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{player.Gesamt_Total_T}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Goals</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10" />

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{player.Gesamt_Total_A}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Assists</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile List View with Position Groups */}
      <div className="md:hidden space-y-6">
      {/* eslint-disable-next-line */}
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.position}>
            {/* Position Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
              <span className="text-sm font-semibold text-red-400">
                {positionLabels[group.position as keyof typeof positionLabels]}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            </div>

            {/* Players in this position group */}
            <div className="space-y-3">
              {group.players.map(player => (
                <motion.div
                  key={player.ID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-3 bg-black/20 rounded-xl backdrop-blur-sm"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img
                      src={player.BildURL}
                      alt={player.Name}
                      className="w-full h-full object-cover object-top rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white truncate">
                        {player.Name}
                      </h3>
                      <span className="px-2 py-1 bg-black/40 rounded-md text-xs font-bold text-red-400 flex-shrink-0">
                        {player.Position}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{player.Gesamt_Total_S}</span>
                        <span className="text-xs text-gray-400">Games</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{player.Gesamt_Total_T}</span>
                        <span className="text-xs text-gray-400">Goals</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{player.Gesamt_Total_A}</span>
                        <span className="text-xs text-gray-400">Assists</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}