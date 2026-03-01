'use client'

import { useState } from 'react'
import { getPresignedUrl, registerAndGenerateCaptions } from './uploadActions'
import Link from 'next/link'

type Caption = {
  id: string
  content: string
  created_datetime_utc: string
}

type UploadState =
  | 'idle'
  | 'uploading'
  | 'registering'
  | 'generating'
  | 'complete'
  | 'error'

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [captions, setCaptions] = useState<Caption[]>([])
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
    ]
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, GIF, HEIC)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError(null)
    setCaptions([])
    setUploadedImageUrl(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploadState('uploading')
      setError(null)

      // Step 1: Get presigned URL
      const { presignedUrl, cdnUrl } = await getPresignedUrl(selectedFile.type)

      // Step 2: Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3')
      }

      setUploadedImageUrl(cdnUrl)
      setUploadState('registering')

      // Steps 3 & 4: Register image and generate captions
      setUploadState('generating')
      const generatedCaptions = await registerAndGenerateCaptions(cdnUrl)

      setCaptions(generatedCaptions)
      setUploadState('complete')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadState('error')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadState('idle')
    setError(null)
    setCaptions([])
    setUploadedImageUrl(null)
  }

  const getStatusMessage = () => {
    switch (uploadState) {
      case 'uploading':
        return '📤 Uploading image...'
      case 'registering':
        return '📝 Registering image...'
      case 'generating':
        return '🤖 Generating captions with AI...'
      case 'complete':
        return '✅ Captions generated!'
      default:
        return null
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>Upload Image & Generate Captions</h1>
        <Link
          href="/"
          style={{
            color: '#22D3EE',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            border: '2px solid #22D3EE',
            borderRadius: '8px',
          }}
        >
          ← Back to Captions
        </Link>
      </div>

      {/* Upload Section */}
      {uploadState !== 'complete' && (
        <div
          style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '2px solid #333',
          }}
        >
          <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>
            Select an Image
          </h2>

          {/* File Input */}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            onChange={handleFileSelect}
            disabled={uploadState !== 'idle' && uploadState !== 'error'}
            style={{
              display: 'block',
              marginBottom: '1.5rem',
              padding: '0.75rem',
              width: '100%',
              background: '#000',
              color: '#fff',
              border: '2px solid #22D3EE',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          />

          {/* Image Preview */}
          {previewUrl && (
            <div
              style={{
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  borderRadius: '8px',
                  border: '2px solid #22D3EE',
                }}
              />
            </div>
          )}

          {/* Status Message */}
          {getStatusMessage() && (
            <div
              style={{
                background: '#22D3EE',
                color: '#000',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {getStatusMessage()}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: '#EF4444',
                color: '#fff',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={
              !selectedFile ||
              (uploadState !== 'idle' && uploadState !== 'error')
            }
            style={{
              background:
                !selectedFile ||
                (uploadState !== 'idle' && uploadState !== 'error')
                  ? '#666'
                  : '#22D3EE',
              color: '#000',
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor:
                !selectedFile ||
                (uploadState !== 'idle' && uploadState !== 'error')
                  ? 'not-allowed'
                  : 'pointer',
              width: '100%',
            }}
          >
            {uploadState === 'idle' || uploadState === 'error'
              ? '🚀 Upload & Generate Captions'
              : 'Processing...'}
          </button>
        </div>
      )}

      {/* Generated Captions */}
      {uploadState === 'complete' && captions.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{ color: '#fff' }}>Generated Captions</h2>
            <button
              onClick={handleReset}
              style={{
                background: '#22D3EE',
                color: '#000',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Upload Another Image
            </button>
          </div>

          {/* Uploaded Image */}
          {uploadedImageUrl && (
            <div
              style={{
                marginBottom: '2rem',
                textAlign: 'center',
              }}
            >
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  borderRadius: '8px',
                  border: '2px solid #22D3EE',
                }}
              />
            </div>
          )}

          {/* Captions Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {captions.map((caption, index) => (
              <div
                key={caption.id}
                style={{
                  background: '#000',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '2px solid #22D3EE',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ lineHeight: 1.6, marginBottom: '0.5rem' }}>
                  {caption.content}
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#888',
                    textAlign: 'right',
                  }}
                >
                  Caption {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333',
          fontSize: '0.9rem',
          color: '#999',
        }}
      >
        <p>
          <strong>Supported formats:</strong> JPEG, PNG, WebP, GIF, HEIC
        </p>
        <p>
          <strong>Max file size:</strong> 10MB
        </p>
        <p>
          <strong>Processing time:</strong> Usually 10-30 seconds depending on
          the image
        </p>
      </div>
    </main>
  )
}
