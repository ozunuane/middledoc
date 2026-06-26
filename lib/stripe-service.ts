import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export function isStripeConfigured(): boolean {
  return !!stripe
}

// Create Stripe Checkout Session for subscription
export async function createCheckoutSession(params: {
  customerEmail: string
  priceId: string // Stripe Price ID
  accountantId: number
  planId: number
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
}): Promise<{ url: string; sessionId: string }> {
  if (!stripe) throw new Error('Stripe is not configured')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: params.customerEmail,
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url:
      params.successUrl ||
      `${BASE_URL}/dashboard/settings/billing?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      params.cancelUrl ||
      `${BASE_URL}/dashboard/settings/billing?stripe=cancelled`,
    metadata: {
      accountant_id: String(params.accountantId),
      plan_id: String(params.planId),
      ...params.metadata,
    },
    subscription_data: {
      metadata: {
        accountant_id: String(params.accountantId),
        plan_id: String(params.planId),
      },
    },
  })

  return { url: session.url!, sessionId: session.id }
}

// Create Stripe Checkout for one-time invoice payment (client invoicing)
export async function createInvoiceCheckoutSession(params: {
  customerEmail: string
  amountCents: number
  currency: string
  description: string
  invoiceId: number
  shareToken: string
  successUrl?: string
  cancelUrl?: string
}): Promise<{ url: string; sessionId: string }> {
  if (!stripe) throw new Error('Stripe is not configured')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: params.description || 'Document preparation fee',
          },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    success_url:
      params.successUrl ||
      `${BASE_URL}/portal/${params.shareToken}?payment=success`,
    cancel_url:
      params.cancelUrl ||
      `${BASE_URL}/portal/${params.shareToken}?payment=cancelled`,
    metadata: {
      invoice_id: String(params.invoiceId),
      share_token: params.shareToken,
    },
  })

  return { url: session.url!, sessionId: session.id }
}

// Retrieve checkout session
export async function getCheckoutSession(sessionId: string) {
  if (!stripe) throw new Error('Stripe is not configured')
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  })
}

// Cancel subscription (at period end)
export async function cancelStripeSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe is not configured')
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

// Reactivate subscription (undo cancel_at_period_end)
export async function reactivateStripeSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe is not configured')
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

// Get subscription
export async function getStripeSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe is not configured')
  return stripe.subscriptions.retrieve(subscriptionId)
}

// Create Stripe Customer Portal session
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl?: string
) {
  if (!stripe) throw new Error('Stripe is not configured')
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${BASE_URL}/dashboard/settings/billing`,
  })
}

// Verify webhook signature
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  if (!stripe) throw new Error('Stripe is not configured')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  return stripe.webhooks.constructEvent(
    body,
    signature,
    webhookSecret
  )
}

// Get the Stripe instance for direct use
export function getStripe(): Stripe | null {
  return stripe
}
