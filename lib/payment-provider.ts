// Determines which payment provider to use
// PAYMENT_PROVIDER env var: 'stripe', 'paystack', or 'auto' (default)
// 'auto' uses Stripe for USD/GBP/EUR, Paystack for NGN/GHS/KES/ZAR

import { isStripeConfigured } from './stripe-service'

const PROVIDER = process.env.PAYMENT_PROVIDER || 'auto'

export type PaymentProvider = 'stripe' | 'paystack'

export function getPaymentProvider(currency?: string): PaymentProvider {
  if (PROVIDER === 'stripe') return 'stripe'
  if (PROVIDER === 'paystack') return 'paystack'

  // Auto-detect based on currency
  if (currency) {
    const paystackCurrencies = ['NGN', 'GHS', 'KES', 'ZAR']
    if (paystackCurrencies.includes(currency.toUpperCase())) return 'paystack'
  }

  // Default to Stripe if configured, else Paystack
  return isStripeConfigured() ? 'stripe' : 'paystack'
}

export function getAvailableProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = []
  if (isStripeConfigured()) providers.push('stripe')
  if (process.env.PAYSTACK_SECRET_KEY) providers.push('paystack')
  return providers
}
