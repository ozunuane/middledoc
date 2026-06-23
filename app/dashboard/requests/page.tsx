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
          <button onClick={() => router.push('/dashboard/requests')} className="bg-primary-600 text-white text-xs font-semibold px-4 py-2.5 rounded-button hover:bg-primary-700 transition">
            + New request
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'received', 'overdue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[13px] font-semibold px-3.5 py-[7px] rounded-full transition ${
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

                {/* Progress Bar */}
                <div className="w-32">
                  <div className="w-full h-[5px] bg-neutral-150 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600"
                      style={{ width: request.status === 'received' ? '100%' : request.status === 'pending' ? '0%' : '0%' }}
                    ></div>
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
