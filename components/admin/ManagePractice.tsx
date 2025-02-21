/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Users, Save, Search, Trash2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Practice, Player, Attendance, TopAttender } from '@/types/database'

interface ManagePracticeProps {
  onBack: () => void
  players: Player[]
  practices: Practice[]
  attendance: Attendance[]
  onDataUpdate: () => Promise<void>
}

export default function ManagePractice({ 
  onBack, 
  players, 
  practices: initialPractices,
  attendance: initialAttendance,
  onDataUpdate 
}: ManagePracticeProps) {
  const [practices, setPractices] = useState(initialPractices)
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null)
  const [attendance, setAttendance] = useState(initialAttendance)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [practiceToCancel, setPracticeToCancel] = useState<number | null>(null)
  const [topAttenders, setTopAttenders] = useState<TopAttender[]>([])

  useEffect(() => {
    if (selectedPractice) {
      fetchAttendance(selectedPractice.ID)
    }
  }, [selectedPractice])

  useEffect(() => {
    const loadTopAttenders = async () => {
      const top = await fetchTopAttenders()
      setTopAttenders(top)
    }
    loadTopAttenders()
  }, [])

  useEffect(() => {
    // Add this effect to initialize practices when component mounts
    const init = async () => {
      await initializePractices();
      await fetchPractices();
    };
    init();
  }, []);

  // Function to get all Tuesdays between the oldest practice and today
  const getMissingTuesdays = async () => {
    const today = new Date()
    
    // First get ALL existing practices to ensure we have the complete set
    const { data: allPractices } = await supabase
      .from('practices')
      .select('Date')
      .order('Date', { ascending: true })

    if (!allPractices?.length) return []

    // Create a Set of ALL existing dates for lookup
    const existingDatesSet = new Set(allPractices.map(p => p.Date))
    const missingTuesdays = new Set<string>() // Use Set to prevent duplicates

    // Start from the first practice date
    const startDate = new Date(allPractices[0].Date)
    const endDate = today

    // Normalize to midnight UTC to avoid time zone issues
    startDate.setUTCHours(0, 0, 0, 0)
    endDate.setUTCHours(0, 0, 0, 0)

    // Iterate through each day
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      if (currentDate.getDay() === 2) { // If it's a Tuesday
        const dateString = currentDate.toISOString().split('T')[0]
        if (!existingDatesSet.has(dateString)) {
          missingTuesdays.add(dateString)
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return Array.from(missingTuesdays)
  }

  // eslint-disable-next-line
  const initializePractices = async () => {
    try {
      // Get missing Tuesdays
      const missingTuesdays = await getMissingTuesdays()
      
      if (missingTuesdays.length === 0) {
        return // No missing Tuesdays, exit early
      }

      // Check which dates already exist
      const { data: existingDates } = await supabase
        .from('practices')
        .select('Date')
        .in('Date', missingTuesdays)

      // Filter out dates that already exist
      const datesToAdd = missingTuesdays.filter(date => 
        !existingDates?.some(existing => existing.Date === date)
      )

      if (datesToAdd.length === 0) {
        return // All dates already exist
      }

      // Insert only new dates
      const { error } = await supabase
        .from('practices')
        .insert(
          datesToAdd.map(date => ({
            Date: date,
            AttendanceSet: false,
            Canceled: false
          }))
        )

      if (error) {
        console.error('Error adding practices:', error)
        return
      }

      await fetchPractices()

    } catch (error) {
      console.error('Error in initializePractices:', error)
    }
  }

  const fetchPractices = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .lte('Date', today) // Only fetch practices up to today
        .eq('Canceled', false) // Only fetch non-canceled practices
        .order('Date', { ascending: false })
      
      if (error) {
        console.error('Error fetching practices:', error)
        return
      }
      
      if (data) {
        console.log('Fetched practices:', data) // Debug log
        setPractices(data)
      }
    } catch (error) {
      console.error('Error in fetchPractices:', error)
    }
  }

  const fetchAttendance = async (practiceId: number) => {
    const { data } = await supabase
      .from('practice_attendance')
      .select('*')
      .eq('PracticeID', practiceId)
    
    if (data) setAttendance(data)
  }

  const handleSaveAttendance = async () => {
    if (!selectedPractice) return
    
    setLoading(true)
    try {
      // Update practice to mark attendance as set
      await supabase
        .from('practices')
        .update({ AttendanceSet: true })
        .eq('ID', selectedPractice.ID)

      // Save attendance
      const { error: attendanceError } = await supabase
        .from('practice_attendance')
        .upsert(attendance)

      if (attendanceError) throw attendanceError

      // Refresh data
      await fetchPractices()
      const newTopAttenders = await fetchTopAttenders() // Fetch updated top attenders
      setTopAttenders(newTopAttenders)
      setSelectedPractice(null)
    } catch (error) {
      console.error('Error saving attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAttendance = (playerId: number) => {
    if (!selectedPractice) return

    const existingIndex = attendance.findIndex(
      a => a.PlayerID === playerId && a.PracticeID === selectedPractice.ID
    )

    if (existingIndex >= 0) {
      setAttendance(prev => [
        ...prev.slice(0, existingIndex),
        { ...prev[existingIndex], Present: !prev[existingIndex].Present },
        ...prev.slice(existingIndex + 1)
      ])
    } else {
      setAttendance(prev => [
        ...prev,
        {
          PracticeID: selectedPractice.ID,
          PlayerID: playerId,
          Present: true
        }
      ])
    }
  }

  const handleCancelPractice = async (practiceId: number) => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({ Canceled: true })
        .eq('ID', practiceId)

      if (error) throw error

      if (selectedPractice?.ID === practiceId) {
        setSelectedPractice(null)
      }

      // Update parent component data
      await onDataUpdate()
    } catch (error) {
      console.error('Error canceling practice:', error)
    }
  }

  // First split players into groups
  const groups = players
    .filter(player => 
      player.isActive && player.Name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .reduce((acc: { attended: Player[]; notAttended: Player[] }, player) => {
      const hasAttended = attendance.find(att => att.PlayerID === player.ID && att.Present)
      if (hasAttended) {
        acc.attended.push(player)
      } else {
        acc.notAttended.push(player)
      }
      return acc
    }, { attended: [], notAttended: [] })

  // Then combine sorted groups
  const filteredPlayers = [
    ...groups.attended.sort((a, b) => a.Name.localeCompare(b.Name)),
    ...groups.notAttended.sort((a, b) => a.Name.localeCompare(b.Name))
  ]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getAttendanceCount = () => {
    return attendance.filter(a => a.Present).length
  }

  const fetchTopAttenders = async () => {
    const { data } = await supabase
      .from('practice_attendance')
      .select(`
        PlayerID,
        Present,
        players (Name, BildURL)
      `)
      .eq('Present', true)

    if (!data) return []

    // Count attendances per player
    const attendanceCounts = data.reduce((acc: any, curr: any) => {
      const playerId = curr.PlayerID
      acc[playerId] = {
        count: (acc[playerId]?.count || 0) + 1,
        name: curr.players.Name,
        image: curr.players.BildURL
      }
      return acc
    }, {})

    // Convert to array and sort by count
    return Object.entries(attendanceCounts)
      .map(([id, info]: [string, any]) => ({
        id: parseInt(id),
        name: info.name,
        image: info.image,
        count: info.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <motion.button
          onClick={onBack}
          className="px-4 py-2 bg-black/20 hover:bg-black/40 
            rounded-xl text-gray-400 text-sm font-medium transition-colors 
            flex items-center gap-2 w-fit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-white">Practice Attendance</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Practice List and Top Attenders */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Practice List */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-4 h-[calc(50vh-8rem)] flex flex-col">
            <h3 className="text-sm font-medium text-white mb-4 flex-shrink-0">Training Sessions</h3>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : practices && practices.length > 0 ? (
              <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-red-500/20 
                hover:scrollbar-thumb-red-500/30 scrollbar-track-transparent pr-2">
                <div className="grid grid-cols-1 gap-2">
                  {practices.map((practice) => (
                    <motion.div
                      key={practice.ID}
                      className={`p-3 rounded-lg transition-all
                        ${selectedPractice?.ID === practice.ID 
                          ? 'bg-red-500/10 border border-red-500/20' 
                          : 'bg-black/20 border border-white/5 hover:bg-black/40'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedPractice(practice)}
                        >
                          <div className="text-sm font-medium text-white truncate">
                            {formatDate(practice.Date)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {practice.AttendanceSet && (
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setPracticeToCancel(practice.ID)
                            }}
                            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center p-4">
                No practice sessions found
              </div>
            )}
          </div>

          {/* Top Attenders */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-4">
            <h3 className="text-sm font-medium text-white mb-4">Top Attenders</h3>
            <div className="space-y-3">
              {topAttenders.map((attender, index) => (
                <div key={attender.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full 
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                      index === 1 ? 'bg-gray-400/20 text-gray-400' : 
                      'bg-orange-700/20 text-orange-700'}`}
                  >
                    {index + 1}
                  </div>
                  <img
                    src={attender.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                    alt={attender.name}
                    className="w-10 h-10 rounded-lg object-cover bg-black/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{attender.name}</div>
                    <div className="text-xs text-gray-400">{attender.count} practices</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Attendance Section */}
        <div className="col-span-12 md:col-span-8">
          {selectedPractice ? (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6 h-[calc(100vh-12rem)] flex flex-col">
              {/* Attendance Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-red-400" />
                  <h3 className="text-lg font-medium text-white">
                    {formatDate(selectedPractice.Date)}
                  </h3>
                  <div className="px-2 py-1 bg-black/20 rounded-lg text-sm">
                    <span className="text-green-400">{getAttendanceCount()}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-400">{filteredPlayers.length}</span>
                  </div>
                </div>
                <motion.button
                  onClick={handleSaveAttendance}
                  disabled={loading}
                  className="w-full md:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                    rounded-xl text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  {selectedPractice.AttendanceSet ? 'Update Attendance' : 'Save Attendance'}
                </motion.button>
              </div>

              {/* Search Bar - Fixed position */}
              <div className="relative mb-6 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                    text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
                />
              </div>

              {/* Player Grid - Scrollable */}
              <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-red-500/20 
                hover:scrollbar-thumb-red-500/30 scrollbar-track-transparent pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pb-20">
                  {filteredPlayers.map((player) => (
                    <motion.div
                      key={player.ID}
                      onClick={() => toggleAttendance(player.ID)}
                      className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-3
                        hover:bg-black/40 
                        ${attendance.find(a => a.PlayerID === player.ID && a.Present)
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-black/20 border border-white/5'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center
                        ${attendance.find(a => a.PlayerID === player.ID && a.Present) ? 'bg-green-500' : 'bg-transparent'}">
                        {attendance.find(a => a.PlayerID === player.ID && a.Present) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <img
                        src={player.BildURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                        alt={player.Name}
                        className="w-8 h-8 rounded-lg object-cover bg-black/20"
                      />
                      <span className="text-sm font-medium text-white truncate flex-1">{player.Name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 
              p-6 flex items-center justify-center min-h-[200px]">
              <div className="text-gray-400 text-center">
                Select a practice session to manage attendance
              </div>
            </div>
          )}
        </div>
      </div>

      {practiceToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/90 border border-white/5 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-medium text-white">Cancel Practice?</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to cancel this practice? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <motion.button
                onClick={() => setPracticeToCancel(null)}
                className="px-4 py-2 bg-black/20 hover:bg-black/40 
                  rounded-xl text-gray-400 text-sm font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={async () => {
                  if (practiceToCancel) {
                    await handleCancelPractice(practiceToCancel)
                    setPracticeToCancel(null)
                  }
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                  rounded-xl text-red-400 text-sm font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      
    </div>
  )
} 