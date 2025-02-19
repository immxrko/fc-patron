'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Minus, Goal, Clock, User } from 'lucide-react'
import type { Match, Player, MatchEvent, MatchLineup, EventType } from '@/types/database'

interface UpdateMatchModalProps {
  match: Match
  players: Player[]
  matches: Match[]
  onClose: () => void
  onUpdate: (match: Match, events: MatchEvent[], lineup: MatchLineup[]) => void
}

export default function UpdateMatchModal({ match, players, matches, onClose, onUpdate }: UpdateMatchModalProps) {
  const [activeTab, setActiveTab] = useState<'score' | 'lineup' | 'events'>('score')
  const [homeScore, setHomeScore] = useState(match.HomeScore || 0)
  const [awayScore, setAwayScore] = useState(match.AwayScore || 0)
  const [starters, setStarters] = useState<number[]>([])
  const [subs, setSubs] = useState<number[]>([])
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [newEvent, setNewEvent] = useState({
    playerID: '',
    type: 'GOAL' as EventType['type'],
    minute: '',
    assistPlayerID: '',
    subInPlayerID: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showSubInDropdown, setShowSubInDropdown] = useState(false)

  const handleSave = () => {
    const lineup: MatchLineup[] = [
      ...starters.map(playerID => ({ MatchID: match.ID, PlayerID: playerID, IsStarter: true })),
      ...subs.map(playerID => ({ MatchID: match.ID, PlayerID: playerID, IsStarter: false }))
    ]

    onUpdate(
      { ...match, HomeScore: homeScore, AwayScore: awayScore, Played: true },
      events,
      lineup
    )
  }

  const addEvent = () => {
    if (!newEvent.minute || !newEvent.playerID) return

    if (newEvent.type === 'YELLOW') {
      // Check if player already has a yellow card
      const existingYellows = events.filter(e => 
        e.PlayerID === Number(newEvent.playerID) && 
        e.EventDetails.type === 'YELLOW'
      ).length

      if (existingYellows > 0) {
        // Add yellow/red card instead of second yellow
        setEvents([
          ...events,
          {
            ID: events.length + 1,
            MatchID: match.ID,
            PlayerID: Number(newEvent.playerID),
            Minute: Number(newEvent.minute),
            EventDetails: { type: 'YELLOW_RED' }
          }
        ])
      } else {
        // Add normal yellow card
        setEvents([
          ...events,
          {
            ID: events.length + 1,
            MatchID: match.ID,
            PlayerID: Number(newEvent.playerID),
            Minute: Number(newEvent.minute),
            EventDetails: { type: 'YELLOW' }
          }
        ])
      }
    } else if (newEvent.type === 'SUBSTITUTION_IN') {
      if (!newEvent.subInPlayerID) return
      
      setEvents([
        ...events,
        {
          ID: events.length + 1,
          MatchID: match.ID,
          PlayerID: Number(newEvent.playerID),
          Minute: Number(newEvent.minute),
          EventDetails: { type: 'SUBSTITUTION_OUT' }
        },
        {
          ID: events.length + 2,
          MatchID: match.ID,
          PlayerID: Number(newEvent.subInPlayerID),
          Minute: Number(newEvent.minute),
          EventDetails: { type: 'SUBSTITUTION_IN' }
        }
      ])
    } else {
      // Add single event (goal or card)
      setEvents([
        ...events,
        {
          ID: events.length + 1,
          MatchID: match.ID,
          PlayerID: Number(newEvent.playerID),
          Minute: Number(newEvent.minute),
          EventDetails: {
            type: newEvent.type,
            ...(newEvent.type === 'GOAL' && newEvent.assistPlayerID 
              ? { assistPlayerID: Number(newEvent.assistPlayerID) }
              : {})
          }
        }
      ])
    }

    setNewEvent({ 
      playerID: '', 
      type: 'GOAL', 
      minute: '', 
      assistPlayerID: '', 
      subInPlayerID: '' 
    })
  }

  const findLastLineup = () => {
    const allMatches = matches
      .filter(m => m.IsU23 === match.IsU23)
      .filter(m => m.Lineup && m.Lineup.length > 0)
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())

    const lastMatch = allMatches[0]
    if (!lastMatch?.Lineup) return null

    const lastStarters = lastMatch.Lineup.filter(p => p.IsStarter).map(p => p.PlayerID)
    const lastSubs = lastMatch.Lineup.filter(p => !p.IsStarter).map(p => p.PlayerID)

    return { starters: lastStarters, subs: lastSubs }
  }

  // Add helper function to check if player is sent off
  const isPlayerSentOff = (playerId: number) => {
    return events.some(e => 
      e.PlayerID === playerId && 
      (e.EventDetails.type === 'RED' || e.EventDetails.type === 'YELLOW_RED')
    )
  }

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.sub-in-dropdown')) {
        setShowSubInDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSubInDropdown])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/90 border border-white/5 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Update Match Details</h3>
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['score', 'lineup', 'events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${activeTab === tab 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-black/20 text-gray-400 hover:bg-black/40'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">{match.HomeTeam}</span>
                  <img 
                    src="https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png" 
                    alt={match.HomeTeam}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-4 h-4 text-gray-400" />
                  </motion.button>
                  <span className="text-3xl font-bold text-white w-12">{homeScore}</span>
                  <motion.button
                    onClick={() => setHomeScore(homeScore + 1)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </div>
              </div>
              <span className="text-2xl text-gray-400">:</span>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src="https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png" 
                    alt={match.AwayTeam}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm text-gray-400">{match.AwayTeam}</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-4 h-4 text-gray-400" />
                  </motion.button>
                  <span className="text-3xl font-bold text-white w-12">{awayScore}</span>
                  <motion.button
                    onClick={() => setAwayScore(awayScore + 1)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lineup Tab */}
        {activeTab === 'lineup' && (
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                  text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div className="flex justify-end">
              <motion.button
                onClick={() => {
                  const lastLineup = findLastLineup()
                  if (lastLineup) {
                    setStarters(lastLineup.starters)
                    setSubs(lastLineup.subs)
                  }
                }}
                className="px-4 py-2 bg-black/20 hover:bg-black/40 
                  rounded-xl text-gray-400 text-sm font-medium transition-colors
                  flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="w-4 h-4" />
                Import Last {match.IsU23 ? 'U23 ' : ''}Lineup
              </motion.button>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Starting Lineup</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {players
                  .filter(player => player.isActive)
                  .filter(player => 
                    player.Name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(player => (
                    <div
                      key={player.ID}
                      onClick={() => {
                        if (starters.includes(player.ID)) {
                          setStarters(starters.filter(id => id !== player.ID))
                        } else if (starters.length < 11) {
                          setStarters([...starters, player.ID])
                        }
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2
                        ${starters.includes(player.ID)
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-black/20 border border-white/5 hover:bg-black/40'}`}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{player.Name}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Substitutes</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {players
                  .filter(player => !starters.includes(player.ID))
                  .map(player => (
                    <div
                      key={player.ID}
                      onClick={() => {
                        if (subs.includes(player.ID)) {
                          setSubs(subs.filter(id => id !== player.ID))
                        } else if (subs.length < 7) {
                          setSubs([...subs, player.ID])
                        }
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2
                        ${subs.includes(player.ID)
                          ? 'bg-blue-500/10 border border-blue-500/20'
                          : 'bg-black/20 border border-white/5 hover:bg-black/40'}`}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{player.Name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Event Type Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setNewEvent({ ...newEvent, type: 'GOAL' })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2
                  ${newEvent.type === 'GOAL' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-black/20 text-gray-400 hover:bg-black/40'}`}
              >
                Goal
              </button>
              <button
                onClick={() => setNewEvent({ ...newEvent, type: 'SUBSTITUTION_IN' })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2
                  ${newEvent.type === 'SUBSTITUTION_IN' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-black/20 text-gray-400 hover:bg-black/40'}`}
              >
                Substitution
              </button>
              <button
                onClick={() => setNewEvent({ ...newEvent, type: 'YELLOW' })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2
                  ${(newEvent.type === 'YELLOW' || newEvent.type === 'RED')
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-black/20 text-gray-400 hover:bg-black/40'}`}
              >
                Card
              </button>
            </div>

            {/* Event Details Form */}
            <div className="space-y-4">
              {/* Goal Form */}
              {newEvent.type === 'GOAL' && (
                <div className="flex gap-2">
                  <select
                    value={newEvent.playerID}
                    onChange={(e) => setNewEvent({ ...newEvent, playerID: e.target.value })}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  >
                    <option value="">Scorer</option>
                    {[...starters, ...subs].map(id => {
                      const player = players.find(p => p.ID === id)
                      if (!player) return null
                      return <option key={player.ID} value={player.ID}>{player.Name}</option>
                    })}
                  </select>

                  <select
                    value={newEvent.assistPlayerID}
                    onChange={(e) => setNewEvent({ ...newEvent, assistPlayerID: e.target.value })}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  >
                    <option value="">Assist (Optional)</option>
                    {[...starters, ...subs]
                      .filter(id => id !== Number(newEvent.playerID))
                      .map(id => {
                        const player = players.find(p => p.ID === id)
                        if (!player) return null
                        return <option key={player.ID} value={player.ID}>{player.Name}</option>
                      })}
                  </select>

                  <input
                    type="number"
                    placeholder="Min"
                    value={newEvent.minute}
                    onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
                    className="w-20 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  />
                </div>
              )}

              {/* Substitution Form */}
              {newEvent.type === 'SUBSTITUTION_IN' && (
                <div className="flex gap-2">
                  {/* Player In Selection */}
                  <div className="flex-1 relative sub-in-dropdown">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search players to sub in..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setShowSubInDropdown(true)
                        }}
                        onFocus={() => setShowSubInDropdown(true)}
                        className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                          text-white focus:outline-none focus:border-red-500/50"
                      />
                    </div>

                    {showSubInDropdown && (
                      <div 
                        className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto 
                          bg-black/90 border border-white/5 rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {players
                          .filter(player => 
                            player.isActive && 
                            !starters.includes(player.ID) &&
                            !subs.includes(player.ID) &&
                            player.Name.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map(player => (
                            <div
                              key={player.ID}
                              onClick={(e) => {
                                e.stopPropagation()
                                setNewEvent(prev => ({ 
                                  ...prev, 
                                  subInPlayerID: player.ID.toString() 
                                }))
                                setSearchTerm(player.Name)
                                setShowSubInDropdown(false)
                              }}
                              className="px-4 py-2 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                            >
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-white">{player.Name}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Player Out Selection */}
                  <select
                    value={newEvent.playerID}
                    onChange={(e) => setNewEvent({ ...newEvent, playerID: e.target.value })}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  >
                    <option value="">Player Out</option>
                    {starters.map(id => {
                      const player = players.find(p => p.ID === id)
                      if (!player) return null
                      return <option key={player.ID} value={player.ID}>{player.Name}</option>
                    })}
                  </select>

                  <input
                    type="number"
                    placeholder="Min"
                    value={newEvent.minute}
                    onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
                    className="w-20 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  />
                </div>
              )}

              {/* Card Form */}
              {(newEvent.type === 'YELLOW' || newEvent.type === 'RED') && (
                <div className="flex gap-2">
                  <select
                    value={newEvent.playerID}
                    onChange={(e) => setNewEvent({ ...newEvent, playerID: e.target.value })}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  >
                    <option value="">Player</option>
                    {[...starters, ...subs]
                      .filter(id => !isPlayerSentOff(id)) // Filter out sent off players
                      .map(id => {
                        const player = players.find(p => p.ID === id)
                        if (!player) return null
                        return <option key={player.ID} value={player.ID}>{player.Name}</option>
                      })}
                  </select>

                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType['type'] })}
                    className="w-32 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  >
                    <option value="YELLOW">Yellow</option>
                    <option value="RED">Red</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Min"
                    value={newEvent.minute}
                    onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
                    className="w-20 px-4 py-2 bg-black/20 border border-white/5 rounded-xl"
                  />
                </div>
              )}

              {/* Add Button */}
              {newEvent.type && (
                <motion.button
                  onClick={addEvent}
                  className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                    rounded-xl text-red-400 text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Event
                </motion.button>
              )}
            </div>

            {/* Events List */}
            <div className="space-y-2">
              {events
                .sort((a, b) => a.Minute - b.Minute)
                // First filter out all SUBSTITUTION_IN events
                .filter(event => event.EventDetails.type !== 'SUBSTITUTION_IN')
                .reduce((acc: MatchEvent[], event, index) => {
                  // If this is a SUB_OUT, find and combine with its SUB_IN
                  if (event.EventDetails.type === 'SUBSTITUTION_OUT') {
                    const subIn = events.find(e => 
                      e.EventDetails.type === 'SUBSTITUTION_IN' && 
                      e.Minute === event.Minute
                    )
                    if (subIn) {
                      return [...acc, { ...event, relatedEvent: subIn }]
                    }
                  }
                  return [...acc, event]
                }, [])
                .map(event => {
                  const player = players.find(p => p.ID === event.PlayerID)
                  const assist = event.EventDetails.type === 'GOAL' 
                    ? players.find(p => p.ID === (event.EventDetails as { type: 'GOAL', assistPlayerID?: number }).assistPlayerID) 
                    : null

                  if (!player) return null

                  return (
                    <div
                      key={event.ID}
                      className="p-3 bg-black/20 border border-white/5 rounded-lg 
                        flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{event.Minute}'</span>
                        <span className="text-sm text-white">
                          {event.EventDetails.type === 'SUBSTITUTION_OUT' && 'relatedEvent' in event ? (
                            <>
                              <span className="text-red-400">{player.Name}</span>
                              <span className="text-gray-400 mx-2">→</span>
                              <span className="text-green-400">
                                {players.find(p => p.ID === (event as any).relatedEvent.PlayerID)?.Name}
                              </span>
                            </>
                          ) : (
                            <>
                              {player.Name}
                              {assist && <span className="text-gray-400"> (Assist: {assist.Name})</span>}
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          {event.EventDetails.type === 'SUBSTITUTION_OUT' 
                            ? 'Substitution'
                            : event.EventDetails.type === 'YELLOW_RED' 
                              ? 'Second Yellow' 
                              : event.EventDetails.type.replace('_', ' ')}
                        </span>
                        <motion.button
                          onClick={() => {
                            if (event.EventDetails.type === 'SUBSTITUTION_OUT' && 'relatedEvent' in event) {
                              // Remove both SUB_OUT and SUB_IN events
                              setEvents(events.filter(e => 
                                e.ID !== event.ID && 
                                e.ID !== (event as any).relatedEvent.ID
                              ))
                            } else {
                              setEvents(events.filter(e => e.ID !== event.ID))
                            }
                          }}
                          className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </motion.button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-white/5">
          <motion.button
            onClick={onClose}
            className="px-4 py-2 bg-black/20 hover:bg-black/40 
              rounded-xl text-gray-400 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSave}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
              rounded-xl text-red-400 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
} 