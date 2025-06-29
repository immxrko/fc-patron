'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar, 
  MapPin, 
  Activity, 
  Trophy, 
  Target, 
  Users, 
  Clock,
  Award,
  TrendingUp,
  Footprints,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PlayerDetailModalProps {
  player: {
    ID: number
    Name: string
    Position: string
    BildURL: string
    KM_Res_Beides?: string
    Fuß?: string
    Geburtsdatum?: string
  }
  onClose: () => void
}

interface SeasonStats {
  season: string
  games: number
  goals: number
  assists: number
  cleanSheets?: number
  yellowCards: number
  redCards: number
  minutesPlayed: number
}

interface CareerStats {
  totalGames: number
  totalGoals: number
  totalAssists: number
  totalCleanSheets?: number
  totalCards: number
  avgGoalsPerGame: number
  avgAssistsPerGame: number
  seasons: SeasonStats[]
}

export default function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'seasons' | 'achievements'>('overview')
  const [careerStats, setCareerStats] = useState<CareerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<'KM' | 'RES'>('KM')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'seasons', label: 'By Season', icon: Calendar },
    { id: 'achievements', label: 'Achievements', icon: Trophy }
  ]

  useEffect(() => {
    fetchPlayerStats()
  }, [player.ID, selectedTeam])

  const fetchPlayerStats = async () => {
    try {
      setLoading(true)

      // Fetch season-by-season stats
      const { data: seasonData, error: seasonError } = await supabase
        .from('squad_details_view')
        .select('*')
        .eq('playerid', player.ID)
        .eq('km_res', selectedTeam)
        .order('seasonname', { ascending: false })

      if (seasonError) throw seasonError

      // Fetch clean sheets for goalkeepers
      let cleanSheetsData = null
      if (player.Position === 'GK') {
        const { data: keeperData, error: keeperError } = await supabase
          .from('keeper_clean_sheets')
          .select('*')
          .eq('playerid', player.ID)
          .eq('team', selectedTeam)

        if (!keeperError) {
          cleanSheetsData = keeperData
        }
      }

      // Fetch cards data
      const { data: cardsData, error: cardsError } = await supabase
        .from('player_cards_by_season')
        .select('*')
        .eq('playerid', player.ID)
        .eq('team', selectedTeam)

      if (cardsError) {
        console.error('Error fetching cards:', cardsError)
      }

      // Process the data
      const seasons: SeasonStats[] = []
      let totalGames = 0
      let totalGoals = 0
      let totalAssists = 0
      let totalCleanSheets = 0
      let totalCards = 0

      seasonData?.forEach(season => {
        const games = parseInt(season.games) || 0
        const goals = parseInt(season.goals) || 0
        const assists = parseInt(season.assists) || 0
        
        // Get clean sheets for this season if goalkeeper
        const cleanSheets = player.Position === 'GK' 
          ? cleanSheetsData?.find(cs => cs.season === season.seasonname)?.clean_sheets || 0
          : undefined

        // Get cards for this season
        const seasonCards = cardsData?.find(card => card.season === season.seasonname)
        const yellowCards = seasonCards?.yellow_cards || 0
        const redCards = seasonCards?.red_cards || 0

        seasons.push({
          season: season.seasonname,
          games,
          goals,
          assists,
          cleanSheets,
          yellowCards,
          redCards,
          minutesPlayed: games * 90 // Estimate
        })

        totalGames += games
        totalGoals += goals
        totalAssists += assists
        if (cleanSheets !== undefined) totalCleanSheets += cleanSheets
        totalCards += yellowCards + redCards
      })

      setCareerStats({
        totalGames,
        totalGoals,
        totalAssists,
        totalCleanSheets: player.Position === 'GK' ? totalCleanSheets : undefined,
        totalCards,
        avgGoalsPerGame: totalGames > 0 ? totalGoals / totalGames : 0,
        avgAssistsPerGame: totalGames > 0 ? totalAssists / totalGames : 0,
        seasons
      })

    } catch (error) {
      console.error('Error fetching player stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAge = () => {
    if (!player.Geburtsdatum) return null
    const birthDate = new Date(player.Geburtsdatum)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getTeamLabel = (team: string) => {
    return team === 'KM' ? 'First Team' : 'Reserve'
  }

  const getFootLabel = (foot: string) => {
    return foot === 'L' ? 'Left' : foot === 'R' ? 'Right' : foot
  }

  const StatCard = ({ icon: Icon, label, value, color = 'text-white' }: {
    icon: any
    label: string
    value: string | number
    color?: string
  }) => (
    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black/90 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <div className="flex items-center gap-6">
              {/* Player Image - Made Much Bigger */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <img
                  src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                  alt={player.Name}
                  className="w-full h-full object-cover object-top rounded-2xl border-4 border-red-500/30 shadow-2xl shadow-red-500/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl" />
                
                {/* Position Badge on Image */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg">
                    {player.Position}
                  </span>
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{player.Name}</h2>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {getAge() && (
                    <span className="px-3 py-1 bg-black/20 text-gray-300 rounded-full text-sm">
                      {getAge()} years old
                    </span>
                  )}
                  {player.KM_Res_Beides && (
                    <span className="px-3 py-1 bg-black/20 text-gray-300 rounded-full text-sm">
                      {getTeamLabel(player.KM_Res_Beides)}
                    </span>
                  )}
                  {player.Fuß && (
                    <span className="px-3 py-1 bg-black/20 text-gray-300 rounded-full text-sm">
                      {getFootLabel(player.Fuß)} footed
                    </span>
                  )}
                </div>
                
                {/* Quick Stats Preview */}
                {careerStats && !loading && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{careerStats.totalGames}</p>
                      <p className="text-xs text-gray-400">Games</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {player.Position === 'GK' ? careerStats.totalCleanSheets || 0 : careerStats.totalGoals}
                      </p>
                      <p className="text-xs text-gray-400">
                        {player.Position === 'GK' ? 'Clean Sheets' : 'Goals'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{careerStats.totalAssists}</p>
                      <p className="text-xs text-gray-400">Assists</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Team Selector */}
            <div className="flex items-center gap-2 mt-6">
              <span className="text-sm text-gray-400">View stats for:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeam('KM')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedTeam === 'KM'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-black/20 text-gray-400 hover:bg-black/40'
                  }`}
                >
                  First Team
                </button>
                <button
                  onClick={() => setSelectedTeam('RES')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedTeam === 'RES'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-black/20 text-gray-400 hover:bg-black/40'
                  }`}
                >
                  Reserve
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === 'overview' && careerStats && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Personal Info */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {player.Geburtsdatum && (
                          <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
                            <Calendar className="w-5 h-5 text-red-400" />
                            <div>
                              <p className="text-sm text-gray-400">Birthday</p>
                              <p className="text-white font-medium">
                                {new Date(player.Geburtsdatum).toLocaleDateString('de-DE')}
                              </p>
                            </div>
                          </div>
                        )}
                        {player.Fuß && (
                          <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
                            <Footprints className="w-5 h-5 text-red-400" />
                            <div>
                              <p className="text-sm text-gray-400">Preferred Foot</p>
                              <p className="text-white font-medium">{getFootLabel(player.Fuß)}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
                          <Shield className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm text-gray-400">Position</p>
                            <p className="text-white font-medium">{player.Position}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Career Stats */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Career Statistics ({getTeamLabel(selectedTeam)})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                          icon={Users}
                          label="Total Games"
                          value={careerStats.totalGames}
                        />
                        {player.Position === 'GK' ? (
                          <StatCard
                            icon={Shield}
                            label="Clean Sheets"
                            value={careerStats.totalCleanSheets || 0}
                            color="text-green-400"
                          />
                        ) : (
                          <StatCard
                            icon={Target}
                            label="Total Goals"
                            value={careerStats.totalGoals}
                            color="text-green-400"
                          />
                        )}
                        <StatCard
                          icon={Activity}
                          label="Total Assists"
                          value={careerStats.totalAssists}
                          color="text-blue-400"
                        />
                        <StatCard
                          icon={Award}
                          label="Cards"
                          value={careerStats.totalCards}
                          color="text-yellow-400"
                        />
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {player.Position !== 'GK' && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <StatCard
                            icon={TrendingUp}
                            label="Goals per Game"
                            value={careerStats.avgGoalsPerGame.toFixed(2)}
                            color="text-green-400"
                          />
                          <StatCard
                            icon={TrendingUp}
                            label="Assists per Game"
                            value={careerStats.avgAssistsPerGame.toFixed(2)}
                            color="text-blue-400"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Seasons Tab */}
                {activeTab === 'seasons' && careerStats && (
                  <motion.div
                    key="seasons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">Season by Season ({getTeamLabel(selectedTeam)})</h3>
                    {careerStats.seasons.length > 0 ? (
                      <div className="space-y-4">
                        {careerStats.seasons.map((season, index) => (
                          <motion.div
                            key={season.season}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/20 rounded-xl p-4 border border-white/5"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xl font-bold text-white">{season.season}</h4>
                              <div className="flex items-center gap-2">
                                {season.yellowCards > 0 && (
                                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                    {season.yellowCards} Yellow
                                  </span>
                                )}
                                {season.redCards > 0 && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                                    {season.redCards} Red
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">{season.games}</p>
                                <p className="text-sm text-gray-400">Games</p>
                              </div>
                              {player.Position === 'GK' ? (
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-400">{season.cleanSheets || 0}</p>
                                  <p className="text-sm text-gray-400">Clean Sheets</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-400">{season.goals}</p>
                                  <p className="text-sm text-gray-400">Goals</p>
                                </div>
                              )}
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-400">{season.assists}</p>
                                <p className="text-sm text-gray-400">Assists</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-gray-400">{Math.round(season.minutesPlayed)}</p>
                                <p className="text-sm text-gray-400">Minutes</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-400 mb-2">No season data</h3>
                        <p className="text-gray-500">No statistics available for {getTeamLabel(selectedTeam)}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && careerStats && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">Achievements & Milestones</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Career Milestones */}
                      <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          Career Milestones
                        </h4>
                        <div className="space-y-3">
                          {careerStats.totalGames >= 50 && (
                            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              <div>
                                <p className="text-white font-medium">50+ Games</p>
                                <p className="text-yellow-400 text-sm">Veteran Player</p>
                              </div>
                            </div>
                          )}
                          {careerStats.totalGoals >= 10 && player.Position !== 'GK' && (
                            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <Target className="w-5 h-5 text-green-500" />
                              <div>
                                <p className="text-white font-medium">10+ Goals</p>
                                <p className="text-green-400 text-sm">Goal Scorer</p>
                              </div>
                            </div>
                          )}
                          {careerStats.totalCleanSheets && careerStats.totalCleanSheets >= 5 && (
                            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="text-white font-medium">5+ Clean Sheets</p>
                                <p className="text-blue-400 text-sm">Reliable Keeper</p>
                              </div>
                            </div>
                          )}
                          {careerStats.totalAssists >= 5 && (
                            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                              <Activity className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="text-white font-medium">5+ Assists</p>
                                <p className="text-purple-400 text-sm">Team Player</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Season Records */}
                      <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-red-500" />
                          Season Records
                        </h4>
                        <div className="space-y-3">
                          {careerStats.seasons.length > 0 && (
                            <>
                              <div className="p-3 bg-black/20 rounded-lg">
                                <p className="text-white font-medium">Most Games in a Season</p>
                                <p className="text-red-400 text-sm">
                                  {Math.max(...careerStats.seasons.map(s => s.games))} games
                                </p>
                              </div>
                              {player.Position !== 'GK' && (
                                <div className="p-3 bg-black/20 rounded-lg">
                                  <p className="text-white font-medium">Most Goals in a Season</p>
                                  <p className="text-green-400 text-sm">
                                    {Math.max(...careerStats.seasons.map(s => s.goals))} goals
                                  </p>
                                </div>
                              )}
                              <div className="p-3 bg-black/20 rounded-lg">
                                <p className="text-white font-medium">Most Assists in a Season</p>
                                <p className="text-blue-400 text-sm">
                                  {Math.max(...careerStats.seasons.map(s => s.assists))} assists
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}