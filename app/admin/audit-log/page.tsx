'use client'

import { useEffect, useState, useCallback } from 'react'

interface AuditEntry {
  id: number
  admin_id: number
  action: string
  target_type: string
  target_id: number
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  admin_name: string
  admin_email: string
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 50

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      const res = await fetch(`/api/admin/audit-log?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.data || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 0)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Audit Log</h1>
        <p className="text-[13px] text-neutral-400 mt-0.5">
          {total.toLocaleString()} total entr{total !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-100 text-[12px] text-neutral-500 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Admin</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-neutral-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-neutral-400 text-sm">
                    No audit log entries
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 text-[13px] text-neutral-500 whitespace-nowrap">
                      {formatDateTime(entry.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[14px] text-neutral-900 font-medium">
                        {entry.admin_name}
                      </p>
                      <p className="text-[12px] text-neutral-400">{entry.admin_email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[12px] font-medium px-2 py-0.5 rounded whitespace-nowrap ${
                        entry.action.includes('delete')
                          ? 'bg-danger-100 text-danger-700'
                          : entry.action.includes('suspend')
                          ? 'bg-warning-100 text-warning-700'
                          : entry.action === 'login'
                          ? 'bg-neutral-100 text-neutral-600'
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {formatAction(entry.action)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[14px] text-neutral-600 whitespace-nowrap">
                      {entry.target_type}
                      {entry.target_id ? ` #${entry.target_id}` : ''}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-neutral-400 max-w-xs truncate">
                      {entry.details ? JSON.stringify(entry.details) : '\u2014'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-[13px] text-neutral-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-[13px] font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-[13px] font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
