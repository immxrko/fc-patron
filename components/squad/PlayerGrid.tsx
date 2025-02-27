'use client'

import { useEffect, useState, useMemo } from 'react'
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

  // Wrap seasonToPrefix in useMemo
  const seasonToPrefix = useMemo(() => ({
    '2021/22': '21',
    '2022/23': '22',
    '2023/24': '23',
    '2024/25': '24'
  }), [])  // Empty dependency array since this object never changes

  // Add this helper function at the top of the component
  const getLastName = (fullName: string) => {
    // Find the word that's in all caps
    const nameParts = fullName.split(' ')
    const capsName = nameParts.find(part => part === part.toUpperCase())
    return capsName || nameParts.pop() || ''
  }

  useEffect(() => {
    async function fetchPlayers() {
      console.log('Fetching players for:', {
        team: selectedTeam,
        season: selectedSeason
      });

      const { data: squadData, error } = await supabase
        .from('squad_details_view')
        .select('*')
        .eq('km_res', selectedTeam === 'first-team' ? 'KM' : 'RES');

      if (error) {
        console.error('Error fetching squad data:', error);
        return;
      }

      console.log('Raw squad data:', squadData);

      // Process the data
      const processedData = squadData?.reduce((acc: any[], player) => {
        console.log('Processing player:', player);
        
        const existingPlayer = acc.find(p => p.ID === player.playerid);
        
        if (existingPlayer) {
          console.log('Updating existing player:', existingPlayer);
          if (selectedSeason === 'All Seasons') {
            existingPlayer.games += parseInt(player.games);
            existingPlayer.goals += parseInt(player.goals);
            existingPlayer.assists += parseInt(player.assists);
          } else if (player.seasonname === selectedSeason) {
            existingPlayer.games = parseInt(player.games);
            existingPlayer.goals = parseInt(player.goals);
            existingPlayer.assists = parseInt(player.assists);
          }
        } else {
          const newPlayer = {
            ID: player.playerid,
            Name: player.playername,
            Position: player.playerposition,
            BildURL: player.playerbildurl,
            games: selectedSeason === 'All Seasons' || player.seasonname === selectedSeason ? parseInt(player.games) : 0,
            goals: selectedSeason === 'All Seasons' || player.seasonname === selectedSeason ? parseInt(player.goals) : 0,
            assists: selectedSeason === 'All Seasons' || player.seasonname === selectedSeason ? parseInt(player.assists) : 0
          };
          console.log('Adding new player:', newPlayer);
          acc.push(newPlayer);
        }
        return acc;
      }, []);

      console.log('Final processed data:', processedData);
      setPlayers(processedData || []);
      setLoading(false);
    }

    fetchPlayers();
  }, [selectedTeam, selectedSeason]);

  // Update the filtering logic
  const activePlayers = players.filter(player => {
    const hasGames = player.games > 0;
    const matchesSearchQuery = player.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              player.Position.toLowerCase().includes(searchQuery.toLowerCase());
    return hasGames && matchesSearchQuery;
  });

  // Update the grouping and sorting logic
  const positionOrder = ['GK', 'DEF', 'MID', 'ATT'];
  const groupedPlayers = positionOrder.map(pos => ({
    position: pos,
    players: activePlayers
      .filter(p => p.Position === pos)
      .sort((a, b) => {
        // First sort by games (descending)
        if (b.games !== a.games) {
          return b.games - a.games;
        }
        // If games are equal, sort by last name
        return getLastName(a.Name).localeCompare(getLastName(b.Name));
      })
  })).filter(group => group.players.length > 0);

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-red-500/20"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-red-400 border-t-transparent animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-l-red-400/30 animate-pulse"></div>
        </div>
      </div>
    )
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
      {/* Desktop & Mobile List View */}
      <div className="space-y-6 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
        {/* GK and DEF Column */}
        <div className="space-y-6">
          {filteredGroups
            .filter(group => ['GK', 'DEF'].includes(group.position))
            .map((group) => (
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
                          src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                          alt={player.Name}
                          className="w-full h-full object-cover object-top rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                          }}
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
                            <span className="text-sm font-semibold text-white">{player.games}</span>
                            <span className="text-xs text-gray-400">Games</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10" />
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-white">{player.goals}</span>
                            <span className="text-xs text-gray-400">Goals</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10" />
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-white">{player.assists}</span>
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

        {/* MID Column */}
        <div className="space-y-6">
          {filteredGroups
            .filter(group => group.position === 'MID')
            .map((group) => (
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
                          src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                          alt={player.Name}
                          className="w-full h-full object-cover object-top rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                          }}
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
                            <span className="text-sm font-semibold text-white">{player.games}</span>
                            <span className="text-xs text-gray-400">Games</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10" />
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-white">{player.goals}</span>
                            <span className="text-xs text-gray-400">Goals</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10" />
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-white">{player.assists}</span>
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

        {/* ATT Column */}
        <div className="space-y-6">
          {filteredGroups
            .filter(group => group.position === 'ATT')
            .map((group) => (
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
                          src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                          alt={player.Name}
                          className="w-full h-full object-cover object-top rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                          }}
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
                            <span className="text-sm font-semibold text-white">{player.games}</span>
                            <span className="text-xs text-gray-400">Games</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10" />
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-white">{player.goals}</span>
                            <span className="text-xs text-gray-400">Goals</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10" />
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-white">{player.assists}</span>
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
      </div>
    </>
  )
} 