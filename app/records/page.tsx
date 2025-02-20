'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TeamStats from '@/components/records/TeamStats'
import PlayerRecords from '@/components/records/PlayerRecords'
import SeasonalAchievements from '@/components/records/SeasonalAchievements'

export default function Records() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 overflow-x-hidden relative"
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
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-red-500/20 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`
                  }}
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

      <div className="relative w-full max-w-7xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          {/* Left Column */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <TeamStats />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SeasonalAchievements />
            </motion.div>
          </div>
          
          {/* Right Column */}
          <div>
            <motion.div variants={itemVariants}>
              <PlayerRecords />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  )
} 