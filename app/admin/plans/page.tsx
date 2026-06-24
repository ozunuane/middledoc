'use client'

import { useEffect, useState, useCallback } from 'react'

interface Plan {
  id: number
  slug: string
  display_name: string
  description: string | null
  monthly_price_cents: number
  annual_price_cents: number
  extra_seat_price_cents: number
  storage_overage_price_cents: number
  max_clients: number
  max_storage_gb: number
  included_team_members: number
  max_team_members: number
  max_email_reminders_per_month: number
  max_client_emails: number
  max_bcc_emails: number
  max_request_templates: number
  max_bulk_requests: number
  feature_teams: boolean
  feature_groups: boolean
  feature_client_assignments: boolean
  feature_whitelabel_logo: boolean
  feature_whitelabel_full: boolean
  feature_api_readonly: boolean
  feature_api_full: boolean
  feature_sso: boolean
  feature_webhooks: boolean
  feature_activity_log: boolean
  feature_custom_fields: boolean
  feature_recurring_requests: boolean
  feature_data_export: boolean
  is_active: boolean
  is_public: boolean
  sort_order: number
}

interface PlanFormData {
  slug: string
  display_name: string
  description: string
  is_active: boolean
  is_public: boolean
  monthly_price_cents: number
  annual_price_cents: number
  extra_seat_price_cents: number
  storage_overage_price_cents: number
  max_clients: number
  max_storage_gb: number
  included_team_members: number
  max_team_members: number
  max_email_reminders_per_month: number
  feature_teams: boolean
  feature_groups: boolean
  feature_client_assignments: boolean
  feature_whitelabel_logo: boolean
  feature_whitelabel_full: boolean
  feature_api_readonly: boolean
  feature_api_full: boolean
  feature_sso: boolean
  feature_webhooks: boolean
  feature_activity_log: boolean
  feature_custom_fields: boolean
  feature_recurring_requests: boolean
  feature_data_export: boolean
  sort_order: number
}

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free'
  return `$${(cents / 100).toFixed(0)}`
}

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2)
}

function dollarsToCents(dollars: string): number {
  const val = parseFloat(dollars)
  if (isNaN(val)) return 0
  return Math.round(val * 100)
}

function planToFormData(plan: Plan): PlanFormData {
  return {
    slug: plan.slug,
    display_name: plan.display_name,
    description: plan.description || '',
    is_active: plan.is_active,
    is_public: plan.is_public,
    monthly_price_cents: plan.monthly_price_cents,
    annual_price_cents: plan.annual_price_cents,
    extra_seat_price_cents: plan.extra_seat_price_cents,
    storage_overage_price_cents: plan.storage_overage_price_cents,
    max_clients: plan.max_clients,
    max_storage_gb: plan.max_storage_gb,
    included_team_members: plan.included_team_members,
    max_team_members: plan.max_team_members,
    max_email_reminders_per_month: plan.max_email_reminders_per_month,
    feature_teams: plan.feature_teams,
    feature_groups: plan.feature_groups,
    feature_client_assignments: plan.feature_client_assignments ?? false,
    feature_whitelabel_logo: plan.feature_whitelabel_logo ?? false,
    feature_whitelabel_full: plan.feature_whitelabel_full ?? false,
    feature_api_readonly: plan.feature_api_readonly ?? false,
    feature_api_full: plan.feature_api_full ?? false,
    feature_sso: plan.feature_sso ?? false,
    feature_webhooks: plan.feature_webhooks ?? false,
    feature_activity_log: plan.feature_activity_log ?? false,
    feature_custom_fields: plan.feature_custom_fields ?? false,
    feature_recurring_requests: plan.feature_recurring_requests ?? false,
    feature_data_export: plan.feature_data_export ?? false,
    sort_order: plan.sort_order,
  }
}

function emptyFormData(): PlanFormData {
  return {
    slug: '',
    display_name: '',
    description: '',
    is_active: true,
    is_public: true,
    monthly_price_cents: 0,
    annual_price_cents: 0,
    extra_seat_price_cents: 0,
    storage_overage_price_cents: 0,
    max_clients: 0,
    max_storage_gb: 1,
    included_team_members: 1,
    max_team_members: 1,
    max_email_reminders_per_month: 20,
    feature_teams: false,
    feature_groups: false,
    feature_client_assignments: false,
    feature_whitelabel_logo: false,
    feature_whitelabel_full: false,
    feature_api_readonly: false,
    feature_api_full: false,
    feature_sso: false,
    feature_webhooks: false,
    feature_activity_log: false,
    feature_custom_fields: false,
    feature_recurring_requests: false,
    feature_data_export: false,
    sort_order: 0,
  }
}

const featureCheckboxes: { key: keyof PlanFormData; label: string }[] = [
  { key: 'feature_teams', label: 'Teams' },
  { key: 'feature_groups', label: 'Groups' },
  { key: 'feature_client_assignments', label: 'Client Assignments' },
  { key: 'feature_whitelabel_logo', label: 'White-label Logo' },
  { key: 'feature_whitelabel_full', label: 'White-label Full' },
  { key: 'feature_api_readonly', label: 'API Read-only' },
  { key: 'feature_api_full', label: 'API Full' },
  { key: 'feature_sso', label: 'SSO' },
  { key: 'feature_webhooks', label: 'Webhooks' },
  { key: 'feature_activity_log', label: 'Activity Log' },
  { key: 'feature_custom_fields', label: 'Custom Fields' },
  { key: 'feature_recurring_requests', label: 'Recurring Requests' },
  { key: 'feature_data_export', label: 'Data Export' },
]

// ────────────────────────────────────────────────────────
// Plan Modal Component
// ────────────────────────────────────────────────────────

function PlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: Plan | null // null = create mode
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = plan !== null
  const [form, setForm] = useState<PlanFormData>(
    isEdit ? planToFormData(plan) : emptyFormData()
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Dollar display values for price fields (kept as strings for clean input UX)
  const [monthlyDollars, setMonthlyDollars] = useState(centsToDollars(form.monthly_price_cents))
  const [annualDollars, setAnnualDollars] = useState(centsToDollars(form.annual_price_cents))
  const [extraSeatDollars, setExtraSeatDollars] = useState(centsToDollars(form.extra_seat_price_cents))
  const [storageOverageDollars, setStorageOverageDollars] = useState(centsToDollars(form.storage_overage_price_cents))

  function setField<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setError('')
    setSaving(true)

    // Convert dollar inputs back to cents
    const payload: Record<string, unknown> = {
      ...form,
      monthly_price_cents: dollarsToCents(monthlyDollars),
      annual_price_cents: dollarsToCents(annualDollars),
      extra_seat_price_cents: dollarsToCents(extraSeatDollars),
      storage_overage_price_cents: dollarsToCents(storageOverageDollars),
    }

    if (isEdit) {
      payload.id = plan.id
    }

    try {
      const res = await fetch('/api/admin/plans', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Failed to ${isEdit ? 'update' : 'create'} plan`)
        setSaving(false)
        return
      }

      onSaved()
    } catch {
      setError('Network error')
      setSaving(false)
    }
  }

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const inputClass =
    'w-full bg-white border border-neutral-200 rounded-[9px] px-3 py-2 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
  const sectionHeader =
    'text-[13px] font-semibold text-neutral-500 uppercase tracking-wide mb-3'

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-[16px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            {isEdit ? plan.display_name : 'Create Plan'}
          </h2>
          {isEdit && (
            <p className="text-[13px] text-neutral-400 mt-0.5">
              Editing plan &middot; {plan.slug}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* ── Basic Info ── */}
          <section>
            <h3 className={sectionHeader}>Basic Info</h3>
            <div className="grid grid-cols-1 gap-4">
              {!isEdit && (
                <div>
                  <label className="block text-[13px] text-neutral-600 mb-1">Slug</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. professional"
                    value={form.slug}
                    onChange={(e) => setField('slug', e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Display Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Professional"
                  value={form.display_name}
                  onChange={(e) => setField('display_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Description</label>
                <textarea
                  className={inputClass + ' resize-none'}
                  rows={2}
                  placeholder="Short description of this plan"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-[14px] text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary-600"
                    checked={form.is_active}
                    onChange={(e) => setField('is_active', e.target.checked)}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-[14px] text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary-600"
                    checked={form.is_public}
                    onChange={(e) => setField('is_public', e.target.checked)}
                  />
                  Public
                </label>
              </div>
            </div>
          </section>

          {/* ── Pricing ── */}
          <section>
            <h3 className={sectionHeader}>Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Monthly Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass + ' pl-7'}
                    value={monthlyDollars}
                    onChange={(e) => setMonthlyDollars(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Annual Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass + ' pl-7'}
                    value={annualDollars}
                    onChange={(e) => setAnnualDollars(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Extra Seat Price <span className="text-neutral-400">$/mo</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass + ' pl-7'}
                    value={extraSeatDollars}
                    onChange={(e) => setExtraSeatDollars(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Storage Overage <span className="text-neutral-400">$/GB/mo</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass + ' pl-7'}
                    value={storageOverageDollars}
                    onChange={(e) => setStorageOverageDollars(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Limits ── */}
          <section>
            <h3 className={sectionHeader}>Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Max Clients <span className="text-neutral-400">(0 = unlimited)</span></label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.max_clients}
                  onChange={(e) => setField('max_clients', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Max Storage GB</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.max_storage_gb}
                  onChange={(e) => setField('max_storage_gb', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Included Team Members</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.included_team_members}
                  onChange={(e) => setField('included_team_members', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Max Team Members</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.max_team_members}
                  onChange={(e) => setField('max_team_members', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Max Email Reminders/Month</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.max_email_reminders_per_month}
                  onChange={(e) => setField('max_email_reminders_per_month', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-[13px] text-neutral-600 mb-1">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.sort_order}
                  onChange={(e) => setField('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section>
            <h3 className={sectionHeader}>Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
              {featureCheckboxes.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-[14px] text-neutral-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-primary-600"
                    checked={form[key] as boolean}
                    onChange={(e) => setField(key, e.target.checked as never)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 text-[13px] px-4 py-2.5 rounded-[9px] border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="text-[13px] font-semibold text-neutral-600 hover:text-neutral-800 px-5 py-2.5 rounded-[9px] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2.5 rounded-[9px] transition"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Toast Component
// ────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-[60] bg-neutral-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-[9px] shadow-lg animate-in fade-in slide-in-from-bottom-2">
      {message}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/plans')
      if (res.ok) {
        const data = await res.json()
        setPlans(data.plans || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  function openEdit(plan: Plan) {
    setEditingPlan(plan)
    setShowModal(true)
  }

  function openCreate() {
    setEditingPlan(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingPlan(null)
  }

  function handleSaved() {
    const msg = editingPlan ? 'Plan updated successfully' : 'Plan created successfully'
    closeModal()
    fetchPlans()
    setToast(msg)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400 text-sm">Loading plans...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Plans</h1>
          <p className="text-[13px] text-neutral-400 mt-0.5">
            Manage pricing tiers and feature limits
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold px-5 py-2.5 rounded-[9px] transition"
        >
          Create plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-neutral-200 rounded-[14px] p-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {plan.display_name}
                  </h2>
                  {plan.is_active ? (
                    <span className="text-[10px] font-medium uppercase tracking-wider bg-success-100 text-success-700 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wider bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-[13px] text-neutral-500 mt-1">{plan.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-neutral-900 font-mono">
                  {formatPrice(plan.monthly_price_cents)}
                </p>
                {plan.monthly_price_cents > 0 && (
                  <p className="text-[12px] text-neutral-400">/month</p>
                )}
              </div>
            </div>

            {/* Limits */}
            <div className="border-t border-neutral-100 pt-4 mt-auto">
              <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-3">
                Limits
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex justify-between">
                  <span className="text-[13px] text-neutral-500">Clients</span>
                  <span className="text-[13px] text-neutral-900 font-mono">
                    {plan.max_clients === 0 ? 'Unlimited' : plan.max_clients}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-neutral-500">Storage</span>
                  <span className="text-[13px] text-neutral-900 font-mono">
                    {plan.max_storage_gb} GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-neutral-500">Team members</span>
                  <span className="text-[13px] text-neutral-900 font-mono">
                    {plan.included_team_members}{plan.max_team_members > plan.included_team_members ? ` (max ${plan.max_team_members})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-neutral-500">Reminders/mo</span>
                  <span className="text-[13px] text-neutral-900 font-mono">
                    {plan.max_email_reminders_per_month}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-3">
                {plan.feature_teams && (
                  <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    Teams
                  </span>
                )}
                {plan.feature_groups && (
                  <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    Groups
                  </span>
                )}
                {plan.feature_client_assignments && (
                  <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    Assignments
                  </span>
                )}
                {plan.feature_whitelabel_logo && (
                  <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    White-label
                  </span>
                )}
                {plan.feature_api_readonly && (
                  <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    API
                  </span>
                )}
                {plan.feature_sso && (
                  <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    SSO
                  </span>
                )}
                {plan.feature_webhooks && (
                  <span className="text-[11px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    Webhooks
                  </span>
                )}
                {!plan.is_public && (
                  <span className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <button
                onClick={() => openEdit(plan)}
                className="text-[13px] text-primary-600 hover:text-primary-700 font-medium transition"
              >
                Edit plan
              </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-2 bg-white border border-neutral-200 rounded-[14px] p-12 text-center">
            <p className="text-neutral-400 text-sm">No plans configured</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  )
}
