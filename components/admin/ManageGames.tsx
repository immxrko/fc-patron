'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Plus, Trophy, Edit2, Trash2 } from 'lucide-react'
import type { Match, Opponent, MatchEvent, MatchLineup, Player, GameType, Season } from '@/types/database'
import UpdateMatchModal from './UpdateMatchModal'
import { supabase } from '@/lib/supabase'

// Sample data
const SAMPLE_OPPONENTS: Opponent[] = [
  { 
    ID: 1, 
    Name: 'FC Bayern München', 
    HasU23: true, 
    Logo: 'https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png'
  },
  { 
    ID: 2, 
    Name: 'Borussia Dortmund', 
    HasU23: true, 
    Logo: 'https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png'
  },
  { 
    ID: 3, 
    Name: 'SV Werder Bremen', 
    HasU23: true, 
    Logo: 'https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png'
  },
  { 
    ID: 4, 
    Name: 'FC St. Pauli', 
    HasU23: false, 
    Logo: 'https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png'
  },
]

const SAMPLE_MATCHES: Match[] = [
  {
    ID: 1,
    Date: '2024-03-15',
    HomeTeam: 'FC Patron',
    AwayTeam: 'FC Bayern München',
    HomeScore: 2,
    AwayScore: 1,
    IsU23: false,
    Season: '2023/24',
    Played: true,
    Type: 'LEAGUE',
    Venue: 'Sportplatz am Goldstein'
  },
  {
    ID: 2,
    Date: '2024-03-15',
    HomeTeam: 'FC Patron II',
    AwayTeam: 'FC Bayern München II',
    HomeScore: 1,
    AwayScore: 1,
    IsU23: true,
    Season: '2023/24',
    Played: true,
    Type: 'LEAGUE',
    Venue: 'Sportplatz am Goldstein'
  },
  {
    ID: 3,
    Date: '2024-04-20',
    HomeTeam: 'Borussia Dortmund',
    AwayTeam: 'FC Patron',
    IsU23: false,
    Season: '2023/24',
    Played: false,
    Type: 'LEAGUE',
    Venue: 'Sportplatz am Goldstein'
  }
]

// Add sample cup competitions
const CUP_COMPETITIONS = [
  'DFB-Pokal',
  'Hessenpokal',
  'Kreispokal Hochtaunus',
  'Verbandspokal'
]

// Add sample leagues
const OPPONENT_LEAGUES = [
  'Bundesliga',
  'Regionalliga',
  'Oberliga',
  'Verbandsliga',
  'Gruppenliga',
  'Kreisoberliga',
  'Kreisliga A',
  'Kreisliga B'
]

// Add sample venues
const VENUES = [
  'Sportplatz am Goldstein',
  'Sportplatz Kalbach',
  'Stadion am Bornheimer Hang',
  'Deutsche Bank Park',
  'Sportplatz Riederwald',
  'Sportplatz Seckbach'
]

// Add constant for home venue
const HOME_VENUE = 'Sportplatz am Goldstein'

interface ManageGamesProps {
  onBack: () => void
  players: Player[]
}

export default function ManageGames({ onBack, players }: ManageGamesProps) {
  const [matches, setMatches] = useState<Match[]>(SAMPLE_MATCHES)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState('')
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    date: '',
    isHome: true,
    includeU23: false,
    type: 'LEAGUE' as GameType,
    cupCompetition: '',
    opponentLeague: '',
    venue: ''
  })
  const [matchToUpdate, setMatchToUpdate] = useState<Match | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    const fetchSeasons = async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('name', { ascending: false })
      
      if (data) {
        setSeasons(data)
        // Set selected season to first in list
        setSelectedSeason(data[0]?.name || '')
      }
    }

    fetchSeasons()
  }, [])

  const handleAddMatch = () => {
    if (!newMatch.opponent || !newMatch.date || !newMatch.venue) return
    if (newMatch.type === 'CUP' && !newMatch.cupCompetition) return

    const opponent = SAMPLE_OPPONENTS.find(o => o.ID === Number(newMatch.opponent))
    if (!opponent) return

    const newMatches: Match[] = []
    
    // Add main team match
    newMatches.push({
      ID: matches.length + 1,
      Date: newMatch.date,
      HomeTeam: newMatch.isHome ? 'FC Patron' : opponent.Name,
      AwayTeam: newMatch.isHome ? opponent.Name : 'FC Patron',
      IsU23: false,
      Season: selectedSeason,
      Played: false,
      Type: newMatch.type,
      CupCompetition: newMatch.type === 'CUP' ? newMatch.cupCompetition : undefined,
      Venue: newMatch.venue
    })

    // Add U23 match if selected and opponent has U23 team
    if (newMatch.includeU23 && opponent.HasU23) {
      newMatches.push({
        ID: matches.length + 2,
        Date: newMatch.date,
        HomeTeam: newMatch.isHome ? 'FC Patron II' : `${opponent.Name} II`,
        AwayTeam: newMatch.isHome ? `${opponent.Name} II` : 'FC Patron II',
        IsU23: true,
        Season: selectedSeason,
        Played: false,
        Type: 'LEAGUE',
        Venue: newMatch.venue
      })
    }

    setMatches([...matches, ...newMatches])
    setShowAddMatch(false)
    setNewMatch({ 
      opponent: '', 
      date: '', 
      isHome: true, 
      includeU23: false, 
      type: 'LEAGUE', 
      cupCompetition: '', 
      opponentLeague: '',
      venue: '' 
    })
  }

  const handleMatchUpdate = (
    updatedMatch: Match, 
    events: MatchEvent[], 
    lineup: MatchLineup[]
  ) => {
    setMatches(matches.map(match => 
      match.ID === updatedMatch.ID 
        ? { ...updatedMatch, Events: events, Lineup: lineup }
        : match
    ))
    setMatchToUpdate(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="px-4 py-2 bg-black/20 hover:bg-black/40 
              rounded-xl text-gray-400 text-sm font-medium transition-colors 
              flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-white">Manage Games</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
              text-white focus:outline-none focus:border-red-500/50"
          >
            {seasons.map(season => (
              <option key={season.id} value={season.name}>
                Season {season.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${showCompleted 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-black/20 text-gray-400 hover:bg-black/40'}`}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>

          <motion.button
            onClick={() => setShowAddMatch(true)}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
              rounded-xl text-red-400 text-sm font-medium transition-colors
              flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Add Match
          </motion.button>
        </div>
      </div>

      {/* Match List */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
        <div className="space-y-4">
          {matches
            .filter(match => match.Season === selectedSeason)
            .filter(match => showCompleted || !match.Played)
            .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
            .map(match => (
              <motion.div 
                key={match.ID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-black/20 rounded-xl border border-white/5 hover:border-red-500/20 
                  transition-colors group"
              >
                {/* Date & Type Row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">
                    {new Date(match.Date).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {match.Type === 'LEAGUE' ? 'Liga' : 
                       match.Type === 'CUP' ? match.CupCompetition : 'Testspiel'}
                    </span>
                    {match.IsU23 && (
                      <span className="px-2 py-1 bg-yellow-500/10 rounded-lg text-yellow-500 text-xs">
                        U23
                      </span>
                    )}
                  </div>
                </div>

                {/* Teams & Score Row */}
                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex-1 flex items-center gap-4 justify-end">
                    <span className="text-lg font-medium text-white">{match.HomeTeam}</span>
                    <div className="w-16 h-16 relative">
                      <img 
                        src="https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png" 
                        alt={match.HomeTeam}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center px-8">
                    {match.Played ? (
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-white">{match.HomeScore}</span>
                        <span className="text-2xl text-gray-400">:</span>
                        <span className="text-3xl font-bold text-white">{match.AwayScore}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xl text-gray-400">vs</span>
                        {!match.Played && (
                          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => setMatchToUpdate(match)}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                if (confirm('Delete this match?')) {
                                  setMatches(matches.filter(m => m.ID !== match.ID))
                                }
                              }}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="w-16 h-16 relative">
                      <img 
                        src="https://xlaukgimmuvsgzfyseow.supabase.co/storage/v1/object/public/logos/eintracht.png" 
                        alt={match.AwayTeam}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-lg font-medium text-white">{match.AwayTeam}</span>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Add Match Modal */}
      {showAddMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/90 border border-white/5 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-white mb-6">Add New Match</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Opponent
                </label>
                <select
                  value={newMatch.opponent}
                  onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                  className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                    text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Select opponent...</option>
                  {SAMPLE_OPPONENTS.map(opponent => (
                    <option key={opponent.ID} value={opponent.ID}>
                      {opponent.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newMatch.date}
                  onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                  className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                    text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Game Type
                </label>
                <select
                  value={newMatch.type}
                  onChange={(e) => setNewMatch({ ...newMatch, type: e.target.value as GameType })}
                  className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                    text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="LEAGUE">Liga</option>
                  <option value="CUP">Pokal</option>
                  <option value="FRIENDLY">Testspiel</option>
                </select>
              </div>

              {newMatch.type === 'CUP' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Cup Competition
                  </label>
                  <select
                    value={newMatch.cupCompetition}
                    onChange={(e) => setNewMatch({ ...newMatch, cupCompetition: e.target.value })}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select competition...</option>
                    {CUP_COMPETITIONS.map(cup => (
                      <option key={cup} value={cup}>{cup}</option>
                    ))}
                  </select>
                </div>
              )}

              {newMatch.type === 'FRIENDLY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Opponent League
                  </label>
                  <select
                    value={newMatch.opponentLeague}
                    onChange={(e) => setNewMatch({ ...newMatch, opponentLeague: e.target.value })}
                    className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select league...</option>
                    {OPPONENT_LEAGUES.map(league => (
                      <option key={league} value={league}>{league}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Location
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewMatch({ 
                      ...newMatch, 
                      isHome: true,
                      venue: HOME_VENUE // Auto-set home venue
                    })}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                      ${newMatch.isHome 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-black/20 text-gray-400 hover:bg-black/40'}`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setNewMatch({ 
                      ...newMatch, 
                      isHome: false,
                      venue: '' // Clear venue when switching to away
                    })}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                      ${!newMatch.isHome 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-black/20 text-gray-400 hover:bg-black/40'}`}
                  >
                    Away
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Venue
                </label>
                <select
                  value={newMatch.venue}
                  onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                  className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                    text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Select venue...</option>
                  {VENUES.map(venue => (
                    <option key={venue} value={venue}>{venue}</option>
                  ))}
                </select>
              </div>

              {SAMPLE_OPPONENTS.find(o => o.ID === Number(newMatch.opponent))?.HasU23 && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeU23"
                    checked={newMatch.includeU23}
                    onChange={(e) => setNewMatch({ ...newMatch, includeU23: e.target.checked })}
                    className="w-4 h-4 rounded border-white/5 bg-black/20 
                      checked:bg-red-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="includeU23" className="text-sm text-gray-400">
                    Include U23 match
                  </label>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <motion.button
                  onClick={() => setShowAddMatch(false)}
                  className="flex-1 px-4 py-2 bg-black/20 hover:bg-black/40 
                    rounded-xl text-gray-400 text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleAddMatch}
                  className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                    rounded-xl text-red-400 text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Match
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {matchToUpdate && (
        <UpdateMatchModal
          match={matchToUpdate}
          players={players}
          matches={matches}
          onClose={() => setMatchToUpdate(null)}
          onUpdate={handleMatchUpdate}
        />
      )}
    </div>
  )
} 