'use client'

import { motion } from 'framer-motion'
import { useState, FormEvent } from 'react'
import { Calendar } from 'lucide-react'
import { format, addMonths, eachDayOfInterval,  isTuesday, isBefore, startOfToday } from 'date-fns'

interface TrialFormProps {
  onBack: () => void
}

const positions = [
  "Striker",
  "Winger",
  "Attacking Midfielder",
  "Central Midfielder",
  "Defensive Midfielder",
  "Full-back",
  "Center-back",
  "Goalkeeper"
] as const

export default function TrialForm({ onBack }: TrialFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [dateError, setDateError] = useState(false)

  // Get only next 3 Tuesdays
  const today = startOfToday()
  const availableDates = eachDayOfInterval({
    start: today,
    end: addMonths(today, 2)
  })
    .filter(date => isTuesday(date) && !isBefore(date, today))
    .slice(0, 3)  // Take only the next 3 Tuesdays

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedDate) {
      setDateError(true)
      return
    }
    
    setDateError(false)
    const formData = new FormData(e.currentTarget)
    console.log({
      name: formData.get('name'),
      phone: formData.get('phone'),
      position: formData.get('position'),
      lastClub: formData.get('lastClub'),
      date: selectedDate
    })
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-white">Book Your Trial Training</h2>
        <p className="text-white/80 hidden md:block">Fill out the form below and we'll get back to you shortly.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white 
                placeholder:text-white/50 focus:outline-none focus:border-red-500/50"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-white">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white 
                placeholder:text-white/50 focus:outline-none focus:border-red-500/50"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="position" className="block text-sm font-medium text-white">
              Position *
            </label>
            <select
              id="position"
              name="position"
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white 
                focus:outline-none focus:border-red-500/50 appearance-none"
              defaultValue=""
            >
              <option value="" disabled className="bg-gray-900">Select your position</option>
              {positions.map((position) => (
                <option key={position} value={position} className="bg-gray-900">
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 relative">
            <label htmlFor="trialDate" className="block text-sm font-medium text-white">
              Preferred Trial Date (Next Available Tuesdays) *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className={`w-full px-4 py-2 bg-black/20 border rounded-lg text-left flex items-center justify-between
                  hover:bg-black/30 transition-colors
                  ${dateError ? 'border-red-500' : 'border-white/10'}
                  ${selectedDate ? 'text-white' : 'text-white/50'}`}
              >
                <span>{selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a Tuesday'}</span>
                <Calendar className="w-5 h-5 text-red-400" />
              </button>

              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-10 mt-2 w-full bg-black/95 backdrop-blur-sm border border-white/10 
                    rounded-lg shadow-xl divide-y divide-white/5 overflow-hidden"
                >
                  {availableDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date)
                        setShowCalendar(false)
                        setDateError(false)
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between
                        ${selectedDate?.toISOString() === date.toISOString()
                          ? 'bg-red-500/20 text-red-400'
                          : 'hover:bg-red-500/10 text-white hover:text-red-400'}`}
                    >
                      <span className="font-medium">{format(date, 'EEEE')}</span>
                      <span className="text-sm opacity-75">{format(date, 'MMMM d')}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            {dateError && (
              <p className="text-sm text-red-500">Please select a date</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastClub" className="block text-sm font-medium text-white">
              Last Club
            </label>
            <input
              type="text"
              id="lastClub"
              name="lastClub"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white 
                placeholder:text-white/50 focus:outline-none focus:border-red-500/50"
              placeholder="Enter your last club (optional)"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium 
              rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 
              focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Submit Request
          </button>
        </form>
      </motion.div>
    </div>
  )
} 