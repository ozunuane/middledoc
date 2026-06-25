import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne, query } from '@/lib/db'
import { initializeTransaction } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { plan_id, interval } = body as { plan_id: number; interval: 'monthly' | 'annual' }

      if (!plan_id || !interval) {
        return NextResponse.json(
          { error: 'plan_id and interval are required' },
          { status: 400 }
        )
      }

      if (!['monthly', 'annual'].includes(interval)) {
        return NextResponse.json(
          { error: 'interval must be "monthly" or "annual"' },
          { status: 400 }
        )
      }

      // Get the plan
      const plan = await getOne<{
        id: number
        slug: string
        display_name: string
        monthly_price_cents: number
        annual_price_cents: number
        is_active: boolean
      }>(
        'SELECT id, slug, display_name, monthly_price_cents, annual_price_cents, is_active FROM plans WHERE id = $1',
        [plan_id]
      )

      if (!plan || !plan.is_active) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      // Get accountant email
      const accountant = await getOne<{ email: string; name: string }>(
        'SELECT email, name FROM accountants WHERE id = $1',
        [accountantId]
      )

      if (!accountant) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }

      const amountCents =
        interval === 'annual' ? plan.annual_price_cents : plan.monthly_price_cents

      // Free plan: activate directly without payment
      if (amountCents === 0) {
        // Deactivate existing active subscriptions
        await query(
          `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
           WHERE accountant_id = $1 AND status IN ('active', 'trialing', 'past_due')`,
          [accountantId]
        )

        // Create free subscription
        await query(
          `INSERT INTO subscriptions (accountant_id, plan_id, status, billing_interval,
             current_period_start, current_period_end)
           VALUES ($1, $2, 'active', $3, NOW(), NOW() + INTERVAL '100 years')`,
          [accountantId, plan_id, interval]
        )

        return NextResponse.json({ free: true, redirect: '/dashboard/settings/billing?billing=success' })
      }

      // Paid plan: initialize Paystack transaction
      const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const callbackUrl = `${origin}/dashboard/settings/billing/callback`

      const result = await initializeTransaction({
        email: accountant.email,
        amount: amountCents, // Paystack expects amount in the smallest currency unit
        callback_url: callbackUrl,
        currency: 'USD',
        metadata: {
          accountant_id: accountantId,
          plan_id: plan_id,
          plan_slug: plan.slug,
          interval: interval,
          custom_fields: [
            {
              display_name: 'Plan',
              variable_name: 'plan',
              value: `${plan.display_name} (${interval})`,
            },
          ],
        },
      })

      if (!result.status) {
        console.error('Paystack initialize failed:', result.message)
        return NextResponse.json(
          { error: 'Payment initialization failed' },
          { status: 502 }
        )
      }

      return NextResponse.json({
        authorization_url: result.data.authorization_url,
        reference: result.data.reference,
      })
    } catch (error) {
      console.error('POST /api/billing/checkout error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
