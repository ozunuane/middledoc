'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { NewRequestModal } from '@/components/NewRequestModal'
import { AnalyticsSection } from '@/components/AnalyticsSection'
import type { Client, DocumentRequest } from '@/types/index'

/* Analytics moved to @/components/AnalyticsSection */

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0]
}

/* ──────────────────────────────────────────────
   Empty-state component shown when the accountant
   has zero clients and zero requests.
   ────────────────────────────────────────────── */
function EmptyState({ firstName, onOpenNewRequest }: { firstName: string; onOpenNewRequest?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-h2 font-serif text-neutral-900 mb-3">
        Welcome to MiddleDoc, {firstName}
      </h1>
      <p className="text-body-md text-neutral-500 max-w-md mb-10">
        Start by adding your first client, then create a document request.
        Your clients will receive a simple link where they can upload what you need.
      </p>

      {/* Action buttons */}
      <div className="flex gap-4 mb-14">
        <Link
          href="/dashboard/clients"
          className="bg-primary-600 text-white text-[13px] font-semibold px-5 py-[10px] rounded-lg hover:bg-primary-700 transition cursor-pointer"
        >
          Add your first client
        </Link>
        <button
          onClick={() => onOpenNewRequest?.()}
          className="border border-neutral-200 bg-white text-neutral-900 text-[13px] font-semibold px-5 py-[10px] rounded-lg hover:bg-neutral-100 transition cursor-pointer"
        >
          Create a request
        </button>
      </div>

      {/* 3-step workflow visual */}
      <div className="w-full max-w-xl">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-5">
          How it works
        </div>
        <div className="flex items-start justify-between gap-4">
          {/* Step 1 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold mb-3">
              1
            </div>
            <div className="text-sm font-semibold text-neutral-900 mb-1">Add Client</div>
            <div className="text-xs text-neutral-400 leading-relaxed">
              Add your client&apos;s name and email address
            </div>
          </div>

          {/* Arrow */}
          <div className="pt-4 text-neutral-300 text-lg select-none">&rarr;</div>

          {/* Step 2 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold mb-3">
              2
            </div>
            <div className="text-sm font-semibold text-neutral-900 mb-1">Create Request</div>
            <div className="text-xs text-neutral-400 leading-relaxed">
              Specify the documents you need and a due date
            </div>
          </div>

          {/* Arrow */}
          <div className="pt-4 text-neutral-300 text-lg select-none">&rarr;</div>

          {/* Step 3 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold mb-3">
              3
            </div>
            <div className="text-sm font-semibold text-neutral-900 mb-1">Share Link</div>
            <div className="text-xs text-neutral-400 leading-relaxed">
              Send the upload link — your client uploads directly
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Main dashboard page
   ────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, teamRole } = useAuth(true)
  const canSeeAllNav = !teamRole || teamRole === 'owner' || teamRole === 'admin'

  const [showNewRequest, setShowNewRequest] = useState(false)

  const { data: clients, loading: clientsLoading } = useApi<Client[]>('/api/clients', {
    skip: !user,
  })
  const { data: allRequests, loading: requestsLoading, refetch: refetchRequests } = useApi<DocumentRequest[]>(
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

  const firstName = getFirstName(user.name)
  const isEmpty = (!clients || clients.length === 0) && (!allRequests || allRequests.length === 0)
  const completionPercentage = allRequests && allRequests.length > 0 ? Math.round((receivedRequests.length / allRequests.length) * 100) : 0

  const getDaysLabel = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    if (days <= 0) return 'OVERDUE'
    if (days === 1) return 'DUE TOMORROW'
    return `DUE IN ${days} DAYS`
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="bg-white border-b border-neutral-200 px-9 py-4.5 -mx-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary-500"></div>
              </div>
              <span className="text-[16px] font-semibold text-neutral-900">MiddleDoc</span>
            </Link>

            {/* Nav Links */}
            <div className="flex gap-6">
              <span className="text-sm text-neutral-900 font-semibold">Dashboard</span>
              <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition cursor-pointer">Clients</Link>
              <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition cursor-pointer">Requests</Link>
              {canSeeAllNav && <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition cursor-pointer">Documents</Link>}
              {canSeeAllNav && <Link href="/dashboard/settings" className="text-sm text-neutral-500 hover:text-neutral-900 transition cursor-pointer">Settings</Link>}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNewRequest(true)} className="bg-primary-600 text-white text-[13px] font-semibold px-4 py-[9px] rounded-lg hover:bg-primary-700 transition cursor-pointer">
              + New request
            </button>
            {canSeeAllNav ? (
              <Link href="/dashboard/settings" className="cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
              </Link>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
        </div>

        {/* Empty State vs Populated State */}
        {isEmpty ? (
          <EmptyState firstName={firstName} onOpenNewRequest={() => setShowNewRequest(true)} />
        ) : (
          <>
            {/* Header with time-of-day greeting */}
            <div className="mb-8">
              <h1 className="text-h2 font-serif text-neutral-900 mb-1">
                {getGreeting()}, {firstName}
              </h1>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px] mb-8" style={{ gridAutoRows: '148px' }}>
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

              {/* Active Clients — links to /dashboard/clients */}
              <Link
                href="/dashboard/clients"
                className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between hover:border-neutral-300 transition cursor-pointer"
              >
                <div className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.05em]">Active clients</div>
                <div className="text-mono text-[38px] font-semibold text-neutral-900">{clients?.length ?? 0}</div>
              </Link>

              {/* Overdue — links to /dashboard/requests?status=overdue */}
              <Link
                href="/dashboard/requests?status=overdue"
                className="bg-danger-50 border border-danger-200 rounded-[18px] p-5 flex flex-col justify-between hover:border-danger-300 transition cursor-pointer"
              >
                <div className="text-xs font-semibold text-danger-700 uppercase tracking-[0.05em]">Overdue</div>
                <div className="text-mono text-[38px] font-semibold text-danger-600">{overdueRequests.length}</div>
              </Link>

              {/* Pending — links to /dashboard/requests?status=pending */}
              <Link
                href="/dashboard/requests?status=pending"
                className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between hover:border-neutral-300 transition cursor-pointer"
              >
                <div className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.05em]">Pending</div>
                <div className="text-mono text-[38px] font-semibold text-warning-600">{pendingRequests.length}</div>
              </Link>

              {/* Due This Week — links to /dashboard/requests */}
              <Link
                href="/dashboard/requests"
                className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between hover:border-neutral-300 transition cursor-pointer"
              >
                <div className="text-xs font-semibold text-neutral-600 uppercase tracking-[0.05em]">Due this week</div>
                <div className="text-mono text-[38px] font-semibold text-neutral-900">{dueThisWeek.length}</div>
              </Link>

              {/* Needs Attention - Wide */}
              <div className="col-span-2 lg:col-span-4 bg-white border border-neutral-200 rounded-[18px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-body-md font-semibold text-neutral-900">Needs your attention</h3>
                  <Link href="/dashboard/requests" className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer">View all &rarr;</Link>
                </div>

                {/* Attention Cards — each wrapped in Link */}
                <div className="flex gap-[14px] h-auto">
                  {overdueRequests.length > 0 && (
                    <Link
                      href={`/dashboard/requests/${overdueRequests[0].id}`}
                      className="flex-1 border border-danger-200 bg-danger-50 rounded-[11px] p-3.5 hover:border-danger-300 transition cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-danger-600 mb-1">{getDaysLabel(overdueRequests[0].due_date)}</div>
                      <div className="text-sm font-medium text-neutral-900">{overdueRequests[0].title}</div>
                      <div className="text-xs text-neutral-400 mt-1">{clients?.find(c => c.id === overdueRequests[0]?.client_id)?.name ?? 'Unknown'}</div>
                    </Link>
                  )}

                  {dueThisWeek.length > 0 && (
                    <Link
                      href={`/dashboard/requests/${dueThisWeek[0].id}`}
                      className="flex-1 border border-warning-200 bg-warning-50 rounded-[11px] p-3.5 hover:border-warning-300 transition cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-warning-700 mb-1">{getDaysLabel(dueThisWeek[0].due_date)}</div>
                      <div className="text-sm font-medium text-neutral-900">{dueThisWeek[0].title}</div>
                      <div className="text-xs text-neutral-400 mt-1">{clients?.find(c => c.id === dueThisWeek[0]?.client_id)?.name ?? 'Unknown'}</div>
                    </Link>
                  )}

                  {pendingRequests.length > 0 && (
                    <Link
                      href={`/dashboard/requests/${pendingRequests[0].id}`}
                      className="flex-1 border border-warning-200 bg-warning-50 rounded-[11px] p-3.5 hover:border-warning-300 transition cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-warning-700 mb-1">{getDaysLabel(pendingRequests[0].due_date)}</div>
                      <div className="text-sm font-medium text-neutral-900">{pendingRequests[0].title}</div>
                      <div className="text-xs text-neutral-400 mt-1">{clients?.find(c => c.id === pendingRequests[0]?.client_id)?.name ?? 'Unknown'}</div>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics Section — loads independently */}
            <AnalyticsSection />
          </>
        )}

        <NewRequestModal
          isOpen={showNewRequest}
          onClose={() => setShowNewRequest(false)}
          onRequestCreated={() => void refetchRequests()}
        />
      </div>
    </div>
  )
}
