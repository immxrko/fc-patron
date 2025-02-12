'use client'

import { motion } from 'framer-motion'
import { History, Star, Trophy, Award } from 'lucide-react'

export default function HistoricalMilestones() {
  const milestones = [
    {
      date: "April 20, 2025",
      title: "League Championship",
      description: "Won the first league title in club history",
      icon: Trophy,
      color: "text-yellow-400"
    },
    {
      date: "March 15, 2024",
      title: "Cup Victory",
      description: "First major trophy - Austrian Cup Winners",
      icon: Award,
      color: "text-blue-400"
    },
    {
      date: "December 3, 2023",
      title: "Record Attendance",
      description: "15,000 fans attended the derby match",
      icon: Star,
      color: "text-purple-400"
    }
  ]

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">Historical Milestones</h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-8 bottom-0 w-px bg-white/10" />

        {/* Milestones */}
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.title}
              className="relative pl-16"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              {/* Timeline dot */}
              <div className={`absolute left-4 top-3 w-4 h-4 rounded-full bg-black/60 border-2 ${milestone.color.replace('text', 'border')}`} />
              
              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <milestone.icon className={`w-5 h-5 ${milestone.color} mb-2`} />
                    <h3 className="text-lg font-bold text-white">{milestone.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{milestone.date}</span>
                </div>
                <p className="text-sm text-gray-400">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Future Milestone */}
      <motion.div
        className="mt-8 p-4 bg-black/30 rounded-xl border border-white/5 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent" />
        <div className="relative">
          <div className="text-sm text-gray-400 mb-1">Next Target</div>
          <div className="text-lg font-bold text-white mb-2">European Qualification</div>
          <div className="text-xs text-gray-400">Aiming to qualify for European competition in the upcoming season</div>
        </div>
      </motion.div>
    </div>
  )
} 