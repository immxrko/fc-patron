'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Trophy, 
  Save, 
  Users, 
  Goal, 
  Clock, 
  Award, 
  Check, 
  Search,
  Plus,
  Minus,
  X,
  User,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'
import type { MatchDetail, Player } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface EditGameProps {
  match: MatchDetail
  onBack: () => void
  players: Player[]
  onUpdate: () => void
}

interface GameEvent {
  id: string
  type: 'goal' | 'assist' | 'yellow' | 'red' | 'sub_out' | 'sub_in'
  playerId: number
  minute: number
  relatedPlayerId?: number // For assists and substitutions
}

export default function EditGame({ match, onBack, players, onUpdate }: EditGameProps) {
  const [activeSection, setActiveSection] = useState<'result' | 'lineup' | 'events'>('result')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Result state
  const [homeScore, setHomeScore] = useState<number>(
    match.ishomegame 
      ? parseInt(match.result?.split(':')[0] || '0')
      : parseInt(match.result?.split(':')[1] || '0')
  )
  const [awayScore, setAwayScore] = useState<number>(
    match.ishomegame 
      ? parseInt(match.result?.split(':')[1] || '0')
      : parseInt(match.result?.split(':')[0] || '0')
  )

  // Lineup state
  const [selectedStarters, setSelectedStarters] = useState<number[]>([])
  const [selectedSubs, setSelectedSubs] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [isLoadingLineup, setIsLoadingLineup] = useState(true)

  // Events state
  const [events, setEvents] = useState<GameEvent[]>([])

  const sections = [
    { id: 'result', label: 'Result', icon: Trophy },
    { id: 'lineup', label: 'Lineup', icon: Users },
    { id: 'events', label: 'Events', icon: Goal },
  ]

  // Fetch existing lineup
  useEffect(() => {
    const fetchLineup = async () => {
      try {
        const { data: startersData, error: startersError } = await supabase
          .from('lineup')
          .select('playerid')
          .eq('matchid', match.matchid)
          .eq('isstarter', true)

        if (startersError) throw startersError

        const { data: subsData, error: subsError } = await supabase
          .from('lineup')
          .select('playerid')
          .eq('matchid', match.matchid)
          .eq('isstarter', false)

        if (subsError) throw subsError

        setSelectedStarters(startersData?.map(item => item.playerid) || [])
        setSelectedSubs(subsData?.map(item => item.playerid) || [])
      } catch (error) {
        console.error('Error fetching lineup:', error)
      } finally {
        setIsLoadingLineup(false)
      }
    }

    fetchLineup()
  }, [match.matchid])

  // Fetch existing events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('matchid', match.matchid)

        // Fetch assists
        const { data: assistsData } = await supabase
          .from('assists')
          .select('*')
          .eq('matchid', match.matchid)

        // Fetch cards
        const { data: cardsData } = await supabase
          .from('cards')
          .select('*')
          .eq('matchid', match.matchid)

        // Fetch substitutions
        const { data: subsData } = await supabase
          .from('lineup')
          .select('playerid, substitutein, substituteout')
          .eq('matchid', match.matchid)
          .or('substitutein.not.is.null,substituteout.not.is.null')

        const loadedEvents: GameEvent[] = []

        // Process goals and assists
        goalsData?.forEach((goal, index) => {
          loadedEvents.push({
            id: `goal-${goal.id}`,
            type: 'goal',
            playerId: goal.playerid,
            minute: 0 // You might want to add minute field to goals table
          })

          const assist = assistsData?.[index]
          if (assist) {
            loadedEvents.push({
              id: `assist-${assist.id}`,
              type: 'assist',
              playerId: assist.playerid,
              minute: 0,
              relatedPlayerId: goal.playerid
            })
          }
        })

        // Process cards
        cardsData?.forEach(card => {
          loadedEvents.push({
            id: `card-${card.id}`,
            type: card.isred ? 'red' : 'yellow',
            playerId: card.playerid,
            minute: 0
          })
        })

        // Process substitutions
        const subsByMinute = subsData?.reduce((acc, sub) => {
          if (sub.substituteout) {
            if (!acc[sub.substituteout]) acc[sub.substituteout] = { out: [], in: [] }
            acc[sub.substituteout].out.push(sub.playerid)
          }
          if (sub.substitutein) {
            if (!acc[sub.substitutein]) acc[sub.substitutein] = { out: [], in: [] }
            acc[sub.substitutein].in.push(sub.playerid)
          }
          return acc
        }, {} as Record<string, { out: number[]; in: number[] }>)

        Object.entries(subsByMinute || {}).forEach(([minute, players]) => {
          players.out.forEach((outId, index) => {
            if (players.in[index]) {
              loadedEvents.push({
                id: `sub-${minute}-${index}`,
                type: 'sub_out',
                playerId: outId,
                minute: parseInt(minute),
                relatedPlayerId: players.in[index]
              })
            }
          })
        })

        setEvents(loadedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    fetchEvents()
  }, [match.matchid])

  const handleSaveResult = async () => {
    if (homeScore < 0 || awayScore < 0) return
    
    setLoading(true)
    try {
      const patronScore = match.ishomegame ? homeScore : awayScore
      const opponentScore = match.ishomegame ? awayScore : homeScore
      
      const { error } = await supabase
        .from('matches')
        .update({ 
          result: `${patronScore}:${opponentScore}`
        })
        .eq('id', match.matchid)

      if (error) throw error
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      onUpdate()
    } catch (error) {
      console.error('Error saving result:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLineup = async () => {
    if (selectedStarters.length === 0) return
    
    setLoading(true)
    try {
      await supabase
        .from('lineup')
        .delete()
        .eq('matchid', match.matchid)
      
      const starterRows = selectedStarters.map(playerId => ({
        matchid: match.matchid,
        playerid: playerId,
        isstarter: true
      }))
      
      const subRows = selectedSubs.map(playerId => ({
        matchid: match.matchid,
        playerid: playerId,
        isstarter: false
      }))
      
      const { error } = await supabase
        .from('lineup')
        .insert([...starterRows, ...subRows])
        
      if (error) throw error
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      onUpdate()
    } catch (error) {
      console.error('Error saving lineup:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = (playerId: number) => {
    if (selectedStarters.includes(playerId)) {
      setSelectedStarters(prev => prev.filter(id => id !== playerId))
    } else if (selectedSubs.includes(playerId)) {
      setSelectedSubs(prev => prev.filter(id => id !== playerId))
    } else {
      if (selectedStarters.length < 11) {
        setSelectedStarters(prev => [...prev, playerId])
      } else {
        setSelectedSubs(prev => [...prev, playerId])
      }
    }
  }

  const getPlayerStatus = (playerId: number) => {
    if (selectedStarters.includes(playerId)) return 'starter'
    if (selectedSubs.includes(playerId)) return 'sub'
    return 'none'
  }

  const filteredPlayers = players.filter(player => 
    player.Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (showInactive || player.isActive)
  ).sort((a, b) => {
    const positionOrder: { [key: string]: number } = {
      'GK': 1, 'DEF': 2, 'MID': 3, 'ATT': 4
    }
    return (positionOrder[a.Position] || 5) - (positionOrder[b.Position] || 5)
  })

  const addEvent = (type: GameEvent['type']) => {
    const newEvent: GameEvent = {
      id: `temp-${Date.now()}`,
      type,
      playerId: 0,
      minute: 0
    }
    setEvents(prev => [...prev, newEvent])
  }

  const updateEvent = (id: string, updates: Partial<GameEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ))
  }

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  const getPlayerName = (playerId: number) => {
    return players.find(p => p.ID === playerId)?.Name || 'Unknown Player'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onBack}
              className="p-2 md:px-4 md:py-2 bg-black/20 hover:bg-black/40 
                rounded-xl text-gray-400 text-sm font-medium transition-colors 
                flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Back</span>
            </motion.button>
            <div className="flex items-center gap-3">
              <img 
                src={match.logourl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp9NXVuzcO7ncREpZSmAozghK0DghB8_G2Fw&s'} 
                alt={match.opponent_name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover bg-black/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp9NXVuzcO7ncREpZSmAozghK0DghB8_G2Fw&s';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-bold text-white">vs {match.opponent_name}</h2>
                  {match.km_res === 'RES' && (
                    <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 
                      text-xs font-medium rounded-md">
                      U23
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{match.date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-black/20 text-gray-400 hover:bg-black/40'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Result Section */}
          {activeSection === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full p-4 md:p-6"
            >
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-8 text-center">Match Result</h3>
                
                {/* Score Input */}
                <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">
                        {match.ishomegame ? 'FC Patron' : match.opponent_name}
                      </p>
                      <img 
                        src={match.ishomegame 
                          ? "https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
                          : match.logourl
                        }
                        alt="Team logo"
                        className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover mx-auto"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                        className="p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Minus className="w-4 h-4 text-gray-400" />
                      </motion.button>
                      <div className="w-16 h-16 bg-black/20 border border-white/5 rounded-xl 
                        flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{homeScore}</span>
                      </div>
                      <motion.button
                        onClick={() => setHomeScore(homeScore + 1)}
                        className="p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-gray-400">:</div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">
                        {match.ishomegame ? match.opponent_name : 'FC Patron'}
                      </p>
                      <img 
                        src={!match.ishomegame 
                          ? "https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
                          : match.logourl
                        }
                        alt="Team logo"
                        className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover mx-auto"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                        className="p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Minus className="w-4 h-4 text-gray-400" />
                      </motion.button>
                      <div className="w-16 h-16 bg-black/20 border border-white/5 rounded-xl 
                        flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{awayScore}</span>
                      </div>
                      <motion.button
                        onClick={() => setAwayScore(awayScore + 1)}
                        className="p-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleSaveResult}
                    disabled={loading}
                    className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 
                      rounded-xl text-red-400 font-medium transition-colors 
                      flex items-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {showSuccess ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {loading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Result'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lineup Section */}
          {activeSection === 'lineup' && (
            <motion.div
              key="lineup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {/* Lineup Header */}
              <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-white">Match Lineup</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                        selectedStarters.length === 11 
                          ? 'bg-green-500/10 text-green-400' 
                          : selectedStarters.length > 11
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {selectedStarters.length}/11
                      </span>
                      {selectedSubs.length > 0 && (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 
                          rounded-md text-sm font-medium">
                          +{selectedSubs.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => setShowInactive(!showInactive)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors 
                        flex items-center gap-2 ${
                          showInactive
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-black/20 text-gray-400 hover:bg-black/40'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="hidden md:inline">
                        {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={handleSaveLineup}
                      disabled={loading || selectedStarters.length === 0}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                        rounded-xl text-red-400 text-sm font-medium transition-colors 
                        flex items-center gap-2 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {showSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      <span className="hidden md:inline">
                        {loading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save'}
                      </span>
                    </motion.button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Players Grid */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredPlayers.map((player) => (
                    <motion.div
                      key={player.ID}
                      onClick={() => handlePlayerClick(player.ID)}
                      className={`relative p-3 rounded-xl border cursor-pointer 
                        transition-all ${
                          getPlayerStatus(player.ID) === 'starter'
                            ? 'bg-red-500/10 border-red-500/50'
                            : getPlayerStatus(player.ID) === 'sub'
                              ? 'bg-blue-500/10 border-blue-500/50'
                              : 'bg-black/20 border-white/5 hover:bg-black/40'
                        } ${isLoadingLineup ? 'opacity-50 pointer-events-none' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <img
                          src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                          alt={player.Name}
                          className="w-12 h-12 rounded-lg object-cover bg-black/20 mb-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                          }}
                        />
                        <h4 className="text-sm font-medium text-white truncate w-full">
                          {player.Name}
                        </h4>
                        <span className="text-xs text-gray-400">{player.Position}</span>
                      </div>
                      {getPlayerStatus(player.ID) !== 'none' && (
                        <div className="absolute top-2 right-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            getPlayerStatus(player.ID) === 'starter' 
                              ? 'bg-red-500' 
                              : 'bg-blue-500'
                          }`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Events Section */}
          {activeSection === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {/* Events Header */}
              <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Match Events</h3>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => addEvent('goal')}
                      className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 
                        rounded-xl text-green-400 text-sm font-medium transition-colors 
                        flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Goal className="w-4 h-4" />
                      <span className="hidden md:inline">Goal</span>
                    </motion.button>
                    <motion.button
                      onClick={() => addEvent('yellow')}
                      className="px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 
                        rounded-xl text-yellow-400 text-sm font-medium transition-colors 
                        flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Award className="w-4 h-4" />
                      <span className="hidden md:inline">Card</span>
                    </motion.button>
                    <motion.button
                      onClick={() => addEvent('sub_out')}
                      className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 
                        rounded-xl text-blue-400 text-sm font-medium transition-colors 
                        flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden md:inline">Sub</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Events List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-4">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      className="p-4 bg-black/20 rounded-xl border border-white/5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            event.type === 'goal' ? 'bg-green-500/20 text-green-400' :
                            event.type === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                            event.type === 'red' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {event.type === 'goal' && <Goal className="w-4 h-4" />}
                            {(event.type === 'yellow' || event.type === 'red') && <Award className="w-4 h-4" />}
                            {(event.type === 'sub_out' || event.type === 'sub_in') && <RotateCcw className="w-4 h-4" />}
                          </div>
                          
                          <div className="flex-1">
                            <select
                              value={event.playerId}
                              onChange={(e) => updateEvent(event.id, { playerId: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 bg-black/20 border border-white/5 
                                rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
                            >
                              <option value={0}>Select player</option>
                              {[...selectedStarters, ...selectedSubs].map(id => {
                                const player = players.find(p => p.ID === id)
                                if (!player) return null
                                return (
                                  <option key={player.ID} value={player.ID}>
                                    {player.Name}
                                  </option>
                                )
                              })}
                            </select>
                          </div>

                          <input
                            type="number"
                            placeholder="Min"
                            value={event.minute || ''}
                            onChange={(e) => updateEvent(event.id, { minute: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-2 bg-black/20 border border-white/5 
                              rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
                          />
                        </div>

                        <motion.button
                          onClick={() => removeEvent(event.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </motion.button>
                      </div>

                      {event.playerId > 0 && (
                        <div className="mt-2 text-sm text-gray-400">
                          {event.type === 'goal' && '⚽ Goal'}
                          {event.type === 'yellow' && '🟨 Yellow Card'}
                          {event.type === 'red' && '🟥 Red Card'}
                          {event.type === 'sub_out' && '🔄 Substitution'}
                          {' • '}
                          {getPlayerName(event.playerId)}
                          {event.minute > 0 && ` • ${event.minute}'`}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {events.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-400 mb-2">No events yet</h4>
                      <p className="text-gray-500">Add goals, cards, or substitutions using the buttons above</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-6 right-6 
              px-4 py-3 bg-green-500/10 text-green-400 rounded-xl 
              border border-green-500/20 text-sm font-medium
              flex items-center gap-2 shadow-lg backdrop-blur-sm z-50"
          >
            <Check className="w-4 h-4" />
            Changes saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}