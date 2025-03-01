'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Trophy, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/types/database'
import EditGame from './EditGame'

interface ManageGamesProps {
  onBack: () => void
  players: Player[]
}

interface Season {
  name: string
}

interface MatchDetail {
  matchid: number
  opponent_name: string
  logourl: string
  result: string | null
  ishomegame: boolean
  season_name: string
  km_res: string | null
  date: string
  matchday: number | null
  matchtype: string
  lineupadded: boolean
}

export default function ManageGames({ onBack, players }: ManageGamesProps) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('All Seasons')
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false)
  const [matches, setMatches] = useState<MatchDetail[]>([])
  const [showNotPlayed, setShowNotPlayed] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null)
  const [needsRefetch, setNeedsRefetch] = useState(false)
  
  // Add cache ref to store fetched matches
  const matchesCache = useRef<{
    [key: string]: MatchDetail[]
  }>({})

  useEffect(() => {
    fetchSeasons()
  }, [])

  useEffect(() => {
    if (needsRefetch || selectedSeason || showNotPlayed) {
      console.log('Refetch triggered by:', {
        needsRefetch,
        selectedSeason,
        showNotPlayed,
        timestamp: new Date().toISOString()
      });
      fetchMatches()
      setNeedsRefetch(false)
    }
  }, [selectedSeason, showNotPlayed, needsRefetch])

  const fetchSeasons = async () => {
    const { data, error } = await supabase
      .from('seasons')
      .select('name')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching seasons:', error)
      return
    }

    if (data) {
      setSeasons(data)
      // Set the newest season (first one) as default
      if (data.length > 0) {
        setSelectedSeason(data[0].name)
      }
    }
  }

  // Helper function to check if current season is the newest
  const isNewestSeason = () => {
    return seasons.length > 0 && selectedSeason === seasons[0].name
  }

  const fetchMatches = async () => {
    try {
      console.log('Fetching matches for:', {
        season: selectedSeason,
        showNotPlayed,
        timestamp: new Date().toISOString()
      });

      // Check if we have cached data for this season
      const cacheKey = `${selectedSeason}-${showNotPlayed}`
      if (matchesCache.current[cacheKey]) {
        setMatches(matchesCache.current[cacheKey])
        return
      }

      let query = supabase
        .from('match_details')
        .select('*')

      if (selectedSeason !== 'All Seasons') {
        query = query.eq('season_name', selectedSeason)
      }

      const { data, error } = await query.order('matchid', { 
        ascending: showNotPlayed
      })

      if (error) throw error
      
      if (data) {
        console.log('Matches fetched successfully:', {
          count: data.length,
          timestamp: new Date().toISOString()
        });
        // Store in cache with combined key
        matchesCache.current[cacheKey] = data
        setMatches(data)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    }
  }

  // Function to clear cache when needed
  const clearMatchesCache = () => {
    matchesCache.current = {}
  }

  const filteredMatches = matches.filter(match => {
    if (showNotPlayed) {
      // Show only matches that haven't been played yet (result is null)
      // and are in the future
      return match.result === null && new Date(match.date) >= new Date()
    }

    // Default view: show played matches AND past matches with null results
    return match.result !== null || 
           (match.result === null && new Date(match.date) < new Date())
  })

  // Sort only if showing not played matches
  const sortedMatches = showNotPlayed 
    ? [...filteredMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : filteredMatches

  // Modify the groupMatchesByDate function to handle different sorting orders
  const groupMatchesByDate = (matches: MatchDetail[]) => {
    const groups = matches.reduce((groups: { [key: string]: MatchDetail[] }, match) => {
      const date = new Date(match.date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(match)
      return groups
    }, {})

    // Sort matches within each date group (KM before RES)
    Object.values(groups).forEach(matches => {
      matches.sort((a, b) => {
        if (a.km_res === b.km_res) return 0
        return a.km_res === 'KM' ? -1 : 1
      })
    })

    return Object.entries(groups)
  }

  const getResultIndicator = (match: MatchDetail) => {
    if (!match.result) return null;
    
    // Result is always stored from FC Patron's perspective
    const [patronScore, opponentScore] = match.result.split(':').map(Number);
    
    if (patronScore > opponentScore) {
      return (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-500" />
      );
    } else if (patronScore < opponentScore) {
      return (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500" />
      );
    } else {
      return (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500" />
      );
    }
  };

  // Add this helper function inside the ManageGames component
  const isPastGame = (date: string) => {
    const gameDate = new Date(date)
    gameDate.setHours(0o0, 0o0, 0o0) // End of the game day
    return gameDate < new Date()
  }

  return (
    <AnimatePresence mode="wait">
      {selectedMatch ? (
        <motion.div
          key="edit-game"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-black/95 z-50"
        >
          <EditGame 
            match={selectedMatch}
            onBack={() => {
              setSelectedMatch(null)
              clearMatchesCache() // Clear cache when returning
              setNeedsRefetch(true) // Trigger refetch when returning
            }}
            players={players}
            onUpdate={() => {
              clearMatchesCache() // Clear cache on updates
              setNeedsRefetch(true) // Also trigger refetch on updates
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="games-list"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6 h-full flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={onBack}
                className="px-4 py-2 bg-black/20 hover:bg-black/40 
                  rounded-xl text-gray-400 text-sm font-medium transition-colors 
                  flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </motion.button>
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-bold text-white">Manage Games</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Only show the button for the newest season */}
              {isNewestSeason() && (
                <motion.button
                  onClick={() => setShowNotPlayed(!showNotPlayed)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors 
                    flex items-center gap-2 ${
                      showNotPlayed 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                        : 'bg-black/20 text-gray-400 hover:bg-black/40'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showNotPlayed ? 'Hide Not Played' : 'Show Not Played'}
                </motion.button>
              )}

              {/* Season Filter - without All Seasons option */}
              <div className="relative">
                <motion.button
                  onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                  className="px-4 py-2 bg-black/20 hover:bg-black/40 
                    rounded-xl text-gray-400 text-sm font-medium transition-colors 
                    flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedSeason}
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 
                      ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </motion.button>

                {isSeasonDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 py-1 
                    bg-black/60 backdrop-blur-md rounded-lg border border-white/10 
                    shadow-xl z-10"
                  >
                    {seasons.map((season) => (
                      <button
                        key={season.name}
                        onClick={() => {
                          setSelectedSeason(season.name)
                          setIsSeasonDropdownOpen(false)
                          setNeedsRefetch(true)
                          if (!isNewestSeason()) {
                            setShowNotPlayed(false)
                          }
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors
                          ${selectedSeason === season.name 
                            ? 'text-red-400 bg-white/5' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {season.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Matches Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6 pb-6">
              {groupMatchesByDate(sortedMatches).map(([date, matches]) => (
                <div key={date} className="flex gap-6">
                  <div className="w-32 py-4 flex-shrink-0">
                    <h3 className="text-white font-medium sticky top-4">{date}</h3>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matches.map((match) => (
                        <motion.div
                          key={match.matchid}
                          className="relative cursor-pointer"
                          onClick={() => setSelectedMatch(match)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={match.logourl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp9NXVuzcO7ncREpZSmAozghK0DghB8_G2Fw&s'} 
                                  alt={match.opponent_name}
                                  className="w-8 h-8 rounded-lg object-cover bg-black/20"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp9NXVuzcO7ncREpZSmAozghK0DghB8_G2Fw&s';
                                  }}
                                />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">{match.opponent_name}</span>
                                    {match.km_res === 'RES' && (
                                      <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 
                                        text-xs font-medium rounded-md">
                                        U23
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{match.matchtype}</span>
                                    {match.matchday && (
                                      <span>• Round {match.matchday}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-400">{match.season_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                {match.ishomegame ? 'Home' : 'Away'}
                              </span>
                              <span className={`text-sm font-medium ${
                                match.result === 'W' ? 'text-green-400' :
                                match.result === 'L' ? 'text-red-400' :
                                match.result === 'D' ? 'text-gray-400' :
                                'text-gray-600'
                              }`}>
                                {match.result || 'Not Played'}
                              </span>
                            </div>
                          </div>
                          {!match.lineupadded && match.result !== null && (
                            <div className="absolute -bottom-2 left-0 right-0 mx-auto w-fit px-3 py-1 
                              bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
                              Lineup Missing
                            </div>
                          )}
                          {match.result === null && isPastGame(match.date) && (
                            <div className="absolute -bottom-2 left-0 right-0 mx-auto w-fit px-3 py-1 
                              bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/20">
                              Missing Result
                            </div>
                          )}
                          {getResultIndicator(match)}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 