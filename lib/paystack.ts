import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''
const BASE_URL = 'https://api.paystack.co'

interface PaystackResponse<T = Record<string, unknown>> {
  status: boolean
  message: string
  data: T
}

async function paystackRequest<T = Record<string, unknown>>(
  method: string,
  path: string,
  body?: unknown
): Promise<PaystackResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    console.error(`Paystack ${method} ${path} failed (${res.status}):`, errorBody)
    throw new Error(`Paystack API error: ${res.status}`)
  }

  return res.json()
}

// Initialize a transaction (one-time or subscription)
export async function initializeTransaction(params: {
  email: string
  amount: number // in kobo (NGN) or cents (USD)
  plan?: string // Paystack plan code for subscriptions
  callback_url: string
  metadata?: Record<string, unknown>
  currency?: string
}): Promise<PaystackResponse<{ authorization_url: string; access_code: string; reference: string }>> {
  return paystackRequest('POST', '/transaction/initialize', params)
}

// Verify a transaction
export async function verifyTransaction(reference: string): Promise<
  PaystackResponse<{
    status: string
    reference: string
    amount: number
    currency: string
    metadata: Record<string, unknown>
    customer: { email: string; customer_code: string }
    authorization: { authorization_code: string }
    plan_object?: { plan_code: string }
  }>
> {
  return paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`)
}

// Create a Paystack plan
export async function createPlan(params: {
  name: string
  amount: number
  interval: 'monthly' | 'annually'
  currency?: string
}): Promise<PaystackResponse<{ plan_code: string }>> {
  return paystackRequest('POST', '/plan', {
    ...params,
    currency: params.currency || 'USD',
  })
}

// List plans
export async function listPlans(): Promise<PaystackResponse<Array<Record<string, unknown>>>> {
  return paystackRequest('GET', '/plan')
}

// Create subscription
export async function createSubscription(params: {
  customer: string // customer email or code
  plan: string // plan code
  start_date?: string
}): Promise<PaystackResponse<{ subscription_code: string; email_token: string }>> {
  return paystackRequest('POST', '/subscription', params)
}

// Disable subscription
export async function disableSubscription(params: {
  code: string
  token: string
}): Promise<PaystackResponse> {
  return paystackRequest('POST', '/subscription/disable', params)
}

// Get subscription
export async function getSubscription(
  idOrCode: string
): Promise<PaystackResponse<{ subscription_code: string; status: string; email_token: string }>> {
  return paystackRequest('GET', `/subscription/${encodeURIComponent(idOrCode)}`)
}

// Get customer
export async function getCustomer(
  emailOrCode: string
): Promise<PaystackResponse<{ customer_code: string; email: string; subscriptions: Array<Record<string, unknown>> }>> {
  return paystackRequest('GET', `/customer/${encodeURIComponent(emailOrCode)}`)
}

// Create customer
export async function createCustomer(params: {
  email: string
  first_name?: string
  last_name?: string
}): Promise<PaystackResponse<{ customer_code: string }>> {
  return paystackRequest('POST', '/customer', params)
}

// Verify webhook signature
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET
  if (!secret) return true // skip verification in dev when secret is not set
  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex')
  return hash === signature
}
