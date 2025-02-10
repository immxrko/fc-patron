'use client'

import { motion } from 'framer-motion'
import SocialLinks from '../home/SocialLinks'
import ProbetrainingButton from '../home/ProbetrainingButton'

interface HeroSectionProps {
  onTrialClick: () => void
}

export default function HeroSection({ onTrialClick }: HeroSectionProps) {
  return (
    <motion.div 
      className="relative flex flex-col items-center gap-8 md:gap-12 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Logo and Title */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
        <motion.img
          src="https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
          alt="FC Patron"
          className="w-32 h-32 md:w-40 md:h-40 rounded-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.2,
            type: "spring",
            stiffness: 100 
          }}
        />

        <div className="flex flex-col justify-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            FC Patron
          </motion.h1>

          <motion.h2
            className="text-lg md:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-gray-200 to-[#FFD700]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            #rotschwarzgold
          </motion.h2>
        </div>
      </div>

      <SocialLinks />
      <ProbetrainingButton onClick={onTrialClick} />
    </motion.div>
  )
} 