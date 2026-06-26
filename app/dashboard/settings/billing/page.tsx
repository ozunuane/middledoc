'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { BillingSubscription, Plan } from '@/types'

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function UsageBar({ current, max, label }: { current: number; max: number; label: string }) {
  const unlimited = max === 0
  const pct = unlimited ? 0 : Math.min((current / max) * 100, 100)
  const isNearLimit = pct >= 80
  const isAtLimit = pct >= 100

  return (
    <div className="mb-3">
      <div className="flex justify-between text-[12px] text-neutral-600 mb-1">
        <span>{label}</span>
        <span>
          {current} / {unlimited ? 'Unlimited' : max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit ? 'bg-danger-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary-500'
          }`}
          style={{ width: unlimited ? '0%' : `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth(true)

  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [effectivePlan, setEffectivePlan] = useState<Partial<Plan> | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [changingPlan, setChangingPlan] = useState(false)
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'annual'>('monthly')
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Usage stats
  const [usage, setUsage] = useState<{
    clients: { current: number; max: number }
    storage: { used_bytes: number; max_bytes: number }
    reminders: { sent: number; max: number }
  } | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  // Show billing status from URL params (Paystack and Stripe callbacks)
  useEffect(() => {
    const billing = searchParams.get('billing')
    const stripeStatus = searchParams.get('stripe')

    if (billing === 'success' || stripeStatus === 'success') {
      showToast('Your plan has been updated successfully.')
    } else if (billing === 'error') {
      const reason = searchParams.get('reason') || 'unknown'
      showToast(`Payment failed: ${reason.replace(/_/g, ' ')}`)
    } else if (stripeStatus === 'cancelled') {
      showToast('Checkout was cancelled.')
    }
  }, [searchParams])

  const loadBillingData = useCallback(async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/plans'),
      ])

      if (subRes.ok) {
        const subData = await subRes.json()
        setSubscription(subData.subscription)
        setEffectivePlan(subData.effective_plan || null)
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans || [])
      }

      // Load usage data
      const [clientsRes, storageRes, remindersRes] = await Promise.all([
        fetch('/api/clients?count_only=true').catch(() => null),
        fetch('/api/storage/usage').catch(() => null),
        fetch('/api/reminders/usage').catch(() => null),
      ])

      const clientCount = clientsRes?.ok ? (await clientsRes.json()).count ?? 0 : 0
      const storageData = storageRes?.ok ? await storageRes.json() : { used_bytes: 0 }
      const reminderData = remindersRes?.ok ? await remindersRes.json() : { sent: 0 }

      const activePlan = subscription || effectivePlan
      setUsage({
        clients: {
          current: clientCount,
          max: (activePlan as BillingSubscription)?.max_clients ?? 5,
        },
        storage: {
          used_bytes: storageData.used_bytes ?? 0,
          max_bytes: ((activePlan as BillingSubscription)?.max_storage_gb ?? 1) * 1024 * 1024 * 1024,
        },
        reminders: {
          sent: reminderData.sent ?? 0,
          max: (activePlan as BillingSubscription)?.max_email_reminders_per_month ?? 20,
        },
      })
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) loadBillingData()
  }, [user, loadBillingData])

  const handleCheckout = async (planId: number) => {
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, interval: selectedInterval }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || 'Checkout failed')
        return
      }

      if (data.free) {
        // Free plan was activated directly
        router.push(data.redirect)
        return
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else if (data.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.authorization_url
      }
    } catch {
      showToast('Network error -- please try again')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        showToast(data.message || 'Subscription cancelled')
        setShowCancelModal(false)
        loadBillingData()
      } else {
        showToast(data.error || 'Cancellation failed')
      }
    } catch {
      showToast('Network error -- please try again')
    } finally {
      setCancelling(false)
    }
  }

  if (authLoading || loading) return <LoadingSpinner fullPage />
  if (!user) return null

  const activePlanSlug = subscription?.slug || effectivePlan?.slug || 'free'
  const activePlanName = subscription?.display_name || effectivePlan?.display_name || 'Free'
  const currentPrice = subscription
    ? subscription.billing_interval === 'annual'
      ? subscription.annual_price_cents
      : subscription.monthly_price_cents
    : 0

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
            <Link href="/dashboard/settings" className="text-sm text-neutral-900 font-semibold">Settings</Link>
          </div>
        </div>
        <Link href="/dashboard/settings" className="cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
            {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : ''}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="px-9 max-w-4xl">
        <Link href="/dashboard/settings" className="text-primary-600 font-medium text-[13px] mb-6 inline-block hover:text-primary-700">
          &larr; Back to settings
        </Link>

        <div className="mb-8">
          <h1 className="text-h2 font-serif text-neutral-900">Billing & Plan</h1>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white border border-neutral-200 rounded-card p-6 mb-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-body-md font-semibold text-neutral-900">Current Plan</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[20px] font-semibold text-neutral-900">{activePlanName}</span>
                {subscription?.status === 'active' && (
                  <span className="text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                )}
                {subscription?.status === 'past_due' && (
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Past Due</span>
                )}
                {subscription?.status === 'trialing' && (
                  <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Trial</span>
                )}
                {!subscription && (
                  <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">Free</span>
                )}
              </div>
              {subscription && currentPrice != null && currentPrice > 0 && (
                <p className="text-[13px] text-neutral-500 mt-1">
                  {formatCents(currentPrice || 0)} / {subscription.billing_interval === 'annual' ? 'year' : 'month'}
                </p>
              )}
              {subscription?.cancel_at_period_end && (
                <p className="text-[13px] text-amber-600 mt-2">
                  Cancels on {formatDate(subscription.current_period_end)}
                </p>
              )}
              {subscription && !subscription.cancel_at_period_end && subscription.current_period_end && (
                <p className="text-[13px] text-neutral-400 mt-1">
                  Renews {formatDate(subscription.current_period_end)}
                </p>
              )}
              {subscription && subscription.payment_provider && (
                <p className="text-[11px] text-neutral-400 mt-2">
                  Powered by {subscription.payment_provider === 'stripe' ? 'Stripe' : 'Paystack'}
                </p>
              )}
            </div>
            <button
              onClick={() => setChangingPlan(!changingPlan)}
              className="text-[13px] font-semibold text-primary-600 hover:text-primary-700 cursor-pointer"
            >
              {changingPlan ? 'Hide plans' : 'Change plan'}
            </button>
          </div>

          {/* Usage Stats */}
          {usage && (
            <div className="border-t border-neutral-100 pt-4">
              <h3 className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide mb-3">Usage</h3>
              <UsageBar
                current={usage.clients.current}
                max={usage.clients.max}
                label="Clients"
              />
              <UsageBar
                current={Math.round(usage.storage.used_bytes / (1024 * 1024))}
                max={Math.round(usage.storage.max_bytes / (1024 * 1024))}
                label="Storage (MB)"
              />
              <UsageBar
                current={usage.reminders.sent}
                max={usage.reminders.max}
                label="Email reminders this month"
              />
            </div>
          )}
        </div>

        {/* Plan Selection */}
        {changingPlan && (
          <div className="mb-6">
            {/* Interval Toggle */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={() => setSelectedInterval('monthly')}
                className={`text-[13px] font-semibold px-4 py-2 rounded-[9px] transition cursor-pointer ${
                  selectedInterval === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedInterval('annual')}
                className={`text-[13px] font-semibold px-4 py-2 rounded-[9px] transition cursor-pointer ${
                  selectedInterval === 'annual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Annual
                <span className="ml-1.5 text-[11px] opacity-80">Save ~20%</span>
              </button>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrentPlan = plan.slug === activePlanSlug
                const price =
                  selectedInterval === 'annual'
                    ? plan.annual_price_cents
                    : plan.monthly_price_cents
                const monthlyEquivalent =
                  selectedInterval === 'annual'
                    ? Math.round(plan.annual_price_cents / 12)
                    : plan.monthly_price_cents
                const isFree = price === 0
                const isUpgrade = plan.sort_order > (plans.find(p => p.slug === activePlanSlug)?.sort_order ?? -1)

                return (
                  <div
                    key={plan.id}
                    className={`bg-white border rounded-card p-5 flex flex-col ${
                      isCurrentPlan ? 'border-primary-500 ring-1 ring-primary-500' : 'border-neutral-200'
                    }`}
                  >
                    <div className="mb-4">
                      <h3 className="text-[15px] font-semibold text-neutral-900">{plan.display_name}</h3>
                      {plan.description && (
                        <p className="text-[12px] text-neutral-500 mt-1">{plan.description}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      {isFree ? (
                        <span className="text-[24px] font-semibold text-neutral-900">Free</span>
                      ) : (
                        <>
                          <span className="text-[24px] font-semibold text-neutral-900">
                            {formatCents(monthlyEquivalent)}
                          </span>
                          <span className="text-[13px] text-neutral-500"> /mo</span>
                          {selectedInterval === 'annual' && (
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {formatCents(price)} billed annually
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <ul className="text-[12px] text-neutral-600 space-y-1.5 mb-5 flex-1">
                      <li>{plan.max_clients === 0 ? 'Unlimited' : plan.max_clients} clients</li>
                      <li>{plan.max_storage_gb} GB storage</li>
                      <li>{plan.included_team_members} team member{plan.included_team_members !== 1 ? 's' : ''}</li>
                      <li>{plan.max_email_reminders_per_month === 0 ? 'Unlimited' : plan.max_email_reminders_per_month.toLocaleString()} reminders/mo</li>
                      {plan.feature_teams && <li>Team collaboration</li>}
                      {plan.feature_groups && <li>Client groups</li>}
                      {plan.feature_api_full && <li>Full API access</li>}
                      {plan.feature_sso && <li>SSO</li>}
                      {plan.feature_whitelabel_full && <li>White label</li>}
                    </ul>

                    {isCurrentPlan ? (
                      <div className="text-center text-[13px] font-semibold text-primary-600 py-[10px]">
                        Current plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading === plan.id}
                        className={`w-full text-[13px] font-semibold py-[10px] rounded-[9px] transition cursor-pointer disabled:opacity-50 ${
                          isUpgrade
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {checkoutLoading === plan.id
                          ? 'Processing...'
                          : isFree
                          ? 'Downgrade to Free'
                          : isUpgrade
                          ? 'Upgrade'
                          : 'Switch plan'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Billing History Placeholder */}
        <div className="bg-white border border-neutral-200 rounded-card p-6 mb-6">
          <h2 className="text-body-md font-semibold text-neutral-900 mb-1">Billing History</h2>
          <p className="text-[13px] text-neutral-500">No invoices yet.</p>
        </div>

        {/* Cancel Subscription */}
        {subscription && activePlanSlug !== 'free' && !subscription.cancel_at_period_end && (
          <div className="bg-white border border-neutral-200 rounded-card p-6 mb-6">
            <h2 className="text-body-md font-semibold text-neutral-900 mb-1">Cancel Subscription</h2>
            <p className="text-[13px] text-neutral-500 mb-4">
              Your subscription will remain active until the end of your current billing period.
              After that, you will be moved to the Free plan.
            </p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-[13px] font-semibold text-danger-600 hover:text-danger-700 cursor-pointer"
            >
              Cancel subscription
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-card p-6 max-w-md w-full shadow-xl">
            <h3 className="text-[18px] font-semibold text-neutral-900 mb-2">Cancel your subscription?</h3>
            <p className="text-[13.5px] text-neutral-500 mb-2">
              Your <strong>{activePlanName}</strong> plan will remain active until{' '}
              {subscription?.current_period_end
                ? formatDate(subscription.current_period_end)
                : 'the end of the billing period'}
              . After that, your account will revert to the Free plan.
            </p>
            <p className="text-[13px] text-neutral-500 mb-5">
              You may lose access to features and data that exceed Free plan limits.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-[13px] font-semibold text-neutral-600 px-[18px] py-[10px] rounded-[9px] hover:bg-neutral-100 transition cursor-pointer"
              >
                Keep subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-danger-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-danger-700 transition cursor-pointer disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[13px] font-medium px-5 py-3 rounded-[9px] shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
