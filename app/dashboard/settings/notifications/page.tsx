'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { NotificationEmail } from '@/types/index'

export default function NotificationEmailsPage() {
  const { user, loading: authLoading } = useAuth(true)

  const [emails, setEmails] = useState<NotificationEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Add form
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [adding, setAdding] = useState(false)

  // Remove loading
  const [removingId, setRemovingId] = useState<number | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch('/api/notification-emails')
      if (res.ok) {
        const data = await res.json()
        setEmails(Array.isArray(data) ? data : data.emails ?? [])
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (user) void fetchEmails()
  }, [user, fetchEmails])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/notification-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), label: newLabel.trim() || undefined }),
      })
      if (res.ok) {
        showToast('Notification email added')
        setNewEmail('')
        setNewLabel('')
        await fetchEmails()
      } else {
        const data = await res.json()
        showToast(data.error ?? 'Failed to add email')
      }
    } catch {
      showToast('Network error')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id: number) => {
    setRemovingId(id)
    try {
      const res = await fetch('/api/notification-emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        showToast('Notification email removed')
        await fetchEmails()
      } else {
        showToast('Failed to remove email')
      }
    } catch {
      showToast('Network error')
    } finally {
      setRemovingId(null)
    }
  }

  if (authLoading) return <LoadingSpinner fullPage />
  if (!user) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-neutral-200 px-9 py-4.5 flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-[16px] font-semibold text-neutral-900">MiddleDoc</span>
          </div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Dashboard</Link>
            <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Clients</Link>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
            <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Documents</Link>
            <span className="text-sm text-neutral-900 font-semibold">Settings</span>
          </div>
        </div>
        <Link href="/dashboard/settings" className="cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
            {user.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
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
          <h1 className="text-h2 font-serif text-neutral-900 mb-1">Notification Emails</h1>
          <p className="text-body-md text-neutral-500">
            These email addresses will receive a BCC copy of every email sent to your clients (reminders, rejections, etc.).
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Current emails */}
            <div className="bg-white border border-neutral-200 rounded-card p-6 mb-4">
              <h2 className="text-body-md font-semibold text-neutral-900 mb-4">Current notification emails</h2>

              {emails.length === 0 ? (
                <p className="text-[13px] text-neutral-400 mb-4">No notification emails configured.</p>
              ) : (
                <div className="mb-4">
                  {emails.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-paper-rowline px-4 py-3">
                      <div>
                        <span className="text-[13px] text-neutral-900">{item.email}</span>
                        {item.label && (
                          <span className="text-[11px] text-neutral-400 ml-2">({item.label})</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                        className="text-[12px] text-danger-600 hover:text-danger-700 font-medium cursor-pointer disabled:opacity-50"
                      >
                        {removingId === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add form */}
              <form onSubmit={handleAdd} className="border border-neutral-200 rounded-[9px] p-4">
                <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Add email</h3>
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Email address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="notifications@firm.com"
                      required
                      className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                    />
                  </div>
                  <div className="w-48">
                    <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Label (optional)</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Office admin"
                      className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={adding || !newEmail.trim()}
                  className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </form>
            </div>
          </>
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
