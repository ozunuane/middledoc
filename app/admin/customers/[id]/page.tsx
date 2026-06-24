'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface AccountInfo {
  id: number
  name: string
  email: string
  firm_name: string | null
  created_at: string
  is_suspended: boolean
  suspended_at: string | null
  suspended_reason: string | null
  last_login_at: string | null
}

interface SubscriptionInfo {
  plan_slug: string
  plan_name: string
  status: string
  [key: string]: unknown
}

interface UsageStats {
  client_count: number
  request_count: number
  upload_count: number
  storage_used: number
}

interface RecentActivity {
  id: number
  title: string
  status: string
  created_at: string
  client_name: string
}

interface CustomerDetail {
  account: AccountInfo
  subscription: SubscriptionInfo | null
  stats: UsageStats | null
  recent_activity: RecentActivity[]
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/customers/${id}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleToggleSuspend() {
    if (!data) return
    const newStatus = data.account.is_suspended ? 'active' : 'suspended'
    const confirmMsg = data.account.is_suspended
      ? 'Reactivate this customer?'
      : 'Suspend this customer? They will lose access.'
    if (!confirm(confirmMsg)) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        // Reload data
        const refreshRes = await fetch(`/api/admin/customers/${id}`)
        if (refreshRes.ok) setData(await refreshRes.json())
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: `DELETE-${id}` }),
      })
      if (res.ok) {
        router.push('/admin/customers')
      } else {
        const err = await res.json()
        alert(err.error || 'Delete failed')
      }
    } catch {
      alert('Delete failed')
    } finally {
      setActionLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400 text-sm">Loading customer...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-neutral-400 text-sm">Customer not found</p>
        <Link href="/admin/customers" className="text-primary-600 text-sm hover:underline">
          Back to customers
        </Link>
      </div>
    )
  }

  const { account, subscription, stats, recent_activity } = data

  const statCards = stats
    ? [
        { label: 'Clients', value: stats.client_count.toLocaleString() },
        { label: 'Requests', value: stats.request_count.toLocaleString() },
        { label: 'Documents', value: stats.upload_count.toLocaleString() },
        { label: 'Storage', value: formatStorage(stats.storage_used) },
      ]
    : []

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/customers"
          className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors inline-flex items-center gap-1 mb-3"
        >
          &larr; Back to customers
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-neutral-900">{account.name}</h1>
          {account.is_suspended && (
            <span className="text-[11px] font-medium uppercase tracking-wider bg-danger-100 text-danger-700 px-2 py-0.5 rounded">
              Suspended
            </span>
          )}
          {!account.is_suspended && (
            <span className="text-[11px] font-medium uppercase tracking-wider bg-success-100 text-success-700 px-2 py-0.5 rounded">
              Active
            </span>
          )}
        </div>
        <p className="text-[14px] text-neutral-500 mt-0.5">{account.email}</p>
      </div>

      {/* Stats row */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-neutral-200 rounded-[14px] p-5"
            >
              <p className="text-[13px] text-neutral-400 uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-semibold text-neutral-900 font-mono">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Info cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Account Info */}
        <div className="bg-white border border-neutral-200 rounded-[14px] p-5">
          <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide mb-4">
            Account Info
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-[14px] text-neutral-500">Name</dt>
              <dd className="text-[14px] text-neutral-900 font-medium">{account.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[14px] text-neutral-500">Email</dt>
              <dd className="text-[14px] text-neutral-900">{account.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[14px] text-neutral-500">Firm</dt>
              <dd className="text-[14px] text-neutral-900">{account.firm_name || '\u2014'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[14px] text-neutral-500">Created</dt>
              <dd className="text-[14px] text-neutral-900">{formatDate(account.created_at)}</dd>
            </div>
            {account.last_login_at && (
              <div className="flex justify-between">
                <dt className="text-[14px] text-neutral-500">Last login</dt>
                <dd className="text-[14px] text-neutral-900">{formatDateTime(account.last_login_at)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Subscription */}
        <div className="bg-white border border-neutral-200 rounded-[14px] p-5">
          <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide mb-4">
            Subscription
          </h2>
          {subscription ? (
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-[14px] text-neutral-500">Plan</dt>
                <dd className="text-[14px] text-neutral-900 font-medium">{subscription.plan_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[14px] text-neutral-500">Status</dt>
                <dd>
                  <span className={`text-[12px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                    subscription.status === 'active'
                      ? 'bg-success-100 text-success-700'
                      : subscription.status === 'trialing'
                      ? 'bg-warning-100 text-warning-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {subscription.status}
                  </span>
                </dd>
              </div>
            </dl>
          ) : (
            <div className="text-[14px] text-neutral-400">
              <p className="font-medium text-neutral-900 mb-1">Free Plan</p>
              <p>No active subscription</p>
            </div>
          )}
        </div>

        {/* Usage */}
        {stats && (
          <div className="bg-white border border-neutral-200 rounded-[14px] p-5">
            <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide mb-4">
              Usage
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-[14px] text-neutral-500">Clients</dt>
                <dd className="text-[14px] text-neutral-900 font-mono">{stats.client_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[14px] text-neutral-500">Requests</dt>
                <dd className="text-[14px] text-neutral-900 font-mono">{stats.request_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[14px] text-neutral-500">Uploads</dt>
                <dd className="text-[14px] text-neutral-900 font-mono">{stats.upload_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[14px] text-neutral-500">Storage</dt>
                <dd className="text-[14px] text-neutral-900 font-mono">{formatStorage(stats.storage_used)}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white border border-neutral-200 rounded-[14px] p-5">
          <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide mb-4">
            Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleToggleSuspend}
              disabled={actionLoading}
              className={`w-full py-2.5 px-4 rounded-[9px] text-[14px] font-medium transition disabled:opacity-50 ${
                account.is_suspended
                  ? 'bg-success-600 hover:bg-success-700 text-white'
                  : 'bg-warning-500 hover:bg-warning-600 text-white'
              }`}
            >
              {account.is_suspended ? 'Reactivate Customer' : 'Suspend Customer'}
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 px-4 rounded-[9px] text-[14px] font-medium bg-white border border-danger-300 text-danger-600 hover:bg-danger-50 transition"
              >
                Delete Customer
              </button>
            ) : (
              <div className="border border-danger-300 rounded-[9px] p-4 bg-danger-50">
                <p className="text-[13px] text-danger-700 mb-3">
                  This will permanently delete this customer and all their data. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 py-2 px-4 rounded-[9px] text-[13px] font-medium bg-danger-600 hover:bg-danger-700 text-white transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 px-4 rounded-[9px] text-[13px] font-medium bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recent_activity.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-[14px] overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200">
            <h2 className="text-[13px] text-neutral-400 uppercase tracking-wide">
              Recent Activity
            </h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-100 text-[12px] text-neutral-500 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Request</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recent_activity.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 text-[14px] text-neutral-900 font-medium">
                    {a.title}
                  </td>
                  <td className="px-5 py-3 text-[14px] text-neutral-600">{a.client_name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                      a.status === 'completed'
                        ? 'bg-success-100 text-success-700'
                        : a.status === 'pending'
                        ? 'bg-warning-100 text-warning-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[14px] text-neutral-500">
                    {formatDate(a.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
