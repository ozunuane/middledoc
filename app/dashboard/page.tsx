'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { NewRequestModal } from '@/components/NewRequestModal'
import type { Client, DocumentRequest } from '@/types/index'

/* ──────────────────────────────────────────────
   Analytics types
   ────────────────────────────────────────────── */
interface AnalyticsData {
  completion_by_month: { month: string; total: number; received: number; rate: number }[]
  response_time: { avg_days: number; min_days: number; max_days: number }
  status_breakdown: { status: string; count: number }[]
  upload_activity: { day: string; count: number }[]
  top_clients: { name: string; uploads: number; requests: number }[]
  overall: {
    total_requests: number
    completed_requests: number
    total_uploads: number
    avg_uploads_per_request: number
    completion_rate: number
  }
}

/* ──────────────────────────────────────────────
   Analytics skeleton loader
   ────────────────────────────────────────────── */
function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-[18px] p-5 h-[120px]">
            <div className="h-3 w-24 bg-neutral-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-neutral-200 rounded"></div>
          </div>
        ))}
      </div>
      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6 h-[280px]">
          <div className="h-3 w-40 bg-neutral-200 rounded mb-6"></div>
          <div className="flex items-end gap-2 h-40">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 bg-neutral-100 rounded-t" style={{ height: `${40 + Math.random() * 60}%` }}></div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6 h-[280px]">
          <div className="h-3 w-32 bg-neutral-200 rounded mb-6"></div>
          <div className="flex items-end gap-px h-24">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="flex-1 bg-neutral-100 rounded-t-sm" style={{ height: `${10 + Math.random() * 70}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Analytics Section component
   ────────────────────────────────────────────── */
function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: AnalyticsData = await res.json()
        setAnalytics(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <AnalyticsSkeleton />
  if (error || !analytics) return null
  if (analytics.overall.total_requests === 0) return null

  const data = analytics
  const maxTotal = Math.max(...data.completion_by_month.map(m => m.total), 1)
  const maxUploads = Math.max(...data.upload_activity.map(u => u.count), 1)
  const maxStatus = Math.max(...data.status_breakdown.map(s => s.count), 1)

  const statusColors: Record<string, string> = {
    pending: 'bg-warning-400',
    received: 'bg-primary-600',
    overdue: 'bg-danger-600',
    cancelled: 'bg-neutral-400',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    received: 'Received',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  }

  return (
    <div>
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="text-h3 font-serif text-neutral-900 mb-1">Analytics</h2>
        <p className="text-[13px] text-neutral-400">Your document collection performance</p>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px] mb-[18px]">
        {/* Completion Rate */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Completion Rate</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.overall.completion_rate}%</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">
            {data.overall.completed_requests} of {data.overall.total_requests} requests
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Avg Response Time</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.response_time.avg_days}</span>
            <span className="text-[13px] text-neutral-500 ml-1">days</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">
            {data.response_time.min_days}d min / {data.response_time.max_days}d max
          </div>
        </div>

        {/* Total Uploads */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Total Uploads</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.overall.total_uploads}</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">
            across all requests
          </div>
        </div>

        {/* Uploads per Request */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Uploads / Request</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.overall.avg_uploads_per_request}</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">
            average per request
          </div>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-[18px]">
        {/* Completion Rate by Month */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-1">Completion Rate by Month</h3>
          <p className="text-[12px] text-neutral-400 mb-5">Received vs total requests over the last 6 months</p>
          {data.completion_by_month.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {data.completion_by_month.map(m => {
                const receivedHeight = (m.received / maxTotal) * 120
                const pendingHeight = ((m.total - m.received) / maxTotal) * 120
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse items-center gap-0">
                      <div
                        className="w-full bg-primary-600 rounded-t"
                        style={{ height: `${receivedHeight}px` }}
                        title={`${m.received} received`}
                      ></div>
                      {m.total - m.received > 0 && (
                        <div
                          className="w-full bg-neutral-200 rounded-t"
                          style={{ height: `${pendingHeight}px` }}
                          title={`${m.total - m.received} not received`}
                        ></div>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-1">{m.month.split(' ')[0]}</span>
                    <span className="text-[10px] text-neutral-600 font-mono">{m.rate}%</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-[13px] text-neutral-400">
              No data for the last 6 months
            </div>
          )}
          {data.completion_by_month.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary-600"></div>
                <span className="text-[11px] text-neutral-400">Received</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-neutral-200"></div>
                <span className="text-[11px] text-neutral-400">Outstanding</span>
              </div>
            </div>
          )}
        </div>

        {/* Upload Activity (30 days) */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-1">Upload Activity</h3>
          <p className="text-[12px] text-neutral-400 mb-5">Daily uploads over the last 30 days</p>
          <div className="flex items-end gap-px h-24">
            {data.upload_activity.map((d, i) => (
              <div
                key={i}
                className="flex-1 bg-primary-600 rounded-t-sm min-h-[2px] transition-all hover:bg-primary-500"
                style={{ height: `${Math.max(2, (d.count / maxUploads) * 80)}px` }}
                title={`${d.day}: ${d.count} uploads`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-neutral-400">30 days ago</span>
            <span className="text-[10px] text-neutral-400">Today</span>
          </div>
        </div>
      </div>

      {/* Row 3: Status Breakdown + Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        {/* Status Breakdown */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {data.status_breakdown.map(s => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-[12px] text-neutral-500 w-20 capitalize">{statusLabels[s.status] ?? s.status}</span>
                <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColors[s.status] ?? 'bg-neutral-400'} rounded-full transition-all`}
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[13px] font-mono text-neutral-900 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-4">Top Clients</h3>
          {data.top_clients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide text-left pb-2">Client</th>
                  <th className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide text-right pb-2">Uploads</th>
                  <th className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide text-right pb-2">Requests</th>
                </tr>
              </thead>
              <tbody>
                {data.top_clients.map((c, i) => (
                  <tr key={i} className="border-b border-neutral-50 last:border-0">
                    <td className="text-[13px] text-neutral-900 py-2.5">{c.name}</td>
                    <td className="text-[13px] font-mono text-neutral-700 text-right py-2.5">{c.uploads}</td>
                    <td className="text-[13px] font-mono text-neutral-700 text-right py-2.5">{c.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-[13px] text-neutral-400 py-6 text-center">No client data yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

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
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary-500"></div>
              </div>
              <span className="text-[16px] font-semibold text-neutral-900">MiddleDoc</span>
            </div>

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
