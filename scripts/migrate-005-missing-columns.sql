-- Add missing columns to accountants
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add missing columns to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Add missing columns to plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_monthly_price_id VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_annual_price_id VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_client_emails INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_bcc_emails INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_request_templates INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_bulk_requests INTEGER DEFAULT 0;
