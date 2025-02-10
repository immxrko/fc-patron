export default function UpcomingMatches() {
  const matches = [
    {
      id: 1,
      home: "FC Patron",
      away: "SV Stripfing",
      date: "20 Apr 2025",
      time: "15:30",
      competition: "League"
    },
    {
      id: 2,
      home: "ASK Ebreichsdorf",
      away: "FC Patron",
      date: "27 Apr 2025",
      time: "16:00",
      competition: "Cup"
    },
    {
      id: 3,
      home: "FC Patron",
      away: "SC Wiener Neustadt",
      date: "4 May 2025",
      time: "15:30",
      competition: "League"
    }
  ]

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Upcoming Matches</h2>
      <div className="space-y-3">
        {matches.map(match => (
          <div 
            key={match.id}
            className="p-3 bg-black/40 rounded-xl border border-white/5 hover:border-red-500/20 transition-colors duration-300"
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
          </div>
        ))}
      </div>
    </div>
  )
} 