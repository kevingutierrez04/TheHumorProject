'use client'

import { submitVote } from './actions'
import { useState, useTransition } from 'react'

interface VoteButtonsProps {
  captionId: string
  initialVoteValue: number | null
  initialNetVotes: number
}

export default function VoteButtons({
  captionId,
  initialVoteValue,
  initialNetVotes,
}: VoteButtonsProps) {
  const [isPending, startTransition] = useTransition()
  const [currentVote, setCurrentVote] = useState<number | null>(
    initialVoteValue
  )
  const [netVotes, setNetVotes] = useState(initialNetVotes)

  const handleVote = (voteValue: number) => {
    // Optimistic update
    const wasUpvoted = currentVote === 1
    const wasDownvoted = currentVote === -1
    const clickedUpvote = voteValue === 1
    const clickedDownvote = voteValue === -1

    let newNetVotes = netVotes
    let newVote: number | null = voteValue

    if (currentVote === voteValue) {
      // Toggle off
      newNetVotes -= voteValue
      newVote = null
    } else if (currentVote === null) {
      // New vote
      newNetVotes += voteValue
    } else {
      // Changing vote
      newNetVotes = newNetVotes - currentVote + voteValue
    }

    setCurrentVote(newVote)
    setNetVotes(newNetVotes)

    // Submit to server
    startTransition(async () => {
      const result = await submitVote(captionId, voteValue)
      if (result.error) {
        // Revert on error
        setCurrentVote(initialVoteValue)
        setNetVotes(initialNetVotes)
        alert(result.error)
      }
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '0.75rem',
      }}
    >
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        style={{
          background: currentVote === 1 ? '#22D3EE' : 'transparent',
          color: currentVote === 1 ? '#000' : '#22D3EE',
          border: '2px solid #22D3EE',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          opacity: isPending ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
      >
        ↑ Upvote
      </button>

      <span
        style={{
          color: netVotes > 0 ? '#22D3EE' : netVotes < 0 ? '#EF4444' : '#888',
          fontWeight: 'bold',
          minWidth: '2rem',
          textAlign: 'center',
        }}
      >
        {netVotes > 0 ? '+' : ''}
        {netVotes}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        style={{
          background: currentVote === -1 ? '#EF4444' : 'transparent',
          color: currentVote === -1 ? '#fff' : '#EF4444',
          border: '2px solid #EF4444',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          opacity: isPending ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
      >
        ↓ Downvote
      </button>
    </div>
  )
}
