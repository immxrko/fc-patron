'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from '@/components/home/HeroSection'
import TrialForm from '@/components/trial/TrialForm'

export default function Home() {
  const [showTrialForm, setShowTrialForm] = useState(false)

  // Prevent scrolling when trial form is shown
  useEffect(() => {
    if (showTrialForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showTrialForm])

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 overflow-x-hidden
      ${showTrialForm ? 'h-screen overflow-hidden' : ''}`}>
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Background Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-20">
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <AnimatePresence mode="wait">
          {!showTrialForm ? (
            <motion.div
              key="hero"
              initial={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <HeroSection onTrialClick={() => setShowTrialForm(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="trial"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-[calc(100vh-2rem)] overflow-y-auto pt-0 md:pt-20 scrollbar-thin scrollbar-track-transparent 
                scrollbar-thumb-red-500/20 hover:scrollbar-thumb-red-500/30"
            >
              <TrialForm onBack={() => setShowTrialForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
} 