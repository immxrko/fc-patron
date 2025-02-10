'use client'

import NextMatch from '@/components/schedule/NextMatch'
import UpcomingMatches from '@/components/schedule/UpcomingMatches'
import SeasonProgress from '@/components/schedule/SeasonProgress'

export default function Schedule() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NextMatch />
        </div>
        <div className="space-y-6">
          <SeasonProgress />
          <UpcomingMatches />
        </div>
      </div>
    </main>
  )
} 