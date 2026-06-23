'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PortalRequest {
  id: number
  title: string
  description?: string
  due_date?: string
  accountant_name: string
  accountant_firm?: string
  document_types?: string[]
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
    async (files: FileList | null) => {
      if (!request || !shareToken || !files || files.length === 0) return
      setIsUploading(true)

      const fileArray = Array.from(files)
      const nextStatus: Record<string, 'uploading'> = {}
      const nextProgress: Record<string, number> = {}
      for (const f of fileArray) {
        nextStatus[f.name] = 'uploading'
        nextProgress[f.name] = 0
      }
      setUploadStatus((prev) => ({ ...prev, ...nextStatus }))
      setUploadProgress((prev) => ({ ...prev, ...nextProgress }))

      const successFiles: UploadedFile[] = []

      for (const file of fileArray) {
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
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-h3 font-serif text-neutral-900 mb-2">Link Not Found</h1>
          <p className="text-body-md text-neutral-600">
            This upload link is invalid or has expired. Please contact your accountant for a new link.
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
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-h3 font-serif text-neutral-900 mb-2">Something Went Wrong</h1>
          <p className="text-body-md text-neutral-600 mb-6">{errorMessage}</p>
          <button
            onClick={fetchRequest}
            className="bg-primary-600 text-white text-body-md font-semibold px-6 py-3 rounded-button hover:bg-primary-700 transition"
          >
            Try Again
          </button>
        </div>
      </PortalShell>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────────
  if (pageState === 'loading' || !request) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner fullPage />
      </div>
    )
  }

  // ── Success state ─────────────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <PortalShell>
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-h3 font-serif text-neutral-900 mb-2">Files Received!</h1>
          <p className="text-body-md text-neutral-600 mb-8">Thank you. Your accountant will be notified.</p>

          {uploadedFiles.length > 0 && (
            <div className="text-left mb-8">
              <p className="text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-3">Uploaded files</p>
              <div className="space-y-2">
                {uploadedFiles.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-button border border-neutral-200"
                  >
                    <span className="text-body-md text-neutral-900 truncate">{f.name}</span>
                    <span className="text-xs text-neutral-500 ml-3 flex-shrink-0">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setPageState('ready')
              setUploadedFiles([])
              setUploadProgress({})
              setUploadStatus({})
            }}
            className="w-full bg-white text-neutral-900 text-body-md font-medium px-6 py-3 rounded-button border border-neutral-300 hover:bg-neutral-50 transition"
          >
            Upload More Files
          </button>
        </div>
      </PortalShell>
    )
  }

  // ── Ready state ───────────────────────────────────────────────────────────────
  const formatDueDate = (d?: string) => {
    if (!d) return null
    const date = new Date(d)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysRemaining = () => {
    if (!request.due_date) return null
    const dueDate = new Date(request.due_date)
    const today = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / msPerDay)
    return Math.max(0, daysLeft)
  }

  const daysLeft = getDaysRemaining()

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[560px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-[26px] h-[26px] rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-[9px] h-[9px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-[15px] font-semibold text-neutral-900">MiddleDoc</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl px-[28px] py-[30px]" style={{ boxShadow: '0 10px 30px -8px rgba(0,0,0,0.12)' }}>
          {/* Requested by */}
          <div className="text-xs text-neutral-400 mb-1">
            Requested by {request.accountant_name}
            {request.accountant_firm && ` · ${request.accountant_firm}`}
          </div>

          {/* Title */}
          <h1 className="text-h3 font-serif text-neutral-900 mb-3">{request.title}</h1>

          {/* Due date */}
          {request.due_date && (
            <p className="text-[13.5px] text-neutral-500 mb-4">
              {request.accountant_name} needs these documents by{' '}
              <strong className="text-neutral-900">{formatDueDate(request.due_date)}</strong>. Upload what you
              have — you can come back for the rest.
            </p>
          )}

          {/* Status badge */}
          {daysLeft !== null && uploadedFiles.length > 0 && (
            <div className="flex items-center gap-2 px-[14px] py-[10px] bg-warning-100 border border-warning-200 rounded-[10px] mb-6">
              <span className="text-[13px] text-warning-700">
                ⏱ {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left · {uploadedFiles.length} uploaded — almost there
              </span>
            </div>
          )}

          {/* Checklist */}
          {request.document_types && request.document_types.length > 0 && (
            <div className="space-y-[9px] mb-6">
              {request.document_types.map((doc, idx) => {
                const isUploaded = uploadedFiles.some(f => f.name.toLowerCase().includes(doc.toLowerCase()))
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-[13px] py-[12px] rounded-[10px] border ${
                      isUploaded
                        ? 'bg-primary-50 border-primary-100'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isUploaded
                          ? 'bg-primary-600'
                          : 'border-2 border-neutral-300'
                      }`}
                    >
                      {isUploaded && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className={`text-body-md ${isUploaded ? 'text-neutral-900' : 'text-neutral-600'}`}>
                      {doc}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* File input */}
          <div className="mb-4">
            <label className="block">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp"
                onChange={(e) => handleFilesSelected(e.target.files)}
                disabled={isUploading}
                className="hidden"
              />
              <div className="border-[1.5px] border-dashed border-primary-200 bg-primary-50 rounded-[13px] p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-100 transition">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-primary-600 flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">↑</span>
                </div>
                <div className="text-body-md font-semibold text-neutral-900 mb-1">
                  Drop files here, or{' '}
                  <span className="text-primary-600">choose from your device</span>
                </div>
                <div className="text-xs text-neutral-400">
                  PDF, DOCX, XLSX, PNG, JPG up to 50 MB
                </div>
              </div>
            </label>
          </div>

          {/* Upload progress */}
          {Object.keys(uploadStatus).length > 0 && (
            <div className="mb-4 space-y-2">
              {Object.entries(uploadStatus).map(([fileName, status]) => (
                <div key={fileName} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-600 flex-1 truncate">{fileName}</span>
                  <div className="w-16 h-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        status === 'complete'
                          ? 'bg-primary-600 w-full'
                          : status === 'error'
                          ? 'bg-danger-600'
                          : 'bg-primary-600'
                      }`}
                      style={{ width: `${uploadProgress[fileName] ?? 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security note */}
          <p className="text-[11.5px] text-neutral-400 text-center">
            🔒 Encrypted in transit and at rest. Only {request.accountant_name} can see what you upload.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Shared shell for error/success states ──────────────────────────────────────
function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[560px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-[26px] h-[26px] rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-[9px] h-[9px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-[15px] font-semibold text-neutral-900">MiddleDoc</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl px-[28px] py-[30px]" style={{ boxShadow: '0 10px 30px -8px rgba(0,0,0,0.12)' }}>{children}</div>
      </div>
    </div>
  )
}
