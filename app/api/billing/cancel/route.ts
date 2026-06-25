import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne, query } from '@/lib/db'
import { disableSubscription, getSubscription } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      // Get current active subscription
      const sub = await getOne<{
        id: number
        plan_id: number
        status: string
        paystack_subscription_code: string | null
        paystack_email_token: string | null
        current_period_end: string
      }>(
        `SELECT id, plan_id, status, paystack_subscription_code,
                paystack_email_token, current_period_end
         FROM subscriptions
         WHERE accountant_id = $1 AND status IN ('active', 'trialing', 'past_due')
         ORDER BY created_at DESC LIMIT 1`,
        [accountantId]
      )

      if (!sub) {
        return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
      }

      // Check if it's a free plan (no payment to cancel)
      const plan = await getOne<{ slug: string; monthly_price_cents: number }>(
        'SELECT slug, monthly_price_cents FROM plans WHERE id = $1',
        [sub.plan_id]
      )

      if (plan?.slug === 'free') {
        return NextResponse.json({ error: 'Cannot cancel the free plan' }, { status: 400 })
      }

      // If there's a Paystack subscription, disable it
      if (sub.paystack_subscription_code) {
        try {
          let emailToken = sub.paystack_email_token

          // If we don't have the email token stored, fetch it from Paystack
          if (!emailToken) {
            const psSub = await getSubscription(sub.paystack_subscription_code)
            emailToken = psSub.data.email_token
          }

          if (emailToken) {
            await disableSubscription({
              code: sub.paystack_subscription_code,
              token: emailToken,
            })
          }
        } catch (psError) {
          // Log but don't fail -- we still want to cancel locally
          console.error('Failed to disable Paystack subscription:', psError)
        }
      }

      // Mark as cancelling at period end (keep active until period expires)
      await query(
        `UPDATE subscriptions
         SET cancel_at_period_end = true, cancelled_at = NOW()
         WHERE id = $1`,
        [sub.id]
      )

      return NextResponse.json({
        cancelled: true,
        active_until: sub.current_period_end,
        message: 'Your subscription has been cancelled and will remain active until the end of the current billing period.',
      })
    } catch (error) {
      console.error('POST /api/billing/cancel error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
