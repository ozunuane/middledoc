'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  total_accountants: number
  total_clients: number
  total_requests: number
  total_uploads: number
  total_storage_bytes: number
  signups_today: number
  signups_this_week: number
  signups_this_month: number
  active_subscriptions: number
}

interface StatsData {
  signup_trend: { day: string; count: number }[]
}

interface Customer {
  id: number
  name: string
  email: string
  firm_name: string | null
  created_at: string
  client_count: number
}

function formatStorage(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, statsRes, custRes] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/stats'),
          fetch('/api/admin/customers?limit=10&sort=created_at&order=desc'),
        ])

        if (dashRes.ok) setDashboard(await dashRes.json())
        if (statsRes.ok) setStats(await statsRes.json())
        if (custRes.ok) {
          const custData = await custRes.json()
          setCustomers(custData.data || [])
        }
      } catch {
        // silently fail for now
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400 text-sm">Loading dashboard...</p>
      </div>
    )
  }

  const signupData = stats?.signup_trend || []
  const maxCount = Math.max(...signupData.map((d) => d.count), 1)

  const statCards = dashboard
    ? [
        {
          label: 'Total Accountants',
          value: dashboard.total_accountants.toLocaleString(),
          sub: `${dashboard.signups_this_week} new this week`,
        },
        {
          label: 'Total Clients',
          value: dashboard.total_clients.toLocaleString(),
          sub: null,
        },
        {
          label: 'Total Requests',
          value: dashboard.total_requests.toLocaleString(),
          sub: null,
        },
        {
          label: 'Storage Used',
          value: formatStorage(dashboard.total_storage_bytes),
          sub: `${dashboard.total_uploads.toLocaleString()} uploads`,
        },
      ]
    : []

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-neutral-200 rounded-[14px] p-5"
          >
            <p className="text-[13px] text-neutral-400 uppercase tracking-wide mb-1">
              {card.label}
            </p>
            <p className="text-3xl font-semibold text-neutral-900 font-mono">
              {card.value}
            </p>
            {card.sub && (
              <p className="text-[13px] text-neutral-400 mt-1">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Signups chart */}
      <div className="bg-white border border-neutral-200 rounded-[14px] p-5 mb-8">
        <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide mb-4">
          Signups — Last 30 Days
        </h2>
        <div className="flex items-end gap-[2px] h-[140px]">
          {signupData.map((day) => {
            const height = maxCount > 0 ? (day.count / maxCount) * 120 : 0
            const dayLabel = new Date(day.day).toLocaleDateString('en-US', { day: 'numeric' })
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-full bg-primary-600 rounded-t min-h-[2px]"
                  style={{ height: `${Math.max(height, 2)}px` }}
                  title={`${day.day}: ${day.count} signups`}
                />
                <span className="text-[9px] text-neutral-400 mt-1">{dayLabel}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent customers */}
      <div className="bg-white border border-neutral-200 rounded-[14px] overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide">
            Recent Signups
          </h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-100 text-[12px] text-neutral-500 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Signed Up</th>
              <th className="px-5 py-3 font-medium text-right">Clients</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="text-[14px] font-medium text-neutral-900 hover:text-primary-600 transition-colors"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-[14px] text-neutral-600">{c.email}</td>
                <td className="px-5 py-3 text-[14px] text-neutral-500">{formatDate(c.created_at)}</td>
                <td className="px-5 py-3 text-[14px] text-neutral-900 font-mono text-right">
                  {c.client_count}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-neutral-400 text-sm">
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
