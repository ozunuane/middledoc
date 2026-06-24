-- Migration: Subscription pricing system, admin panel, and analytics
-- Run this against an existing database to add billing and admin support
-- Depends on: init.sql, migrate-teams.sql, migrate-rejection.sql

-- ============================================================
-- SUBSCRIPTION & BILLING
-- ============================================================

-- Pricing plans (admin-managed)
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  annual_price_cents INTEGER NOT NULL DEFAULT 0,
  extra_seat_price_cents INTEGER NOT NULL DEFAULT 0,
  storage_overage_price_cents INTEGER NOT NULL DEFAULT 0,
  max_clients INTEGER NOT NULL DEFAULT 0,
  max_storage_gb INTEGER NOT NULL DEFAULT 1,
  included_team_members INTEGER NOT NULL DEFAULT 1,
  max_team_members INTEGER NOT NULL DEFAULT 1,
  max_email_reminders_per_month INTEGER NOT NULL DEFAULT 20,
  max_client_emails INTEGER NOT NULL DEFAULT 1,
  max_bcc_emails INTEGER NOT NULL DEFAULT 0,
  max_request_templates INTEGER NOT NULL DEFAULT 0,
  max_bulk_requests INTEGER NOT NULL DEFAULT 0,
  feature_teams BOOLEAN NOT NULL DEFAULT false,
  feature_groups BOOLEAN NOT NULL DEFAULT false,
  feature_client_assignments BOOLEAN NOT NULL DEFAULT false,
  feature_whitelabel_logo BOOLEAN NOT NULL DEFAULT false,
  feature_whitelabel_full BOOLEAN NOT NULL DEFAULT false,
  feature_api_readonly BOOLEAN NOT NULL DEFAULT false,
  feature_api_full BOOLEAN NOT NULL DEFAULT false,
  feature_sso BOOLEAN NOT NULL DEFAULT false,
  feature_webhooks BOOLEAN NOT NULL DEFAULT false,
  feature_activity_log BOOLEAN NOT NULL DEFAULT false,
  feature_custom_fields BOOLEAN NOT NULL DEFAULT false,
  feature_recurring_requests BOOLEAN NOT NULL DEFAULT false,
  feature_data_export BOOLEAN NOT NULL DEFAULT false,
  stripe_product_id VARCHAR(255),
  stripe_monthly_price_id VARCHAR(255),
  stripe_annual_price_id VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed default plans
INSERT INTO plans (slug, display_name, description, monthly_price_cents, annual_price_cents,
  extra_seat_price_cents, storage_overage_price_cents,
  max_clients, max_storage_gb, included_team_members, max_team_members,
  max_email_reminders_per_month, max_client_emails, max_bcc_emails,
  max_request_templates, max_bulk_requests,
  feature_teams, feature_groups, feature_client_assignments,
  feature_whitelabel_logo, feature_whitelabel_full,
  feature_api_readonly, feature_api_full, feature_sso, feature_webhooks,
  feature_activity_log, feature_custom_fields, feature_recurring_requests,
  feature_data_export, sort_order)
VALUES
  ('free', 'Free', 'Get started with document collection', 0, 0,
    0, 0,
    5, 1, 1, 1,
    20, 1, 0,
    1, 0,
    false, false, false,
    false, false,
    false, false, false, false,
    false, false, false,
    false, 0),
  ('solo', 'Solo', 'For solo accountants and bookkeepers', 1900, 18000,
    0, 200,
    50, 10, 1, 1,
    200, 3, 1,
    10, 10,
    false, false, false,
    false, false,
    false, false, false, false,
    false, false, false,
    false, 1),
  ('team', 'Team', 'For small firms that need collaboration', 3900, 38400,
    800, 200,
    250, 50, 5, 25,
    1000, 5, 5,
    0, 50,
    true, true, true,
    true, false,
    true, false, false, false,
    true, false, false,
    false, 2),
  ('firm', 'Firm', 'For established firms with full control', 7900, 78000,
    800, 200,
    0, 200, 15, 0,
    5000, 0, 0,
    0, 0,
    true, true, true,
    true, true,
    true, true, true, true,
    true, true, true,
    true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Customer subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(30) NOT NULL DEFAULT 'trialing',
  billing_interval VARCHAR(10) NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  extra_seats INTEGER NOT NULL DEFAULT 0,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_accountant
  ON subscriptions(accountant_id)
  WHERE status IN ('trialing', 'active', 'past_due');

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end) WHERE status = 'trialing';

-- Invoices (synced from Stripe)
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(30) NOT NULL,
  invoice_url TEXT,
  invoice_pdf TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(10) NOT NULL,
  discount_value INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  duration VARCHAR(20) NOT NULL,
  duration_months INTEGER,
  max_redemptions INTEGER,
  times_redeemed INTEGER NOT NULL DEFAULT 0,
  applies_to_plans INTEGER[],
  expires_at TIMESTAMPTZ,
  stripe_coupon_id VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Coupon redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id),
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  redeemed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(coupon_id, subscription_id)
);

-- ============================================================
-- MRR TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS mrr_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  total_mrr_cents INTEGER NOT NULL,
  free_count INTEGER NOT NULL DEFAULT 0,
  solo_mrr_cents INTEGER NOT NULL DEFAULT 0,
  solo_count INTEGER NOT NULL DEFAULT 0,
  team_mrr_cents INTEGER NOT NULL DEFAULT 0,
  team_count INTEGER NOT NULL DEFAULT 0,
  firm_mrr_cents INTEGER NOT NULL DEFAULT 0,
  firm_count INTEGER NOT NULL DEFAULT 0,
  extra_seats_mrr_cents INTEGER NOT NULL DEFAULT 0,
  storage_mrr_cents INTEGER NOT NULL DEFAULT 0,
  new_mrr_cents INTEGER NOT NULL DEFAULT 0,
  expansion_mrr_cents INTEGER NOT NULL DEFAULT 0,
  contraction_mrr_cents INTEGER NOT NULL DEFAULT 0,
  churned_mrr_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ADMIN SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS super_admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  totp_secret VARCHAR(255),
  totp_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES super_admins(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INTEGER,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at);

CREATE TABLE IF NOT EXISTS customer_notes (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  admin_id INTEGER NOT NULL REFERENCES super_admins(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_accountant ON customer_notes(accountant_id);

CREATE TABLE IF NOT EXISTS customer_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_tag_assignments (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES super_admins(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, tag_id)
);

-- ============================================================
-- PLATFORM ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS usage_snapshots (
  id BIGSERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  client_count INTEGER NOT NULL DEFAULT 0,
  active_request_count INTEGER NOT NULL DEFAULT 0,
  total_upload_count INTEGER NOT NULL DEFAULT 0,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  emails_sent_count INTEGER NOT NULL DEFAULT 0,
  team_member_count INTEGER NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  UNIQUE(accountant_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_usage_snapshots_date ON usage_snapshots(snapshot_date);

CREATE TABLE IF NOT EXISTS platform_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  total_accountants INTEGER NOT NULL DEFAULT 0,
  new_signups INTEGER NOT NULL DEFAULT 0,
  dau INTEGER NOT NULL DEFAULT 0,
  wau INTEGER NOT NULL DEFAULT 0,
  mau INTEGER NOT NULL DEFAULT 0,
  total_clients INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_uploads INTEGER NOT NULL DEFAULT 0,
  total_storage_bytes BIGINT NOT NULL DEFAULT 0,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  emails_delivered INTEGER NOT NULL DEFAULT 0,
  emails_bounced INTEGER NOT NULL DEFAULT 0,
  emails_opened INTEGER NOT NULL DEFAULT 0,
  api_requests INTEGER NOT NULL DEFAULT 0,
  avg_response_ms INTEGER,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CONTENT & COMMUNICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  announcement_type VARCHAR(20) NOT NULL DEFAULT 'info',
  target_plans VARCHAR(50)[] DEFAULT '{}',
  target_statuses VARCHAR(30)[] DEFAULT '{}',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_dismissible BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER REFERENCES super_admins(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS changelog_entries (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(30) DEFAULT 'improvement',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  notify_subscribers BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER REFERENCES super_admins(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECURITY & COMPLIANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS data_requests (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id),
  request_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,
  processed_by INTEGER REFERENCES super_admins(id),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_data_requests_accountant ON data_requests(accountant_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status);

CREATE TABLE IF NOT EXISTS failed_logins (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  login_type VARCHAR(20) NOT NULL DEFAULT 'customer',
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_failed_logins_email ON failed_logins(email);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON failed_logins(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_logins_at ON failed_logins(attempted_at);

-- ============================================================
-- MODIFICATIONS TO EXISTING TABLES
-- ============================================================

ALTER TABLE accountants ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Auto-update updated_at triggers for new tables
DROP TRIGGER IF EXISTS trg_plans_updated_at ON plans;
CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_super_admins_updated_at ON super_admins;
CREATE TRIGGER trg_super_admins_updated_at
  BEFORE UPDATE ON super_admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_changelog_updated_at ON changelog_entries;
CREATE TRIGGER trg_changelog_updated_at
  BEFORE UPDATE ON changelog_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
