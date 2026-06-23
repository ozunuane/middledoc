'use client'

import React, { useState, useEffect } from 'react'
import type { Client } from '@/types/index'

interface NewRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestCreated: () => void
}

export function NewRequestModal({ isOpen, onClose, onRequestCreated }: NewRequestModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)

  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch clients when modal opens
  useEffect(() => {
    if (!isOpen) return
    setClientsLoading(true)
    fetch('/api/clients', { headers: { 'Content-Type': 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load clients')
        const data: Client[] = await res.json()
        setClients(data)
      })
      .catch(() => setClients([]))
      .finally(() => setClientsLoading(false))
  }, [isOpen])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setClientId('')
      setTitle('')
      setDescription('')
      setDueDate('')
      setError(null)
    }
  }, [isOpen])

  const selectedClient = clients.find((c) => String(c.id) === clientId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: Number(clientId),
          title,
          description: description || undefined,
          due_date: dueDate,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      onRequestCreated()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-neutral-900/40 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-neutral-50 rounded-[16px] shadow-hero max-w-[560px] w-full">
        {/* Header */}
        <div className="border-b border-neutral-200 px-[28px] py-[24px] flex items-center justify-between">
          <h2 className="font-serif text-[26px] text-neutral-900">New request</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition text-2xl leading-none cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-[28px] py-[24px] flex flex-col gap-5">
            {/* Error */}
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 text-[13px] rounded-[9px] px-[14px] py-[10px]">
                {error}
              </div>
            )}

            {/* Client dropdown */}
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">
                Client
              </label>
              <div className="relative">
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] text-neutral-900 w-full appearance-none focus:border-[1.5px] focus:border-primary-600 focus:shadow-focus outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    {clientsLoading ? 'Loading clients...' : 'Select a client'}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none text-xs">
                  &#9662;
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">
                Request title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2025 Tax Documents"
                className="bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] text-neutral-900 w-full focus:border-[1.5px] focus:border-primary-600 focus:shadow-focus outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">
                Description <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what documents you need..."
                className="bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] text-neutral-900 w-full resize-none focus:border-[1.5px] focus:border-primary-600 focus:shadow-focus outline-none"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">
                Due date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] text-neutral-900 w-full focus:border-[1.5px] focus:border-primary-600 focus:shadow-focus outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 px-[28px] py-[18px] flex items-center justify-between">
            <div className="text-[13px] text-neutral-400">
              {selectedClient
                ? `We\u2019ll email the link to ${selectedClient.email}`
                : '\u00A0'}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-[10px] rounded-[9px] hover:bg-neutral-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create & send'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
