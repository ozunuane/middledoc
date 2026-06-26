-- Migration: Add Stripe payment provider support alongside Paystack
-- Run after: migrate-subscriptions.sql, migrate-paystack.sql

-- Add payment_provider column to subscriptions (default 'paystack' for existing rows)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'paystack';

-- The stripe_subscription_id and stripe_customer_id columns already exist
-- from migrate-subscriptions.sql. These indexes may also already exist, so use IF NOT EXISTS.
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- The plans table already has stripe_monthly_price_id and stripe_annual_price_id
-- from migrate-subscriptions.sql. No changes needed.

-- Add Stripe fields to client_invoices
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'paystack';

CREATE INDEX IF NOT EXISTS idx_client_invoices_stripe_session
  ON client_invoices(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
