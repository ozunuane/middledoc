-- Migration: Add Paystack billing columns to subscriptions table
-- Run after: migrate-subscriptions.sql
-- This replaces Stripe columns with Paystack equivalents

-- Add Paystack-specific columns
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_authorization_code VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_email_token VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_transaction_ref VARCHAR(255);

-- Indexes for Paystack lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_sub
  ON subscriptions(paystack_subscription_code)
  WHERE paystack_subscription_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_customer
  ON subscriptions(paystack_customer_code)
  WHERE paystack_customer_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_ref
  ON subscriptions(paystack_transaction_ref)
  WHERE paystack_transaction_ref IS NOT NULL;

-- Add paystack plan codes to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS paystack_plan_code_monthly VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS paystack_plan_code_annual VARCHAR(255);
