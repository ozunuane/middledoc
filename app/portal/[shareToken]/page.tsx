'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SignatureCanvas } from '@/components/SignatureCanvas'
import { InstallPrompt } from '@/components/InstallPrompt'
import type { SignatureRequest } from '@/types/index'

interface PortalInvoice {
  id: number
  amount_cents: number
  currency: string
  description?: string
  status: 'sent' | 'paid' | 'cancelled'
  payment_required: boolean
}

interface PortalRequest {
  id: number
  title: string
  description?: string
  due_date?: string
  accountant_name: string
  accountant_firm?: string
  document_types?: string[]
  checklist_items?: string[]
  invoice?: PortalInvoice | null
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
  const [paymentVerifying, setPaymentVerifying] = useState(false)

  // Signature state
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([])
  const [signingRequest, setSigningRequest] = useState<SignatureRequest | null>(null)
  const [signerName, setSignerName] = useState('')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [signing, setSigning] = useState(false)

  // Resolve the async params (Next.js App Router pattern)
  useEffect(() => {
    params.then((p) => setShareToken(p.shareToken))
  }, [params])

  // Handle payment callback from Paystack redirect
  useEffect(() => {
    if (!shareToken) return
    const urlParams = new URLSearchParams(window.location.search)
    const isPaymentCallback = urlParams.get('payment') === 'callback'
    const reference = urlParams.get('reference') || urlParams.get('trxref')
    if (isPaymentCallback && reference) {
      setPaymentVerifying(true)
      fetch(`/api/portal-pay/${shareToken}/verify?reference=${encodeURIComponent(reference)}`)
        .then(async (res) => {
          if (res.ok) {
            // Refresh request data to get updated invoice status
            void fetchRequest()
          }
          // Clean up URL
          window.history.replaceState({}, '', `/portal/${shareToken}`)
        })
        .catch(() => {
          // silently fail, user can retry
        })
        .finally(() => setPaymentVerifying(false))
    }
  }, [shareToken]) // eslint-disable-line react-hooks/exhaustive-deps

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

          const res = await fetch(`/api/portal-upload/${shareToken}`, {
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

  const handlePayInvoice = async () => {
    try {
      const res = await fetch(`/api/portal-pay/${shareToken}`, { method: 'POST' })
      const data = await res.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch {
      // silently fail
    }
  }

  // Signature functions
  const fetchSignatureRequests = useCallback(async () => {
    if (!shareToken) return
    try {
      const res = await fetch(`/api/portal-sign/${shareToken}`)
      if (res.ok) {
        const data: SignatureRequest[] = await res.json()
        setSignatureRequests(data)
      }
    } catch {
      // silently fail
    }
  }, [shareToken])

  useEffect(() => {
    if (shareToken) {
      void fetchSignatureRequests()
    }
  }, [fetchSignatureRequests, shareToken])

  const handleSign = async () => {
    if (!signingRequest || !signatureData || !signerName.trim() || !consent) return
    setSigning(true)
    try {
      const res = await fetch(`/api/portal-sign/${shareToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_request_id: signingRequest.id,
          signature_data: signatureData,
          signer_name: signerName.trim(),
        }),
      })
      if (res.ok) {
        setSigningRequest(null)
        setSignatureData(null)
        setSignerName('')
        setConsent(false)
        fetchSignatureRequests()
      }
    } catch {
      // silently fail
    } finally {
      setSigning(false)
    }
  }

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

          {/* Invoice / Payment */}
          {request.invoice && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-[10px] p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-semibold text-neutral-900">Preparation Fee</span>
                <span className="text-lg font-semibold font-mono text-neutral-900">
                  ${(request.invoice.amount_cents / 100).toFixed(2)}
                </span>
              </div>
              {request.invoice.description && (
                <p className="text-[12px] text-neutral-500 mb-3">{request.invoice.description}</p>
              )}
              {request.invoice.status === 'paid' ? (
                <div className="flex items-center gap-2 text-[13px] text-primary-600 font-semibold">
                  <span>&#10003;</span> Paid
                </div>
              ) : paymentVerifying ? (
                <div className="text-[13px] text-neutral-500 text-center py-2">Verifying payment...</div>
              ) : (
                <button
                  onClick={handlePayInvoice}
                  className="w-full bg-primary-600 text-white text-[13px] font-semibold py-2.5 rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
                >
                  Pay ${(request.invoice.amount_cents / 100).toFixed(2)}
                </button>
              )}
              {request.invoice.payment_required && request.invoice.status !== 'paid' && (
                <p className="text-[11px] text-neutral-400 mt-2 text-center">Payment is required to access completed documents</p>
              )}
            </div>
          )}

          {/* Checklist */}
          {((request.checklist_items && request.checklist_items.length > 0) || (request.document_types && request.document_types.length > 0)) && (
            <div className="space-y-[9px] mb-6">
              {(request.checklist_items && request.checklist_items.length > 0 ? request.checklist_items : request.document_types || []).map((doc, idx) => {
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

          {/* Documents to sign */}
          {signatureRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-body-md font-semibold text-neutral-900 mb-3">Documents to Sign</h3>
              {signatureRequests.map((sig) => (
                <div key={sig.id} className="border border-neutral-200 rounded-[10px] p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-neutral-900">{sig.original_file_name}</span>
                    {sig.status === 'signed' ? (
                      <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        Signed
                      </span>
                    ) : (
                      <button
                        onClick={() => setSigningRequest(sig)}
                        className="text-[13px] text-primary-600 font-semibold cursor-pointer"
                      >
                        Sign now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile Camera + File Buttons (visible on small screens only) */}
          <div className="flex gap-3 mb-4 sm:hidden">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
                disabled={isUploading}
              />
              <div className="bg-primary-600 text-white text-center text-[13px] font-semibold py-3 rounded-[9px] flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Take Photo
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
                disabled={isUploading}
              />
              <div className="bg-white border border-neutral-300 text-neutral-900 text-center text-[13px] font-medium py-3 rounded-[9px]">
                Choose Files
              </div>
            </label>
          </div>

          {/* Desktop drag-and-drop area (hidden on small screens) */}
          <div className="mb-4 hidden sm:block">
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
                  <span className="text-white text-xl">&uarr;</span>
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

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Signing modal */}
      {signingRequest && (
        <div className="fixed inset-0 bg-neutral-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6">
            <h3 className="text-lg font-serif text-neutral-900 mb-1">Sign Document</h3>
            <p className="text-[13px] text-neutral-500 mb-4">{signingRequest.original_file_name}</p>

            {/* PDF Preview */}
            <div className="border border-neutral-200 rounded-[9px] mb-4 overflow-hidden" style={{ height: '200px' }}>
              <iframe
                src={`/api/portal-sign/${shareToken}?preview=${signingRequest.id}`}
                className="w-full h-full"
                title="Document preview"
              />
            </div>

            {/* Signer Name */}
            <input
              type="text"
              placeholder="Your full name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] mb-4 focus:outline-none focus:border-primary-600"
            />

            {/* Signature Canvas */}
            <SignatureCanvas onSignatureChange={setSignatureData} />

            {/* Consent */}
            <label className="flex items-start gap-2 mt-4 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-primary-600"
              />
              <span className="text-[12px] text-neutral-500">
                I agree that this electronic signature is legally binding and equivalent to my handwritten signature.
              </span>
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSigningRequest(null)
                  setSignatureData(null)
                  setSignerName('')
                  setConsent(false)
                }}
                className="px-4 py-2.5 text-[13px] border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={!consent || !signatureData || !signerName.trim() || signing}
                className="px-5 py-2.5 text-[13px] font-semibold bg-primary-600 text-white rounded-[9px] disabled:opacity-50 hover:bg-primary-700 transition cursor-pointer"
              >
                {signing ? 'Signing...' : 'Sign document'}
              </button>
            </div>
          </div>
        </div>
      )}
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
