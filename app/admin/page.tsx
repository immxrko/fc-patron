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
  const [practices, setPractices] = useState<Practice[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [dataLoading, setDataLoading] = useState(true)

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

  const loadInitialData = async () => {
    try {
      const [practicesRes, playersRes, attendanceRes] = await Promise.all([
        supabase.from('practices').select('*').order('date', { ascending: false }),
        supabase.from('players').select('*'),
        supabase.from('attendance').select('*')
      ])

      if (practicesRes.data) setPractices(practicesRes.data)
      if (playersRes.data) setPlayers(playersRes.data)
      if (attendanceRes.data) setAttendance(attendanceRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
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
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 text-sm font-medium transition-colors"
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