'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TopScorer {
  name: string
  goals: number
  matches: number
  image: string
}

interface GoalCount {
  playerid: number
  count: number
}

export default function PlayerRecords() {
  const [topScorers, setTopScorers] = useState<TopScorer[]>([])
  const [topTrainers, setTopTrainers] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    fetchTopScorers()
    fetchTopAttenders()
    fetchMostGoalsInGame()
    fetchMostAssists()
    fetchHattricks()
  }, [])

  const fetchTopScorers = async () => {
    try {
      // First get top 3 scorers
      const topScorers = []
      let excludeIds = []
      
      for (let i = 0; i < 3; i++) {
        const { data: goalData, error: goalError } = await supabase
          .from('player_goals')
          .select('playerid, count')
          .not('playerid', 'in', `(${excludeIds.join(',')})`)
          .order('count', { ascending: false })
          .limit(1) as { data: GoalCount[] | null, error: any }
        
        if (goalError) throw goalError
        if (goalData && goalData[0]) {
          topScorers.push(goalData[0])
          excludeIds.push(goalData[0].playerid)
        }
      }

      if (topScorers.length > 0) {
        // Then fetch player details
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('ID, Name, BildURL')
          .in('ID', topScorers.map(g => g.playerid))

        if (playerError) throw playerError

        // Get appearances data from the view
        const { data: appearanceData } = await supabase
          .from('player_appearances')
          .select('*')
          .eq('km_res', 'KM')
          .in('playerid', topScorers.map(g => g.playerid))

        if (playerData) {
          const scorers = topScorers.map((goal) => {
            const appearances = appearanceData?.find(a => a.playerid === goal.playerid)
            const totalGames = appearances ? 
              parseInt(appearances['2021/22'] || '0') + 
              parseInt(appearances['2022/23'] || '0') + 
              parseInt(appearances['2023/24'] || '0') + 
              parseInt(appearances['2024/25'] || '0') : 0

            return {
              name: playerData.find(p => p.ID === goal.playerid)?.Name || 'Unknown',
              goals: goal.count,
              matches: totalGames,
              image: playerData.find(p => p.ID === goal.playerid)?.BildURL || '/default-player.png'
            }
          })

          setTopScorers(scorers)
        }
      }
    } catch (error: any) {
      console.error('Error fetching top scorers:', error.message || error)
    }
  }

  const fetchTopAttenders = async () => {
    // First get total number of practices where attendance was set
    const { data: practicesData } = await supabase
      .from('practices')
      .select('count')
      .eq('AttendanceSet', true)
      .single()

    const totalPractices = practicesData?.count || 0

    // Then get attendance data
    const { data } = await supabase
      .from('practice_attendance')
      .select(`
        PlayerID,
        Present,
        players (Name, BildURL)
      `)
      .eq('Present', true)

    if (!data) return []

    // Count attendances per player
    const attendanceCounts = data.reduce((acc: any, curr: any) => {
      const playerId = curr.PlayerID
      acc[playerId] = {
        count: (acc[playerId]?.count || 0) + 1,
        name: curr.players.Name,
        image: curr.players.BildURL
      }
      return acc
    }, {})

    // Convert to array and sort by count
    const topAttenders = Object.entries(attendanceCounts)
      .map(([id, info]: [string, any]) => ({
        name: info.name,
        attended: info.count,
        total: totalPractices,
        image: info.image
      }))
      .sort((a, b) => b.attended - a.attended)
      .slice(0, 3)

    setTopTrainers(topAttenders)
  }

  const fetchMostGoalsInGame = async () => {
    const { data, error } = await supabase
      .from('player_match_goals')
      .select('*')
      .order('goals', { ascending: false })
      .limit(1)

    if (error) throw error
    if (!data || !data[0]) return null

    return {
      label: "Most Goals in a Game",
      value: data[0].goals.toString(),
      holder: data[0].player_name,
      date: `vs ${data[0].opponent}, ${new Date(data[0].match_date).toLocaleDateString('de-DE')}`
    }
  }

  const fetchMostAssists = async () => {
    const { data, error } = await supabase
      .from('player_assists')
      .select('*')
      .order('assists', { ascending: false })
      .limit(1)

    if (error) throw error
    if (!data || !data[0]) return null

    return {
      label: "Most Assists",
      value: data[0].assists.toString(),
      holder: data[0].player_name,
      date: "All-time"
    }
  }

  const fetchHattricks = async () => {
    const { data, error } = await supabase
      .from('player_hattricks')
      .select('*')
      .order('hattricks', { ascending: false })
      .limit(1)

    if (error) throw error
    if (!data || !data[0]) return null

    return {
      label: "Most Hat-tricks",
      value: data[0].hattricks.toString(),
      holder: data[0].player_name,
      date: "All-time"
    }
  }

  useEffect(() => {
    const loadRecords = async () => {
      const mostGoals = await fetchMostGoalsInGame()
      const mostHattricks = await fetchHattricks()
      const mostAssists = await fetchMostAssists()
      if (mostGoals) {
        setRecords([
          mostGoals,
          mostHattricks,
          mostAssists
        ])
      }
    }
    loadRecords()
  }, [])

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">Player Records</h2>
      </div>

      {/* Top Scorers */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400">All-Time Top Scorers</h3>
        {topScorers.map((scorer, index) => (
          <motion.div
            key={scorer.name}
            className="flex items-center gap-4 p-3 bg-black/30 rounded-xl border border-white/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-12 h-12">
              <img
                src={scorer.image}
                alt={scorer.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {index + 1}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{scorer.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-red-400">{scorer.goals} Goals</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="text-xs text-gray-400">{scorer.matches} Games</span> 
              </div>
            </div>
            <div className="hidden md:block text-lg font-bold text-white">
              {(scorer.goals /scorer.matches).toFixed(2)}
              <span className="text-xs text-gray-400 ml-1">Goals per Game</span>
            </div> 
          </motion.div>
        ))}
      </div>

      {/* Training Attendance */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400">Training Attendance Leaders</h3>
        {topTrainers.map((trainer, index) => (
          <motion.div
            key={trainer.name}
            className="flex items-center gap-4 p-3 bg-black/30 rounded-xl border border-white/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-12 h-12">
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {index + 1}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{trainer.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-green-400">{trainer.attended} Sessions</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="text-xs text-gray-400">{trainer.total} Total</span>
              </div>
            </div>
            <div className="text-lg font-bold text-white">
              {((trainer.attended / trainer.total) * 100).toFixed(0)}
              <span className="text-xs text-gray-400 ml-1">%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Individual Records */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Individual Records</h3>
        {records.map((record, index) => (
          <motion.div
            key={record.label}
            className="p-4 bg-black/30 rounded-xl border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-400">{record.label}</span>
              <span className="text-xl font-bold text-white">{record.value}</span>
            </div>
            <div className="text-xs text-gray-400">
              {record.holder} • {record.date}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 