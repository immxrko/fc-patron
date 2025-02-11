'use client'

import { motion } from 'framer-motion'
import { Check, Calendar, ArrowLeft } from 'lucide-react'
import { format, addHours } from 'date-fns'

interface SubmissionSuccessProps {
  selectedDate: Date
  onClose: () => void
  userName: string
}

export default function SubmissionSuccess({ selectedDate, onClose, userName }: SubmissionSuccessProps) {
  const handleAddToCalendar = () => {
    // Set trial time to 20:00 - 22:00
    const startDate = new Date(selectedDate)
    startDate.setHours(20, 0, 0)
    const endDate = new Date(selectedDate)
    endDate.setHours(22, 0, 0)
    
    // Format dates for iCal
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '')
    }

    const event = {
      begin: formatDate(startDate),
      end: formatDate(endDate),
      title: 'FC Patron Trial Training',
      description: 'Trial training session at FC Patron',
      location: 'WAF Platz',
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.begin}
DTEND:${event.end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', `trial-training-${format(selectedDate, 'yyyy-MM-dd')}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          duration: 0.5,
          delay: 0.2
        }}
        className="bg-black/50 border border-white/10 rounded-2xl p-6 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            duration: 0.7,
            delay: 0.5,
            bounce: 0.5
          }}
          className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Request Submitted!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-white/80 mb-6"
        >
          <span className="block mb-2 font-bold">
            👋 Hello {userName},
          </span>
          We look forward to seeing you on
          <br />
          <span className="text-red-400 font-semibold">
            {format(selectedDate, 'EEEE, MMMM d')}
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-3 mb-6"
        >
          <button
            onClick={handleAddToCalendar}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 
              border border-white/10 rounded-lg text-white transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>
          
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 
              bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white 
              transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-sm text-white/60"
        >
          <div>Our Manager will contact you shortly</div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 