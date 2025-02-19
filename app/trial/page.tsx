'use client'
import TrialForm from '@/components/trial/TrialForm'
import { useRouter } from 'next/navigation'

export default function TrialPage() {
  const router = useRouter()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <TrialForm onBack={() => router.push('/')} />
    </div>
  )
} 