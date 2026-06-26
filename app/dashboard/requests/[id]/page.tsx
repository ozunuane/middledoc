'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { DocumentRequest, Client } from '@/types/index'

interface UploadedFile {
  id: number
  file_name: string
  file_size?: number
  uploaded_at: string
  status?: 'uploaded' | 'rejected'
  rejection_reason?: string
  rejected_at?: string
  // Classification fields
  document_category?: string
  document_year?: number
  confidence?: number
  issues?: string[]
  matched_checklist_item?: string
  match_confidence?: number
  classification_status?: 'queued' | 'processing' | 'completed' | 'failed'
  accountant_override?: string
  category_display_name?: string
}

interface RequestDetail extends DocumentRequest {
  accountant_name?: string
  accountant_email?: string
  checklist_items?: string[]
  uploaded_files?: UploadedFile[]
  documents?: Array<{
    id: number
    name: string
    status: 'pending' | 'received'
    received_at?: string
    file_name?: string
    file_size?: number
  }>
  activity?: Array<{
    id: number
    type: 'upload' | 'reminder' | 'created'
    description: string
    timestamp: string
  }>
}

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, teamRole } = useAuth(true)
  const canSeeAllNav = !teamRole || teamRole === 'owner' || teamRole === 'admin'

  const [requestId, setRequestId] = useState<string>('')
  const { data: request, loading, refetch } = useApi<RequestDetail>(`/api/request-details/${requestId}`, {
    skip: !requestId,
  })
  const { data: clients } = useApi<Client[]>('/api/clients')

  useEffect(() => {
    params.then((p) => setRequestId(p.id))
  }, [params])

  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  // Rejection state
  const [rejectingFileId, setRejectingFileId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  // Preview state
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)

  // Classification override state
  const [overrideFileId, setOverrideFileId] = useState<number | null>(null)
  const [overrideCategory, setOverrideCategory] = useState('')
  const [overriding, setOverriding] = useState(false)

  const CATEGORY_OPTIONS = [
    { slug: 'w2', label: 'W-2' }, { slug: '1099_nec', label: '1099-NEC' },
    { slug: '1099_int', label: '1099-INT' }, { slug: '1099_div', label: '1099-DIV' },
    { slug: '1099_b', label: '1099-B' }, { slug: '1099_r', label: '1099-R' },
    { slug: '1099_misc', label: '1099-MISC' }, { slug: 'k1', label: 'K-1' },
    { slug: 'w9', label: 'W-9' }, { slug: 'bank_statement', label: 'Bank Statement' },
    { slug: 'credit_card_statement', label: 'Credit Card Statement' },
    { slug: 'mortgage_statement', label: 'Mortgage Statement' },
    { slug: 'property_tax', label: 'Property Tax Statement' },
    { slug: 'profit_loss', label: 'Profit & Loss' }, { slug: 'balance_sheet', label: 'Balance Sheet' },
    { slug: 'payroll_record', label: 'Payroll Record' }, { slug: 'invoice', label: 'Invoice' },
    { slug: 'charity_receipt', label: 'Charitable Donation Receipt' },
    { slug: 'medical_receipt', label: 'Medical Expense' },
    { slug: 'business_expense', label: 'Business Expense Receipt' },
    { slug: 'tax_return_prior', label: 'Prior Year Tax Return' },
    { slug: 'id_document', label: 'ID / Government Document' },
    { slug: 'insurance', label: 'Insurance Document' },
    { slug: 'contract', label: 'Contract / Agreement' },
    { slug: 'other', label: 'Other' },
  ]

  const handleConfirmClassification = async (uploadId: number, override?: string) => {
    setOverriding(true)
    try {
      const res = await fetch('/api/classifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upload_id: uploadId,
          override_category: override || undefined,
        }),
      })
      if (res.ok) {
        setOverrideFileId(null)
        setOverrideCategory('')
        refetch()
      }
    } catch {
      // silently fail
    } finally {
      setOverriding(false)
    }
  }

  const handleReprocess = async (uploadId: number) => {
    try {
      await fetch('/api/classifications/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_id: uploadId }),
      })
      // Poll for update after a short delay
      setTimeout(() => refetch(), 3000)
    } catch {
      // silently fail
    }
  }

  const handleSendReminder = async () => {
    if (sending || !request) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: request.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setSendResult(data.message || 'Reminder sent')
      } else {
        setSendResult(data.error || 'Failed to send reminder')
      }
    } catch {
      setSendResult('Network error — please try again')
    } finally {
      setSending(false)
      setTimeout(() => setSendResult(null), 3000)
    }
  }

  const handleReject = async () => {
    if (rejecting || !rejectingFileId || !rejectReason.trim()) return
    setRejecting(true)
    try {
      const res = await fetch('/api/documents/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: rejectingFileId,
          reason: rejectReason.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setRejectingFileId(null)
        setRejectReason('')
        refetch()
      } else {
        alert(data.error || 'Failed to reject document')
      }
    } catch {
      alert('Network error -- please try again')
    } finally {
      setRejecting(false)
    }
  }

  const getClientName = (clientId: number): string => {
    return clients?.find((c) => c.id === clientId)?.name ?? 'Unknown Client'
  }

  const getClientEmail = (clientId: number): string => {
    return clients?.find((c) => c.id === clientId)?.email ?? 'unknown@example.com'
  }

  const getDaysLeft = (): number => {
    if (!request?.due_date) return 0
    const dueDate = new Date(request.due_date)
    const today = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / msPerDay)
    return Math.max(0, daysLeft)
  }

  const getProgressPercentage = (): number => {
    if (!request?.documents || request.documents.length === 0) return 0
    const received = request.documents.filter((d) => d.status === 'received').length
    return Math.round((received / request.documents.length) * 100)
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatBytes = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return <LoadingSpinner fullPage />
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-neutral-50 px-9 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-h3 font-serif text-neutral-900 mb-2">Request not found</h1>
            <p className="text-body-md text-neutral-600 mb-6">This request doesn't exist or has been deleted.</p>
            <Link
              href="/dashboard/requests"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Back to requests
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const daysLeft = getDaysLeft()
  const progressPercentage = getProgressPercentage()
  const previewExt = previewFile ? getFileExtension(previewFile.file_name) : ''

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <div className="bg-white border-b border-neutral-200 px-9 py-4.5 flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-[16px] font-semibold text-neutral-900">MiddleDoc</span>
          </div>

          {/* Nav Links */}
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition">
              Dashboard
            </Link>
            <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">
              Clients
            </Link>
            <span className="text-sm text-neutral-900 font-semibold">Requests</span>
            {canSeeAllNav && (
              <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition">
                Documents
              </Link>
            )}
            {canSeeAllNav && (
              <Link href="/dashboard/settings" className="text-sm text-neutral-500 hover:text-neutral-900 transition">
                Settings
              </Link>
            )}
          </div>
        </div>

        {/* User Avatar */}
        {canSeeAllNav ? (
          <Link href="/dashboard/settings" className="cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
            </div>
          </Link>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-9 max-w-7xl mx-auto">
        {/* Back link */}
        <Link href="/dashboard/requests" className="text-primary-600 font-medium text-[13px] mb-6 inline-block hover:text-primary-700">
          &larr; Back to requests
        </Link>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-h2 font-serif text-neutral-900">{request.title}</h1>
              <StatusBadge status={request.status} size="md" />
            </div>
            <p className="text-sm text-neutral-500">
              {getClientName(request.client_id)} · {getClientEmail(request.client_id)} · due{' '}
              <strong className="text-neutral-900">{formatDate(request.due_date)}</strong> ({daysLeft} days left)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendReminder}
              disabled={sending}
              className="bg-white text-neutral-900 text-xs font-medium px-4 py-2.5 rounded-button border border-neutral-300 hover:bg-neutral-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send reminder'}
            </button>
            <button onClick={() => alert('Download started')} className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-button hover:bg-neutral-800 transition">
              Download all
            </button>
          </div>
        </div>

        {/* Reminder toast */}
        {sendResult && (
          <div className="mb-4 px-4 py-2.5 rounded-button text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 inline-block">
            {sendResult}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid gap-6" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          {/* Left: Documents checklist */}
          <div>
            <div className="bg-white border border-neutral-200 rounded-card overflow-hidden">
              {/* Header */}
              <div className="px-[22px] py-[18px] border-b border-[#EFEAE0]">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-body-md font-semibold text-neutral-900">Documents requested</h2>
                  <span className="text-[13px] font-mono text-neutral-600">
                    {request.documents?.filter((d) => d.status === 'received').length ?? 0} / {request.documents?.length ?? 0} received
                  </span>
                </div>
                <div className="w-full h-[6px] bg-neutral-150 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Documents */}
              <div className="divide-y divide-neutral-200">
                {request.documents && request.documents.length > 0 ? (
                  request.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-3 px-[22px] py-[15px] ${
                        doc.status === 'pending' ? 'bg-paper-pending' : ''
                      }`}
                    >
                      <div
                        className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 ${
                          doc.status === 'received'
                            ? 'bg-primary-600'
                            : 'border-[1.5px] border-neutral-300'
                        }`}
                      >
                        {doc.status === 'received' && (
                          <span className="text-white text-xs font-bold">&#10003;</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-body-md font-medium ${doc.status === 'pending' ? 'text-neutral-700' : 'text-neutral-900'}`}>{doc.name}</div>
                        {doc.status === 'received' && doc.file_name && (
                          <div className="text-xs text-neutral-600 mt-1">
                            {doc.file_name} · {formatBytes(doc.file_size)} · received{' '}
                            {doc.received_at && formatDateTime(doc.received_at)}
                          </div>
                        )}
                        {doc.status === 'pending' && (
                          <div className="text-xs text-warning-600 font-medium mt-1">Still needed</div>
                        )}
                      </div>

                      {doc.status === 'received' && (
                        <span className="text-primary-600 text-body-md">&darr;</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-neutral-600">
                    <p>No documents tracked for this request</p>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded files with rejection support and preview */}
            {request.uploaded_files && request.uploaded_files.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-card overflow-hidden mt-6">
                <div className="px-[22px] py-[18px] border-b border-[#EFEAE0]">
                  <h2 className="text-body-md font-semibold text-neutral-900">Uploaded files</h2>
                </div>
                <div className="divide-y divide-neutral-200">
                  {request.uploaded_files.map((file) => {
                    const ext = getFileExtension(file.file_name)
                    const isPreviewable = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
                    const confidencePct = file.confidence ? Math.round(file.confidence * 100) : null
                    return (
                      <div key={file.id} className="px-[22px] py-[15px]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-body-md font-medium text-neutral-900 truncate">{file.file_name}</span>
                              {file.status === 'rejected' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                  Rejected
                                </span>
                              )}
                              {/* Classification badge */}
                              {file.classification_status === 'processing' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                                  Analyzing...
                                </span>
                              )}
                              {file.classification_status === 'completed' && file.category_display_name && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  file.accountant_override
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : confidencePct && confidencePct >= 80
                                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {file.category_display_name} {confidencePct !== null && !file.accountant_override ? `(${confidencePct}%)` : ''}
                                  {file.document_year ? ` · ${file.document_year}` : ''}
                                </span>
                              )}
                              {file.classification_status === 'failed' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
                                  Classification failed
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                              {formatBytes(file.file_size)} · uploaded {formatDateTime(file.uploaded_at)}
                            </div>
                            {file.status === 'rejected' && file.rejection_reason && (
                              <div className="text-xs text-red-600 mt-1">
                                Rejected: {file.rejection_reason}
                              </div>
                            )}
                            {/* Checklist match */}
                            {file.matched_checklist_item && (
                              <div className="text-xs text-green-700 mt-1 flex items-center gap-1">
                                <span className="text-green-600 font-bold">&#10003;</span> Matches: {file.matched_checklist_item}
                              </div>
                            )}
                            {/* Issues */}
                            {file.issues && file.issues.length > 0 && (
                              <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <span title={file.issues.join('; ')}>&#9888; {file.issues[0]}{file.issues.length > 1 ? ` (+${file.issues.length - 1} more)` : ''}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            {/* Classification actions */}
                            {file.classification_status === 'completed' && !file.accountant_override && (
                              <>
                                <button
                                  onClick={() => handleConfirmClassification(file.id)}
                                  disabled={overriding}
                                  className="text-xs text-green-600 hover:text-green-700 cursor-pointer"
                                  title="Confirm classification"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => { setOverrideFileId(file.id); setOverrideCategory(file.document_category || '') }}
                                  className="text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
                                  title="Override classification"
                                >
                                  Override
                                </button>
                              </>
                            )}
                            {(file.classification_status === 'failed' || file.classification_status === 'completed') && (
                              <button
                                onClick={() => handleReprocess(file.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                                title="Re-analyze document"
                              >
                                Re-analyze
                              </button>
                            )}
                            {isPreviewable && (
                              <button
                                onClick={() => setPreviewFile(file)}
                                className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer"
                              >
                                Preview
                              </button>
                            )}
                            {file.status !== 'rejected' && (
                              <button
                                onClick={() => { setRejectingFileId(file.id); setRejectReason('') }}
                                className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-button border border-red-200 hover:bg-red-50 transition"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Override dropdown */}
                        {overrideFileId === file.id && (
                          <div className="mt-3 flex items-center gap-2 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                            <select
                              value={overrideCategory}
                              onChange={(e) => setOverrideCategory(e.target.value)}
                              className="text-xs border border-neutral-300 rounded-[7px] px-2 py-1.5 bg-white flex-1"
                            >
                              <option value="">Select category...</option>
                              {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.slug} value={opt.slug}>{opt.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => overrideCategory && handleConfirmClassification(file.id, overrideCategory)}
                              disabled={!overrideCategory || overriding}
                              className="text-xs font-semibold text-white bg-primary-600 px-3 py-1.5 rounded-[7px] hover:bg-primary-700 disabled:opacity-50"
                            >
                              {overriding ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setOverrideFileId(null); setOverrideCategory('') }}
                              className="text-xs text-neutral-500 hover:text-neutral-700"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Share link and activity */}
          <div className="flex flex-col gap-6">
            {/* Share link */}
            <div className="bg-white border border-neutral-200 rounded-card p-6">
              <h3 className="text-body-md font-semibold text-neutral-900 mb-2">Client share link</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Share this with your client — no account or password to set up.
              </p>

              <div className="bg-paper-url border border-neutral-200 rounded-lg p-3 mb-3 text-xs text-neutral-600 font-mono break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/portal/{request.share_token ?? request.id}
              </div>

              <div className="flex gap-2">
                <button onClick={() => {
                  const url = `${window.location.origin}/portal/${request.share_token ?? request.id}`
                  navigator.clipboard.writeText(url)
                }} className="flex-1 bg-primary-600 text-white text-xs font-semibold py-2 rounded-button hover:bg-primary-700 transition">
                  Copy link
                </button>
                <button onClick={() => window.open(`/portal/${request.share_token ?? request.id}`, '_blank')} className="bg-white text-neutral-900 text-xs font-semibold px-3 py-2 rounded-button border border-neutral-300 hover:bg-neutral-50 transition">
                  Preview
                </button>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white border border-neutral-200 rounded-card p-6">
              <h3 className="text-body-md font-semibold text-neutral-900 mb-4">Activity</h3>

              <div className="space-y-4">
                {request.activity && request.activity.length > 0 ? (
                  request.activity.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        item.type === 'upload' ? 'bg-primary-600' : 'bg-neutral-400'
                      }`}></div>
                      <div>
                        <div className="text-[13px] text-neutral-900">{item.description}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {formatDateTime(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-neutral-600 text-center py-4">
                    No activity yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection modal */}
      {rejectingFileId !== null && (
        <div className="fixed inset-0 bg-neutral-900/40 flex items-center justify-center z-50">
          <div className="bg-neutral-50 rounded-[16px] shadow-hero max-w-sm w-full p-6">
            <h3 className="text-lg font-serif text-neutral-900 mb-2">Reject document</h3>
            <p className="text-[13.5px] text-neutral-500 mb-4">The client will be notified and asked to re-upload.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g., 'Wrong tax year', 'File is corrupted')"
              className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[13px] h-24 resize-none mb-4 focus:outline-none focus:border-primary-600"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRejectingFileId(null); setRejectReason('') }}
                className="text-xs font-medium text-neutral-700 px-4 py-2.5 rounded-button border border-neutral-300 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejecting}
                className="text-xs font-semibold text-white bg-red-600 px-4 py-2.5 rounded-button hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejecting ? 'Rejecting...' : 'Reject & notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-8" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-[16px] max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200">
              <span className="font-semibold text-neutral-900">{previewFile.file_name}</span>
              <button onClick={() => setPreviewFile(null)} className="text-neutral-400 hover:text-neutral-600 text-xl cursor-pointer">&times;</button>
            </div>
            <div className="p-4 flex items-center justify-center" style={{ maxHeight: 'calc(90vh - 80px)', overflow: 'auto' }}>
              {previewExt === 'pdf' ? (
                <iframe src={`/api/download/${previewFile.id}`} className="w-full" style={{ height: '70vh' }} />
              ) : (
                <img src={`/api/download/${previewFile.id}`} alt={previewFile.file_name} className="max-w-full max-h-[70vh] object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
