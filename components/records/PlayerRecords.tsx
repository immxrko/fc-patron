'use client'

import { motion } from 'framer-motion'
import { Star} from 'lucide-react'

export default function PlayerRecords() {
  const topScorers = [
    { name: "Josip MATIJEVIC", goals: 78, matches: 95, image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png" },
    { name: "Aleksandar KOSTIC", goals: 65, matches: 88, image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png" },
    { name: "Mario STEFEL", goals: 52, matches: 82, image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png" }
  ]

  const topTrainers = [
    { name: "Aleksandar KOSTIC", attended: 156, total: 160, image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png" },
    { name: "Mario STEFEL", attended: 154, total: 160, image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png" },
    { name: "Josip MATIJEVIC", attended: 152, total: 160, image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png" }
  ]

  const records = [
    { label: "Most Goals in a Game", value: "5", holder: "Josip MATIJEVIC", date: "vs SC Wiener Neustadt, 15.10.23" },
    { label: "Fastest Goal", value: "28s", holder: "Mario STEFEL", date: "vs ASK Ebreichsdorf, 12.03.24" },
    { label: "Most Assists", value: "102", holder: "Aleksandar KOSTIC", date: "All-time" }
  ]

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
                <span className="text-xs text-gray-400">{scorer.matches} Matches</span>
              </div>
            </div>
            <div className="text-lg font-bold text-white">
              {(scorer.goals / scorer.matches).toFixed(2)}
              <span className="text-xs text-gray-400 ml-1">G/M</span>
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