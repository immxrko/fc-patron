'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TeamHeader from '@/components/squad/TeamHeader'
import TeamSelector from '@/components/squad/TeamSelector'
import PlayerGrid from '@/components/squad/PlayerGrid'
import SearchBar from '@/components/squad/SearchBar'
import { useRouter } from 'next/navigation'

export default function Squad() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<'first-team' | 'u23'>('first-team')
  const [selectedSeason, setSelectedSeason] = useState('2024/25')
  const router = useRouter()

  // Fixed positions for particles
  const particlePositions = [
    { left: '20%', top: '30%' },
    { left: '80%', top: '40%' },
    { left: '40%', top: '70%' },
    { left: '70%', top: '20%' },
    { left: '30%', top: '80%' },
  ]

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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.toLowerCase() === "diana23") {
      router.push('/admin')
    }
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-[100dvh] relative"
    >
      {/* Desktop Layout */}
      <div className="hidden md:block container mx-auto p-8">
        <motion.div variants={itemVariants}>
          <TeamHeader onSeasonChange={setSelectedSeason} />
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="flex gap-6 mb-8 items-center justify-between"
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <TeamSelector onTeamChange={setSelectedTeam} />
          </motion.div>
          <motion.div variants={itemVariants} className="w-96" whileHover={{ scale: 1.02 }}>
            <SearchBar onSearch={handleSearch} />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PlayerGrid 
            searchQuery={searchQuery} 
            selectedTeam={selectedTeam}
            selectedSeason={selectedSeason}
          />
        </motion.div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-30 bg-black/95">
          <TeamHeader onSeasonChange={setSelectedSeason} />
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between gap-4">
              <motion.div 
                className="flex-1"
                animate={{ opacity: isSearchOpen ? 0 : 1, width: isSearchOpen ? 0 : 'auto' }}
              >
                <TeamSelector onTeamChange={setSelectedTeam} />
              </motion.div>
              
              <motion.div 
                className="w-full"
                animate={{ 
                  width: isSearchOpen ? '100%' : '48px',
                  paddingLeft: isSearchOpen ? '0px' : '0'
                }}
              >
                <div className="flex items-center justify-end">
                  <motion.button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ rotate: isSearchOpen ? 45 : 0 }}
                      className="text-white/80"
                    >
                      {isSearchOpen ? (
                        <path d="M18 6L6 18M6 6l12 12" />
                      ) : (
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      )}
                    </motion.svg>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <SearchBar onSearch={handleSearch} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Players Grid */}
        <div className="px-4 py-4 pb-24">
          <PlayerGrid 
            searchQuery={searchQuery} 
            selectedTeam={selectedTeam}
            selectedSeason={selectedSeason}
          />
        </div>
      </div>

      {/* Floating Particles Effect */}
      <AnimatePresence>
        {isClient && (
          <div className="absolute inset-0 -z-10 overflow-hidden">
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
    </motion.main>
  )
} 