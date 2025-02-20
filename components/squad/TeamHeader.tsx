import { Trophy, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface TeamHeaderProps {
  onSeasonChange: (season: string) => void;
}

export default function TeamHeader({ onSeasonChange }: TeamHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const seasons = ['All Seasons', '2024/25', '2023/24', '2022/23', '2021/22']
  const [selectedSeason, setSelectedSeason] = useState('2024/25')

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season)
    setIsOpen(false)
    onSeasonChange(season)
  }

  return (
    <div className="mb-4 md:mb-12">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-black/20 rounded-2xl shadow-lg shadow-black/[0.03] p-4 md:p-8">
        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="shrink-0 relative h-16 w-16 md:h-24 md:w-24 rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105">
            <img
              src="https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
              alt="Team Logo"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 md:flex-initial">
            <div className="flex items-center justify-between md:block">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">FC Patron</h1>
                <div className="relative mt-1">
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <span>{selectedSeason}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-32 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 shadow-xl z-10">
                      {seasons.map((season) => (
                        <button
                          key={season}
                          onClick={() => handleSeasonChange(season)}
                          className={`w-full px-3 py-1.5 text-left text-sm transition-colors duration-200
                            ${selectedSeason === season 
                              ? 'text-red-400 bg-white/5' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          {season}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 