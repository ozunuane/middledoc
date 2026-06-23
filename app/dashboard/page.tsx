'use client'

import React from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client, DocumentRequest } from '@/types/index'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(true)

  const { data: clients, loading: clientsLoading } = useApi<Client[]>('/api/clients', {
    skip: !user,
  })
  const { data: allRequests, loading: requestsLoading } = useApi<DocumentRequest[]>(
    '/api/requests',
    { skip: !user }
  )

  const pendingRequests = allRequests?.filter((r) => r.status === 'pending') ?? []
  const receivedRequests = allRequests?.filter((r) => r.status === 'received') ?? []
  const overdueRequests = allRequests?.filter((r) => r.status === 'overdue') ?? []
  const dueThisWeek = allRequests?.filter((r) => {
    const dueDate = new Date(r.due_date)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return dueDate >= today && dueDate <= nextWeek
  }) ?? []

  if (authLoading) return <LoadingSpinner fullPage />
  if (!user) return null

  const completionPercentage = allRequests ? Math.round((receivedRequests.length / allRequests.length) * 100) : 0

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="bg-white border-b border-neutral-200 px-9 py-4.5 -mx-6 mb-8 flex items-center justify-between">
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
              <span className="text-sm text-neutral-900 font-semibold">Dashboard</span>
              <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Clients</Link>
              <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
              <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Documents</a>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button className="bg-primary-600 text-white text-[13px] font-semibold px-4 py-[9px] rounded-lg hover:bg-primary-700 transition">
              + New request
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 font-serif text-neutral-900 mb-1">This week at a glance</h1>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-4 gap-[18px] mb-8" style={{ gridAutoRows: '148px' }}>
          {/* Big Hero - Overall Completion */}
          <div className="col-span-2 row-span-2 bg-neutral-900 rounded-[18px] p-7 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-medium text-[#8C8E92] mb-2">Overall completion</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-[72px] text-neutral-50 leading-none">{completionPercentage}</span>
                  <span className="text-[34px] text-primary-500 mb-1">%</span>
                </div>
              </div>
              {/* Circular Progress */}
              <div className="relative w-[76px] h-[76px]">
                <svg className="w-[76px] h-[76px] transform -rotate-90" viewBox="0 0 76 76">
                  <circle cx="38" cy="38" r="35" fill="none" stroke="#2C2F35" strokeWidth="2" />
                  <circle
                    cx="38"
                    cy="38"
                    r="35"
                    fill="none"
                    stroke="#10A37F"
                    strokeWidth="2"
                    strokeDasharray={`${(35 * 2 * Math.PI * completionPercentage) / 100} ${35 * 2 * Math.PI}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div>
                <div className="text-mono font-semibold text-neutral-50">{allRequests?.length ?? 0}</div>
                <div className="text-xs text-[#8C8E92] mt-0.5">requested</div>
              </div>
              <div>
                <div className="text-mono font-semibold text-primary-500">{receivedRequests.length}</div>
                <div className="text-xs text-[#8C8E92] mt-0.5">received</div>
              </div>
              <div>
                <div className="text-mono font-semibold text-warning-400">{pendingRequests.length}</div>
                <div className="text-xs text-[#8C8E92] mt-0.5">outstanding</div>
              </div>
            </div>
          </div>

          {/* Active Clients */}
          <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
            <div className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.05em]">Active clients</div>
            <div className="text-mono text-[38px] font-semibold text-neutral-900">{clients?.length ?? 0}</div>
          </div>

          {/* Overdue */}
          <div className="bg-danger-50 border border-danger-200 rounded-[18px] p-5 flex flex-col justify-between">
            <div className="text-xs font-semibold text-danger-700 uppercase tracking-[0.05em]">Overdue</div>
            <div className="text-mono text-[38px] font-semibold text-danger-600">{overdueRequests.length}</div>
          </div>

          {/* Pending */}
          <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
            <div className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.05em]">Pending</div>
            <div className="text-mono text-[38px] font-semibold text-warning-600">{pendingRequests.length}</div>
          </div>

          {/* Due This Week */}
          <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
            <div className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.05em]">Due this week</div>
            <div className="text-mono text-[38px] font-semibold text-neutral-900">{dueThisWeek.length}</div>
          </div>

          {/* Needs Attention - Wide */}
          <div className="col-span-4 bg-white border border-neutral-200 rounded-[18px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-body-md font-semibold text-neutral-900">Needs your attention</h3>
              <Link href="/dashboard/requests" className="text-xs font-medium text-primary-600 hover:text-primary-700">View all →</Link>
            </div>

            {/* Attention Cards */}
            <div className="flex gap-[14px] h-auto">
              {overdueRequests.length > 0 && (
                <div className="flex-1 border border-danger-200 bg-danger-50 rounded-[11px] p-3.5">
                  <div className="text-xs font-semibold text-danger-600 mb-1">OVERDUE {Math.floor((Date.now() - new Date(overdueRequests[0].due_date).getTime()) / (24 * 60 * 60 * 1000))} DAYS</div>
                  <div className="text-sm font-medium text-neutral-900">{overdueRequests[0].title}</div>
                  <div className="text-xs text-neutral-400 mt-1">Harbor Logistics</div>
                </div>
              )}

              {dueThisWeek.length > 0 && (
                <div className="flex-1 border border-warning-200 bg-warning-50 rounded-[11px] p-3.5">
                  <div className="text-xs font-semibold text-warning-700 mb-1">DUE TOMORROW</div>
                  <div className="text-sm font-medium text-neutral-900">{dueThisWeek[0].title}</div>
                  <div className="text-xs text-neutral-400 mt-1">Atlas Printing Co</div>
                </div>
              )}

              {pendingRequests.length > 0 && (
                <div className="flex-1 border border-warning-200 bg-warning-50 rounded-[11px] p-3.5">
                  <div className="text-xs font-semibold text-warning-700 mb-1">DUE IN 2 DAYS</div>
                  <div className="text-sm font-medium text-neutral-900">{pendingRequests[0].title}</div>
                  <div className="text-xs text-neutral-400 mt-1">Summit Consulting</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
