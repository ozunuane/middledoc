import { NextRequest, NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { getOne, query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')

    if (!reference) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/billing?billing=error&reason=missing_reference', request.url)
      )
    }

    // Verify transaction with Paystack
    const result = await verifyTransaction(reference)

    if (!result.status || result.data.status !== 'success') {
      console.error('Paystack verification failed:', result.message)
      return NextResponse.redirect(
        new URL('/dashboard/settings/billing?billing=error&reason=payment_failed', request.url)
      )
    }

    const { metadata, customer, authorization } = result.data
    const accountantId = metadata.accountant_id as number
    const planId = metadata.plan_id as number
    const interval = (metadata.interval as string) || 'monthly'

    if (!accountantId || !planId) {
      console.error('Missing metadata in Paystack callback:', metadata)
      return NextResponse.redirect(
        new URL('/dashboard/settings/billing?billing=error&reason=invalid_metadata', request.url)
      )
    }

    // Calculate period end based on interval
    const periodInterval = interval === 'annual' ? '1 year' : '1 month'

    // Deactivate existing active subscriptions
    await query(
      `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
       WHERE accountant_id = $1 AND status IN ('active', 'trialing', 'past_due')`,
      [accountantId]
    )

    // Check if a subscription with this ref already exists (idempotency)
    const existing = await getOne<{ id: number }>(
      'SELECT id FROM subscriptions WHERE paystack_transaction_ref = $1',
      [reference]
    )

    if (!existing) {
      // Create new subscription
      await query(
        `INSERT INTO subscriptions (
           accountant_id, plan_id, status, billing_interval,
           current_period_start, current_period_end,
           paystack_customer_code, paystack_authorization_code,
           paystack_transaction_ref
         ) VALUES ($1, $2, 'active', $3, NOW(), NOW() + $4::interval, $5, $6, $7)`,
        [
          accountantId,
          planId,
          interval,
          periodInterval,
          customer.customer_code,
          authorization?.authorization_code || null,
          reference,
        ]
      )
    }

    return NextResponse.redirect(
      new URL('/dashboard/settings/billing?billing=success', request.url)
    )
  } catch (error) {
    console.error('GET /api/billing/callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings/billing?billing=error&reason=server_error', request.url)
    )
  }
}
