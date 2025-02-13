'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const handleGoogleLogin = async () => {
    try {
      // eslint-disable-next-line
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://team-patron.com/admin`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-red-500/10 rounded-full mb-4">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
          <p className="text-gray-400">Please sign in to access the admin panel</p>
        </div>

        <motion.button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 p-3 bg-white/5 hover:bg-white/10 
            border border-white/10 rounded-xl text-white font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  )
} 