'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminContextType {
  isAdmin: boolean | null
  checkAdminStatus: (userId: string) => Promise<boolean>
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminUsers, setAdminUsers] = useState<string[]>([])

  useEffect(() => {
    const loadAdmins = async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('id')
      
      if (!error && data) {
        setAdminUsers(data.map(admin => admin.id))
      }
    }

    loadAdmins()
  }, [])

  const checkAdminStatus = async (userId: string) => {
    return adminUsers.includes(userId)
  }

  return (
    <AdminContext.Provider value={{ isAdmin: null, checkAdminStatus }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used within an AdminProvider')
  return context
} 