'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { DocumentRequest, Client } from '@/types/index'

interface RequestDetail extends DocumentRequest {
  accountant_name?: string
  accountant_email?: string
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

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth(true)

  const [requestId, setRequestId] = useState<string>('')
  const { data: request, loading } = useApi<RequestDetail>(`/api/request-details/${requestId}`, {
    skip: !requestId,
  })
  const { data: clients } = useApi<Client[]>('/api/clients')

  useEffect(() => {
    params.then((p) => setRequestId(p.id))
  }, [params])

  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

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
            <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition">
              Documents
            </Link>
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
          {user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
        </div>
      </div>

      {/* Content */}
      <div className="px-9 max-w-7xl mx-auto">
        {/* Back link */}
        <Link href="/dashboard/requests" className="text-primary-600 font-medium text-[13px] mb-6 inline-block hover:text-primary-700">
          ← Back to requests
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
                          <span className="text-white text-xs font-bold">✓</span>
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
                        <span className="text-primary-600 text-body-md">↓</span>
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
    </div>
  )
}
