'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, TrendingUp, Award, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'
import LoginScreen from '@/components/auth/LoginScreen'
import LoadingScreen from '@/components/ui/LoadingScreen'
import type { User } from '@supabase/supabase-js'

interface VoteResult {
  name: string
  votes: number
  percentage: number
  image: string
}

interface AwardResults {
  newcomer: VoteResult[]
  playerOfSeason: VoteResult[]
  mostImproved: VoteResult[]
  totalVotes: number
}

interface ScratchCardProps {
  title: string
  icon: any
  winner: VoteResult
  onReveal: () => void
  isRevealed: boolean
  canReveal: boolean
}

function ScratchCard({ title, icon: Icon, winner, onReveal, isRevealed, canReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScratching, setIsScratching] = useState(false)
  const [scratchPercentage, setScratchPercentage] = useState(0)

  useEffect(() => {
    if (!canvasRef.current || isRevealed) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Create scratch surface
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#FFD700')
    gradient.addColorStop(0.5, '#FFA500')
    gradient.addColorStop(1, '#FF8C00')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add FC Patron logo pattern
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#000'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    
    for (let y = 30; y < canvas.height; y += 60) {
      for (let x = 50; x < canvas.width; x += 100) {
        ctx.fillText('FC PATRON', x, y)
      }
    }
    
    ctx.globalAlpha = 1
    ctx.fillStyle = '#000'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 4, canvas.height / 4)
    
    // Add trophy icon
    ctx.font = '48px Arial'
    ctx.fillText('🏆', canvas.width / 4, canvas.height / 4 + 50)

  }, [isRevealed])

  const scratch = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !canReveal || isRevealed) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * 2
    const y = (e.clientY - rect.top) * 2

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 30, 0, 2 * Math.PI)
    ctx.fill()

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparentPixels = 0

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100
    setScratchPercentage(percentage)

    if (percentage > 30) {
      onReveal()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isScratching) {
      scratch(e)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <Icon className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      </div>

      {/* Scratch Area */}
      <div className="relative h-80 p-6">
        {/* Winner Content (behind scratch layer) */}
        <div className="absolute inset-6 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: isRevealed ? 1 : 0.8, 
              opacity: isRevealed ? 1 : 0 
            }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-24 h-24 mb-4">
              <img
                src={winner.image}
                alt={winner.name}
                className="w-full h-full object-cover object-top rounded-full border-4 border-yellow-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                }}
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-black" />
              </div>
            </div>
            
            <h4 className="text-2xl font-bold text-white mb-2">{winner.name}</h4>
            <div className="flex items-center gap-2 text-yellow-500">
              <span className="text-lg font-bold">{winner.votes} votes</span>
              <span className="text-sm">({winner.percentage}%)</span>
            </div>
          </motion.div>
        </div>

        {/* Scratch Canvas */}
        {!isRevealed && canReveal && (
          <canvas
            ref={canvasRef}
            className="absolute inset-6 w-full h-full cursor-pointer rounded-xl"
            onMouseDown={() => setIsScratching(true)}
            onMouseUp={() => setIsScratching(false)}
            onMouseLeave={() => setIsScratching(false)}
            onMouseMove={handleMouseMove}
            onClick={scratch}
          />
        )}

        {/* Waiting State */}
        {!canReveal && !isRevealed && (
          <div className="absolute inset-6 flex items-center justify-center bg-black/40 rounded-xl border-2 border-dashed border-white/20">
            <div className="text-center">
              <Eye className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 font-medium">Waiting for previous reveal...</p>
            </div>
          </div>
        )}
      </div>

      {/* Reveal Button (fallback) */}
      {canReveal && !isRevealed && (
        <div className="p-6 border-t border-white/10">
          <motion.button
            onClick={onReveal}
            className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:scale-105 transition-transform"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reveal Winner
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

export default function AdminAwards() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [results, setResults] = useState<AwardResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set())
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0)
  const [showAllResults, setShowAllResults] = useState(false)
  const { checkAdminStatus } = useAdmin()

  const awards = [
    { key: 'newcomer', title: 'Newcomer of the Season', icon: Star },
    { key: 'playerOfSeason', title: 'Player of the Season', icon: Trophy },
    { key: 'mostImproved', title: 'Most Improved Player', icon: TrendingUp }
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      setUser(currentUser ?? null)
      
      if (currentUser) {
        const isUserAdmin = await checkAdminStatus(currentUser.id)
        setIsAdmin(isUserAdmin)
      } else {
        setIsAdmin(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user
      setUser(currentUser ?? null)
      
      if (currentUser) {
        const isUserAdmin = await checkAdminStatus(currentUser.id)
        setIsAdmin(isUserAdmin)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [checkAdminStatus])

  useEffect(() => {
    if (isAdmin) {
      fetchVotingResults()
    }
  }, [isAdmin])

  const fetchVotingResults = async () => {
    try {
      setLoading(true)

      // Fetch all votes
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('*')

      if (votesError) throw votesError

      if (!votes || votes.length === 0) {
        setResults({
          newcomer: [],
          playerOfSeason: [],
          mostImproved: [],
          totalVotes: 0
        })
        return
      }

      // Count votes for each category
      const newcomerVotes: { [key: string]: number } = {}
      const playerOfSeasonVotes: { [key: string]: number } = {}
      const mostImprovedVotes: { [key: string]: number } = {}

      votes.forEach(vote => {
        newcomerVotes[vote.newcomer_vote] = (newcomerVotes[vote.newcomer_vote] || 0) + 1
        playerOfSeasonVotes[vote.player_of_season_vote] = (playerOfSeasonVotes[vote.player_of_season_vote] || 0) + 1
        mostImprovedVotes[vote.most_improved_vote] = (mostImprovedVotes[vote.most_improved_vote] || 0) + 1
      })

      // Get all unique player names
      const allPlayerNames = [
        ...Object.keys(newcomerVotes),
        ...Object.keys(playerOfSeasonVotes),
        ...Object.keys(mostImprovedVotes)
      ]

      // Fetch player images
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('Name, BildURL')
        .in('Name', allPlayerNames)

      if (playersError) throw playersError

      const playerImageMap = new Map()
      players?.forEach(player => {
        playerImageMap.set(player.Name, player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png')
      })

      // Process results
      const processVotes = (votesObj: { [key: string]: number }) => {
        return Object.entries(votesObj)
          .map(([name, voteCount]) => ({
            name,
            votes: voteCount,
            percentage: Math.round((voteCount / votes.length) * 100),
            image: playerImageMap.get(name) || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
          }))
          .sort((a, b) => b.votes - a.votes)
      }

      setResults({
        newcomer: processVotes(newcomerVotes),
        playerOfSeason: processVotes(playerOfSeasonVotes),
        mostImproved: processVotes(mostImprovedVotes),
        totalVotes: votes.length
      })

    } catch (error) {
      console.error('Error fetching voting results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReveal = (awardKey: string) => {
    setRevealedCards(prev => new Set([...prev, awardKey]))
    if (currentRevealIndex < awards.length - 1) {
      setCurrentRevealIndex(prev => prev + 1)
    }
  }

  const resetReveals = () => {
    setRevealedCards(new Set())
    setCurrentRevealIndex(0)
  }

  if (isAdmin === null || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-red-500/20 text-center"
        >
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don&apos;t have permission to access the admin panel.</p>
          <motion.button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Out
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80">Loading voting results...</p>
        </div>
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
                Season Awards Results
              </h1>
              <p className="text-white/80 mt-2">
                {results.totalVotes} total votes • Scratch to reveal winners
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={resetReveals}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 rounded-xl text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Cards
            </motion.button>
            
            <motion.button
              onClick={() => setShowAllResults(!showAllResults)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showAllResults ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAllResults ? 'Hide' : 'Show'} All Results
            </motion.button>
          </div>
        </motion.div>

        {/* Scratch Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {awards.map((award, index) => {
            const categoryResults = results[award.key as keyof AwardResults] as VoteResult[]
            const winner = categoryResults[0]
            
            if (!winner) return null

            return (
              <ScratchCard
                key={award.key}
                title={award.title}
                icon={award.icon}
                winner={winner}
                onReveal={() => handleReveal(award.key)}
                isRevealed={revealedCards.has(award.key)}
                canReveal={index === currentRevealIndex}
              />
            )
          })}
        </div>

        {/* Detailed Results */}
        <AnimatePresence>
          {showAllResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-8"
            >
              {awards.map((award) => {
                const categoryResults = results[award.key as keyof AwardResults] as VoteResult[]
                
                return (
                  <div key={award.key} className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <award.icon className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-bold text-white">{award.title}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {categoryResults.map((result, index) => (
                        <div key={result.name} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                          <div className="flex items-center gap-3 flex-1">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              index === 2 ? 'bg-orange-600 text-white' :
                              'bg-black/40 text-white'
                            }`}>
                              {index + 1}
                            </span>
                            
                            <img
                              src={result.image}
                              alt={result.name}
                              className="w-12 h-12 object-cover object-top rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                              }}
                            />
                            
                            <div>
                              <h4 className="font-bold text-white">{result.name}</h4>
                              <p className="text-sm text-gray-400">{result.votes} votes ({result.percentage}%)</p>
                            </div>
                          </div>
                          
                          <div className="w-32">
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${result.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}