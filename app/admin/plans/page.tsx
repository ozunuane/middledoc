'use client'

import { useEffect, useState } from 'react'

interface Plan {
  id: number
  slug: string
  display_name: string
  description: string | null
  monthly_price_cents: number
  annual_price_cents: number
  max_clients: number
  max_storage_gb: number
  included_team_members: number
  max_team_members: number
  max_email_reminders_per_month: number
  feature_teams: boolean
  feature_groups: boolean
  is_active: boolean
  is_public: boolean
  sort_order: number
}

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free'
  return `$${(cents / 100).toFixed(0)}`
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
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
    }
    load()
  }, [])

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
              <div className="flex gap-3 mt-3">
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
                onClick={() => alert(`Edit plan: ${plan.slug} (id: ${plan.id})`)}
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
    </div>
  )
}
