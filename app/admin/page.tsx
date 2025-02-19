'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import ManagementMenu from '@/components/admin/ManagementMenu'
import LoginScreen from '@/components/auth/LoginScreen'
import type { User } from '@supabase/supabase-js'
import type { Practice, Player, Attendance } from '@/types/database'

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [practices, setPractices] = useState<Practice[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      setUser(currentUser ?? null)

      if (currentUser) {
        // Check if user is in admins table
        // eslint-disable-next-line
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('id')
          .eq('id', currentUser.id)
          .single()

        setIsAdmin(!!adminData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user
      setUser(currentUser ?? null)
      
      if (currentUser) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('id')
          .eq('id', currentUser.id)
          .single()

        setIsAdmin(!!adminData)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Add this function to load all required data
  const loadInitialData = async () => {
    try {
      // First initialize any missing practices
      await initializePractices()
      
      // Then get all practices
      const today = new Date().toISOString().split('T')[0]
      const { data: practicesData } = await supabase
        .from('practices')
        .select('*')
        .lte('Date', today)
        .eq('Canceled', false)
        .order('Date', { ascending: false })
      
      // Get all active players
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .order('Name', { ascending: true })
      
      // Get all attendance records
      const { data: attendanceData } = await supabase
        .from('practice_attendance')
        .select('*')

      setPractices(practicesData || [])
      setPlayers(playersData || [])
      setAttendance(attendanceData || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Load data when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      loadInitialData()
    }
  }, [isAdmin])

  // Add back the initialize practices function
  const initializePractices = async () => {
    try {
      const missingTuesdays = await getMissingTuesdays()
      if (missingTuesdays.length === 0) return

      const { error } = await supabase
        .from('practices')
        .insert(
          missingTuesdays.map(date => ({
            Date: date,
            AttendanceSet: false,
            Canceled: false
          }))
        )

      if (error) console.error('Error adding practices:', error)
    } catch (error) {
      console.error('Error in initializePractices:', error)
    }
  }

  // Add back the get missing tuesdays function
  const getMissingTuesdays = async () => {
    const today = new Date()
    const { data: allPractices } = await supabase
      .from('practices')
      .select('Date')
      .order('Date', { ascending: true })

    if (!allPractices?.length) return []

    const existingDatesSet = new Set(allPractices.map(p => p.Date))
    const missingTuesdays = new Set<string>()

    const startDate = new Date(allPractices[0].Date)
    startDate.setUTCHours(0, 0, 0, 0)
    today.setUTCHours(0, 0, 0, 0)

    const currentDate = new Date(startDate)
    while (currentDate <= today) {
      if (currentDate.getDay() === 2) {
        const dateString = currentDate.toISOString().split('T')[0]
        if (!existingDatesSet.has(dateString)) {
          missingTuesdays.add(dateString)
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return Array.from(missingTuesdays)
  }

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-red-500/20 text-center"
        >
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don&apos;t have permission to access the admin panel.</p>
          <motion.button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
              rounded-xl text-red-400 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Out
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-[100dvh] relative overflow-hidden"
    >
      <div className="container mx-auto p-4 md:p-8 h-[100dvh] overflow-y-auto md:overflow-hidden">
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/5 p-6 h-full">
          <ManagementMenu 
            practices={practices}
            players={players}
            attendance={attendance}
            onDataUpdate={loadInitialData}
          />
        </div>
      </div>
    </motion.main>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} 