'use client'

import { motion } from 'framer-motion'
import NextMatch from '@/components/schedule/NextMatch'
import UpcomingMatches from '@/components/schedule/UpcomingMatches'
import SeasonProgress from '@/components/schedule/SeasonProgress'

export default function Schedule() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 overflow-x-hidden">
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Background Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-20">
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="lg:col-span-2">
            <NextMatch />
          </div>
          <div className="space-y-6">
            <SeasonProgress />
            <UpcomingMatches />
          </div>
        </motion.div>
      </div>
    </main>
  )
} 