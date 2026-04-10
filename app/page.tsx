import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import VoteButtons from './VoteButtons'
import OnboardingBanner from './OnboardingBanner'
import { getUserVotes, getVoteCounts } from './actions'

const PAGE_SIZE = 21

type Caption = {
  id: string
  content: string | null
  created_datetime_utc: string
  image_id: string | null
  imageUrl?: string
}

export default async function CaptionsPage(props: {
  searchParams?: Promise<{ page?: string }>
}) {
  // Check authentication
  const supabaseServer = await createClient()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const searchParams = await props.searchParams

  const currentPage = Number(searchParams?.page ?? '1')
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Fetch captions
  const { data, error } = await supabase
    .from('captions')
    .select('id, content, created_datetime_utc, image_id')
    .order('created_datetime_utc', { ascending: false })
    .range(from, to)

  // Fetch total count for pagination indicator
  const { count } = await supabase
    .from('captions')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error(error)
    return <div>Error loading captions</div>
  }

  const captions = (data ?? []) as Caption[]
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Fetch image URLs for this page's captions
  const imageIds = [...new Set(captions.map((c) => c.image_id).filter(Boolean))] as string[]
  const { data: imageData } = imageIds.length
    ? await supabase.from('images').select('id, url').in('id', imageIds)
    : { data: [] }
  const imageUrlMap: Record<string, string> = {}
  imageData?.forEach((img) => { imageUrlMap[img.id] = img.url })
  captions.forEach((c) => { if (c.image_id) c.imageUrl = imageUrlMap[c.image_id] })

  // Get user's votes and total vote counts for this page
  const captionIds = captions.map((c) => c.id)
  const [userVotes, voteCounts] = await Promise.all([
    getUserVotes(captionIds),
    getVoteCounts(captionIds),
  ])

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ margin: 0 }}>The Humor Project</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666', fontSize: '0.8rem' }}>{user.email}</span>
          <Link
            href="/upload"
            style={{
              background: '#22D3EE',
              color: '#000',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            📤 Upload Image
          </Link>
          <LogoutButton />
        </div>
      </div>

      <OnboardingBanner />

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}
      >
        {captions.map((caption) => (
          <div
            key={caption.id}
            style={{
              background: '#000',
              color: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderColor: '#22D3EE',
              borderWidth: '0.1rem',
              borderStyle: 'solid',
            }}
          >
            {caption.imageUrl && (
              <img
                src={caption.imageUrl}
                alt="Caption source"
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ lineHeight: 1.6, marginBottom: '0.75rem' }}>
                {caption.content ?? 'No caption text'}
              </p>
              <VoteButtons
                captionId={caption.id}
                initialVoteValue={userVotes[caption.id] ?? null}
                initialNetVotes={voteCounts[caption.id] ?? 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2.5rem',
        }}
      >
        {currentPage > 1 ? (
          <Link
            href={`/?page=${currentPage - 1}`}
            style={{
              background: '#22D3EE',
              color: '#000',
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            ← Previous
          </Link>
        ) : (
          <div />
        )}

        <div style={{ color: '#888', fontSize: '0.9rem' }}>
          Page {currentPage} of {totalPages}
        </div>

        {currentPage < totalPages ? (
          <Link
            href={`/?page=${currentPage + 1}`}
            style={{
              background: '#22D3EE',
              color: '#000',
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Next →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  )
}
