'use client'

import React, { useState, useEffect, useRef } from 'react'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: () => void
}

export function AddClientModal({ isOpen, onClose, onClientAdded }: AddClientModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setEmail('')
      setError(null)
      setSubmitting(false)
      // Focus the name input after a brief delay for the modal to render
      setTimeout(() => nameInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? `Request failed (${res.status})`)
      }

      onClientAdded()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-neutral-50 rounded-[16px] shadow-hero max-w-[560px] w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4">
          <h2 className="font-serif text-[26px] text-neutral-900">Add client</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none cursor-pointer transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-7 pb-6 space-y-4">
            {error && (
              <div className="bg-danger-50 text-danger-600 text-sm rounded-[9px] p-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="client-name" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
                Name
              </label>
              <input
                ref={nameInputRef}
                id="client-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[1.5px] focus:border-primary-600 focus:shadow-focus transition"
              />
            </div>

            <div>
              <label htmlFor="client-email" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
                Email
              </label>
              <input
                id="client-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jane@company.com"
                className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[1.5px] focus:border-primary-600 focus:shadow-focus transition"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-7 py-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-2.5 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {submitting ? 'Adding...' : 'Add client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
