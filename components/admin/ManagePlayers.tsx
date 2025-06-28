'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Search, 
  User, 
  Users, 
  Footprints, 
  Shield, 
  UserPlus,
  Edit3,
  Check,
  X,
  Calendar,
  MapPin,
  Activity,
  Filter,
  SortAsc,
  SortDesc,
  Image
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Player {
  ID: number
  isActive: boolean
  Name: string
  Position: string
  BildURL: string
  Fuß: string
  Geburtsdatum: string
  KM_Res_Beides: string
}

interface ManagePlayersProps {
  onBack: () => void
  players: Player[]
  onPlayersUpdate: () => Promise<void>
}

const defaultPlayer: Omit<Player, 'ID'> = {
  isActive: true,
  Name: '',
  Position: '',
  BildURL: '',
  Fuß: '',
  Geburtsdatum: '',
  KM_Res_Beides: ''
}

const positions = ['GK', 'DEF', 'MID', 'ATT']
const teams = [
  { value: 'KM', label: 'First Team' },
  { value: 'RES', label: 'Reserve' },
  { value: 'Beides', label: 'Both Teams' }
]
const feet = [
  { value: 'L', label: 'Left' },
  { value: 'R', label: 'Right' }
]

type SortField = 'Name' | 'Position' | 'KM_Res_Beides' | 'isActive'
type SortOrder = 'asc' | 'desc'

export default function ManagePlayers({ 
  onBack, 
  players: initialPlayers,
  onPlayersUpdate 
}: ManagePlayersProps) {
  const [players, setPlayers] = useState(initialPlayers)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const [filterPosition, setFilterPosition] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('Name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchPlayers()

    const channel = supabase
      .channel('players_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players' }, 
        () => {
          fetchPlayers()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('Name')
      
      if (error) {
        console.error('Error fetching players:', error)
        return
      }

      if (data) {
        setPlayers(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddNew = () => {
    setEditingPlayer({
      ...defaultPlayer,
      ID: Date.now()
    } as Player)
    setIsAddingNew(true)
  }

  const handleEdit = (player: Player) => {
    setEditingPlayer({ ...player })
    setIsAddingNew(false)
  }

  const handleSave = async () => {
    if (!editingPlayer) return
    
    setLoading(true)
    try {
      const playerData = {
        isActive: editingPlayer.isActive,
        Name: editingPlayer.Name.trim(),
        Position: editingPlayer.Position,
        BildURL: editingPlayer.BildURL.trim(),
        Fuß: editingPlayer.Fuß,
        Geburtsdatum: editingPlayer.Geburtsdatum,
        KM_Res_Beides: editingPlayer.KM_Res_Beides,
      }

      if (isAddingNew) {
        const { data, error } = await supabase
          .from('players')
          .insert([playerData])
          .select()

        if (error) {
          console.error('Error creating player:', error)
          return
        }
      } else {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('ID', editingPlayer.ID)

        if (error) {
          console.error('Error updating player:', error)
          return
        }
      }

      await fetchPlayers()
      setEditingPlayer(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingPlayer(null)
    setIsAddingNew(false)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getPlayerCounts = () => {
    const active = players.filter(p => p.isActive).length
    const inactive = players.filter(p => !p.isActive).length
    return { active, inactive, total: players.length }
  }

  const filteredAndSortedPlayers = players
    .filter(player => {
      const matchesSearch = player.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           player.Position.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && player.isActive) ||
                           (filterStatus === 'inactive' && !player.isActive)
      
      const matchesTeam = filterTeam === 'all' || player.KM_Res_Beides === filterTeam
      
      const matchesPosition = filterPosition === 'all' || player.Position === filterPosition

      return matchesSearch && matchesStatus && matchesTeam && matchesPosition
    })
    .sort((a, b) => {
      let aValue: string | number | boolean = a[sortField]
      let bValue: string | number | boolean = b[sortField]
      
      // Convert boolean to number for comparison
      if (typeof aValue === 'boolean') {
        aValue = aValue ? 1 : 0
        bValue = (bValue as boolean) ? 1 : 0
      }
      
      // Convert strings to lowercase for comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const counts = getPlayerCounts()

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="px-4 py-2 bg-black/20 hover:bg-black/40 
              rounded-xl text-gray-400 text-sm font-medium transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Player Management</h2>
              <p className="text-sm text-gray-400">
                {counts.total} players • {counts.active} active • {counts.inactive} inactive
              </p>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleAddNew}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
            rounded-xl text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <UserPlus className="w-4 h-4" />
          Add Player
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              showFilters ? 'bg-red-500/20 text-red-400' : 'bg-black/20 text-gray-400 hover:bg-black/40'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
                  >
                    <option value="all">All Players</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

                {/* Team Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Team</label>
                  <select
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
                  >
                    <option value="all">All Teams</option>
                    {teams.map(team => (
                      <option key={team.value} value={team.value}>{team.label}</option>
                    ))}
                  </select>
                </div>

                {/* Position Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
                  >
                    <option value="all">All Positions</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="flex-1 px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
                    >
                      <option value="Name">Name</option>
                      <option value="Position">Position</option>
                      <option value="KM_Res_Beides">Team</option>
                      <option value="isActive">Status</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-gray-400 hover:text-white"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Players Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPlayers.map((player) => (
            <PlayerCard
              key={player.ID}
              player={player}
              isEditing={editingPlayer?.ID === player.ID}
              editingPlayer={editingPlayer}
              onEdit={() => handleEdit(player)}
              onSave={handleSave}
              onCancel={handleCancel}
              onEditingPlayerChange={setEditingPlayer}
              loading={loading}
            />
          ))}
        </div>

        {filteredAndSortedPlayers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No players found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add New Player Modal */}
      <AnimatePresence>
        {isAddingNew && editingPlayer && (
          <AddPlayerModal
            player={editingPlayer}
            onSave={handleSave}
            onCancel={handleCancel}
            onPlayerChange={setEditingPlayer}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface PlayerCardProps {
  player: Player
  isEditing: boolean
  editingPlayer: Player | null
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditingPlayerChange: (player: Player) => void
  loading: boolean
}

function PlayerCard({ 
  player, 
  isEditing, 
  editingPlayer, 
  onEdit, 
  onSave, 
  onCancel, 
  onEditingPlayerChange,
  loading 
}: PlayerCardProps) {
  const getTeamLabel = (team: string) => {
    const teamMap: { [key: string]: string } = {
      'KM': 'First Team',
      'RES': 'Reserve',
      'Beides': 'Both Teams'
    }
    return teamMap[team] || team
  }

  const getFootLabel = (foot: string) => {
    return foot === 'L' ? 'Left' : foot === 'R' ? 'Right' : foot
  }

  if (isEditing && editingPlayer) {
    return (
      <motion.div
        layout
        className="bg-black/30 backdrop-blur-sm rounded-xl border border-red-500/20 p-4 space-y-4"
      >
        {/* Player Image */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <img
              src={editingPlayer.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
              alt={editingPlayer.Name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
              }}
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={editingPlayer.Name}
              onChange={(e) => onEditingPlayerChange({...editingPlayer, Name: e.target.value})}
              placeholder="Player name"
              className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
            />
          </div>
        </div>

        {/* Image URL Field */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <Image className="w-4 h-4 inline mr-2" />
            Image URL
          </label>
          <input
            type="url"
            value={editingPlayer.BildURL}
            onChange={(e) => onEditingPlayerChange({...editingPlayer, BildURL: e.target.value})}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
          />
        </div>

        {/* Quick Edit Fields */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={editingPlayer.Position}
            onChange={(e) => onEditingPlayerChange({...editingPlayer, Position: e.target.value})}
            className="px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
          >
            <option value="">Position</option>
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>

          <select
            value={editingPlayer.KM_Res_Beides}
            onChange={(e) => onEditingPlayerChange({...editingPlayer, KM_Res_Beides: e.target.value})}
            className="px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
          >
            <option value="">Team</option>
            {teams.map(team => (
              <option key={team.value} value={team.value}>{team.label}</option>
            ))}
          </select>

          <select
            value={editingPlayer.isActive.toString()}
            onChange={(e) => onEditingPlayerChange({...editingPlayer, isActive: e.target.value === 'true'})}
            className="px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={editingPlayer.Fuß}
            onChange={(e) => onEditingPlayerChange({...editingPlayer, Fuß: e.target.value})}
            className="px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
          >
            <option value="">Foot</option>
            {feet.map(foot => (
              <option key={foot.value} value={foot.value}>{foot.label}</option>
            ))}
          </select>
        </div>

        {/* Birthday Field */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Birthday
          </label>
          <input
            type="date"
            value={editingPlayer.Geburtsdatum}
            onChange={(e) => onEditingPlayerChange({...editingPlayer, Geburtsdatum: e.target.value})}
            className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-lg text-white text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={onSave}
            disabled={loading || !editingPlayer.Name.trim()}
            className="flex-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 
              rounded-lg text-green-400 text-sm font-medium transition-colors 
              flex items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Check className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save'}
          </motion.button>
          <motion.button
            onClick={onCancel}
            className="px-3 py-2 bg-black/20 hover:bg-black/40 
              rounded-lg text-gray-400 text-sm font-medium transition-colors 
              flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/5 p-4 
        hover:border-red-500/20 transition-colors group cursor-pointer"
      onClick={onEdit}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <img
              src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
              alt={player.Name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{player.Name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                player.isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {player.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
      </div>

      {/* Player Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Position</span>
          </div>
          <span className="text-sm font-medium text-white">{player.Position || 'Not set'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Team</span>
          </div>
          <span className="text-sm font-medium text-white">{getTeamLabel(player.KM_Res_Beides) || 'Not set'}</span>
        </div>

        {player.Fuß && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Foot</span>
            </div>
            <span className="text-sm font-medium text-white">{getFootLabel(player.Fuß)}</span>
          </div>
        )}

        {player.Geburtsdatum && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Birthday</span>
            </div>
            <span className="text-sm font-medium text-white">
              {new Date(player.Geburtsdatum).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Image URL indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Image</span>
          </div>
          <span className={`text-sm font-medium ${
            player.BildURL ? 'text-green-400' : 'text-red-400'
          }`}>
            {player.BildURL ? 'Set' : 'Missing'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

interface AddPlayerModalProps {
  player: Player
  onSave: () => void
  onCancel: () => void
  onPlayerChange: (player: Player) => void
  loading: boolean
}

function AddPlayerModal({ player, onSave, onCancel, onPlayerChange, loading }: AddPlayerModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-black/90 border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add New Player</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
            <input
              type="text"
              value={player.Name}
              onChange={(e) => onPlayerChange({...player, Name: e.target.value})}
              placeholder="Enter player name"
              className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                text-white focus:outline-none focus:border-red-500/50"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Image className="w-4 h-4 inline mr-2" />
              Image URL
            </label>
            <input
              type="url"
              value={player.BildURL}
              onChange={(e) => onPlayerChange({...player, BildURL: e.target.value})}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                text-white focus:outline-none focus:border-red-500/50"
            />
            {player.BildURL && (
              <div className="mt-2">
                <img
                  src={player.BildURL}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-white/10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Position & Team */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
              <select
                value={player.Position}
                onChange={(e) => onPlayerChange({...player, Position: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                  text-white focus:outline-none focus:border-red-500/50"
              >
                <option value="">Select position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Team</label>
              <select
                value={player.KM_Res_Beides}
                onChange={(e) => onPlayerChange({...player, KM_Res_Beides: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                  text-white focus:outline-none focus:border-red-500/50"
              >
                <option value="">Select team</option>
                {teams.map(team => (
                  <option key={team.value} value={team.value}>{team.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Foot */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={player.isActive.toString()}
                onChange={(e) => onPlayerChange({...player, isActive: e.target.value === 'true'})}
                className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                  text-white focus:outline-none focus:border-red-500/50"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Foot</label>
              <select
                value={player.Fuß}
                onChange={(e) => onPlayerChange({...player, Fuß: e.target.value})}
                className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                  text-white focus:outline-none focus:border-red-500/50"
              >
                <option value="">Select foot</option>
                {feet.map(foot => (
                  <option key={foot.value} value={foot.value}>{foot.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Birthday</label>
            <input
              type="date"
              value={player.Geburtsdatum}
              onChange={(e) => onPlayerChange({...player, Geburtsdatum: e.target.value})}
              className="w-full px-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                text-white focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <motion.button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-black/20 hover:bg-black/40 
              rounded-xl text-gray-400 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onSave}
            disabled={loading || !player.Name.trim()}
            className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
              rounded-xl text-red-400 text-sm font-medium transition-colors 
              flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add Player
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}