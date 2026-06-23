'use client'

import React, { useState, useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import { useForm } from '@/hooks/useForm'
import { useAuth } from '@/hooks/useAuth'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Client } from '@/types/index'

// ── Toast notification ────────────────────────────────────────────────────────
interface ToastProps {
  message: string
  type: 'success' | 'error'
  onDismiss: () => void
}

function Toast({ message, type, onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'fixed bottom-6 right-6 z-toast flex items-center gap-3 px-4 py-3 rounded-card shadow-dark text-sm font-medium animate-slide-in-from-right',
        type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800',
      ].join(' ')}
    >
      {type === 'success' ? (
        <svg aria-hidden="true" className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
      {message}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Add Client Form ────────────────────────────────────────────────────────────
interface AddClientFormValues extends Record<string, unknown> {
  name: string
  email: string
}

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}

function AddClientModal({ isOpen, onClose, onSuccess, onToast }: AddClientModalProps) {
  const { values, errors, loading, handleChange, handleSubmit, reset } = useForm<AddClientFormValues>(
    { name: '', email: '' },
    async (vals) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vals),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to create client')
      }
      onToast('Client added successfully', 'success')
      reset()
      onClose()
      onSuccess()
    }
  )

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Client"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            onClick={() => {
              const form = document.getElementById('add-client-form') as HTMLFormElement | null
              form?.requestSubmit()
            }}
          >
            Add Client
          </Button>
        </>
      }
    >
      <form
        id="add-client-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
        noValidate
      >
        <FormField
          label="Name"
          name="name"
          type="text"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Jane Smith"
          autoComplete="name"
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="jane@example.com"
          autoComplete="email"
        />
        {errors.submit && (
          <p role="alert" className="text-sm text-red-600 font-medium">
            {errors.submit}
          </p>
        )}
      </form>
    </Modal>
  )
}

// ── Delete Confirmation ────────────────────────────────────────────────────────
interface DeleteModalProps {
  client: Client | null
  onClose: () => void
  onSuccess: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}

function DeleteClientModal({ client, onClose, onSuccess, onToast }: DeleteModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!client) return
    setLoading(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete client')
      onToast('Client deleted', 'success')
      onClose()
      onSuccess()
    } catch (err) {
      onToast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={!!client}
      onClose={onClose}
      title="Delete Client"
      size="sm"
      disableBackdropClose
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete Client
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg aria-hidden="true" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{client?.name}</span>?
        </p>
        <p className="text-sm text-gray-500">
          This will permanently delete all associated document requests and files.
        </p>
      </div>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  useAuth(true)

  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data: clients, loading, refetch } = useApi<Client[]>('/api/clients')

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const filteredClients = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<Client>[] = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Email',
      accessor: (row) => (
        <a
          href={`mailto:${row.email}`}
          className="text-indigo-600 hover:text-indigo-700 hover:underline truncate max-w-[200px] block"
          onClick={(e) => e.stopPropagation()}
        >
          {row.email}
        </a>
      ),
    },
    {
      header: 'Created',
      accessor: (row) =>
        new Date(row.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      sortable: true,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            onClick={() => setDeleteTarget(row)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-standard transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="px-4 sm:px-6 py-6 max-w-content mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Clients</h1>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredClients}
        columns={columns}
        isLoading={loading}
        emptyMessage="No clients yet."
        aria-label="Clients list"
        emptyState={
          <div className="text-center py-16 px-6">
            <svg aria-hidden="true" className="mx-auto w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">No clients yet.</p>
            <p className="mt-1 text-sm text-gray-500">Add one to get started.</p>
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)} className="mt-4">
              Add Your First Client
            </Button>
          </div>
        }
      />

      {/* Modals */}
      <AddClientModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={refetch}
        onToast={showToast}
      />
      <DeleteClientModal
        client={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={refetch}
        onToast={showToast}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
