'use client'

import { useEffect, useState } from 'react'

interface TableSize {
  table_name: string
  size: string
}

interface StatsData {
  db_size: string
  table_sizes: TableSize[]
  total_storage_bytes: number
  signup_trend: { day: string; count: number }[]
}

function formatStorage(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

export default function AdminSystemPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          setStats(await res.json())
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400 text-sm">Loading system stats...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400 text-sm">Failed to load system stats</p>
      </div>
    )
  }

  const signupData = stats.signup_trend || []
  const maxCount = Math.max(...signupData.map((d) => d.count), 1)

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">System</h1>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-[14px] p-5">
          <p className="text-[13px] text-neutral-400 uppercase tracking-wide mb-1">
            Database Size
          </p>
          <p className="text-3xl font-semibold text-neutral-900 font-mono">
            {stats.db_size}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-[14px] p-5">
          <p className="text-[13px] text-neutral-400 uppercase tracking-wide mb-1">
            Upload Storage
          </p>
          <p className="text-3xl font-semibold text-neutral-900 font-mono">
            {formatStorage(stats.total_storage_bytes)}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-[14px] p-5">
          <p className="text-[13px] text-neutral-400 uppercase tracking-wide mb-1">
            Tables
          </p>
          <p className="text-3xl font-semibold text-neutral-900 font-mono">
            {stats.table_sizes.length}
          </p>
        </div>
      </div>

      {/* Signup trend chart */}
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

      {/* Table sizes */}
      <div className="bg-white border border-neutral-200 rounded-[14px] overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide">
            Tables by Size
          </h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-100 text-[12px] text-neutral-500 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Table</th>
              <th className="px-5 py-3 font-medium text-right">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {stats.table_sizes.map((t) => (
              <tr key={t.table_name} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-3 text-[14px] text-neutral-900 font-mono">
                  {t.table_name}
                </td>
                <td className="px-5 py-3 text-[14px] text-neutral-600 font-mono text-right">
                  {t.size}
                </td>
              </tr>
            ))}
            {stats.table_sizes.length === 0 && (
              <tr>
                <td colSpan={2} className="px-5 py-8 text-center text-neutral-400 text-sm">
                  No tables found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
