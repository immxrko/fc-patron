'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import NextMatch from '@/components/schedule/NextMatch'
import HeadToHead from '@/components/schedule/HeadToHead'

interface Match {
  id: number
  opponentid: number
  venueid: number
  matchtypeid: number
  leagueid: number
  seasonid: number
  date: string
  time: string
  resTime?: string | null
  result: string
  matchday: number
  ishomegame: boolean
  km_res: string
  opponent?: {
    name: string
    logourl: string
    league?: string
  }
  venue?: {
    name: string
    adress: string
  }
  matchtype?: string
}

export default function Schedule() {
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [nextMatches, setNextMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    fetchNextMatches()
  }, [])

  const fetchNextMatches = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch next 2 KM matches
      const { data: kmMatchesData, error: kmMatchError } = await supabase
        .from('matches')
        .select('*')
        .gte('date', today)
        .eq('km_res', 'KM')
        .order('date', { ascending: true })
        .limit(2)

      if (kmMatchError) throw kmMatchError

      // Process each KM match
      const processedMatches = await Promise.all(kmMatchesData.map(async (kmMatch) => {
        // Get RES match for the same date if exists
        const { data: resMatchData } = await supabase
          .from('matches')
          .select('time')
          .eq('date', kmMatch.date)
          .eq('km_res', 'RES')
          .single()

        // Get opponent details
        const { data: opponentData, error: opponentError } = await supabase
          .from('opponents')
          .select('name, logourl')
          .eq('id', kmMatch.opponentid)
          .single()

        if (opponentError) throw opponentError

        // Get venue details
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', kmMatch.venueid)
          .single()

        if (venueError) throw venueError

        // Get matchtype if not league game
        let leagueData = null
        if (kmMatch.matchtypeid !== 1) {
          const { data: typeData } = await supabase
            .from('leagues')
            .select('name')
            .eq('id', kmMatch.leagueid)
            .single()

          leagueData = typeData
        }

        return {
          ...kmMatch,
          resTime: resMatchData?.time || null,
          opponent: {
            name: opponentData.name,
            logourl: opponentData.logourl,
            league: leagueData?.name
          },
          venue: {
            name: venueData.name,
            adress: venueData.adress
          }
        }
      }))

      setNextMatches(processedMatches)
    } catch (error) {
      console.error('Error fetching next matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentMatch = () => {
    if (!nextMatches.length) return null

    const now = new Date()
    const match1Date = new Date(`${nextMatches[0].date}T${nextMatches[0].time}`)

    // If first match is in the past and we have a second match, show the second match
    if (match1Date < now && nextMatches.length > 1) {
      return nextMatches[1]
    }

    // Otherwise show the first match
    return nextMatches[0]
  }

  const currentMatch = getCurrentMatch()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  // Fixed positions for particles
  const particlePositions = [
    { left: '10%', top: '20%' },
    { left: '90%', top: '30%' },
    { left: '50%', top: '60%' },
    { left: '80%', top: '10%' },
    { left: '20%', top: '90%' },
  ]

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="md:fixed md:inset-0 md:overflow-hidden min-h-screen p-4 overflow-x-hidden relative"
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Floating Particles */}
        <AnimatePresence>
          {isClient && (
            <div className="absolute inset-0">
              {particlePositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-red-500/20 rounded-full"
                  style={pos}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          <div className="lg:col-span-2">
            <motion.div variants={itemVariants}>
              {currentMatch && (
                <NextMatch 
                  match={currentMatch} 
                  onMatchComplete={fetchNextMatches}
                />
              )}
            </motion.div>
          </div>
          
          <div>
            <motion.div variants={itemVariants}>
              {currentMatch && (
                <HeadToHead 
                  opponent={{
                    id: currentMatch.opponentid,
                    name: currentMatch.opponent?.name || '',
                    logourl: currentMatch.opponent?.logourl || ''
                  }}
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  )
} 