'use client'

import { motion } from 'framer-motion'
import { Trophy, Award, Crown, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SeasonalAchievements() {
  const [unbeatenRun, setUnbeatenRun] = useState(0)
  const [unbeatenRunPeriod, setUnbeatenRunPeriod] = useState('')
  const [cleanSheets, setCleanSheets] = useState(0)
  const [cleanSheetsDescription, setCleanSheetsDescription] = useState('')

  useEffect(() => {
    const fetchUnbeatenRun = async () => {
      // Get all KM games ordered by date
      const { data: matches, error } = await supabase
        .from('matches')
        .select('date, result, opponents(name)')
        .eq('matchtypeid', 1)
        .eq('km_res', 'KM')
        .order('date', { ascending: true })

      if (error) throw error
      if (!matches) return

      // Calculate longest unbeaten run
      let currentRun = 0
      let longestRun = 0
      let startDate: string | null = null
      let endDate: string | null = null
      let tempStartDate: string | null = null
      let currentStreak: any[] = []

      matches.forEach((match, index) => {
        // Skip matches with no result
        if (!match.result) return

        // Convert score to result
        const [ourScore, theirScore] = match.result.split(':').map(Number)
        const result = ourScore > theirScore ? 'W' : ourScore === theirScore ? 'D' : 'L'

        if (result === 'W' || result === 'D') {
          if (currentRun === 0) {
            tempStartDate = match.date
          }
          currentRun++
          
          if (currentRun > longestRun) {
            longestRun = currentRun
            startDate = tempStartDate
            endDate = match.date
          }
        } else {
          if (currentRun > 0) {
            
          }
          currentRun = 0
          tempStartDate = null
        }
      })

      setUnbeatenRun(longestRun)
      if (startDate && endDate) {
        setUnbeatenRunPeriod(`${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}`)
      }
    }

    fetchUnbeatenRun()
  }, [])

  useEffect(() => {
    const fetchCleanSheets = async () => {
      const { data, error } = await supabase
        .from('clean_sheets')
        .select('*')

      if (error) throw error
      if (!data) return

    

      setCleanSheets(data.length)
      setCleanSheetsDescription(`Total clean sheets`)
    }

    fetchCleanSheets()
  }, [])

  

  const achievements = [
    { 
      icon: Crown, 
      label: "Best Unbeaten Run", 
      count: unbeatenRun, 
      description: unbeatenRunPeriod 
    },
    { 
      icon: Award, 
      label: "Clean Sheets", 
      count: cleanSheets, 
      description: cleanSheetsDescription 
    }
  ]

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">League Records</h2>
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
        
          </motion.div>
        ))}
      </div>

    
    </div>
  )
} 