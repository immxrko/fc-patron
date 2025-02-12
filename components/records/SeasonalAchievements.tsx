'use client'

import { motion } from 'framer-motion'
import { Trophy, Award, Crown, Shield } from 'lucide-react'

export default function SeasonalAchievements() {
  const bestSeasons = [
    { season: "2024/25", position: 1, points: 68, wins: 22, draws: 2, losses: 2 },
    { season: "2023/24", position: 2, points: 65, wins: 20, draws: 5, losses: 3 },
    { season: "2022/23", position: 3, points: 62, wins: 19, draws: 5, losses: 4 }
  ]

  const achievements = [
    { icon: Trophy, label: "League Titles", count: 2, seasons: ["2024/25", "2023/24"] },
    { icon: Shield, label: "Cup Victories", count: 1, seasons: ["2023/24"] },
    { icon: Crown, label: "Unbeaten Runs", count: 15, description: "Longest streak (2024/25)" },
    { icon: Award, label: "Clean Sheets", count: 18, description: "Most in a season (2024/25)" }
  ]

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">Season Records</h2>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.label}
            className="p-4 bg-black/30 rounded-xl border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <achievement.icon className="w-5 h-5 text-red-400 mb-2" />
            <div className="text-2xl font-bold text-white mb-1">{achievement.count}</div>
            <div className="text-xs text-gray-400">{achievement.label}</div>
            <div className="text-xs text-red-400 mt-2">
              {achievement.seasons ? achievement.seasons.join(', ') : achievement.description}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Best Seasons */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Best Seasons</h3>
        {bestSeasons.map((season, index) => (
          <motion.div
            key={season.season}
            className="p-4 bg-black/30 rounded-xl border border-white/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">{season.season}</span>
              <div className="px-2 py-1 bg-red-500/10 rounded-full">
                <span className="text-xs font-medium text-red-400">
                  Position {season.position}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xl font-bold text-white">{season.points}</div>
                <div className="text-xs text-gray-400">Points</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">{season.wins}</div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-400">{season.draws}</div>
                <div className="text-xs text-gray-400">Draws</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-400">{season.losses}</div>
                <div className="text-xs text-gray-400">Losses</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 