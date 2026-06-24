'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client, Document } from '@/types/index'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatUploadDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return { color: '#C0492F', label: 'PDF' }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return { color: '#2563EB', label: 'IMG' }
  if (['doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'].includes(ext)) return { color: '#0F7A63', label: 'DOC' }
  return { color: '#9C968A', label: 'FILE' }
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Images' },
  { value: 'doc', label: 'Docs' },
  { value: 'other', label: 'Other' },
] as const

export default function DocumentsPage() {
  const { user } = useAuth(true)

  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState<string>(searchParams.get('client_id') ?? '')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const limit = 50

  const debouncedSearch = useDebounce(search, 300)

  // Build API URL with all params
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (clientFilter) params.set('client_id', clientFilter)
  if (typeFilter) params.set('type', typeFilter)
  if (debouncedSearch) params.set('search', debouncedSearch)
  params.set('sort', 'newest')

  const { data: docsResponse, loading, refetch } = useApi<any>(`/api/documents?${params}`)
  const documents: Document[] = docsResponse?.data ?? docsResponse ?? []
  const total = docsResponse?.total ?? documents.length
  const totalPages = docsResponse?.totalPages ?? 1

  const { data: clients } = useApi<Client[]>('/api/clients')

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [clientFilter, typeFilter, debouncedSearch])

  // Clear selection when page changes
  useEffect(() => { setSelectedIds(new Set()) }, [page])

  // Select all / individual selection
  const allSelected = documents.length > 0 && documents.every((d) => selectedIds.has(d.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(documents.map((d) => d.id)))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    try {
      await fetch('/api/documents/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
      refetch()
    } catch {
      setShowDeleteConfirm(false)
    }
  }

  const gridColumns = '0.3fr 2fr 1.2fr 1.5fr 1.2fr 0.6fr 0.5fr'

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
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
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Dashboard</Link>
            <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Clients</Link>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
            <span className="text-sm text-neutral-900 font-semibold">Documents</span>
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
          {user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
        </div>
      </div>

      {/* Content */}
      <div className="px-9 max-w-7xl">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-h2 font-serif text-neutral-900 mb-1">Documents</h1>
          <p className="text-body-md text-neutral-500">
            {total} document{total !== 1 ? 's' : ''} uploaded
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-3 mb-4">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-48 bg-white border border-neutral-300 rounded-button px-3 py-2.5 text-[13px] text-neutral-900 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 cursor-pointer appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239C968A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="">All clients</option>
            {(clients ?? []).map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by file name, client, or request..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-neutral-300 rounded-button px-3 py-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
          />
        </div>

        {/* File type filter pills */}
        <div className="flex gap-2 mb-4">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTypeFilter(t.value); setPage(1) }}
              className={`text-[13px] font-semibold px-3.5 py-[7px] rounded-full transition cursor-pointer ${
                typeFilter === t.value
                  ? 'bg-white border border-neutral-900 text-neutral-900'
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-neutral-900 text-white px-5 py-3 rounded-[9px] mb-4">
            <span className="text-[13px]">{selectedIds.size} file{selectedIds.size > 1 ? 's' : ''} selected</span>
            <div className="flex gap-3">
              <button onClick={() => setSelectedIds(new Set())} className="text-[13px] text-neutral-400 hover:text-white transition cursor-pointer">
                Clear
              </button>
              <button onClick={handleBulkDelete} className="text-[13px] text-danger-300 hover:text-danger-100 font-semibold transition cursor-pointer">
                Delete selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : documents.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-neutral-200 rounded-card py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17H15M9 13H15M9 9H11M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="#0F7A63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 2V9H20" stroke="#0F7A63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-serif text-neutral-900 mb-2">No documents yet</h2>
            <p className="text-body-md text-neutral-500 mb-6 max-w-sm">
              Documents will appear here when clients upload files to your requests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="bg-white border border-neutral-200 rounded-card overflow-hidden">
              {/* Table Header */}
              <div
                className="grid gap-4 px-[22px] py-[13px] bg-paper-table border-b border-[#EFEAE0] text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em] items-center"
                style={{ gridTemplateColumns: gridColumns }}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-[15px] h-[15px] rounded border-neutral-300 text-primary-600 focus:ring-primary-600/20 cursor-pointer accent-neutral-900"
                  />
                </div>
                <div>File name</div>
                <div>Client</div>
                <div>Request</div>
                <div>Uploaded</div>
                <div>Size</div>
                <div></div>
              </div>

              {/* Table Rows */}
              {documents.map((doc) => {
                const icon = getFileIcon(doc.file_name)
                const isSelected = selectedIds.has(doc.id)

                return (
                  <div
                    key={doc.id}
                    className={`grid gap-4 px-[22px] py-[14px] border-b border-paper-rowline items-center hover:bg-neutral-50 transition last:border-b-0 cursor-pointer ${
                      isSelected ? 'bg-primary-50/30' : ''
                    }`}
                    style={{ gridTemplateColumns: gridColumns }}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(doc.id)}
                        className="w-[15px] h-[15px] rounded border-neutral-300 text-primary-600 focus:ring-primary-600/20 cursor-pointer accent-neutral-900"
                      />
                    </div>

                    {/* File name with type icon */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: icon.color }}
                      >
                        {icon.label}
                      </div>
                      <span className="text-body-md font-medium text-neutral-900 truncate">{doc.file_name}</span>
                    </div>

                    {/* Client */}
                    <div className="text-[13.5px] text-neutral-600 truncate">{doc.client_name}</div>

                    {/* Request */}
                    <div className="truncate">
                      <Link
                        href={`/dashboard/requests/${doc.request_id}`}
                        className="text-[13.5px] text-primary-600 hover:text-primary-700 transition"
                      >
                        {doc.request_title}
                      </Link>
                    </div>

                    {/* Uploaded date */}
                    <div className="text-[13px] text-neutral-400">{formatUploadDate(doc.uploaded_at)}</div>

                    {/* Size */}
                    <div className="text-[13px] text-neutral-400 font-mono">{formatFileSize(doc.file_size)}</div>

                    {/* Download action */}
                    <div className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert('Download started')
                        }}
                        className="text-neutral-350 hover:text-neutral-600 cursor-pointer transition"
                        aria-label={`Download ${doc.file_name}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 mb-8">
            <p className="text-[13px] text-neutral-400">
              Showing {(page - 1) * limit + 1}--{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-[7px] text-[13px] font-medium border border-neutral-200 rounded-[8px] bg-white hover:bg-neutral-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-[7px] text-[13px] text-neutral-400">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`px-3 py-[7px] text-[13px] font-medium rounded-[8px] transition cursor-pointer ${
                        page === item
                          ? 'bg-neutral-900 text-white border border-neutral-900'
                          : 'bg-white border border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-[7px] text-[13px] font-medium border border-neutral-200 rounded-[8px] bg-white hover:bg-neutral-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-neutral-900/40 flex items-center justify-center z-50">
          <div className="bg-neutral-50 rounded-[16px] shadow-hero max-w-sm w-full p-6">
            <h3 className="text-lg font-serif text-neutral-900 mb-2">Delete {selectedIds.size} file{selectedIds.size > 1 ? 's' : ''}?</h3>
            <p className="text-[13.5px] text-neutral-500 mb-6">These files will be permanently deleted. This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer">Cancel</button>
              <button onClick={confirmBulkDelete} className="px-4 py-[10px] text-[13px] font-semibold bg-danger-600 text-white rounded-[9px] hover:bg-danger-700 transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
