'use client'

import { useState } from 'react'
import TeamHeader from '@/components/squad/TeamHeader'
import TeamSelector from '@/components/squad/TeamSelector'
import PlayerGrid from '@/components/squad/PlayerGrid'
import SearchBar from '@/components/squad/SearchBar'

export default function Squad() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="container mx-auto p-4 md:p-8">
      <TeamHeader />
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8 items-center justify-between">
        <TeamSelector />
        <div className="w-full md:w-96">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>
      <PlayerGrid searchQuery={searchQuery} />
    </main>
  )
} 