'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, TrendingUp, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Nominee {
  name: string
  image: string
}

const nominees = {
  newcomer: [
    { name: 'JEFIMIC Nedeljko', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'IZVERNAR Iosif-Cornel', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'ZIVKOVIC Stefan', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'RAMHAPP Elias', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'SULJIC Mathias', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' }
  ],
  playerOfSeason: [
    { name: 'SAGIROGLU Ogulcan', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'ANICIC-ZUPARIC Lukas', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'PRIBILL Adrian', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'JORGANOVIC Philipp', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'ULUSOY Burak', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' }
  ],
  mostImproved: [
    { name: 'SCHUCKERT Luca', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'SAGIROGLU Ogulcan', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'ZIER Alessandro', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'DRAGONI Paul', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' },
    { name: 'MOSER Sebastian', image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' }
  ]
}

export default function VotingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [voterName, setVoterName] = useState('')
  const [votes, setVotes] = useState({
    newcomer: '',
    playerOfSeason: '',
    mostImproved: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    { title: 'Your Information', icon: Star },
    { title: 'Newcomer of the Season', icon: Star, category: 'newcomer' },
    { title: 'Player of the Season', icon: Trophy, category: 'playerOfSeason' },
    { title: 'Most Improved Player', icon: TrendingUp, category: 'mostImproved' },
    { title: 'Confirm Your Votes', icon: Check }
  ]

  const handleVote = (category: string, nominee: string) => {
    setVotes(prev => ({ ...prev, [category]: nominee }))
  }

  const handleNext = () => {
    if (currentStep === 0 && !voterName.trim()) {
      setError('Please enter your name')
      return
    }
    if (currentStep > 0 && currentStep < 4) {
      const category = steps[currentStep].category
      if (category && !votes[category as keyof typeof votes]) {
        setError('Please select a nominee')
        return
      }
    }
    setError('')
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    setError('')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Get user's IP address (in a real app, you'd get this from the server)
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const { ip } = await ipResponse.json()

      const { error: submitError } = await supabase
        .from('votes')
        .insert([{
          voter_name: voterName.trim(),
          newcomer_vote: votes.newcomer,
          player_of_season_vote: votes.playerOfSeason,
          most_improved_vote: votes.mostImproved,
          ip_address: ip
        }])

      if (submitError) {
        if (submitError.code === '23505') { // Unique constraint violation
          throw new Error('You have already voted. Only one vote per person is allowed.')
        }
        throw submitError
      }

      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit votes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderNomineeCard = (nominee: Nominee, category: string, isSelected: boolean) => (
    <motion.div
      key={nominee.name}
      onClick={() => handleVote(category, nominee.name)}
      className={`relative cursor-pointer group ${
        isSelected 
          ? 'ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10' 
          : 'hover:bg-black/40'
      } bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-5 h-5 text-black" />
        </motion.div>
      )}
      
      <div className="flex flex-col items-center text-center">
        <div className="relative w-24 h-24 mb-4">
          <img
            src={nominee.image}
            alt={nominee.name}
            className="w-full h-full object-cover rounded-full border-2 border-white/20"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-full" />
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
          {nominee.name}
        </h3>
        
        <div className={`w-full h-1 rounded-full transition-all duration-300 ${
          isSelected ? 'bg-yellow-500' : 'bg-white/20 group-hover:bg-yellow-500/50'
        }`} />
      </div>
    </motion.div>
  )

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Check className="w-12 h-12 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
          <p className="text-white/80 mb-6">Your votes have been successfully submitted for the FC Patron Season Awards.</p>
          <motion.button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src="https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
              alt="FC Patron"
              className="w-16 h-16 rounded-xl"
            />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-transparent bg-clip-text">
                Season Awards 2024/25
              </h1>
              <p className="text-white/80 mt-2">Vote for your favorite players</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' 
                      : 'bg-black/40 text-white/60'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 transition-colors ${
                    index <= currentStep ? 'text-yellow-400' : 'text-white/60'
                  }`}>
                    Step {index + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Voter Name */}
            {currentStep === 0 && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-8">What's your name?</h2>
                <div className="max-w-md mx-auto">
                  <input
                    type="text"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-xl text-white text-lg
                      placeholder:text-white/50 focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                  {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
              </motion.div>
            )}

            {/* Steps 2-4: Voting Categories */}
            {currentStep >= 1 && currentStep <= 3 && (
              <motion.div
                key={`voting-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">{steps[currentStep].title}</h2>
                  <p className="text-white/80">Select your choice for this category</p>
                  {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nominees[steps[currentStep].category as keyof typeof nominees].map((nominee) =>
                    renderNomineeCard(
                      nominee,
                      steps[currentStep].category!,
                      votes[steps[currentStep].category as keyof typeof votes] === nominee.name
                    )
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Summary */}
            {currentStep === 4 && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Confirm Your Votes</h2>
                  <p className="text-white/80">Please review your selections before submitting</p>
                  {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                </div>

                <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                      <span className="text-white/80">Voter:</span>
                      <span className="text-white font-medium">{voterName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                      <span className="text-white/80">Newcomer of the Season:</span>
                      <span className="text-yellow-400 font-medium">{votes.newcomer}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                      <span className="text-white/80">Player of the Season:</span>
                      <span className="text-yellow-400 font-medium">{votes.playerOfSeason}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-4">
                      <span className="text-white/80">Most Improved Player:</span>
                      <span className="text-yellow-400 font-medium">{votes.mostImproved}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <motion.button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'bg-black/20 text-white/40 cursor-not-allowed'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
              whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            {currentStep < 4 ? (
              <motion.button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 
                  text-black font-medium rounded-xl hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 
                  text-white font-medium rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                whileTap={!isSubmitting ? { scale: 0.95 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Votes
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}