'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [firmName, setFirmName] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email ?? '')
      setFirmName(user.firm_name ?? '')
    }
  }, [user])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, firm_name: firmName }),
      })
      if (res.ok) {
        showToast('Profile updated')
      } else {
        showToast('Failed to save changes')
      }
    } catch {
      showToast('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return <LoadingSpinner fullPage />
  if (!user) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-neutral-200 px-9 py-4.5 flex items-center justify-between mb-8">
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
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Dashboard</Link>
            <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Clients</Link>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
            <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Documents</Link>
            <span className="text-sm text-neutral-900 font-semibold">Settings</span>
          </div>
        </div>

        {/* User Avatar */}
        <Link href="/dashboard/settings" className="cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
            {user.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="px-9 max-w-3xl">
        {/* Back link */}
        <Link href="/dashboard" className="text-primary-600 font-medium text-[13px] mb-6 inline-block hover:text-primary-700">
          &larr; Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 font-serif text-neutral-900">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-neutral-200 rounded-card p-6 mb-6">
          <div className="mb-5">
            <h2 className="text-body-md font-semibold text-neutral-900">Profile</h2>
            <p className="text-[13px] text-neutral-500 mt-1">Your name and firm details used in client communications.</p>
          </div>

          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] text-neutral-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Firm Name</label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="e.g. Miller & Associates"
                  className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                />
              </div>
            </div>

            <div className="mt-5">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Email Templates Section */}
        <div className="bg-white border border-neutral-200 rounded-card p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-body-md font-semibold text-neutral-900">Email Templates</h2>
            <p className="text-[13px] text-neutral-500 mt-1">Customize the emails sent to your clients.</p>
          </div>

          <Link
            href="/dashboard/settings/email-templates"
            className="text-[13px] font-semibold text-primary-600 hover:text-primary-700 transition"
          >
            Manage templates &rarr;
          </Link>
        </div>
      </div>

      {/* Success toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[13px] font-medium px-5 py-3 rounded-[9px] shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
