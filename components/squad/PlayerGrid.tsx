import { motion } from 'framer-motion'

interface PlayerCard {
  id: number
  name: string
  position: string
  image: string
  stats: {
    games: number
    goals: number
    assists: number
  }
}

const players: PlayerCard[] = [
  {
    id: 1,
    name: "Luca Schuckert",
    position: "GK",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_b0b441e826bc548aa7fc-1,0-320x320.png",
    stats: {
      games: 19,
      goals: 0,
      assists: 0
    }
  },
  {
    id: 2,
    name: "Marko Cvejic",
    position: "DEF",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_e1e6df7df2184ef1349b-1,0-320x320.png",
    stats: {
      games: 18,
      goals: 2,
      assists: 1
    }
  },
  {
    id: 3,
    name: "Josip Matijevic",
    position: "ATT",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_4dcb084bb2c30e1395ee-1,0-320x320.png",
    stats: {
      games: 20,
      goals: 15,
      assists: 7
    }
  },
  {
    id: 4,
    name: "Muhamet Mahmutaj",
    position: "ATT",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_f740f25ac9da09af2246-1,0-320x320.png",
    stats: {
      games: 17,
      goals: 8,
      assists: 11
    }
  },
  {
    id: 5,
    name: "Marvin de Chavez",
    position: "MID",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_49e17c18c1d6921a7870-1,0-320x320.png",
    stats: {
      games: 19,
      goals: 6,
      assists: 8
    }
  },
  {
    id: 6,
    name: "Christoph Hafner",
    position: "MID",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_7ccdd5ee9c5e8e2a0c22-1,0-320x320.png",
    stats: {
      games: 16,
      goals: 2,
      assists: 4
    }
  },
  {
    id: 7,
    name: "Michael Frühwirth",
    position: "DEF",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_ba89cc5af9585cffb11c-1,0-320x320.png",
    stats: {
      games: 15,
      goals: 1,
      assists: 3
    }
  },
  {
    id: 8,
    name: "Ermin Kokic",
    position: "DEF",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_e807ce175060c2e86db6-1,0-320x320.png",
    stats: {
      games: 17,
      goals: 1,
      assists: 0
    }
  },
  {
    id: 9,
    name: "Dominik Kubiak",
    position: "MID",
    image: "https://www.oefb.at/oefb2/images/1278650591628556536_77be3e9035fdc75e8cff-1,0-320x320.png",
    stats: {
      games: 18,
      goals: 4,
      assists: 6
    }
  }
]

interface PlayerGridProps {
  searchQuery: string;
}

export default function PlayerGrid({ searchQuery }: PlayerGridProps) {
  // Group and sort players by position
  const positionOrder = ['GK', 'DEF', 'MID', 'ATT']
  const groupedPlayers = positionOrder.map(pos => ({
    position: pos,
    players: players.filter(p => p.position === pos)
  })).filter(group => group.players.length > 0)

  const filteredGroups = groupedPlayers.map(group => ({
    position: group.position,
    players: group.players.filter(player => {
      const searchTerm = searchQuery.toLowerCase()
      return (
        player.name.toLowerCase().includes(searchTerm) ||
        player.position.toLowerCase().includes(searchTerm)
      )
    })
  })).filter(group => group.players.length > 0)

  // Position labels mapping
  const positionLabels = {
    GK: 'Goalkeepers',
    DEF: 'Defenders',
    MID: 'Midfielders',
    ATT: 'Attackers'
  }

  return (
    <>
      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGroups.flatMap(group => group.players).map(player => (
          <div key={player.id} className="group">
            <div className="bg-black/20 rounded-2xl shadow-lg shadow-black/[0.03] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="relative h-[400px] w-full">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                  <div>
                    {(() => {
                      const nameParts = player.name.split(' ')
                      const lastName = nameParts.pop() // Get the last name
                      const firstNames = nameParts.join(' ') // Join all other parts as first names
                      return (
                        <>
                          <h3 className="text-2xl font-bold text-white leading-tight">{firstNames}</h3>
                          <h3 className="text-2xl font-bold text-white/90">{lastName}</h3>
                        </>
                      )
                    })()}
                  </div>
                  <span className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs font-bold text-red-400">
                    {player.position}
                  </span>
                </div>
                <div className="absolute bottom-6 inset-x-0 px-6">
                  <div className="flex justify-between items-center bg-black/40 backdrop-blur-md rounded-xl p-3">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{player.stats.games}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Games</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10" />

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{player.stats.goals}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Goals</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10" />

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{player.stats.assists}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Assists</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile List View with Position Groups */}
      <div className="md:hidden space-y-6">
      {/* eslint-disable-next-line */}
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.position}>
            {/* Position Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
              <span className="text-sm font-semibold text-red-400">
                {positionLabels[group.position as keyof typeof positionLabels]}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            </div>

            {/* Players in this position group */}
            <div className="space-y-3">
              {group.players.map(player => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-3 bg-black/20 rounded-xl backdrop-blur-sm"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-full h-full object-cover object-top rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white truncate">
                        {player.name}
                      </h3>
                      <span className="px-2 py-1 bg-black/40 rounded-md text-xs font-bold text-red-400 flex-shrink-0">
                        {player.position}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{player.stats.games}</span>
                        <span className="text-xs text-gray-400">Games</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{player.stats.goals}</span>
                        <span className="text-xs text-gray-400">Goals</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-white">{player.stats.assists}</span>
                        <span className="text-xs text-gray-400">Assists</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}