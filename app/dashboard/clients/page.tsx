'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client, DocumentRequest } from '@/types/index'

export default function ClientsPage() {
  const { user } = useAuth(true)

  const [search, setSearch] = useState('')
  const { data: clients, loading } = useApi<Client[]>('/api/clients')
  const { data: allRequests } = useApi<DocumentRequest[]>('/api/requests')

  const filteredClients = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

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
            <span className="text-sm text-neutral-900 font-semibold">Clients</span>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
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
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-h2 font-serif text-neutral-900 mb-1">Clients</h1>
            <p className="text-body-md text-neutral-500">{clients?.length ?? 0} active</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-2.5 rounded-[9px] hover:bg-neutral-50 transition">
              Import CSV
            </button>
            <button className="bg-primary-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[9px] hover:bg-primary-700 transition">
              + Add client
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search clients by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-neutral-300 rounded-button px-3.5 py-2.5 text-body-md text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
          />
          <button className="bg-white border border-neutral-300 text-neutral-900 text-body-md px-4 py-2.5 rounded-button hover:bg-neutral-50 transition">
            All statuses ▾
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white border border-neutral-200 rounded-card overflow-hidden">
            {/* Header */}
            <div className="grid gap-4 px-[22px] py-[13px] bg-paper-table border-b border-[#EFEAE0] text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]" style={{ gridTemplateColumns: '2.2fr 1.4fr 1fr 0.8fr 0.5fr' }}>
              <div>Client</div>
              <div>Email</div>
              <div>Open requests</div>
              <div>Last activity</div>
              <div></div>
            </div>

            {/* Rows */}
            {filteredClients.map((client) => (
              <div key={client.id} className="grid gap-4 px-[22px] py-[14px] border-b border-paper-rowline items-center hover:bg-neutral-50 transition last:border-b-0" style={{ gridTemplateColumns: '2.2fr 1.4fr 1fr 0.8fr 0.5fr' }}>
                <div className="flex items-center gap-3">
                  <div className="w-[34px] h-[34px] rounded-[9px] bg-[#E8F3EE] text-primary-600 font-semibold text-xs flex items-center justify-center">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-body-md font-medium text-neutral-900">{client.name}</span>
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
                <div className="text-right">
                  <button className="text-neutral-350 hover:text-neutral-600 text-lg">⋯</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
