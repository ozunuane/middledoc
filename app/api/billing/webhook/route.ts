import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { getOne, query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature') || ''

    if (!verifyWebhookSignature(body, signature)) {
      console.error('Paystack webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body) as {
      event: string
      data: Record<string, unknown>
    }

    console.log('Paystack webhook event:', event.event)

    switch (event.event) {
      case 'charge.success': {
        const data = event.data as {
          reference: string
          amount: number
          metadata: Record<string, unknown>
          customer: { email: string; customer_code: string }
          authorization: { authorization_code: string }
        }

        // Handle invoice payments
        const invoiceId = data.metadata?.invoice_id as number | undefined
        if (invoiceId) {
          const inv = await getOne<{ id: number; status: string }>(
            'SELECT id, status FROM invoices WHERE id = $1',
            [invoiceId]
          )
          if (inv && inv.status !== 'paid') {
            await query(
              `UPDATE invoices SET status = 'paid', paid_at = NOW(), paystack_reference = $1, updated_at = NOW()
               WHERE id = $2`,
              [data.reference, invoiceId]
            )
          }
          break
        }

        const accountantId = data.metadata?.accountant_id as number | undefined
        const planId = data.metadata?.plan_id as number | undefined
        const interval = (data.metadata?.interval as string) || 'monthly'

        if (!accountantId || !planId) {
          // This might be a recurring charge -- look up by customer code
          const sub = await getOne<{ id: number; accountant_id: number; plan_id: number; billing_interval: string }>(
            `SELECT id, accountant_id, plan_id, billing_interval
             FROM subscriptions
             WHERE paystack_customer_code = $1
               AND status IN ('active', 'past_due')
             ORDER BY created_at DESC LIMIT 1`,
            [data.customer.customer_code]
          )

          if (sub) {
            const periodInterval = sub.billing_interval === 'annual' ? '1 year' : '1 month'
            await query(
              `UPDATE subscriptions
               SET status = 'active',
                   current_period_start = NOW(),
                   current_period_end = NOW() + $1::interval,
                   paystack_authorization_code = $2
               WHERE id = $3`,
              [periodInterval, data.authorization.authorization_code, sub.id]
            )
          }
          break
        }

        const periodInterval = interval === 'annual' ? '1 year' : '1 month'

        // Check if already processed (idempotency via transaction ref)
        const existing = await getOne<{ id: number }>(
          'SELECT id FROM subscriptions WHERE paystack_transaction_ref = $1',
          [data.reference]
        )

        if (existing) {
          // Already processed, just make sure it's active
          await query(
            'UPDATE subscriptions SET status = $1 WHERE id = $2',
            ['active', existing.id]
          )
          break
        }

        // Deactivate old subscriptions
        await query(
          `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
           WHERE accountant_id = $1 AND status IN ('active', 'trialing', 'past_due')`,
          [accountantId]
        )

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
            data.customer.customer_code,
            data.authorization.authorization_code,
            data.reference,
          ]
        )
        break
      }

      case 'subscription.create': {
        const data = event.data as {
          subscription_code: string
          email_token: string
          customer: { customer_code: string }
          plan: { plan_code: string }
        }

        // Update the subscription with the Paystack subscription code
        await query(
          `UPDATE subscriptions
           SET paystack_subscription_code = $1,
               paystack_email_token = $2
           WHERE paystack_customer_code = $3
             AND status = 'active'
           ORDER BY created_at DESC
           LIMIT 1`,
          [data.subscription_code, data.email_token, data.customer.customer_code]
        )
        break
      }

      case 'subscription.disable': {
        const data = event.data as {
          subscription_code: string
          customer: { customer_code: string }
        }

        await query(
          `UPDATE subscriptions
           SET status = 'cancelled', cancelled_at = NOW()
           WHERE paystack_subscription_code = $1 AND status IN ('active', 'past_due')`,
          [data.subscription_code]
        )
        break
      }

      case 'invoice.payment_failed': {
        const data = event.data as {
          subscription: { subscription_code: string }
          customer: { customer_code: string }
        }

        const subCode = data.subscription?.subscription_code
        if (subCode) {
          await query(
            `UPDATE subscriptions SET status = 'past_due'
             WHERE paystack_subscription_code = $1 AND status = 'active'`,
            [subCode]
          )
        } else {
          // Fallback: match by customer code
          await query(
            `UPDATE subscriptions SET status = 'past_due'
             WHERE paystack_customer_code = $1 AND status = 'active'`,
            [data.customer.customer_code]
          )
        }
        break
      }

      default:
        console.log('Unhandled Paystack webhook event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('POST /api/billing/webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
