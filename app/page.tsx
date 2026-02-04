import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

const PAGE_SIZE = 21

type Caption = {
  id: string
  content: string | null
  created_datetime_utc: string
}

export default async function CaptionsPage(props: {
  searchParams?: Promise<{ page?: string }>
}) {
  const searchParams = await props.searchParams

  const currentPage = Number(searchParams?.page ?? '1')
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Fetch captions
  const { data, error } = await supabase
    .from('captions')
    .select('id, content, created_datetime_utc')
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

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>The Humor Project Assignment 2
        <br></br>kmg2226</h1>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem'
        }}
      >
        {captions.map((caption) => (
          <div
            key={caption.id}
            style={{
              background: '#000',
              color: '#fff',
              borderRadius: '12px',
              padding: '1.25rem',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderColor: '#22D3EE',
              borderWidth: '0.1rem',
              borderStyle: 'solid'
            }}
          >
            <p style={{ lineHeight: 1.6 }}>
              {caption.content ?? 'No caption text'}
            </p>

            <p
              style={{
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: '#bbb'
              }}
            >
              {new Date(
                caption.created_datetime_utc
              ).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem'
        }}
      >
        {currentPage > 1 ? (
          <Link href={`/?page=${currentPage - 1}`}>
            ← Previous
          </Link>
        ) : (
          <div />
        )}

        <div>
          Page {currentPage} of {totalPages}
        </div>

        {currentPage < totalPages ? (
          <Link href={`/?page=${currentPage + 1}`}>
            Next →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  )
}
