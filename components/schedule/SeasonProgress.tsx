export default function SeasonProgress() {
  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Season Progress</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Matches Played</span>
            <span className="text-white">21/30</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div className="h-full w-[70%] bg-gradient-to-r from-red-500 to-red-600 rounded-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Points Collected</span>
            <span className="text-white">56/90</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div className="h-full w-[62%] bg-gradient-to-r from-red-500 to-red-600 rounded-full" />
          </div>
        </div>
        <div className="pt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">18</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Draws</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">1</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Losses</div>
          </div>
        </div>
      </div>
    </div>
  )
} 