'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar,  MapPin, Users } from 'lucide-react'

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

interface WeatherData {
  current_condition: [{
    temp_C: string;
    windspeedKmph: string;
    precipMM: string;
    humidity: string;
    weatherDesc: [{ value: string }];
  }];
  weather: {
    date: string;
    hourly: {
      tempC: string;
      weatherDesc: [{ value: string }];
      humidity: string;
      windspeedKmph: string;
      precipMM: string;
      time: string;
    }[];
  }[];
}

export default function NextMatch({ match, onMatchComplete }: MatchProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const [weather, setWeather] = useState<WeatherData['current_condition'][0] | null>(null);

  useEffect(() => {
    const matchDate = new Date(match.date + 'T' + match.time)
    
    const timer = setInterval(() => {
      const now = new Date()
      const difference = matchDate.getTime() - now.getTime()
      
      if (difference <= 0) {
        clearInterval(timer)
        // Set tomorrow as the new date to find next match
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0) // Reset to start of day
        onMatchComplete(tomorrow.toISOString().split('T')[0]) // Pass the new date
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

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://wttr.in/Vienna?format=j1');
        const data: WeatherData = await response.json();
        const matchDayWeather = findWeatherForDate(data, match.date);
        if (matchDayWeather) {
          setWeather({
            temp_C: matchDayWeather.tempC,
            windspeedKmph: matchDayWeather.windspeedKmph,
            precipMM: matchDayWeather.precipMM,
            humidity: matchDayWeather.humidity,
            weatherDesc: matchDayWeather.weatherDesc
          });
        } else {
          setWeather(null);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [match.date]);

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
    return timeStr.substring(0, 5) // Assuming time is in format "HH:mm:ss", this gets "HH:mm"
  }


  const getWeatherIcon = (temp: string) => {
    const temperature = parseInt(temp)
    
    if (temperature >= 25) {
      // Hot sun
      return (
        <path 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          d="M12 3v2M12 19v2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M3 12h2M19 12h2M17 7l1.5-1.5M5.5 18.5l1.5-1.5M12 16a4 4 0 100-8 4 4 0 000 8z" 
          fill="currentColor"
        />
      )
    }
    
    if (temperature >= 15) {
      // Mild sun
      return (
        <path 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          d="M12 3V5M5.5 5.5L7 7M18.5 5.5L17 7M6 12H4M20 12H18M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7Z" 
          fill="currentColor"
        />
      )
    }
    
    if (temperature >= 5) {
      // Cool cloud
      return (
        <path 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          d="M3 15C3 17.2091 4.79086 19 7 19H16C18.7614 19 21 16.7614 21 14C21 11.2386 18.7614 9 16 9C15.9666 9 15.9334 9.00033 15.9002 9.00098C15.4373 6.71825 13.4193 5 11 5C8.23858 5 6 7.23858 6 10C6 10.3768 6.04169 10.7439 6.12071 11.097C4.33457 11.4976 3 13.0929 3 15Z"
        />
      )
    }
    
    // Cold/freezing (snowflake)
    return (
      <path 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        d="M12 2v20M17.5 6.5L6.5 17.5M17.5 17.5L6.5 6.5M4 12h16M9.5 4L12 2l2.5 2M9.5 20L12 22l2.5-2"
      />
    )
  }

  const findWeatherForDate = (weatherData: WeatherData, matchDate: string) => {
    const matchDayWeather = weatherData.weather.find(day => day.date === matchDate);
    if (!matchDayWeather) return null;

    // Get weather for 15:00 (time: "1500")
    const matchTimeWeather = matchDayWeather.hourly.find(hour => hour.time === "1500");
    return matchTimeWeather || null;
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

      {/* Weather Widget */}
      <motion.div 
        className="mb-6 p-4 md:p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {weather ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Weather Icon */}
              <div className="p-2 md:p-4 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {getWeatherIcon(weather.temp_C)}
                </svg>
              </div>
              
              {/* Temperature and Conditions */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-white">{weather.temp_C}°</span>
                </div>
                <span className="text-xs md:text-sm text-gray-400">{weather.weatherDesc[0].value}</span>
              </div>
            </div>

            {/* Additional Weather Info */}
            <div className="flex gap-3 md:gap-6">
              <div className="text-center">
                <div className="text-xs md:text-sm text-gray-400 mb-1">Wind</div>
                <div className="text-sm md:text-lg font-medium text-white">{weather.windspeedKmph} km/h</div>
              </div>
              <div className="text-center hidden md:block">
                <div className="text-sm text-gray-400 mb-1">Humidity</div>
                <div className="text-lg font-medium text-white">{weather.humidity}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs md:text-sm text-gray-400 mb-1">Rain</div>
                <div className="text-sm md:text-lg font-medium text-white">{weather.precipMM}mm</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            Weather forecast will be available 3 days before the match
          </div>
        )}
      </motion.div>

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