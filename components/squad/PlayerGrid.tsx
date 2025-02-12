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
  KM_Res_Beides: string
  // eslint-disable-next-line
  [key: string]: any  // This allows for dynamic season-based stat fields
}

interface PlayerGridProps {
  searchQuery: string;
  selectedTeam: 'first-team' | 'u23';
  selectedSeason: string;
}

export default function PlayerGrid({ searchQuery, selectedTeam, selectedSeason }: PlayerGridProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  // Map season to column prefixes
  const seasonToPrefix = {
    '2021/22': '21',
    '2022/23': '22',
    '2023/24': '23',
    '2024/25': '24'
  }

  // Get stats based on season and team
  // eslint-disable-next-line
  const getPlayerStats = (player: any) => {
    if (selectedSeason === 'All Seasons') {
      if (selectedTeam === 'first-team') {
        return {
          games: player.Gesamt_Total_S || 0,
          goals: player.Gesamt_Total_T || 0,
          assists: player.Gesamt_Total_A || 0
        }
      } else {
        return {
          games: player.Reserve_Total_S || 0,
          goals: player.Reserve_Total_T || 0,
          assists: player.Reserve_Total_A || 0
        }
      }
    }

    const prefix = seasonToPrefix[selectedSeason as keyof typeof seasonToPrefix]
    if (selectedTeam === 'first-team') {
      return {
        games: player[`KM_${prefix}_S`] || 0,
        goals: player[`KM_${prefix}_T`] || 0,
        assists: player[`KM_${prefix}_A`] || 0
      }
    } else {
      return {
        games: player[`Reserve_${prefix}_S`] || 0,
        goals: player[`Reserve_${prefix}_T`] || 0,
        assists: player[`Reserve_${prefix}_A`] || 0
      }
    }
  }

  // Add this helper function at the top of the component
  const getLastName = (fullName: string) => {
    // Find the word that's in all caps
    const nameParts = fullName.split(' ')
    const capsName = nameParts.find(part => part === part.toUpperCase())
    return capsName || nameParts.pop() || ''
  }

  useEffect(() => {
    async function fetchPlayers() {
      const baseColumns = `
        "ID",
        "isActive",
        "Name",
        "Position",
        "BildURL",
        "KM_Res_Beides"
      `

      const totalColumns = `
        "Gesamt_Total_S",
        "Gesamt_Total_T",
        "Gesamt_Total_A",
        "Reserve_Total_S",
        "Reserve_Total_T",
        "Reserve_Total_A"
      `

      let columns = baseColumns
      if (selectedSeason === 'All Seasons') {
        columns += `, ${totalColumns}`
      } else {
        const prefix = seasonToPrefix[selectedSeason as keyof typeof seasonToPrefix]
        columns += `, 
          "KM_${prefix}_S",
          "KM_${prefix}_T",
          "KM_${prefix}_A",
          "Reserve_${prefix}_S",
          "Reserve_${prefix}_T",
          "Reserve_${prefix}_A"
        `
      }

      const { data, error } = await supabase
        .from('players')
        .select(columns)
         // eslint-disable-next-line
        .eq("isActive", true) as { data: Player[] | null, error: any }
    
      if (error) {
        console.error('Error fetching players:', error)
        return
      }

      const filteredData = data?.filter(player => {
        if (selectedTeam === 'first-team') {
          return player.KM_Res_Beides === 'KM' || player.KM_Res_Beides === 'BEIDES'
        } else {
          return player.KM_Res_Beides === 'RES' || player.KM_Res_Beides === 'BEIDES'
        }
      })

      setPlayers(filteredData || [])
      setLoading(false)
    }

    fetchPlayers()
  }, [selectedTeam, selectedSeason, seasonToPrefix])

  // Group and sort players by position
  const positionOrder = ['GK', 'DEF', 'MID', 'ATT']
  const groupedPlayers = positionOrder.map(pos => ({
    position: pos,
    players: players
      .filter(p => p.Position === pos)
      .sort((a, b) => getLastName(a.Name).localeCompare(getLastName(b.Name)))
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
                      <span className="text-2xl font-bold text-white">{getPlayerStats(player).games}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Games</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10" />

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{getPlayerStats(player).goals}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Goals</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10" />

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{getPlayerStats(player).assists}</span>
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
                        <span className="text-sm font-semibold text-white">{getPlayerStats(player).games}</span>
                        <span className="text-xs text-gray-400">Games</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{getPlayerStats(player).goals}</span>
                        <span className="text-xs text-gray-400">Goals</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{getPlayerStats(player).assists}</span>
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