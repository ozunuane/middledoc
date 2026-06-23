'use client'

import React, { useState, useMemo } from 'react'
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

export default function DocumentsPage() {
  const { user } = useAuth(true)

  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState<string>(searchParams.get('client_id') ?? '')

  const documentsUrl = clientFilter
    ? `/api/documents?client_id=${clientFilter}`
    : '/api/documents'

  const { data: documents, loading } = useApi<Document[]>(documentsUrl)
  const { data: clients } = useApi<Client[]>('/api/clients')

  const filteredDocuments = useMemo(() => {
    const docs = documents ?? []
    if (!search) return docs
    return docs.filter((d) =>
      d.file_name.toLowerCase().includes(search.toLowerCase())
    )
  }, [documents, search])

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
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} uploaded
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
            placeholder="Search by file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-neutral-300 rounded-button px-3 py-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
          />
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredDocuments.length === 0 ? (
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
                className="grid gap-4 px-[22px] py-[13px] bg-paper-table border-b border-[#EFEAE0] text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]"
                style={{ gridTemplateColumns: '2fr 1.2fr 1.5fr 1.2fr 0.6fr 0.5fr' }}
              >
                <div>File name</div>
                <div>Client</div>
                <div>Request</div>
                <div>Uploaded</div>
                <div>Size</div>
                <div></div>
              </div>

              {/* Table Rows */}
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="grid gap-4 px-[22px] py-[14px] border-b border-paper-rowline items-center hover:bg-neutral-50 transition last:border-b-0 cursor-pointer"
                  style={{ gridTemplateColumns: '2fr 1.2fr 1.5fr 1.2fr 0.6fr 0.5fr' }}
                >
                  {/* File name with icon */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-neutral-400">
                      <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 2V9H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
