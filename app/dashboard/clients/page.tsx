'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client, DocumentRequest } from '@/types/index'

export default function ClientsPage() {
  useAuth(true)

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
      <div className="bg-white border-b border-neutral-300 px-9 py-4.5 flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-lg font-semibold text-neutral-900">Ledgerly</span>
          </div>

          {/* Nav Links */}
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-body-md text-neutral-600 hover:text-neutral-900 transition">Dashboard</Link>
            <span className="text-body-md text-neutral-900 font-semibold">Clients</span>
            <Link href="/dashboard/requests" className="text-body-md text-neutral-600 hover:text-neutral-900 transition">Requests</Link>
            <a href="#" className="text-body-md text-neutral-600 hover:text-neutral-900 transition">Documents</a>
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
          SC
        </div>
      </div>

      {/* Content */}
      <div className="px-9 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-h3 font-serif text-neutral-900 mb-1">Clients</h1>
            <p className="text-body-md text-neutral-600">{clients?.length ?? 0} active · 0 archived</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-neutral-300 text-neutral-900 text-xs font-medium px-4 py-2.5 rounded-button hover:bg-neutral-50 transition">
              Import CSV
            </button>
            <button className="bg-primary-600 text-white text-xs font-semibold px-4 py-2.5 rounded-button hover:bg-primary-700 transition">
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
            className="flex-1 bg-white border border-neutral-300 rounded-button px-3.5 py-2.5 text-body-md text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
          />
          <button className="bg-white border border-neutral-300 text-neutral-900 text-body-md px-4 py-2.5 rounded-button hover:bg-neutral-50 transition">
            All statuses ▾
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white border border-neutral-300 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-neutral-100 border-b border-neutral-200 text-xs font-semibold text-neutral-600 uppercase tracking-widest">
              <div>Client</div>
              <div>Email</div>
              <div>Open requests</div>
              <div>Last activity</div>
              <div></div>
            </div>

            {/* Rows */}
            {filteredClients.map((client) => (
              <div key={client.id} className="grid grid-cols-5 gap-4 px-6 py-3.5 border-b border-neutral-200 items-center hover:bg-neutral-50 transition last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 font-semibold text-xs flex items-center justify-center">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-body-md font-medium text-neutral-900">{client.name}</span>
                </div>
                <div className="text-body-md text-neutral-600">{client.email}</div>
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    getStatusColor(client.id) === 'warning'
                      ? 'bg-warning-100 text-warning-700'
                      : getStatusColor(client.id) === 'success'
                      ? 'bg-success-50 text-success-700'
                      : 'bg-danger-50 text-danger-700'
                  }`}>
                    {getClientStatus(client.id)}
                  </span>
                </div>
                <div className="text-body-md text-neutral-600">2 days ago</div>
                <div className="text-right">
                  <button className="text-neutral-400 hover:text-neutral-600 text-lg">⋯</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
