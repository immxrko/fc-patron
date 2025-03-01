'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Swords, TrendingUp, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface HeadToHeadProps {
  opponent?: {
    id: number
    name: string
    logourl: string
  }
}

interface H2HStats {
  lastGames: Array<{
    result: 'W' | 'L' | 'D'
    score: string
    date: string
  }>
  stats: {
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
  }
  form: {
    home: string
    away: string
  }
}

interface TopScorer {
  name: string
  image: string
  stats: {
    goals: number
    matches: number
  }
}

export default function HeadToHead({ opponent }: HeadToHeadProps) {
  const [stats, setStats] = useState<H2HStats | null>(null)
  const [topScorer, setTopScorer] = useState<TopScorer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (opponent?.id) {
      setLoading(true)
      fetchHeadToHead(opponent.id)
    } else {
      setStats(null)
      setLoading(false)
    }
  }, [opponent])

  const fetchTopScorer = async (opponentId: number, matchIds: number[]) => {
    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('playerid, matchid')
        .in('matchid', matchIds)

      if (goalsError) throw goalsError

      if (!goalsData || goalsData.length === 0) return null

      const goalsByPlayer = goalsData.reduce((acc: {[key: number]: number}, goal) => {
        acc[goal.playerid] = (acc[goal.playerid] || 0) + 1
        return acc
      }, {})

      const topScorerId = Object.entries(goalsByPlayer)
        .sort(([,a], [,b]) => b - a)[0]?.[0]

      if (!topScorerId) return null

      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('Name, BildURL')
        .eq('ID', topScorerId)
        .single()

      if (playerError) throw playerError

      const matchesScored = new Set(
        goalsData
          .filter(g => g.playerid === Number(topScorerId))
          .map(g => g.matchid)
      ).size

      return {
        name: playerData.Name,
        image: playerData.BildURL,
        stats: {
          goals: goalsByPlayer[Number(topScorerId)],
          matches: matchesScored
        }
      }
    } catch (error) {
      console.error('Error fetching top scorer:', error)
      return null
    }
  }

  const fetchHeadToHead = async (opponentId: number) => {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('id, result, ishomegame, date')
        .eq('opponentid', opponentId)
        .eq('km_res', 'KM')
        .not('result', 'is', null)
        .order('date', { ascending: false })

      if (error) throw error

      const topScorer = await fetchTopScorer(opponentId, matches.map(m => m.id))
      setTopScorer(topScorer)

      let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0
      let homeForm = '', awayForm = ''
      const lastGames: Array<{result: 'W' | 'L' | 'D', score: string, date: string}> = []

      matches.forEach(match => {
        const [ourGoals, theirGoals] = match.result.split(':').map(Number)
        goalsFor += ourGoals
        goalsAgainst += theirGoals

        let result: 'W' | 'L' | 'D'
        if (ourGoals > theirGoals) {
          result = 'W'
          wins++
        } else if (ourGoals < theirGoals) {
          result = 'L'
          losses++
        } else {
          result = 'D'
          draws++
        }

        if (match.ishomegame && homeForm.length < 5) homeForm += result
        if (!match.ishomegame && awayForm.length < 5) awayForm += result

        if (lastGames.length < 5) {
          lastGames.push({
            result,
            score: match.result,
            date: new Date(match.date).toLocaleDateString('de-DE', { 
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })
          })
        }
      })

      setStats({
        lastGames,
        stats: {
          wins,
          draws,
          losses,
          goalsFor,
          goalsAgainst
        },
        form: {
          home: homeForm.padEnd(5, '-'),
          away: awayForm.padEnd(5, '-')
        }
      })
    } catch (error) {
      console.error('Error fetching head to head:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!opponent || loading) return null;

  return (
    <motion.div 
      className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col pb-24 md:pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Swords className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">
          vs. {opponent.name}
        </h2>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-between">
        {/* Top Scorer Widget (Sample Data) */}
        <div className="space-y-6">
          {topScorer ? (
            <motion.div 
              className="bg-black/30 rounded-xl border border-white/5 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <img
                    src={topScorer.image}
                    alt={topScorer.name}
                    className="w-full h-full object-cover object-top rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Top Scorer</h3>
                  <p className="text-sm text-gray-400">{topScorer.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-white">{topScorer.stats.goals}</span>
                      <span className="text-xs text-gray-400">Goals</span>
                    </div>
                    <div className="w-[1px] h-3 bg-white/10" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-white">{topScorer.stats.matches}</span>
                      <span className="text-xs text-gray-400">Games</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="bg-black/30 rounded-xl border border-white/5 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center text-sm text-gray-400">
                No goals scored yet
              </div>
            </motion.div>
          )}

          {stats && (
            <>
              {/* Overall Record */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-2xl font-bold text-green-400">{stats.stats.wins}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Wins</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-2xl font-bold text-gray-400">{stats.stats.draws}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Draws</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-2xl font-bold text-red-400">{stats.stats.losses}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Losses</span>
                </div>
              </div>

              {/* Goals Stats */}
              <div className="bg-black/30 rounded-xl border border-white/5 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Goals Scored</span>
                  <span className="text-white font-bold">{stats.stats.goalsFor}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.stats.goalsFor / (stats.stats.goalsFor + stats.stats.goalsAgainst)) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Goals Conceded</span>
                  <span className="text-white font-bold">{stats.stats.goalsAgainst}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.stats.goalsAgainst / (stats.stats.goalsFor + stats.stats.goalsAgainst)) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  />
                </div>
              </div>

              {/* Last 5 Meetings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400">Last 5 Meetings</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array(5).fill(null).map((_, i) => {
                    const game = stats.lastGames[i]
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group"
                      >
                        {game ? (
                          <>
                            <div className={`
                              w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold
                              ${game.result === 'W' ? 'bg-green-500/20 text-green-400' : 
                                game.result === 'L' ? 'bg-red-500/20 text-red-400' : 
                                'bg-gray-500/20 text-gray-400'}
                            `}>
                              {game.result}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg">
                              <div className="text-center">
                                <div className="text-white font-bold">{game.score}</div>
                                <div className="text-xs text-gray-400">{game.date}</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold bg-black/40 text-gray-600">
                            -
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Form Guide */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-xl border border-white/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Home Form</span>
                  </div>
                  <div className="flex gap-1">
                    {stats.form.home.split('').map((result, i) => (
                      <div
                        key={i}
                        className={`
                          w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                          ${result === 'W' ? 'bg-green-500/20 text-green-400' : 
                            result === 'L' ? 'bg-red-500/20 text-red-400' : 
                            result === 'D' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-black/20 text-gray-600'}
                        `}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-black/30 rounded-xl border border-white/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Away Form</span>
                  </div>
                  <div className="flex gap-1">
                    {stats.form.away.split('').map((result, i) => (
                      <div
                        key={i}
                        className={`
                          w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                          ${result === 'W' ? 'bg-green-500/20 text-green-400' : 
                            result === 'L' ? 'bg-red-500/20 text-red-400' : 
                            result === 'D' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-black/20 text-gray-600'}
                        `}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
} 