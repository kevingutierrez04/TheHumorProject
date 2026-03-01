'use server'

import { createClient } from '@/lib/supabase/server'

const API_BASE = 'https://api.almostcrackd.ai'

async function getAuthToken() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  return session.access_token
}

export async function getPresignedUrl(contentType: string) {
  const token = await getAuthToken()

  const response = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentType }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to get presigned URL: ${response.status} ${errorText}`
    )
  }

  return await response.json() // { presignedUrl, cdnUrl }
}

export async function registerAndGenerateCaptions(cdnUrl: string) {
  const token = await getAuthToken()

  // Step 3: Register Image
  const registerResponse = await fetch(
    `${API_BASE}/pipeline/upload-image-from-url`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: cdnUrl,
        isCommonUse: false,
      }),
    }
  )

  if (!registerResponse.ok) {
    const errorText = await registerResponse.text()
    throw new Error(
      `Failed to register image: ${registerResponse.status} ${errorText}`
    )
  }

  const { imageId } = await registerResponse.json()

  // Step 4: Generate Captions
  const generateResponse = await fetch(
    `${API_BASE}/pipeline/generate-captions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId }),
    }
  )

  if (!generateResponse.ok) {
    const errorText = await generateResponse.text()
    throw new Error(
      `Failed to generate captions: ${generateResponse.status} ${errorText}`
    )
  }

  return await generateResponse.json() // Returns array of captions
}
