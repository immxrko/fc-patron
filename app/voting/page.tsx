'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, TrendingUp, Check, ArrowRight, ArrowLeft, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Nominee {
  name: string
  image: string
}

const nomineeNames = {
  newcomer: [
    'JEFIMIC Nedeljko',
    'IZVERNAR Iosif-Cornel',
    'ZIVKOVIC Stefan',
    'RAMHAPP Elias',
    'SULJIC Mathias'
  ],
  playerOfSeason: [
    'SAGIROGLU Ogulcan',
    'ANICIC-ZUPARIC Lukas',
    'PRIBILL Adrian',
    'JORGANOVIC Philipp',
    'ULUSOY Burak'
  ],
  mostImproved: [
    'SCHUCKERT Luca',
    'SAGIROGLU Ogulcan',
    'ZIER Alessandro',
    'DRAGONI Paul',
    'MOSER Sebastian'
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
  const [nominees, setNominees] = useState<{
    newcomer: Nominee[]
    playerOfSeason: Nominee[]
    mostImproved: Nominee[]
  }>({
    newcomer: [],
    playerOfSeason: [],
    mostImproved: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const steps = [
    { title: 'Your Information', icon: Star },
    { title: 'Newcomer of the Season', icon: Star, category: 'newcomer' },
    { title: 'Player of the Season', icon: Trophy, category: 'playerOfSeason' },
    { title: 'Most Improved Player', icon: TrendingUp, category: 'mostImproved' },
    { title: 'Confirm Your Votes', icon: Check }
  ]

  // Fetch player images from database
  useEffect(() => {
    const fetchPlayerImages = async () => {
      try {
        setLoading(true)
        
        // Get all nominee names
        const allNames = [
          ...nomineeNames.newcomer,
          ...nomineeNames.playerOfSeason,
          ...nomineeNames.mostImproved
        ]

        // Fetch player data from database
        const { data: players, error } = await supabase
          .from('players')
          .select('Name, BildURL')
          .in('Name', allNames)

        if (error) throw error

        // Create a map of player names to images
        const playerImageMap = new Map()
        players?.forEach(player => {
          playerImageMap.set(player.Name, player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png')
        })

        // Build nominees object with images
        const nomineesWithImages = {
          newcomer: nomineeNames.newcomer.map(name => ({
            name,
            image: playerImageMap.get(name) || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
          })),
          playerOfSeason: nomineeNames.playerOfSeason.map(name => ({
            name,
            image: playerImageMap.get(name) || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
          })),
          mostImproved: nomineeNames.mostImproved.map(name => ({
            name,
            image: playerImageMap.get(name) || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
          }))
        }

        setNominees(nomineesWithImages)
      } catch (error) {
        console.error('Error fetching player images:', error)
        // Fallback to default images if database fetch fails
        const fallbackNominees = {
          newcomer: nomineeNames.newcomer.map(name => ({
            name,
            image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
          })),
          playerOfSeason: nomineeNames.playerOfSeason.map(name => ({
            name,
            image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
          })),
          mostImproved: nomineeNames.mostImproved.map(name => ({
            name,
            image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
          }))
        }
        setNominees(fallbackNominees)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerImages()
  }, [])

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

  // Helper function to get nominee image by name
  const getNomineeImage = (name: string) => {
    const allNominees = [...nominees.newcomer, ...nominees.playerOfSeason, ...nominees.mostImproved]
    const nominee = allNominees.find(n => n.name === name)
    return nominee?.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
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
            className="w-full h-full object-cover object-top rounded-full border-2 border-white/20"
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

  const renderSummaryCard = (title: string, voteName: string, icon: any, delay: number) => {
    const IconComponent = icon
    const nomineeImage = getNomineeImage(voteName)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-yellow-500/30 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          {/* Award Icon */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
            <IconComponent className="w-8 h-8 text-yellow-500" />
          </div>
          
          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-yellow-400 mb-1">{title}</h3>
            <p className="text-lg font-bold text-white truncate">{voteName}</p>
          </div>
          
          {/* Player Image */}
          <div className="flex-shrink-0 relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500/30">
              <img
                src={nomineeImage}
                alt={voteName}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                }}
              />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80">Loading nominees...</p>
        </motion.div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pb-24 md:pb-4">
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
    <div className="min-h-screen relative overflow-hidden pb-24 md:pb-0">
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

            {/* Step 5: Enhanced Summary */}
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

                <div className="space-y-6">
                  {/* Voter Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
                        <Award className="w-8 h-8 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-red-400 mb-1">Voter</h3>
                        <p className="text-2xl font-bold text-white">{voterName}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Award Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderSummaryCard("Newcomer of the Season", votes.newcomer, Star, 0.1)}
                    {renderSummaryCard("Player of the Season", votes.playerOfSeason, Trophy, 0.2)}
                    {renderSummaryCard("Most Improved Player", votes.mostImproved, TrendingUp, 0.3)}
                  </div>

                  {/* Final Confirmation */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-6 text-center"
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Check className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-bold text-white">Ready to Submit</h3>
                    </div>
                    <p className="text-white/80">
                      By submitting, you confirm that these are your final votes for the FC Patron Season Awards 2024/25.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 mb-8">
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