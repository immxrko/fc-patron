'use client'

import { motion } from 'framer-motion'
import { Swords, TrendingUp, History } from 'lucide-react'

interface HeadToHeadProps {
  opponent: string | null;
}

export default function HeadToHead({ opponent }: HeadToHeadProps) {
  // This would come from your database in a real implementation
  const h2hStats = {
    lastGames: [
      { result: 'W', score: '3-1', date: '12.03.24' },
      { result: 'W', score: '2-0', date: '15.10.23' },
      { result: 'L', score: '1-2', date: '23.05.23' },
      { result: 'W', score: '4-1', date: '08.04.23' },
      { result: 'D', score: '2-2', date: '11.03.23' },
    ],
    stats: {
      wins: 12,
      draws: 3,
      losses: 2,
      goalsFor: 38,
      goalsAgainst: 15,
    },
    form: {
      home: 'WWWDW',
      away: 'WWLWD',
    }
  }

  // Add top scorer data
  const topScorer = {
    name: "Josip MATIJEVIC",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png",
    stats: {
      goals: 5,
      assists: 2,
      matches: 4
    }
  }

  return (
    <motion.div 
      className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col pb-24 md:pb-6"
      layout
    >
      <div className="flex items-center gap-3 mb-6">
        <Swords className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">
          {opponent ? `Head to Head vs ${opponent}` : 'Head to Head'}
        </h2>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-between">
        {/* Top Scorer Widget */}
        <div className="space-y-6">
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
                <h3 className="text-lg font-bold text-white mb-1">Top Scorer vs {opponent}</h3>
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

          {/* Overall Record */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-2xl font-bold text-green-400">{h2hStats.stats.wins}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Wins</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-2xl font-bold text-gray-400">{h2hStats.stats.draws}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Draws</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-2xl font-bold text-red-400">{h2hStats.stats.losses}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Losses</span>
            </div>
          </div>

          {/* Goals Stats */}
          <div className="bg-black/30 rounded-xl border border-white/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Goals Scored</span>
              <span className="text-white font-bold">{h2hStats.stats.goalsFor}</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Goals Conceded</span>
              <span className="text-white font-bold">{h2hStats.stats.goalsAgainst}</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '28%' }}
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
              {h2hStats.lastGames.map((game, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
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
                </motion.div>
              ))}
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
                {h2hStats.form.home.split('').map((result, i) => (
                  <div
                    key={i}
                    className={`
                      w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                      ${result === 'W' ? 'bg-green-500/20 text-green-400' : 
                        result === 'L' ? 'bg-red-500/20 text-red-400' : 
                        'bg-gray-500/20 text-gray-400'}
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
                {h2hStats.form.away.split('').map((result, i) => (
                  <div
                    key={i}
                    className={`
                      w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                      ${result === 'W' ? 'bg-green-500/20 text-green-400' : 
                        result === 'L' ? 'bg-red-500/20 text-red-400' : 
                        'bg-gray-500/20 text-gray-400'}
                    `}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
} 