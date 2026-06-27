'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface ConnectionInfo {
  id: number
  company_name?: string
  last_synced_at?: string
  sync_status: 'idle' | 'syncing' | 'error'
  sync_error?: string
  created_at: string
}

interface SyncResult {
  imported: number
  updated: number
  skipped: number
  total: number
}

export default function IntegrationsPage() {
  const { user, loading: authLoading } = useAuth(true)
  const searchParams = useSearchParams()

  const [connection, setConnection] = useState<ConnectionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/qbo')
      if (res.ok) {
        const data = await res.json()
        if (data.connected) {
          setConnection(data.connection)
        } else {
          setConnection(null)
        }
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) void fetchStatus()
  }, [user, fetchStatus])

  // Show success toast on redirect from OAuth callback
  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      showToast('QuickBooks connected successfully')
      // Remove query param from URL without reload
      window.history.replaceState({}, '', '/dashboard/settings/integrations')
    }
    const error = searchParams.get('error')
    if (error) {
      const messages: Record<string, string> = {
        invalid_state: 'Connection failed: invalid state. Please try again.',
        access_denied: 'QuickBooks access was denied.',
        missing_params: 'Connection failed: missing parameters.',
        connection_failed: 'Failed to connect to QuickBooks. Please try again.',
      }
      showToast(messages[error] || 'Connection failed. Please try again.')
      window.history.replaceState({}, '', '/dashboard/settings/integrations')
    }
  }, [searchParams])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/integrations/qbo', { method: 'POST' })
      if (res.ok) {
        const result = await res.json()
        setSyncResult(result)
        showToast('Sync completed successfully')
        void fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Sync failed')
      }
    } catch {
      showToast('Network error -- please try again')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect QuickBooks? Your imported clients will not be deleted.')) return
    setDisconnecting(true)
    try {
      const res = await fetch('/api/integrations/qbo', { method: 'DELETE' })
      if (res.ok) {
        setConnection(null)
        setSyncResult(null)
        showToast('QuickBooks disconnected')
      } else {
        showToast('Failed to disconnect')
      }
    } catch {
      showToast('Network error -- please try again')
    } finally {
      setDisconnecting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (authLoading) return <LoadingSpinner fullPage />
  if (!user) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-neutral-200 px-9 py-4.5 flex items-center justify-between mb-8">
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
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Dashboard</Link>
            <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Clients</Link>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
            <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Documents</Link>
            <Link href="/dashboard/settings" className="text-sm text-neutral-900 font-semibold">Settings</Link>
          </div>
        </div>

        {/* User Avatar */}
        <Link href="/dashboard/settings" className="cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
            {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : ''}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="px-9 max-w-3xl">
        {/* Back link */}
        <Link href="/dashboard/settings" className="text-primary-600 font-medium text-[13px] mb-6 inline-block hover:text-primary-700">
          &larr; Settings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 font-serif text-neutral-900">Integrations</h1>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          /* QuickBooks Card */
          <div className="bg-white border border-neutral-200 rounded-card p-6">
            <div className="flex items-center gap-3 mb-4">
              {/* QBO logo placeholder */}
              <div className="w-10 h-10 rounded-lg bg-[#2CA01C] flex items-center justify-center text-white text-lg font-bold">
                Q
              </div>
              <div>
                <h3 className="text-body-md font-semibold text-neutral-900">QuickBooks Online</h3>
                <p className="text-[12px] text-neutral-400">Sync your client list automatically</p>
              </div>
            </div>

            {connection ? (
              /* Connected state */
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                  <span className="text-[13px] text-neutral-900">Connected to {connection.company_name}</span>
                </div>
                <div className="text-[12px] text-neutral-400 mb-4">
                  Last synced: {connection.last_synced_at ? formatDate(connection.last_synced_at) : 'Never'}
                  {connection.sync_status === 'syncing' && ' -- Syncing...'}
                  {connection.sync_error && <span className="text-danger-600"> -- Error: {connection.sync_error}</span>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSync}
                    disabled={syncing || connection.sync_status === 'syncing'}
                    className="bg-primary-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[9px] disabled:opacity-50 cursor-pointer hover:bg-primary-700 transition"
                  >
                    {syncing ? 'Syncing...' : 'Sync now'}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-[13px] text-danger-600 hover:text-danger-700 cursor-pointer disabled:opacity-50"
                  >
                    {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
                {syncResult && (
                  <div className="mt-3 bg-primary-50 border border-primary-100 rounded-[9px] p-3 text-[13px] text-neutral-700">
                    Imported {syncResult.imported}, updated {syncResult.updated}, skipped {syncResult.skipped} ({syncResult.total} total)
                  </div>
                )}
              </div>
            ) : (
              /* Not connected */
              <div>
                <p className="text-[13px] text-neutral-500 mb-4">
                  Connect your QuickBooks account to automatically import your client list. New clients added in QuickBooks will sync to MiddleDoc.
                </p>
                <a
                  href="/api/integrations/qbo/connect"
                  className="inline-block bg-[#2CA01C] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[9px] hover:bg-[#249017] transition cursor-pointer"
                >
                  Connect QuickBooks
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[13px] font-medium px-5 py-3 rounded-[9px] shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
