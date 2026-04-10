'use client'

import { useState, useEffect } from 'react'

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('humor_onboarding_seen')
    if (!seen) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem('humor_onboarding_seen', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        background: '#0e3a45',
        border: '1px solid #22D3EE',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div>
        <p style={{ fontWeight: 'bold', color: '#22D3EE', marginBottom: '0.4rem', fontSize: '1rem' }}>
          Welcome to The Humor Project
        </p>
        <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Each card shows an AI-generated caption for a photo. <strong style={{ color: '#fff' }}>Upvote</strong> the ones that made you laugh,{' '}
          <strong style={{ color: '#fff' }}>downvote</strong> the ones that missed. Want to add your own?{' '}
          Hit <strong style={{ color: '#fff' }}>Upload Image</strong> to generate new captions for any photo.
        </p>
      </div>
      <button
        onClick={dismiss}
        style={{
          background: '#22D3EE',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '0.4rem 1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: '0.85rem',
          flexShrink: 0,
        }}
      >
        Got it
      </button>
    </div>
  )
}
