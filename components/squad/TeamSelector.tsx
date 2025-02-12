import { Users, UserCircle } from 'lucide-react'
import { useState } from 'react'

interface TeamSelectorProps {
  onTeamChange: (team: 'first-team' | 'u23') => void;
}

export default function TeamSelector({ onTeamChange }: TeamSelectorProps) {
  const [selectedTeam, setSelectedTeam] = useState<'first-team' | 'u23'>('first-team')

  const handleTeamChange = (team: 'first-team' | 'u23') => {
    setSelectedTeam(team)
    onTeamChange(team)
  }

  return (
    <div className="inline-flex p-1 bg-black/40 backdrop-blur-md rounded-2xl">
      <button 
        onClick={() => handleTeamChange('first-team')}
        className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500
          ${selectedTeam === 'first-team' 
            ? 'bg-gradient-to-r from-red-500/20 via-red-400/20 to-red-500/20 shadow-lg shadow-red-500/20' 
            : 'hover:bg-white/5'
          }`}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
          ${selectedTeam === 'first-team' 
            ? 'bg-red-500/30 text-red-400' 
            : 'bg-white/5 text-gray-400 group-hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
        </div>
        <span className={`font-medium transition-colors duration-300 ${
          selectedTeam === 'first-team' 
            ? 'text-white' 
            : 'text-gray-400 group-hover:text-white'
        }`}>KM</span>
      </button>

      <button 
        onClick={() => handleTeamChange('u23')}
        className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500
          ${selectedTeam === 'u23' 
            ? 'bg-gradient-to-r from-red-500/20 via-red-400/20 to-red-500/20 shadow-lg shadow-red-500/20' 
            : 'hover:bg-white/5'
          }`}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
          ${selectedTeam === 'u23' 
            ? 'bg-red-500/30 text-red-400' 
            : 'bg-white/5 text-gray-400 group-hover:text-white'
          }`}
        >
          <UserCircle className="w-5 h-5" />
        </div>
        <span className={`font-medium transition-colors duration-300 ${
          selectedTeam === 'u23' 
            ? 'text-white' 
            : 'text-gray-400 group-hover:text-white'
        }`}>RES</span>
      </button>
    </div>
  )
} 