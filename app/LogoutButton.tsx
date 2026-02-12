'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: '#22D3EE',
        color: '#000',
        padding: '0.5rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      Sign Out
    </button>
  )
}
