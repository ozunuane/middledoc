import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne } from '@/lib/db'
import type { BillingSubscription } from '@/types'

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const sub = await getOne<BillingSubscription>(
        `SELECT s.id, s.plan_id, s.status, s.billing_interval,
                s.current_period_start, s.current_period_end,
                s.cancel_at_period_end, s.cancelled_at,
                s.paystack_subscription_code, s.paystack_customer_code,
                s.payment_provider, s.stripe_subscription_id, s.stripe_customer_id,
                p.slug, p.display_name, p.monthly_price_cents, p.annual_price_cents,
                p.max_clients, p.max_storage_gb,
                p.included_team_members, p.max_team_members,
                p.max_email_reminders_per_month
         FROM subscriptions s
         JOIN plans p ON p.id = s.plan_id
         WHERE s.accountant_id = $1 AND s.status IN ('active', 'trialing', 'past_due')
         ORDER BY s.created_at DESC
         LIMIT 1`,
        [accountantId]
      )

      if (sub) {
        return NextResponse.json({ subscription: sub })
      }

      // No active subscription -- return free plan info
      const freePlan = await getOne<{
        id: number
        slug: string
        display_name: string
        max_clients: number
        max_storage_gb: number
        included_team_members: number
        max_team_members: number
        max_email_reminders_per_month: number
      }>(
        `SELECT id, slug, display_name, max_clients, max_storage_gb,
                included_team_members, max_team_members, max_email_reminders_per_month
         FROM plans WHERE slug = 'free' AND is_active = true`
      )

      return NextResponse.json({
        subscription: null,
        effective_plan: freePlan || {
          slug: 'free',
          display_name: 'Free',
          max_clients: 5,
          max_storage_gb: 1,
          included_team_members: 1,
          max_team_members: 1,
          max_email_reminders_per_month: 20,
        },
      })
    } catch (error) {
      console.error('GET /api/billing/subscription error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
