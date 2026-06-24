'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AddClientModal } from '@/components/AddClientModal'
import { ImportClientModal } from '@/components/ImportClientModal'
import { EditClientModal } from '@/components/EditClientModal'
import type { Client, DocumentRequest } from '@/types/index'

export default function ClientsPage() {
  const { user } = useAuth(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Pagination state
  const [page, setPage] = useState(1)
  const limit = 50

  // Sort state
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Debounce search input (300ms)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [search])

  // Clear selection when page changes
  useEffect(() => {
    setSelectedIds(new Set())
  }, [page])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null)
    if (openMenuId !== null) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [openMenuId])

  const { data: clientsResponse, loading, refetch: refetchClients } = useApi<any>(
    `/api/clients?page=${page}&limit=${limit}&sort=${sortField}&order=${sortOrder}&search=${encodeURIComponent(debouncedSearch)}`
  )
  const { data: allRequests } = useApi<DocumentRequest[]>('/api/requests')

  const clients: Client[] = clientsResponse?.data ?? clientsResponse ?? []
  const total: number = clientsResponse?.total ?? clients.length
  const totalPages: number = clientsResponse?.totalPages ?? 1

  const getClientStatus = (clientId: number) => {
    const clientRequests = (allRequests ?? []).filter((r) => r.client_id === clientId)
    const pending = clientRequests.filter((r) => r.status === 'pending')
    if (pending.length > 0) return `${pending.length} PENDING`
    const allIn = clientRequests.every((r) => r.status === 'received')
    if (allIn && clientRequests.length > 0) return 'ALL IN'
    return `${clientRequests.filter((r) => r.status === 'overdue').length} OVERDUE`
  }

  const getRelativeTime = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const getStatusColor = (clientId: number) => {
    const clientRequests = (allRequests ?? []).filter((r) => r.client_id === clientId)
    const pending = clientRequests.filter((r) => r.status === 'pending')
    if (pending.length > 0) return 'warning'
    const allIn = clientRequests.every((r) => r.status === 'received')
    if (allIn && clientRequests.length > 0) return 'success'
    return 'danger'
  }

  // Selection helpers
  const allSelected = clients.length > 0 && clients.every((c) => selectedIds.has(c.id))
  const someSelected = clients.some((c) => selectedIds.has(c.id))
  const headerCheckRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = someSelected && !allSelected
    }
  }, [someSelected, allSelected])

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)))
    }
  }

  const toggleSelectOne = (id: number) => {
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

  // Sort handler
  const handleSort = (field: string) => {
    setSortOrder((prev) => (sortField === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'))
    setSortField(field)
  }

  // Bulk delete
  const handleBulkDelete = () => {
    setBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    await fetch('/api/clients/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selectedIds] }),
    })
    setSelectedIds(new Set())
    setBulkDeleteConfirm(false)
    refetchClients()
  }

  const gridCols = '0.3fr 2.2fr 1.4fr 1fr 0.8fr 0.5fr'

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
            <span className="text-sm text-neutral-900 font-semibold">Clients</span>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
            <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Documents</Link>
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
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-h2 font-serif text-neutral-900 mb-1">Clients</h1>
            <p className="text-body-md text-neutral-500">{total} client{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-2.5 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
            >
              Import CSV
            </button>
            <button
              onClick={() => setShowAddClient(true)}
              className="bg-primary-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
            >
              + Add client
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-neutral-300 rounded-button px-3.5 py-2.5 text-body-md text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
          />
          <button className="bg-white border border-neutral-300 text-neutral-900 text-body-md px-4 py-2.5 rounded-button hover:bg-neutral-50 transition cursor-pointer">
            All statuses ▾
          </button>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-neutral-900 text-white px-5 py-3 rounded-[9px] mb-4">
            <span className="text-[13px]">{selectedIds.size} client{selectedIds.size > 1 ? 's' : ''} selected</span>
            <div className="flex gap-3">
              <button onClick={() => setSelectedIds(new Set())} className="text-[13px] text-neutral-400 hover:text-white transition cursor-pointer">
                Clear selection
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
        ) : clients.length === 0 && !debouncedSearch ? (
          /* Empty State */
          <div className="bg-white border border-neutral-200 rounded-card py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="#0F7A63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20C20 16.69 16.42 14 12 14C7.58 14 4 16.69 4 20" stroke="#0F7A63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-serif text-neutral-900 mb-2">No clients yet</h2>
            <p className="text-body-md text-neutral-500 mb-6 max-w-sm">
              Add your first client to start collecting documents.
            </p>
            <button
              onClick={() => setShowAddClient(true)}
              className="bg-primary-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
            >
              Add your first client
            </button>
          </div>
        ) : clients.length === 0 && debouncedSearch ? (
          /* No search results */
          <div className="bg-white border border-neutral-200 rounded-card py-20 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-serif text-neutral-900 mb-2">No results found</h2>
            <p className="text-body-md text-neutral-500 mb-6 max-w-sm">
              No clients match your search. Try a different query.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-neutral-200 rounded-card overflow-hidden">
              {/* Header */}
              <div className="grid gap-4 px-[22px] py-[13px] bg-paper-table border-b border-[#EFEAE0] text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]" style={{ gridTemplateColumns: gridCols }}>
                <div className="flex items-center">
                  <input
                    ref={headerCheckRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 cursor-pointer accent-primary-600"
                  />
                </div>
                <div
                  onClick={() => handleSort('name')}
                  className="cursor-pointer hover:text-neutral-600 transition select-none"
                >
                  Client {sortField === 'name' && (sortOrder === 'asc' ? '\u2191' : '\u2193')}
                </div>
                <div
                  onClick={() => handleSort('email')}
                  className="cursor-pointer hover:text-neutral-600 transition select-none"
                >
                  Email {sortField === 'email' && (sortOrder === 'asc' ? '\u2191' : '\u2193')}
                </div>
                <div>Open requests</div>
                <div
                  onClick={() => handleSort('created_at')}
                  className="cursor-pointer hover:text-neutral-600 transition select-none"
                >
                  Last activity {sortField === 'created_at' && (sortOrder === 'asc' ? '\u2191' : '\u2193')}
                </div>
                <div></div>
              </div>

              {/* Rows */}
              {clients.map((client) => (
                <div key={client.id} className="grid gap-4 px-[22px] py-[14px] border-b border-paper-rowline items-center hover:bg-neutral-50 transition last:border-b-0 cursor-pointer" style={{ gridTemplateColumns: gridCols }}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(client.id)}
                      onChange={() => toggleSelectOne(client.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 cursor-pointer accent-primary-600"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-[34px] h-[34px] rounded-[9px] bg-primary-50 text-primary-600 font-semibold text-xs flex items-center justify-center">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <Link href={`/dashboard/documents?client_id=${client.id}`} className="text-body-md font-medium text-neutral-900 hover:text-primary-600 transition">
                      {client.name}
                    </Link>
                  </div>
                  <div className="text-[13.5px] text-neutral-600">{client.email}</div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      getStatusColor(client.id) === 'warning'
                        ? 'bg-warning-100 text-warning-600'
                        : getStatusColor(client.id) === 'success'
                        ? 'bg-success-50 text-success-600'
                        : 'bg-danger-50 text-danger-700'
                    }`}>
                      {getClientStatus(client.id)}
                    </span>
                  </div>
                  <div className="text-[13px] text-neutral-400">{getRelativeTime(client.created_at)}</div>
                  <div className="text-right relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === client.id ? null : client.id) }}
                      className="text-neutral-350 hover:text-neutral-600 text-lg cursor-pointer"
                    >
                      &#x22EF;
                    </button>

                    {openMenuId === client.id && (
                      <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-[9px] shadow-medium py-1 w-40 z-50">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditClient(client); setOpenMenuId(null) }}
                          className="w-full text-left px-4 py-2 text-[13px] text-neutral-900 hover:bg-neutral-50 transition cursor-pointer"
                        >
                          Edit client
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(client.id); setOpenMenuId(null) }}
                          className="w-full text-left px-4 py-2 text-[13px] text-danger-600 hover:bg-danger-50 transition cursor-pointer"
                        >
                          Delete client
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <span className="text-[13px] text-neutral-400">
                  Showing {(page - 1) * limit + 1}&ndash;{Math.min(page * limit, total)} of {total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-[13px] border border-neutral-200 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-[13px] border border-neutral-200 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ImportClientModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={() => { refetchClients(); setShowImport(false) }}
      />

      <AddClientModal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        onClientAdded={() => { refetchClients() }}
      />

      <EditClientModal
        isOpen={editClient !== null}
        onClose={() => setEditClient(null)}
        onClientUpdated={() => void refetchClients()}
        client={editClient}
      />

      {/* Single Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-neutral-900/40 flex items-center justify-center z-50">
          <div className="bg-neutral-50 rounded-[16px] shadow-hero max-w-sm w-full p-6">
            <h3 className="text-lg font-serif text-neutral-900 mb-2">Delete client?</h3>
            <p className="text-[13.5px] text-neutral-500 mb-6">This will also delete all their requests and uploaded documents. This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-2.5 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await fetch(`/api/clients/${deleteConfirm}`, { method: 'DELETE' })
                  setDeleteConfirm(null)
                  refetchClients()
                }}
                className="bg-danger-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[9px] hover:bg-danger-700 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-neutral-900/40 flex items-center justify-center z-50">
          <div className="bg-neutral-50 rounded-[16px] shadow-hero max-w-sm w-full p-6">
            <h3 className="text-lg font-serif text-neutral-900 mb-2">Delete {selectedIds.size} client{selectedIds.size > 1 ? 's' : ''}?</h3>
            <p className="text-[13.5px] text-neutral-500 mb-6">This will also delete all their requests and uploaded documents. This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-2.5 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="bg-danger-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[9px] hover:bg-danger-700 transition cursor-pointer"
              >
                Delete {selectedIds.size} client{selectedIds.size > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
