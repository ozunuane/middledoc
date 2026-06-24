'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Customer {
  id: number
  name: string
  email: string
  firm_name: string | null
  created_at: string
  is_suspended: boolean
  client_count: number
  request_count: number
  storage_used: number
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

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const limit = 50

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder(field === 'name' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  const sortIndicator = (field: string) => {
    if (sortField !== field) return ''
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: sortField,
        order: sortOrder,
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/customers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.data || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 0)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, search, sortField, sortOrder])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  async function handleSuspend(customerId: number, isSuspended: boolean) {
    const action = isSuspended ? 'active' : 'suspended'
    const confirmMsg = isSuspended
      ? 'Reactivate this customer?'
      : 'Suspend this customer? They will lose access.'

    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      if (res.ok) {
        fetchCustomers()
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Customers</h1>
          <p className="text-[13px] text-neutral-400 mt-0.5">
            {total.toLocaleString()} total accountant{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or firm..."
            className="flex-1 px-3 py-2 text-[14px] border border-neutral-200 rounded-[9px] bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-neutral-400"
          />
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-[9px] text-[14px] font-medium transition"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setPage(1)
              }}
              className="px-3 py-2 text-[14px] text-neutral-500 hover:text-neutral-700 transition"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-100 text-[12px] text-neutral-500 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium cursor-pointer hover:text-neutral-700 transition select-none" onClick={() => handleSort('name')}>Name{sortIndicator('name')}</th>
                <th className="px-5 py-3 font-medium cursor-pointer hover:text-neutral-700 transition select-none" onClick={() => handleSort('email')}>Email{sortIndicator('email')}</th>
                <th className="px-5 py-3 font-medium">Firm</th>
                <th className="px-5 py-3 font-medium text-right cursor-pointer hover:text-neutral-700 transition select-none" onClick={() => handleSort('client_count')}>Clients{sortIndicator('client_count')}</th>
                <th className="px-5 py-3 font-medium text-right cursor-pointer hover:text-neutral-700 transition select-none" onClick={() => handleSort('request_count')}>Requests{sortIndicator('request_count')}</th>
                <th className="px-5 py-3 font-medium text-right cursor-pointer hover:text-neutral-700 transition select-none" onClick={() => handleSort('storage_used')}>Storage{sortIndicator('storage_used')}</th>
                <th className="px-5 py-3 font-medium cursor-pointer hover:text-neutral-700 transition select-none" onClick={() => handleSort('created_at')}>Joined{sortIndicator('created_at')}</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-neutral-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-neutral-400 text-sm">
                    {search ? 'No customers match your search' : 'No customers yet'}
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/customers/${c.id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-neutral-900">
                          {c.name}
                        </span>
                        {c.is_suspended && (
                          <span className="text-[10px] font-medium uppercase tracking-wider bg-danger-100 text-danger-700 px-1.5 py-0.5 rounded">
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[14px] text-neutral-600">{c.email}</td>
                    <td className="px-5 py-3 text-[14px] text-neutral-500">
                      {c.firm_name || '\u2014'}
                    </td>
                    <td className="px-5 py-3 text-[14px] text-neutral-900 font-mono text-right">
                      {c.client_count}
                    </td>
                    <td className="px-5 py-3 text-[14px] text-neutral-900 font-mono text-right">
                      {c.request_count}
                    </td>
                    <td className="px-5 py-3 text-[14px] text-neutral-500 font-mono text-right">
                      {formatStorage(c.storage_used)}
                    </td>
                    <td className="px-5 py-3 text-[14px] text-neutral-500">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="text-[13px] text-primary-600 hover:text-primary-700 font-medium transition"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleSuspend(c.id, c.is_suspended)}
                          className={`text-[13px] font-medium transition ${
                            c.is_suspended
                              ? 'text-success-600 hover:text-success-700'
                              : 'text-danger-600 hover:text-danger-700'
                          }`}
                        >
                          {c.is_suspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </div>
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
