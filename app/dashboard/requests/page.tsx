'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client, DocumentRequest } from '@/types/index'

export default function RequestsPage() {
  const router = useRouter()
  const { user } = useAuth(true)

  const [filter, setFilter] = useState<'all' | 'pending' | 'received' | 'overdue'>('all')
  const { data: allRequests, loading: requestsLoading } = useApi<DocumentRequest[]>('/api/requests')
  const { data: clients } = useApi<Client[]>('/api/clients')

  const getClientName = (clientId: number): string => {
    return clients?.find((c) => c.id === clientId)?.name ?? 'Unknown Client'
  }

  const filteredRequests = (() => {
    const reqs = allRequests ?? []
    if (filter === 'all') return reqs
    return reqs.filter((r) => r.status === filter)
  })()

  const stats = {
    all: allRequests?.length ?? 0,
    pending: (allRequests ?? []).filter((r) => r.status === 'pending').length,
    received: (allRequests ?? []).filter((r) => r.status === 'received').length,
    overdue: (allRequests ?? []).filter((r) => r.status === 'overdue').length,
  }

  const getProgressWidth = (request: DocumentRequest): string => {
    if (request.status === 'received') return '100%'
    if (request.status === 'pending') return '0%'
    if (request.status === 'overdue') return '0%'
    return '0%'
  }

  const getProgressBarColor = (request: DocumentRequest): string => {
    if (request.status === 'overdue') return 'bg-danger-500'
    return 'bg-primary-600'
  }

  const getProgressTrackColor = (request: DocumentRequest): string => {
    if (request.status === 'overdue') return 'bg-danger-100'
    return 'bg-neutral-150'
  }

  const getEmptyStateHeading = (): string => {
    if (filter === 'all') return 'No requests yet'
    return `No ${filter} requests`
  }

  const getEmptyStateDescription = (): string => {
    if (filter === 'all') return 'Create your first document request to start collecting files from clients.'
    if (filter === 'pending') return 'No pending requests right now. All caught up!'
    if (filter === 'received') return 'No received requests yet. Documents will appear here once clients upload them.'
    if (filter === 'overdue') return 'No overdue requests. Everything is on track!'
    return ''
  }

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
            <span className="text-[16px] font-semibold text-neutral-900">Ledgerly</span>
          </div>

          {/* Nav Links */}
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Dashboard</Link>
            <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Clients</Link>
            <span className="text-sm text-neutral-900 font-semibold">Requests</span>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Documents</Link>
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
        <div className="flex justify-between items-end mb-5">
          <div>
            <h1 className="text-h2 font-serif text-neutral-900 mb-1">Requests</h1>
            <p className="text-body-md text-neutral-500">All document requests across your clients</p>
          </div>
          <button onClick={() => router.push('/dashboard/requests')} className="bg-primary-600 text-white text-xs font-semibold px-4 py-2.5 rounded-button hover:bg-primary-700 transition cursor-pointer">
            + New request
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'received', 'overdue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[13px] font-semibold px-3.5 py-[7px] rounded-full transition cursor-pointer ${
                filter === f
                  ? 'bg-white border border-neutral-900 text-neutral-900'
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              {f === 'all' && `All · ${stats.all}`}
              {f === 'pending' && `Pending · ${stats.pending}`}
              {f === 'received' && `Received · ${stats.received}`}
              {f === 'overdue' && `Overdue · ${stats.overdue}`}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {requestsLoading ? (
          <LoadingSpinner />
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-neutral-200 rounded-card py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17H15M9 13H15M9 9H11M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="#0F7A63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 2V9H20" stroke="#0F7A63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-serif text-neutral-900 mb-2">{getEmptyStateHeading()}</h2>
            <p className="text-body-md text-neutral-500 mb-6 max-w-sm">
              {getEmptyStateDescription()}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => alert('Create request modal coming soon')}
                className="bg-primary-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
              >
                Create your first request
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-card overflow-hidden">
            {filteredRequests.map((request) => (
              <Link
                href={`/dashboard/requests/${request.id}`}
                key={request.id}
                className="flex items-center gap-4 px-[22px] py-[16px] border-b border-paper-rowline hover:bg-neutral-50 transition last:border-b-0 cursor-pointer"
              >
                {/* Title and Client */}
                <div className="flex-1 min-w-0">
                  <div className="text-body-md font-medium text-neutral-900">{request.title}</div>
                  <div className="text-[12.5px] text-neutral-400 mt-0.5">
                    {getClientName(request.client_id)} · due{' '}
                    {new Date(request.due_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <StatusBadge status={request.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
