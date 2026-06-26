import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne, query } from '@/lib/db'
import { initializeTransaction } from '@/lib/paystack'
import { getPaymentProvider } from '@/lib/payment-provider'
import { createCheckoutSession } from '@/lib/stripe-service'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { plan_id, interval, provider: requestedProvider, currency } = body as {
        plan_id: number
        interval: 'monthly' | 'annual'
        provider?: 'stripe' | 'paystack'
        currency?: string
      }

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
        stripe_monthly_price_id: string | null
        stripe_annual_price_id: string | null
      }>(
        `SELECT id, slug, display_name, monthly_price_cents, annual_price_cents, is_active,
                stripe_monthly_price_id, stripe_annual_price_id
         FROM plans WHERE id = $1`,
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
             current_period_start, current_period_end, payment_provider)
           VALUES ($1, $2, 'active', $3, NOW(), NOW() + INTERVAL '100 years', 'paystack')`,
          [accountantId, plan_id, interval]
        )

        return NextResponse.json({ free: true, redirect: '/dashboard/settings/billing?billing=success' })
      }

      // Determine payment provider
      const provider = requestedProvider || getPaymentProvider(currency || 'USD')

      if (provider === 'stripe') {
        // Stripe checkout path
        const priceId =
          interval === 'annual'
            ? plan.stripe_annual_price_id
            : plan.stripe_monthly_price_id

        if (!priceId) {
          return NextResponse.json(
            { error: 'Stripe pricing not configured for this plan' },
            { status: 400 }
          )
        }

        const { url, sessionId } = await createCheckoutSession({
          customerEmail: accountant.email,
          priceId,
          accountantId,
          planId: plan.id,
        })

        return NextResponse.json({
          url,
          provider: 'stripe',
          session_id: sessionId,
        })
      } else {
        // Paystack checkout path (existing flow)
        const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const callbackUrl = `${origin}/dashboard/settings/billing/callback`

        const result = await initializeTransaction({
          email: accountant.email,
          amount: amountCents,
          callback_url: callbackUrl,
          currency: currency || 'USD',
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
          provider: 'paystack',
        })
      }
    } catch (error) {
      console.error('POST /api/billing/checkout error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
