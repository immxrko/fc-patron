import { motion } from 'framer-motion'

interface UpcomingMatchesProps {
  onMatchSelect: (opponent: string) => void;
}

export default function UpcomingMatches({ onMatchSelect }: UpcomingMatchesProps) {
  const matches = [
    {
      id: 2,
      home: "ASK Ebreichsdorf",
      away: "FC Patron",
      date: "27 Apr 2025",
      time: "16:00",
      competition: "Cup"
    }
  ]

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Future Match</h2>
      <div className="space-y-3">
        {matches.map(match => (
          <motion.div 
            key={match.id}
            className="p-3 bg-black/40 rounded-xl border border-white/5 cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: 'rgba(239, 68, 68, 0.2)' }}
            onClick={() => onMatchSelect(match.home === "FC Patron" ? match.away : match.home)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-red-400">{match.competition}</span>
              <span className="text-xs text-gray-400">{match.date} • {match.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">{match.home}</span>
              <span className="text-xs font-bold text-gray-400 mx-2">VS</span>
              <span className="text-sm font-medium text-white">{match.away}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 