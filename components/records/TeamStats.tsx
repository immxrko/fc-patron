'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Target, Percent, Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SeasonWinRate {
  seasonId: number
  seasonName: string
  winPercentage: number
}

export default function TeamStats() {
  const [stats, setStats] = useState({
    totalWins: 0,
    winPercentage: 0,
    cleanSheets: 0,
    currentStreak: 0,
    goalsScored: 0,
    goalsConceded: 0
  })
  const [seasonWinRates, setSeasonWinRates] = useState<SeasonWinRate[]>([])

  useEffect(() => {
    fetchStats()
  }, [])

  const getSeasonName = (seasonId: number): string => {
    switch (seasonId) {
      case 1: return '21/22'
      case 2: return '22/23'
      case 3: return '23/24'
      case 4: return '24/25'
      default: return ''
    }
  }

  const fetchStats = async () => {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('km_res', 'KM')
        .not('result', 'is', null)
        .order('date', { ascending: false })

      if (error) throw error

      if (matches && matches.length > 0) {
        // Calculate total wins
        const wins = matches.filter(match => {
          const [ourGoals, theirGoals] = match.result.split(':').map(Number)
          return ourGoals > theirGoals
        }).length

        // Calculate win percentage
        const winPercentage = ((wins / matches.length) * 100).toFixed(1)

        // Calculate clean sheets
        const cleanSheets = matches.filter(match => {
          const [_, theirGoals] = match.result.split(':').map(Number)
          return theirGoals === 0
        }).length

        // Calculate current streak
        let streak = 0
        for (const match of matches) {
          const [ourGoals, theirGoals] = match.result.split(':').map(Number)
          if (ourGoals > theirGoals) {
            streak++
          } else {
            break
          }
        }

        // Calculate total goals
        const { goalsScored, goalsConceded } = matches.reduce((acc, match) => {
          const [ourGoals, theirGoals] = match.result.split(':').map(Number)
          return {
            goalsScored: acc.goalsScored + ourGoals,
            goalsConceded: acc.goalsConceded + theirGoals
          }
        }, { goalsScored: 0, goalsConceded: 0 })

        // Calculate win rates by season
        const seasonMatches = matches.reduce((acc, match) => {
          if (!acc[match.seasonid]) {
            acc[match.seasonid] = {
              total: 0,
              wins: 0
            }
          }
          acc[match.seasonid].total++
          
          // Parse result string to determine win
          const [ourGoals, theirGoals] = match.result.split(':').map(Number)
          if (ourGoals > theirGoals) {
            acc[match.seasonid].wins++
          }
          
          return acc
        }, {} as Record<number, { total: number; wins: number }>)


        const winRates: SeasonWinRate[] = Object.entries(seasonMatches).map(([seasonId, data]) => ({
          seasonId: parseInt(seasonId),
          seasonName: getSeasonName(parseInt(seasonId)),
          winPercentage: parseFloat(((data as { total: number; wins: number }).wins / 
                                    (data as { total: number; wins: number }).total * 100).toFixed(1))
        })).sort((a, b) => a.seasonId - b.seasonId)


        setSeasonWinRates(winRates)

        setStats({
          totalWins: wins,
          winPercentage: parseFloat(winPercentage),
          cleanSheets,
          currentStreak: streak,
          goalsScored,
          goalsConceded
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">Team Statistics</h2>
      </div>

      <div className="space-y-6">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Trophy, label: 'Total Wins', value: stats.totalWins },
            { icon: Percent, label: 'Win Rate', value: `${stats.winPercentage}%` },
            { icon: Target, label: 'Clean Sheets', value: stats.cleanSheets },
            { icon: Flame, label: 'Win Streak', value: stats.currentStreak },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center justify-center p-4 bg-black/30 rounded-xl border border-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <stat.icon className="w-5 h-5 text-red-400 mb-2" />
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-xs text-gray-400 mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Goals Stats */}
        <div className="bg-black/30 rounded-xl border border-white/5 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Goals Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Goals Scored</span>
                <span className="text-white font-bold">{stats.goalsScored}</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Goals Conceded</span>
                <span className="text-white font-bold">{stats.goalsConceded}</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Win Percentage Chart */}
        <div className="bg-black/30 rounded-xl border border-white/5 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Win Rate by Season</h3>
          <div className="h-32 flex items-end gap-2">
            {seasonWinRates.map((season, index) => (
              <motion.div
                key={season.seasonId}
                className="flex-1 bg-gradient-to-t from-red-500/20 to-red-400/20 rounded-t-lg relative group"
                initial={{ height: 0 }}
                animate={{ height: `${season.winPercentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute inset-x-0 -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                  <span className="text-xs font-medium text-white">{season.winPercentage}%</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {seasonWinRates.map((season) => (
              <span key={season.seasonId} className="text-xs text-gray-400">
                {season.seasonName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 