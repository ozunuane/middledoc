'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface EmailTemplate {
  type: string
  subject: string
  body: string
  cta: string
  isCustom: boolean
}

const TEMPLATE_META: Record<string, { label: string; description: string; dotColor: string; barColor: string }> = {
  initial: {
    label: 'First reminder',
    description: 'Friendly heads-up sent 7 days before the deadline',
    dotColor: 'bg-primary-600',
    barColor: '#0F7A63',
  },
  '7day': {
    label: '7-day reminder',
    description: 'Gentle nudge when a week remains',
    dotColor: 'bg-primary-600',
    barColor: '#0F7A63',
  },
  '3day': {
    label: '3-day reminder',
    description: 'Concrete nudge listing remaining documents',
    dotColor: 'bg-warning-400',
    barColor: '#E6A23C',
  },
  deadline: {
    label: 'Deadline day',
    description: 'Calm, professional reminder on the due date',
    dotColor: 'bg-danger-600',
    barColor: '#C0492F',
  },
  rejection: {
    label: 'Document rejected',
    description: 'Sent when you reject an uploaded document',
    dotColor: 'bg-danger-600',
    barColor: '#C0492F',
  },
}

const EXAMPLE_VALUES: Record<string, string> = {
  '{clientName}': 'Sarah',
  '{accountantName}': 'James Miller',
  '{firmName}': 'Miller & Associates',
  '{requestTitle}': '2025 Tax Return',
  '{dueDate}': 'Friday, April 15',
  '{portalUrl}': 'https://middledoc.app/portal/abc123',
  '{fileName}': 'W2_2025.pdf',
  '{rejectionReason}': 'This is for the wrong tax year. Please upload the 2025 version.',
}

const VARIABLES = [
  { token: '{clientName}', desc: "Client's name" },
  { token: '{accountantName}', desc: 'Your name' },
  { token: '{firmName}', desc: 'Your firm name' },
  { token: '{requestTitle}', desc: 'Request title' },
  { token: '{dueDate}', desc: 'Due date' },
  { token: '{portalUrl}', desc: 'Upload link' },
  { token: '{fileName}', desc: 'File name (rejection only)' },
  { token: '{rejectionReason}', desc: 'Reason (rejection only)' },
]

function replaceVariables(text: string): string {
  let result = text
  for (const [token, value] of Object.entries(EXAMPLE_VALUES)) {
    result = result.replaceAll(token, value)
  }
  return result
}

function TemplateCard({
  template,
  meta,
  editingType,
  onStartEdit,
  onCancelEdit,
  onSave,
  onReset,
}: {
  template: EmailTemplate
  meta: { label: string; description: string; dotColor: string; barColor: string }
  editingType: string | null
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: (subject: string, body: string, cta: string) => Promise<void>
  onReset: () => Promise<void>
}) {
  const isEditing = editingType === template.type
  const [subject, setSubject] = useState(template.subject)
  const [body, setBody] = useState(template.body)
  const [cta, setCta] = useState(template.cta)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Sync local state when template data changes (e.g. after reset)
  useEffect(() => {
    setSubject(template.subject)
    setBody(template.body)
    setCta(template.cta)
  }, [template.subject, template.body, template.cta])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(subject, body, cta)
    setSaving(false)
  }

  const handleReset = async () => {
    await onReset()
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-card p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${meta.dotColor}`}></div>
            <h3 className="text-body-md font-semibold text-neutral-900">{meta.label}</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1 ml-4">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {template.isCustom && (
            <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Customized</span>
          )}
          <button
            onClick={isEditing ? onCancelEdit : onStartEdit}
            className="text-[13px] text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Preview mode */}
      {!isEditing && (
        <>
          <div className="space-y-2">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wide">Subject</span>
              <p className="text-[13px] text-neutral-900">{template.subject}</p>
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wide">Body</span>
              <p className="text-[13px] text-neutral-600 whitespace-pre-line">{template.body}</p>
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wide">Button text</span>
              <p className="text-[13px] text-neutral-900">{template.cta}</p>
            </div>
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="mt-3 text-[12px] text-neutral-400 hover:text-neutral-600 font-medium cursor-pointer"
          >
            {showPreview ? 'Hide preview' : 'Preview'}
          </button>

          {showPreview && (
            <div className="mt-4 bg-neutral-100 rounded-[9px] p-4">
              <div className="bg-white rounded-[9px] overflow-hidden border border-neutral-200 max-w-[400px] mx-auto">
                <div className="h-[4px]" style={{ backgroundColor: meta.barColor }}></div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded bg-neutral-900 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-sm bg-primary-500"></div>
                    </div>
                    <span className="text-[12px] font-semibold text-neutral-900">MiddleDoc</span>
                  </div>
                  <p className="text-[12px] text-neutral-600 leading-relaxed whitespace-pre-line">
                    {replaceVariables(template.body)}
                  </p>
                  <div className="mt-3 inline-block bg-primary-600 text-white text-[12px] font-semibold px-4 py-2 rounded-[7px]">
                    {replaceVariables(template.cta)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit mode */}
      {isEditing && (
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Subject line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Email body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] resize-none focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Button text</label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-200">
            <div>
              {template.isCustom && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[13px] text-neutral-500 hover:text-neutral-700 cursor-pointer"
                >
                  Reset to default
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-[18px] py-[10px] text-[13px] font-semibold bg-primary-600 text-white rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default function EmailTemplatesPage() {
  const { user, loading: authLoading } = useAuth(true)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [variablesOpen, setVariablesOpen] = useState(false)

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTemplates()
    }
  }, [user])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (type: string, subject: string, body: string, cta: string) => {
    try {
      const res = await fetch('/api/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, subject, body, cta }),
      })
      if (res.ok) {
        showToast('Template saved')
        setEditingType(null)
        await fetchTemplates()
      }
    } catch {
      // silently fail
    }
  }

  const handleReset = async (type: string) => {
    try {
      const res = await fetch('/api/email-templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        showToast('Template reset to default')
        setEditingType(null)
        await fetchTemplates()
      }
    } catch {
      // silently fail
    }
  }

  if (authLoading) return <LoadingSpinner fullPage />
  if (!user) return null

  const templateOrder = ['initial', '7day', '3day', 'deadline', 'rejection']

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
        <Link href="/dashboard/settings" className="text-primary-600 font-medium text-[13px] mb-6 inline-block hover:text-primary-700">
          &larr; Settings
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-h2 font-serif text-neutral-900 mb-1">Email Templates</h1>
          <p className="text-body-md text-neutral-500">
            Customize the emails sent to your clients. Use &#123;variables&#125; for dynamic content.
          </p>
        </div>

        {/* Variable reference box */}
        <div className="mb-6">
          <button
            onClick={() => setVariablesOpen(!variablesOpen)}
            className="flex items-center gap-2 text-[13px] font-medium text-primary-700 hover:text-primary-800 cursor-pointer mb-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${variablesOpen ? 'rotate-90' : ''}`}
            >
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Available variables
          </button>

          {variablesOpen && (
            <div className="bg-primary-50 border border-primary-100 rounded-[9px] p-4 text-[13px] text-neutral-700 font-mono">
              <div className="space-y-1.5">
                {VARIABLES.map((v) => (
                  <div key={v.token} className="flex gap-3">
                    <span className="text-primary-700 font-semibold min-w-[160px]">{v.token}</span>
                    <span className="text-neutral-500 font-sans">&mdash; {v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Template cards */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div>
            {templateOrder.map((type) => {
              const template = templates.find((t) => t.type === type)
              const meta = TEMPLATE_META[type]
              if (!template || !meta) return null
              return (
                <TemplateCard
                  key={type}
                  template={template}
                  meta={meta}
                  editingType={editingType}
                  onStartEdit={() => setEditingType(type)}
                  onCancelEdit={() => setEditingType(null)}
                  onSave={(subject, body, cta) => handleSave(type, subject, body, cta)}
                  onReset={() => handleReset(type)}
                />
              )
            })}
          </div>
        )}
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
