'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error logging in:', error.message)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px',
          border: '1px solid #22D3EE',
        }}
      >
        <h1 style={{ color: '#fff', marginBottom: '1rem' }}>
          The Humor Project
        </h1>
        <p style={{ color: '#bbb', marginBottom: '2rem' }}>
          Assignment 3 - kmg2226
        </p>
        <p style={{ color: '#ccc', marginBottom: '2rem' }}>
          Please sign in with your Google account to view captions
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            background: '#22D3EE',
            color: '#000',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Sign in with Google
        </button>
      </div>
    </main>
  )
}
