'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, Goal, Calendar, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AwardData {
  top_scorer_km: {
    name: string
    bildurl: string
    value: number
  }
  top_scorer_res: {
    name: string
    bildurl: string
    value: number
  }
  most_games_km: {
    name: string
    bildurl: string
    value: number
  }
  most_games_res: {
    name: string
    bildurl: string
    value: number
  }
  most_clean_sheets: {
    name: string
    bildurl: string
    value: number
  }
}

export default function Awards() {
  const [awardData, setAwardData] = useState<AwardData | null>(null)
  const defaultPlayerImage = "https://www.oefb.at/oefb2/images/1278650591628556536_6f8f0a32fde0532e65ab-1,0-320x320.png"

  useEffect(() => {
    const fetchAwardData = async () => {
      const { data, error } = await supabase
        .from('award_details')
        .select('*')
        .single()
      
      if (data && !error) {
        setAwardData(data)
      }
    }

    fetchAwardData()
  }, [])

  const awards = [
    {
      title: "Player of the Season",
      icon: Trophy,
      status: 'voting' as const
    },
    {
      title: "Newcomer of the Season",
      icon: Star,
      status: 'voting' as const
    },
    {
      title: "Goal of the Season",
      icon: Goal,
      status: 'voting' as const
    },
    {
      title: "Most Goals (KM)",
      icon: Goal,
      player: awardData?.top_scorer_km ? {
        name: awardData.top_scorer_km.name,
        imageUrl: awardData.top_scorer_km.bildurl,
        value: `${awardData.top_scorer_km.value} Goals`
      } : undefined,
      status: 'determined' as const
    },
    {
      title: "Most Goals (RES)",
      icon: Goal,
      player: awardData?.top_scorer_res ? {
        name: awardData.top_scorer_res.name,
        imageUrl: awardData.top_scorer_res.bildurl,
        value: `${awardData.top_scorer_res.value} Goals`
      } : undefined,
      status: 'determined' as const
    },
    {
      title: "Most Games (KM)",
      icon: Calendar,
      player: awardData?.most_games_km ? {
        name: awardData.most_games_km.name,
        imageUrl: awardData.most_games_km.bildurl,
        value: `${awardData.most_games_km.value} Games`
      } : undefined,
      status: 'determined' as const
    },
    {
      title: "Most Games (RES)",
      icon: Calendar,
      player: awardData?.most_games_res ? {
        name: awardData.most_games_res.name,
        imageUrl: awardData.most_games_res.bildurl,
        value: `${awardData.most_games_res.value} Games`
      } : undefined,
      status: 'determined' as const
    },
    {
      title: "Most Clean Sheets",
      icon: Shield,
      player: awardData?.most_clean_sheets ? {
        name: awardData.most_clean_sheets.name,
        imageUrl: awardData.most_clean_sheets.bildurl,
        value: `${awardData.most_clean_sheets.value} Clean Sheets`
      } : undefined,
      status: 'determined' as const
    }
  ]

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/10 rounded-3xl border border-yellow-500/10 overflow-hidden backdrop-blur-sm">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">
            Awards <span className="text-yellow-500">2024/25</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {awards.map((award, index) => {
            const Icon = award.icon
            return (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-black/40 to-black/20 
                  rounded-xl border border-yellow-500/10 p-4 hover:border-yellow-500/30 
                  transition-all duration-300 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Icon className="w-4 h-4 text-yellow-500" />
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-yellow-500 
                      transition-colors duration-300">
                      {award.title}
                    </h3>
                  </div>

                  {award.status === 'voting' ? (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 flex-1 bg-black/30 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-gradient-to-r from-yellow-500 to-yellow-600 
                          group-hover:w-full transition-all duration-1000" />
                      </div>
                      <span className="text-xs text-yellow-500/80">Voting Soon</span>
                    </div>
                  ) : award.player ? (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 
                          to-transparent rounded-lg" />
                        <img
                          src={award.player.imageUrl}
                          alt={award.player.name}
                          className="relative w-16 h-16 rounded-lg object-cover bg-black/20"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultPlayerImage;
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white mb-1">
                          {award.player.name}
                        </div>
                        <div className="text-sm text-yellow-500/80 font-medium">
                          {award.player.value}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Bottom Highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r 
                  from-transparent via-yellow-500/50 to-transparent transform scale-x-0 
                  group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 