'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import { useForm } from '@/hooks/useForm'
import { useAuth } from '@/hooks/useAuth'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client, DocumentRequest, DocumentUpload } from '@/types/index'

// ── Types ──────────────────────────────────────────────────────────────────────
type StatusFilter = 'all' | DocumentRequest['status']

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string
  type: 'success' | 'error'
  onDismiss: () => void
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'fixed bottom-6 right-6 z-toast flex items-center gap-3 px-4 py-3 rounded-card shadow-dark text-sm font-medium animate-slide-in-from-right',
        type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800',
      ].join(' ')}
    >
      {message}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Create Request Modal ───────────────────────────────────────────────────────
interface CreateRequestValues extends Record<string, unknown> {
  title: string
  client_id: string
  due_date: string
  description: string
}

function CreateRequestModal({
  isOpen,
  onClose,
  onSuccess,
  onToast,
  clients,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
  clients: Client[]
}) {
  const { values, errors, loading, handleChange, handleSubmit, reset } =
    useForm<CreateRequestValues>(
      { title: '', client_id: '', due_date: '', description: '' },
      async (vals) => {
        if (!vals.title.trim()) throw new Error('Title is required')
        if (!vals.client_id) throw new Error('Please select a client')
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: vals.title,
            client_id: Number(vals.client_id),
            due_date: vals.due_date || null,
            description: vals.description || null,
          }),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to create request')
        }
        onToast('Request created successfully', 'success')
        reset()
        onClose()
        onSuccess()
      }
    )

  const handleClose = () => {
    reset()
    onClose()
  }

  const clientOptions = clients.map((c) => ({ value: String(c.id), label: c.name }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Document Request"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => {
              const form = document.getElementById('create-request-form') as HTMLFormElement | null
              form?.requestSubmit()
            }}
          >
            Create Request
          </Button>
        </>
      }
    >
      <form id="create-request-form" onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <FormField
          label="Request Title"
          name="title"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          required
          placeholder="e.g. Annual Tax Return 2025"
        />
        <FormField
          label="Client"
          name="client_id"
          type="select"
          value={values.client_id}
          onChange={(e) => handleChange('client_id', e.target.value)}
          error={errors.client_id}
          required
          placeholder="Select a client"
          options={clientOptions}
        />
        <FormField
          label="Due Date"
          name="due_date"
          type="date"
          value={values.due_date}
          onChange={(e) => handleChange('due_date', e.target.value)}
          error={errors.due_date}
          helperText="Optional — leave blank if no deadline"
        />
        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Optional instructions for your client..."
          rows={3}
        />
        {errors.submit && (
          <p role="alert" className="text-sm text-red-600 font-medium">
            {errors.submit}
          </p>
        )}
      </form>
    </Modal>
  )
}

// ── Details Panel ─────────────────────────────────────────────────────────────
function RequestDetailPanel({
  request,
  onStatusUpdate,
  onToast,
}: {
  request: DocumentRequest | null
  onStatusUpdate: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { data: uploads, loading: uploadsLoading, refetch: refetchUploads } = useApi<DocumentUpload[]>(
    request ? `/api/requests/${request.id}/files` : '',
    { skip: !request }
  )
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (request) void refetchUploads()
  }, [request?.id])

  if (!request) {
    return (
      <div className="hidden lg:flex bg-white dark:bg-gray-900 rounded-lg shadow-light h-fit sticky top-6 items-center justify-center p-10 text-center min-h-[200px]">
        <div>
          <svg aria-hidden="true" className="mx-auto w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-400">Select a request to view details</p>
        </div>
      </div>
    )
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/portal/${request.share_token}`
      : `/portal/${request.share_token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      onToast('Failed to copy link', 'error')
    }
  }

  const updateStatus = async (status: DocumentRequest['status']) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      onToast('Status updated', 'success')
      onStatusUpdate()
    } catch (err) {
      onToast((err as Error).message, 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const isPastDue = request.due_date && new Date(request.due_date) < new Date()

  return (
    <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-lg shadow-light sticky top-6 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          {request.title}
        </h2>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Meta */}
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd><StatusBadge status={request.status} size="sm" /></dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Due Date</dt>
            <dd className={`font-medium ${isPastDue ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
              {request.due_date ? formatDate(request.due_date) : '—'}
            </dd>
          </div>
        </dl>

        {/* Description */}
        {request.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {request.description}
          </p>
        )}

        {/* Share link */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Portal Link
          </p>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-standard border border-gray-200 dark:border-gray-700 px-3 py-2">
            <span className="text-xs text-gray-500 truncate flex-1 min-w-0 font-mono">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy portal link"
              className="flex-shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1.5 py-0.5 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Uploaded files */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Uploaded Files
          </p>
          {uploadsLoading ? (
            <LoadingSpinner size="sm" />
          ) : !uploads || uploads.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No files uploaded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {uploads.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-standard border border-gray-200 dark:border-gray-700"
                >
                  <svg aria-hidden="true" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 min-w-0">
                    {file.file_name}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {(file.file_size / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Status actions */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Update Status
          </p>
          <div className="flex flex-wrap gap-2">
            {request.status !== 'received' && (
              <Button
                size="sm"
                variant="secondary"
                loading={updatingStatus}
                onClick={() => updateStatus('received')}
              >
                Mark Received
              </Button>
            )}
            {request.status !== 'cancelled' && (
              <Button
                size="sm"
                variant="ghost"
                loading={updatingStatus}
                onClick={() => updateStatus('cancelled')}
              >
                Cancel
              </Button>
            )}
            {request.status === 'cancelled' && (
              <Button
                size="sm"
                variant="secondary"
                loading={updatingStatus}
                onClick={() => updateStatus('pending')}
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Status Filter Tabs ─────────────────────────────────────────────────────────
function StatusTabs({
  activeFilter,
  onChange,
  counts,
}: {
  activeFilter: StatusFilter
  onChange: (f: StatusFilter) => void
  counts: Record<StatusFilter, number>
}) {
  const tabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Received', value: 'received' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 flex gap-6 mb-4 overflow-x-auto" role="tablist" aria-label="Filter requests by status">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={activeFilter === tab.value}
          onClick={() => onChange(tab.value)}
          className={[
            'pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
            activeFilter === tab.value
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ].join(' ')}
        >
          {tab.label}
          {counts[tab.value] > 0 && (
            <span
              className={[
                'ml-2 inline-flex items-center px-2 py-0.5 text-xs rounded-full',
                activeFilter === tab.value
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600',
              ].join(' ')}
            >
              {counts[tab.value]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  useAuth(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data: requests, loading: requestsLoading, refetch: refetchRequests } =
    useApi<DocumentRequest[]>('/api/requests')
  const { data: clients } = useApi<Client[]>('/api/clients')

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const allRequests = requests ?? []

  const filteredRequests = statusFilter === 'all'
    ? allRequests
    : allRequests.filter((r) => r.status === statusFilter)

  const counts: Record<StatusFilter, number> = {
    all: allRequests.length,
    pending: allRequests.filter((r) => r.status === 'pending').length,
    received: allRequests.filter((r) => r.status === 'received').length,
    overdue: allRequests.filter((r) => r.status === 'overdue').length,
    cancelled: allRequests.filter((r) => r.status === 'cancelled').length,
  }

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—'
    const date = new Date(d)
    const isPast = date < new Date()
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return isPast ? (
      <span className="text-red-600 font-medium">{formatted}</span>
    ) : formatted
  }

  const columns: Column<DocumentRequest>[] = [
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
    },
    {
      header: 'Due Date',
      accessor: (row) => formatDate(row.due_date),
      minWidth: '120px',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      minWidth: '120px',
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label={`View details for ${row.title}`}
            onClick={() => setSelectedRequest(row)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-standard transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="px-4 sm:px-6 py-6 max-w-content mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Document Requests</h1>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Button>
      </div>

      {/* Status filter tabs */}
      <StatusTabs activeFilter={statusFilter} onChange={setStatusFilter} counts={counts} />

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <DataTable
            data={filteredRequests}
            columns={columns}
            isLoading={requestsLoading}
            selectedRowId={selectedRequest?.id}
            onRowClick={(row) => setSelectedRequest((prev) => prev?.id === row.id ? null : row)}
            emptyMessage="No requests yet."
            aria-label="Document requests list"
            emptyState={
              <div className="text-center py-16 px-6">
                <svg aria-hidden="true" className="mx-auto w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">No requests yet.</p>
                <p className="mt-1 text-sm text-gray-500">Create your first request to get started.</p>
                <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)} className="mt-4">
                  Create Request
                </Button>
              </div>
            }
          />
        </div>

        {/* Details panel (desktop) */}
        <div className="w-80 flex-shrink-0">
          <RequestDetailPanel
            request={selectedRequest}
            onStatusUpdate={() => {
              void refetchRequests()
            }}
            onToast={showToast}
          />
        </div>
      </div>

      {/* Create modal */}
      <CreateRequestModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={refetchRequests}
        onToast={showToast}
        clients={clients ?? []}
      />

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
