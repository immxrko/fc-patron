'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NextMatch from '@/components/schedule/NextMatch'
import HeadToHead from '@/components/schedule/HeadToHead'

export default function Schedule() {
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null)
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
              <NextMatch onOpponentSelect={setSelectedOpponent} />
            </motion.div>
          </div>
          
          <div>
            <motion.div variants={itemVariants}>
              <HeadToHead opponent={selectedOpponent} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  )
} 