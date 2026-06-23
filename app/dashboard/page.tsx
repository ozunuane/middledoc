'use client'

import React from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client, DocumentRequest } from '@/types/index'

interface StatsCardProps {
  label: string
  value: number | null
  color?: string
  icon: React.ReactNode
  isLoading?: boolean
}

function StatsCard({ label, value, color = 'text-gray-900', icon, isLoading }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-light p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-2" aria-hidden="true">
          {icon}
        </div>
      </div>
      {isLoading ? (
        <div className="mt-2 h-10 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
      ) : (
        <p className={`mt-2 text-4xl font-bold ${color} dark:text-white`}>{value ?? 0}</p>
      )}
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  if (diffDay === 1) return 'yesterday'
  return `${diffDay} days ago`
}

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
  const recentRequests = [...(allRequests ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  if (authLoading) return <LoadingSpinner fullPage />
  if (!user) return null

  return (
    <div className="px-4 sm:px-6 py-6 max-w-content mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Welcome back, {user.name}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          label="Total Clients"
          value={clients?.length ?? null}
          isLoading={clientsLoading}
          icon={
            <svg
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <StatsCard
          label="Pending Requests"
          value={pendingRequests.length}
          color="text-yellow-600"
          isLoading={requestsLoading}
          icon={
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatsCard
          label="Total Requests"
          value={allRequests?.length ?? null}
          color="text-green-600"
          isLoading={requestsLoading}
          icon={
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-standard border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 min-h-[2.75rem]"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </Link>
        <Link
          href="/dashboard/requests"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-standard border border-gray-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 min-h-[2.75rem]"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Create Request
        </Link>
      </div>

      {/* Recent requests */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-light">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Requests</h2>
        </div>

        {requestsLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-16 px-6">
            <svg
              aria-hidden="true"
              className="mx-auto w-12 h-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
              No requests yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              <Link
                href="/dashboard/requests"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first request
              </Link>
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentRequests.map((req) => (
              <li key={req.id} className="py-4 px-6 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {req.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={req.status} size="sm" />
                    {req.due_date && (
                      <span className="text-xs text-gray-400">
                        Due{' '}
                        {new Date(req.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatRelativeTime(req.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {recentRequests.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/dashboard/requests"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Show all requests →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
