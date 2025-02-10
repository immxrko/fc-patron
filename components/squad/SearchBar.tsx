import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 transition-colors duration-300">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        className="block w-full pl-16 pr-4 py-2.5 bg-black/40 backdrop-blur-md text-white text-right
          placeholder:text-gray-400 rounded-2xl border-0 outline-none
          transition-all duration-300
          focus:ring-2 focus:ring-red-500/20 focus:bg-black/60
          hover:bg-black/50
          selection:bg-red-500/20"
        placeholder="Search players..."
      />
    </div>
  )
} 