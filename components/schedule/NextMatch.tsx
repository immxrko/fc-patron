'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar,  MapPin, Users } from 'lucide-react'

interface NextMatchProps {
  onOpponentSelect: (opponent: string) => void;
}

export default function NextMatch({ onOpponentSelect }: NextMatchProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Calculate a date that's always in the future (e.g., next Saturday)
    const calculateNextMatchDate = () => {
      const now = new Date()
      const nextMatch = new Date(now)
      nextMatch.setDate(now.getDate() + (6 - now.getDay() + 7) % 7) // Next Saturday
      nextMatch.setHours(15, 30, 0, 0) // Set to 15:30
      
      // If it's Saturday after 15:30, get next Saturday
      if (now.getDay() === 6 && now.getHours() >= 15 && now.getMinutes() >= 30) {
        nextMatch.setDate(nextMatch.getDate() + 7)
      }
      
      return nextMatch
    }

    const matchDate = calculateNextMatchDate()
    
    const timer = setInterval(() => {
      const now = new Date()
      const difference = matchDate.getTime() - now.getTime()
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Set initial opponent when component mounts
    onOpponentSelect('SV Stripfing')
  }, [onOpponentSelect])

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
            <h2 className="text-2xl md:text-2xl font-bold text-white">20 April 2025</h2>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Matchday 26</span>
          </div>
        </div>
        <motion.div 
          className="px-3 md:px-4 py-1.5 md:py-2 bg-red-500/10 rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xs md:text-sm font-medium text-red-400">League Match</span>
        </motion.div>
      </motion.div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.img 
            src="https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
            alt="FC Patron"
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl mb-3 md:mb-4 ring-1 ring-white/10"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          <h3 className="text-xl md:text-2xl font-bold text-white">FC Patron</h3>
          <p className="text-red-400 text-xs md:text-sm mt-1">1st Place</p>
        </motion.div>

        <motion.div 
          className="text-center px-4 md:px-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text mb-4">VS</div>
          <div className="space-y-1">
            <div className="text-xs md:text-sm font-medium text-red-400">Kick-off</div>
            <div className="text-xl md:text-2xl font-bold text-white">15:30</div>
          </div>
        </motion.div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.img 
            src="https://images.regionalfussball.net/club-5946/logo.png?v=3&width=400&format=webp&height=400&mode=max"
            alt="SV Stripfing"
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl mb-3 md:mb-4 ring-1 ring-white/10"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          <h3 className="text-xl md:text-2xl font-bold text-white">SV Stripfing</h3>
          <p className="text-gray-400 text-xs md:text-sm mt-1">3rd Place</p>
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

      {/* Weather Widget */}
      <motion.div 
        className="mb-6 p-4 md:p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Weather Icon */}
            <div className="p-2 md:p-4 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg md:rounded-xl">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V5M5.5 5.5L7 7M18.5 5.5L17 7M6 12H4M20 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7Z" fill="currentColor"/>
              </svg>
            </div>
            
            {/* Temperature and Conditions */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-white">22°</span>
                <span className="text-base md:text-lg text-gray-400">/ 15°</span>
              </div>
              <span className="text-xs md:text-sm text-gray-400">Partly Cloudy</span>
            </div>
          </div>

          {/* Additional Weather Info */}
          <div className="flex gap-3 md:gap-6">
            <div className="text-center">
              <div className="text-xs md:text-sm text-gray-400 mb-1">Wind</div>
              <div className="text-sm md:text-lg font-medium text-white">12 km/h</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="text-sm text-gray-400 mb-1">Humidity</div>
              <div className="text-lg font-medium text-white">65%</div>
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm text-gray-400 mb-1">Rain</div>
              <div className="text-sm md:text-lg font-medium text-white">10%</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Match Info */}
      <div className="grid grid-cols-1 gap-4">
        <motion.div 
          key="venue"
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
              <div className="text-sm font-medium text-white">Sportplatz WAF Vorwärts Brigittenau</div>
            </div>
            <div className="ml-auto text-xs text-gray-400">15:30 CEST</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Meldemannstraße 4, 1200 Wien
            </div>
            <motion.a
              href="https://maps.google.com/?q=Sportplatz+WAF+Vorwärts+Brigittenau+Meldemannstraße+4+1200+Wien"
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
      </div>
    </motion.div>
  )
} 