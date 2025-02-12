'use client'

import { motion } from 'framer-motion'
import { Trophy, Target, Percent, Flame } from 'lucide-react'

export default function TeamStats() {
  const stats = {
    totalWins: 156,
    winPercentage: 72.3,
    cleanSheets: 48,
    currentStreak: 12,
    goalsScored: 423,
    goalsConceded: 142
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
            {[65, 70, 75, 72, 78].map((percentage, index) => (
              <motion.div
                key={index}
                className="flex-1 bg-gradient-to-t from-red-500/20 to-red-400/20 rounded-t-lg relative group"
                initial={{ height: 0 }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute inset-x-0 -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                  <span className="text-xs font-medium text-white">{percentage}%</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['20/21', '21/22', '22/23', '23/24', '24/25'].map((season) => (
              <span key={season} className="text-xs text-gray-400">{season}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 