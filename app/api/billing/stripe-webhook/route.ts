import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe-service'
import { query } from '@/lib/db'

// Helper to safely extract period end from a subscription object.
// In newer Stripe API versions, current_period_end moved to subscription items,
// but the webhook payload still includes it on the subscription object.
function getSubscriptionPeriodEnd(sub: Stripe.Subscription): number | null {
  // Try the subscription items first (new API)
  const firstItem = sub.items?.data?.[0]
  if (firstItem?.current_period_end) return firstItem.current_period_end

  // Fallback: access the raw object (webhook payloads include this field)
  const raw = sub as unknown as Record<string, unknown>
  if (typeof raw.current_period_end === 'number') return raw.current_period_end

  return null
}

// Helper to extract subscription ID from an invoice's subscription field
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  // The subscription field may be a string ID or an expanded object
  const raw = invoice as unknown as Record<string, unknown>
  const sub = raw.subscription
  if (typeof sub === 'string') return sub
  if (sub && typeof sub === 'object' && 'id' in sub) return (sub as { id: string }).id
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    let event: Stripe.Event
    try {
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Stripe webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}
        const accountantId = parseInt(metadata.accountant_id || '0')
        const planId = parseInt(metadata.plan_id || '0')
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id || null
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : (session.customer as Stripe.Customer | null)?.id || null

        // Handle subscription checkout
        if (accountantId && planId && subscriptionId) {
          // Deactivate any existing active subscription
          await query(
            `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
             WHERE accountant_id = $1 AND status IN ('active', 'trialing', 'past_due')`,
            [accountantId]
          )

          // Create new subscription record
          await query(
            `INSERT INTO subscriptions (
               accountant_id, plan_id, status, billing_interval,
               payment_provider, stripe_subscription_id, stripe_customer_id,
               current_period_start, current_period_end
             ) VALUES ($1, $2, 'active', 'monthly', 'stripe', $3, $4, NOW(), NOW() + INTERVAL '1 month')`,
            [accountantId, planId, subscriptionId, customerId]
          )
        }

        // Handle one-time invoice payment (client invoicing via Stripe)
        const invoiceId = metadata.invoice_id
        if (invoiceId) {
          await query(
            `UPDATE client_invoices
             SET status = 'paid', paid_at = NOW(),
                 stripe_session_id = $2, payment_provider = 'stripe',
                 updated_at = NOW()
             WHERE id = $1`,
            [parseInt(invoiceId), session.id]
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const cancelAtPeriodEnd = sub.cancel_at_period_end
        const subStatus = sub.status
        const periodEnd = getSubscriptionPeriodEnd(sub)

        // Map Stripe status to our status
        let status: string
        if (subStatus === 'active') {
          status = 'active'
        } else if (subStatus === 'past_due') {
          status = 'past_due'
        } else if (subStatus === 'trialing') {
          status = 'trialing'
        } else {
          status = subStatus
        }

        if (periodEnd) {
          await query(
            `UPDATE subscriptions
             SET status = $1,
                 cancel_at_period_end = $2,
                 current_period_end = to_timestamp($3)
             WHERE stripe_subscription_id = $4`,
            [status, cancelAtPeriodEnd, periodEnd, sub.id]
          )
        } else {
          await query(
            `UPDATE subscriptions
             SET status = $1,
                 cancel_at_period_end = $2
             WHERE stripe_subscription_id = $3`,
            [status, cancelAtPeriodEnd, sub.id]
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await query(
          `UPDATE subscriptions
           SET status = 'cancelled', cancelled_at = NOW()
           WHERE stripe_subscription_id = $1`,
          [sub.id]
        )
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = getInvoiceSubscriptionId(invoice)
        if (subId) {
          await query(
            `UPDATE subscriptions SET status = 'past_due'
             WHERE stripe_subscription_id = $1 AND status = 'active'`,
            [subId]
          )
        }
        break
      }

      case 'invoice.paid': {
        // Renewal: mark subscription active if it was past_due
        const invoice = event.data.object as Stripe.Invoice
        const subId = getInvoiceSubscriptionId(invoice)
        if (subId) {
          await query(
            `UPDATE subscriptions
             SET status = 'active'
             WHERE stripe_subscription_id = $1 AND status = 'past_due'`,
            [subId]
          )
        }
        break
      }

      default:
        console.log('Unhandled Stripe webhook event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('POST /api/billing/stripe-webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
