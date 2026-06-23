'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { FileUploadArea } from '@/components/ui/FileUploadArea'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PortalRequest {
  id: number
  title: string
  description?: string
  due_date?: string
  accountant_name: string
}

interface UploadedFile {
  name: string
  size: number
}

type PageState = 'loading' | 'not_found' | 'ready' | 'success' | 'error'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PortalPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const [shareToken, setShareToken] = useState<string>('')
  const [pageState, setPageState] = useState<PageState>('loading')
  const [request, setRequest] = useState<PortalRequest | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'complete' | 'error'>>({})
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Resolve the async params (Next.js App Router pattern)
  useEffect(() => {
    params.then((p) => setShareToken(p.shareToken))
  }, [params])

  const fetchRequest = useCallback(async () => {
    if (!shareToken) return
    setPageState('loading')
    try {
      const res = await fetch(`/api/portal/${shareToken}`)
      if (res.status === 404) {
        setPageState('not_found')
        return
      }
      if (!res.ok) {
        setPageState('error')
        setErrorMessage('Something went wrong. Please try again.')
        return
      }
      const data: PortalRequest = await res.json()
      setRequest(data)
      setPageState('ready')
    } catch {
      setPageState('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }, [shareToken])

  useEffect(() => {
    void fetchRequest()
  }, [fetchRequest])

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (!request || !shareToken || files.length === 0) return
      setIsUploading(true)

      const nextStatus: Record<string, 'uploading'> = {}
      const nextProgress: Record<string, number> = {}
      for (const f of files) {
        nextStatus[f.name] = 'uploading'
        nextProgress[f.name] = 0
      }
      setUploadStatus((prev) => ({ ...prev, ...nextStatus }))
      setUploadProgress((prev) => ({ ...prev, ...nextProgress }))

      const successFiles: UploadedFile[] = []

      for (const file of files) {
        try {
          const formData = new FormData()
          formData.append('file', file)

          // Simulate progress while uploading
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              const current = prev[file.name] ?? 0
              if (current >= 90) {
                clearInterval(progressInterval)
                return prev
              }
              return { ...prev, [file.name]: current + 10 }
            })
          }, 150)

          const res = await fetch(`/api/portal/${shareToken}/upload`, {
            method: 'POST',
            body: formData,
          })

          clearInterval(progressInterval)

          if (!res.ok) {
            setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }))
            setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))
            continue
          }

          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
          setUploadStatus((prev) => ({ ...prev, [file.name]: 'complete' }))
          successFiles.push({ name: file.name, size: file.size })
        } catch {
          setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }))
        }
      }

      setIsUploading(false)

      if (successFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...successFiles])
        // Small delay so user sees 100% before transitioning to success
        setTimeout(() => setPageState('success'), 600)
      }
    },
    [request, shareToken]
  )

  // ── Not found ────────────────────────────────────────────────────────────────
  if (pageState === 'not_found') {
    return (
      <PortalShell>
        <div className="text-center">
          <svg
            aria-hidden="true"
            className="mx-auto w-12 h-12 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Link Not Found
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This upload link is invalid or has expired. Please contact your accountant for a new
            link.
          </p>
        </div>
      </PortalShell>
    )
  }

  // ── Network / generic error ───────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <PortalShell>
        <div className="text-center">
          <svg
            aria-hidden="true"
            className="mx-auto w-12 h-12 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something Went Wrong
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
          <Button variant="secondary" onClick={fetchRequest}>
            Try Again
          </Button>
        </div>
      </PortalShell>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────────
  if (pageState === 'loading' || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading upload form..." />
      </div>
    )
  }

  // ── Success state ─────────────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <PortalShell>
        <div className="text-center">
          <svg
            aria-hidden="true"
            className="mx-auto w-16 h-16 text-green-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1
            tabIndex={-1}
            className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 focus:outline-none"
          >
            Files Received!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Thank you. Your accountant will be notified.
          </p>

          {uploadedFiles.length > 0 && (
            <div className="text-left mb-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Uploaded files
              </p>
              <ul className="flex flex-col gap-1.5">
                {uploadedFiles.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-standard border border-gray-200 dark:border-gray-700 text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400 ml-3 flex-shrink-0">{formatBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              setPageState('ready')
              setUploadedFiles([])
              setUploadProgress({})
              setUploadStatus({})
            }}
            className="w-full"
          >
            Upload More Files
          </Button>
        </div>
      </PortalShell>
    )
  }

  // ── Ready state ───────────────────────────────────────────────────────────────
  const formatDueDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Branding */}
        <p className="text-sm font-medium text-gray-500 mb-6 text-center">Accountant Hub</p>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-modal shadow-medium p-6 sm:p-8">
          {/* Context */}
          <div>
            <p className="text-xs text-gray-500">Requested by:</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {request.accountant_name}
            </p>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-1">
            {request.title}
          </h1>

          {/* Due date */}
          {request.due_date && (
            <p className="text-sm text-gray-500 mb-4">
              Due by{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatDueDate(request.due_date)}
              </span>
            </p>
          )}

          {/* Description */}
          {request.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {request.description}
            </p>
          )}

          <hr className="border-gray-200 dark:border-gray-700 mb-6" />

          {/* Upload section */}
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Upload Documents
            </p>
            <FileUploadArea
              onFilesSelected={handleFilesSelected}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp"
              maxSize={50 * 1024 * 1024}
              multiple
              disabled={isUploading}
              uploadProgress={uploadProgress}
              uploadStatus={uploadStatus}
              helperText="PDF, DOCX, XLSX, PNG, JPG up to 50 MB"
            />
          </div>

          {/* Security note */}
          <p className="text-xs text-gray-400 mt-4 text-center">
            Your files are encrypted and only accessible by your accountant.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Shared shell for error/success states ──────────────────────────────────────
function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <p className="text-sm font-medium text-gray-500 mb-6 text-center">Accountant Hub</p>
        <div className="bg-white dark:bg-gray-900 rounded-modal shadow-medium p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
