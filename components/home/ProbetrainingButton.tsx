'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface ProbetrainingButtonProps {
  onClick: () => void
}

export default function ProbetrainingButton({ onClick }: ProbetrainingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group flex items-center gap-2 px-6 py-3 bg-black/20 rounded-xl 
        backdrop-blur-sm border border-white/5 transition-all duration-300
        hover:bg-black/30 hover:border-red-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-base font-medium text-white">Probetraining</span>
      <ArrowRight className="w-4 h-4 text-red-400 transition-transform duration-300 
        group-hover:translate-x-1" />
    </motion.button>
  )
} 