'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

export default function NextMatch() {
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

  return (
    <div className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-medium text-gray-400">Next Match</h2>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-500">Matchday 26</span>
          </div>
        </div>
        <div className="px-4 py-2 bg-red-500/10 rounded-full">
          <span className="text-sm font-medium text-red-400">League Match</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-12">
        <div className="text-center">
          <img 
            src="https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
            alt="FC Patron"
            className="w-28 h-28 rounded-2xl mb-4 ring-1 ring-white/10"
          />
          <h3 className="text-2xl font-bold text-white">FC Patron</h3>
          <p className="text-gray-400 text-sm mt-1">1st Place</p>
        </div>

        <div className="text-center px-8">
          <div className="text-5xl font-bold bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text mb-4">VS</div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-red-400">Kick-off</div>
            <div className="text-xl font-bold text-white">15:30</div>
          </div>
        </div>

        <div className="text-center">
          <img 
            src="https://www.oefb.at/oefb2/images/1278650591628556536_ba89cc5af9585cffb11c-1,0-320x320.png"
            alt="SV Stripfing"
            className="w-28 h-28 rounded-2xl mb-4 ring-1 ring-white/10"
          />
          <h3 className="text-2xl font-bold text-white">SV Stripfing</h3>
          <p className="text-gray-400 text-sm mt-1">3rd Place</p>
        </div>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-2xl">
            <div className="text-3xl font-bold text-white mb-1">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {unit}
            </div>
          </div>
        ))}
      </div>

      {/* Match Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-black/20 backdrop-blur-sm rounded-xl">
          <Calendar className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-xs text-gray-400">Date</div>
            <div className="text-sm font-medium text-white">20 April 2025</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-black/20 backdrop-blur-sm rounded-xl">
          <Clock className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-xs text-gray-400">Time</div>
            <div className="text-sm font-medium text-white">15:30 CEST</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-black/20 backdrop-blur-sm rounded-xl">
          <MapPin className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-xs text-gray-400">Venue</div>
            <div className="text-sm font-medium text-white">FC Patron Arena</div>
          </div>
        </div>
      </div>
    </div>
  )
} 