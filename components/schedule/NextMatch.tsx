'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users } from 'lucide-react'

interface MatchProps {
  match: {
    id: number
    date: string
    time: string
    resTime?: string | null
    ishomegame: boolean
    matchday: number | null
    opponent?: {
      name: string
      logourl: string
      league?: string
    }
    venue?: {
      name: string
      adress: string
    }
    matchtypeid?: number
  }
  onMatchComplete: (date?: string) => void
}

export default function NextMatch({ match, onMatchComplete }: MatchProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const matchDate = new Date(match.date + 'T' + match.time)
    
    const timer = setInterval(() => {
      const now = new Date()
      const difference = matchDate.getTime() - now.getTime()
      
      if (difference <= 0) {
        clearInterval(timer)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        onMatchComplete(tomorrow.toISOString().split('T')[0])
        return
      }
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [match.date, match.time, onMatchComplete])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5)
  }

  return (
    <motion.div 
      className="relative overflow-hidden bg-black/20 backdrop-blur-sm rounded-3xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-red-400" />
            <h2 className="text-2xl md:text-2xl font-bold text-white">
              {formatDate(match.date)}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {match.matchtypeid === 1 
                ? `Matchday ${match.matchday}`
                : match.matchtypeid === 2
                  ? "Cup"
                  : "Friendly"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2 md:gap-4 mb-8">
        {/* Home Team */}
        <motion.div 
          className="flex-1 flex flex-col items-center min-w-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.img
            src={match.ishomegame 
              ? "https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
              : match.opponent?.logourl}
            alt={match.ishomegame ? "FC Patron" : match.opponent?.name}
            className="w-20 h-20 md:w-32 md:h-32 object-contain mb-4"
            style={{ maxWidth: '80px', maxHeight: '80px' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
          <h3 className="text-xs md:text-2xl font-bold text-white text-center">
            {match.ishomegame ? "FC Patron" : match.opponent?.name}
          </h3>
          {match.matchtypeid !== 1 && (
            <p className="text-red-400 text-xs md:text-sm mt-1">
              {match.ishomegame ? "1. Klasse B" : match.opponent?.league}
            </p>
          )}
        </motion.div>

        {/* VS Section */}
        <motion.div 
          className="flex-shrink-0 flex flex-col items-center justify-center w-24 md:w-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text mb-4">VS</div>
          <div className="flex flex-col items-center">
            <div className="text-xs md:text-sm font-medium text-red-400">Kick-off</div>
            <div className="text-xl md:text-2xl font-bold text-white">
              {formatTime(match.time)}
            </div>
            {match.resTime && (
              <div className="flex flex-col items-center mt-1">
                <div className="text-sm font-medium text-gray-300">
                  {formatTime(match.resTime)}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Away Team */}
        <motion.div 
          className="flex-1 flex flex-col items-center min-w-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.img
            src={!match.ishomegame 
              ? "https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
              : match.opponent?.logourl}
            alt={!match.ishomegame ? "FC Patron" : match.opponent?.name}
            className="w-20 h-20 md:w-32 md:h-32 object-contain mb-4"
            style={{ maxWidth: '80px', maxHeight: '80px' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
          <h3 className="text-xs md:text-2xl font-bold text-white text-center">
            {!match.ishomegame ? "FC Patron" : match.opponent?.name}
          </h3>
          {match.matchtypeid !== 1 && (
            <p className="text-red-400 text-xs md:text-sm mt-1">
              {!match.ishomegame ? "1. Klasse B" : match.opponent?.league}
            </p>
          )}
        </motion.div>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
        {Object.entries(timeLeft).map(([unit, value], index) => (
          <motion.div 
            key={unit}
            className="text-center p-3 md:p-6 bg-black/40 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05, borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <div className="text-xl md:text-3xl font-bold text-white mb-1">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-wider">
              {unit}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Venue Info */}
      <motion.div 
        className="flex flex-col px-3 md:px-4 py-3 bg-black/40 backdrop-blur-sm rounded-xl
          border border-white/5 hover:border-red-500/20 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3 mb-2 md:mb-3">
          <MapPin className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-400">Venue</div>
            <div className="text-sm font-medium text-white">{match.venue?.name}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {match.venue?.adress}
          </div>
          <motion.a
            href={`https://maps.google.com/?q=${encodeURIComponent(match.venue?.name ?? '')}+${encodeURIComponent(match.venue?.adress ?? '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs font-medium text-red-400 bg-red-500/10 
              rounded-full hover:bg-red-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Directions
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  )
} 