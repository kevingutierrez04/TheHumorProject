'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createClient()

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to vote' }
  }

  // Check if user has already voted on this caption
  const { data: existingVote } = await supabase
    .from('caption_votes')
    .select('id, vote_value')
    .eq('caption_id', captionId)
    .eq('profile_id', user.id)
    .single()

  const now = new Date().toISOString()

  if (existingVote) {
    // If clicking the same vote, remove it (toggle off)
    if (existingVote.vote_value === voteValue) {
      const { error } = await supabase
        .from('caption_votes')
        .delete()
        .eq('id', existingVote.id)

      if (error) {
        return { error: error.message }
      }

      return { success: true, action: 'removed' }
    } else {
      // Update to new vote value
      const { error } = await supabase
        .from('caption_votes')
        .update({
          vote_value: voteValue,
          modified_datetime_utc: now,
        })
        .eq('id', existingVote.id)

      if (error) {
        return { error: error.message }
      }

      return { success: true, action: 'updated' }
    }
  }

  // Insert new vote
  const { error } = await supabase.from('caption_votes').insert({
    caption_id: captionId,
    profile_id: user.id,
    vote_value: voteValue,
    created_datetime_utc: now,
    modified_datetime_utc: now,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, action: 'created' }
}

export async function getUserVotes(captionIds: string[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || captionIds.length === 0) {
    return {}
  }

  const { data } = await supabase
    .from('caption_votes')
    .select('caption_id, vote_value')
    .eq('profile_id', user.id)
    .in('caption_id', captionIds)

  // Convert to map for easy lookup
  const votesMap: Record<string, number> = {}
  data?.forEach((vote) => {
    votesMap[vote.caption_id] = vote.vote_value
  })

  return votesMap
}

export async function getVoteCounts(captionIds: string[]) {
  const supabase = await createClient()

  if (captionIds.length === 0) {
    return {}
  }

  const { data } = await supabase
    .from('caption_votes')
    .select('caption_id, vote_value')
    .in('caption_id', captionIds)

  // Calculate net votes (upvotes - downvotes) for each caption
  const voteCounts: Record<string, number> = {}
  data?.forEach((vote) => {
    if (!voteCounts[vote.caption_id]) {
      voteCounts[vote.caption_id] = 0
    }
    voteCounts[vote.caption_id] += vote.vote_value
  })

  return voteCounts
}