-- MiddleDoc — Complete Database Schema
-- This file is idempotent: safe to run on a fresh DB or an existing one.
-- All tables use IF NOT EXISTS, all columns use ADD COLUMN IF NOT EXISTS.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Accountants (users)
CREATE TABLE IF NOT EXISTS accountants (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  firm_name VARCHAR(255),
  is_suspended BOOLEAN DEFAULT false,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  source VARCHAR(20) DEFAULT 'manual',
  company_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, email)
);

-- Document Requests
CREATE TABLE IF NOT EXISTS document_requests (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  checklist_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Document Uploads
CREATE TABLE IF NOT EXISTS document_uploads (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  status VARCHAR(20) DEFAULT 'uploaded',
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Email Reminders
CREATE TABLE IF NOT EXISTS email_reminders (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50),
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TEAMS & ACCESS CONTROL
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, accountant_id)
);

CREATE TABLE IF NOT EXISTS team_invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  invited_by INTEGER NOT NULL REFERENCES accountants(id),
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  team_member_id INTEGER NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  UNIQUE(group_id, team_member_id)
);

CREATE TABLE IF NOT EXISTS group_clients (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE(group_id, client_id)
);

CREATE TABLE IF NOT EXISTS client_assignments (
  id SERIAL PRIMARY KEY,
  team_member_id INTEGER NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES accountants(id),
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_member_id, client_id)
);

-- ============================================================
-- COMMUNICATION & TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS client_emails (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  label VARCHAR(100) DEFAULT 'Primary',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_emails (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, email)
);

CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  template_type VARCHAR(50) NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  cta_text VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, template_type)
);

CREATE TABLE IF NOT EXISTS request_templates (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  checklist_items TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AUTH & SECURITY
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, endpoint)
);

-- ============================================================
-- AI DOCUMENT CLASSIFICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS document_classifications (
  id SERIAL PRIMARY KEY,
  upload_id INTEGER NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  document_category VARCHAR(100),
  document_year SMALLINT,
  confidence NUMERIC(4,3),
  issues TEXT[] DEFAULT '{}',
  matched_checklist_item VARCHAR(255),
  match_confidence NUMERIC(4,3),
  processing_status VARCHAR(20) DEFAULT 'queued',
  processing_error TEXT,
  accountant_override VARCHAR(100),
  confirmed_at TIMESTAMPTZ,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  UNIQUE(upload_id)
);

CREATE TABLE IF NOT EXISTS document_category_labels (
  slug VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO document_category_labels (slug, display_name, sort_order) VALUES
  ('w2', 'W-2', 1), ('1099_nec', '1099-NEC', 2), ('1099_int', '1099-INT', 3),
  ('1099_div', '1099-DIV', 4), ('1099_b', '1099-B', 5), ('1099_r', '1099-R', 6),
  ('1099_misc', '1099-MISC', 7), ('k1', 'K-1', 8), ('w9', 'W-9', 9),
  ('bank_statement', 'Bank Statement', 20), ('credit_card_statement', 'Credit Card Statement', 21),
  ('mortgage_statement', 'Mortgage Statement', 22), ('property_tax', 'Property Tax Statement', 23),
  ('profit_loss', 'Profit & Loss Statement', 24), ('balance_sheet', 'Balance Sheet', 25),
  ('payroll_record', 'Payroll Record', 26), ('invoice', 'Invoice', 27),
  ('charity_receipt', 'Charitable Donation Receipt', 30), ('medical_receipt', 'Medical Expense', 31),
  ('business_expense', 'Business Expense Receipt', 32), ('tax_return_prior', 'Prior Year Tax Return', 40),
  ('id_document', 'ID / Government Document', 41), ('insurance', 'Insurance Document', 42),
  ('contract', 'Contract / Agreement', 43), ('other', 'Other Document', 99)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- E-SIGNATURES
-- ============================================================

CREATE TABLE IF NOT EXISTS signature_requests (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  original_file_name VARCHAR(255) NOT NULL,
  original_file_path VARCHAR(500) NOT NULL,
  signed_file_path VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  signer_name VARCHAR(255),
  signer_email VARCHAR(255),
  signed_at TIMESTAMPTZ,
  signer_ip VARCHAR(45),
  signer_user_agent TEXT,
  signature_event_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS signature_audit_log (
  id SERIAL PRIMARY KEY,
  signature_request_id INTEGER NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  signature_event_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- QUICKBOOKS ONLINE INTEGRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS qbo_connections (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  realm_id VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  company_name VARCHAR(255),
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(20) DEFAULT 'idle',
  sync_error TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id)
);

CREATE TABLE IF NOT EXISTS qbo_client_map (
  id SERIAL PRIMARY KEY,
  qbo_connection_id INTEGER NOT NULL REFERENCES qbo_connections(id) ON DELETE CASCADE,
  qbo_customer_id VARCHAR(50) NOT NULL,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  last_synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(qbo_connection_id, qbo_customer_id)
);

-- ============================================================
-- BILLING & SUBSCRIPTIONS
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
    0, 0, 5, 1, 1, 1, 20, 1, 0, 1, 0,
    false, false, false, false, false, false, false, false, false, false, false, false, false, 0),
  ('solo', 'Solo', 'For solo accountants and bookkeepers', 1900, 18000,
    0, 200, 50, 10, 1, 1, 200, 3, 1, 10, 10,
    false, false, false, false, false, false, false, false, false, false, false, false, false, 1),
  ('team', 'Team', 'For small firms that need collaboration', 3900, 38400,
    800, 200, 250, 50, 5, 25, 1000, 5, 5, 0, 50,
    true, true, true, true, false, true, false, false, false, true, false, false, false, 2),
  ('firm', 'Firm', 'For established firms with full control', 7900, 78000,
    800, 200, 0, 200, 15, 0, 5000, 0, 0, 0, 0,
    true, true, true, true, true, true, true, true, true, true, true, true, true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(30) NOT NULL DEFAULT 'trialing',
  billing_interval VARCHAR(10) NOT NULL DEFAULT 'monthly',
  payment_provider VARCHAR(20) DEFAULT 'stripe',
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
  paystack_subscription_code VARCHAR(255),
  paystack_customer_code VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Client invoices (for document request payments)
CREATE TABLE IF NOT EXISTS client_invoices (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  status VARCHAR(20) DEFAULT 'unpaid',
  payment_required BOOLEAN DEFAULT false,
  paystack_reference VARCHAR(100),
  paystack_authorization_url TEXT,
  stripe_session_id VARCHAR(255),
  payment_provider VARCHAR(20) DEFAULT 'stripe',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id),
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  redeemed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(coupon_id, subscription_id)
);

-- MRR tracking
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
-- ACTIVITY LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB DEFAULT '{}',
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
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_notes (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  admin_id INTEGER NOT NULL REFERENCES super_admins(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

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
-- CONTENT & COMMUNICATION (ADMIN)
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

CREATE TABLE IF NOT EXISTS failed_logins (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  login_type VARCHAR(20) NOT NULL DEFAULT 'customer',
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Core
CREATE INDEX IF NOT EXISTS idx_clients_accountant_id ON clients(accountant_id);
CREATE INDEX IF NOT EXISTS idx_requests_accountant_id ON document_requests(accountant_id);
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON document_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_share_token ON document_requests(share_token);
CREATE INDEX IF NOT EXISTS idx_uploads_request_id ON document_uploads(request_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_client_id ON document_uploads(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_request_id ON email_reminders(request_id);

-- Teams & access
CREATE INDEX IF NOT EXISTS idx_team_members_accountant_id ON team_members(accountant_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_groups_team_id ON groups(team_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_clients_group_id ON group_clients(group_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_team_member_id ON client_assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_client_id ON client_assignments(client_id);

-- Communication
CREATE INDEX IF NOT EXISTS idx_client_emails_client_id ON client_emails(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_emails_accountant_id ON notification_emails(accountant_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_accountant_id ON email_templates(accountant_id);
CREATE INDEX IF NOT EXISTS idx_request_templates_accountant ON request_templates(accountant_id);

-- Auth
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_sub_accountant ON push_subscriptions(accountant_id);

-- AI classification
CREATE INDEX IF NOT EXISTS idx_doc_class_upload ON document_classifications(upload_id);
CREATE INDEX IF NOT EXISTS idx_doc_class_status ON document_classifications(processing_status);

-- E-signatures
CREATE INDEX IF NOT EXISTS idx_sig_requests_request ON signature_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_sig_audit_request ON signature_audit_log(signature_request_id);

-- QBO
CREATE INDEX IF NOT EXISTS idx_qbo_client_map_client ON qbo_client_map(client_id);

-- Billing
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_accountant
  ON subscriptions(accountant_id)
  WHERE status IN ('trialing', 'active', 'past_due');
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end) WHERE status = 'trialing';
CREATE INDEX IF NOT EXISTS idx_client_invoices_accountant ON client_invoices(accountant_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON client_invoices(status);
CREATE INDEX IF NOT EXISTS idx_client_invoices_stripe_session ON client_invoices(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- Activity
CREATE INDEX IF NOT EXISTS idx_activity_log_accountant ON activity_log(accountant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- Admin
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_notes_accountant ON customer_notes(accountant_id);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_usage_snapshots_date ON usage_snapshots(snapshot_date);

-- Security
CREATE INDEX IF NOT EXISTS idx_data_requests_accountant ON data_requests(accountant_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status);
CREATE INDEX IF NOT EXISTS idx_failed_logins_email ON failed_logins(email);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON failed_logins(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_logins_at ON failed_logins(attempted_at);

-- Search (trigram)
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_email_trgm ON clients USING gin (email gin_trgm_ops);

-- ============================================================
-- CONSTRAINTS
-- ============================================================

ALTER TABLE document_requests DROP CONSTRAINT IF EXISTS chk_request_status;
ALTER TABLE document_requests ADD CONSTRAINT chk_request_status
  CHECK (status IN ('pending', 'received', 'overdue', 'cancelled'));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-mark request as received when file uploaded
CREATE OR REPLACE FUNCTION update_request_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE document_requests
  SET status = 'received', updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.request_id AND status = 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Revert status when all uploads deleted
CREATE OR REPLACE FUNCTION revert_request_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM document_uploads WHERE request_id = OLD.request_id
  ) THEN
    UPDATE document_requests
    SET status = 'pending'
    WHERE id = OLD.request_id AND status = 'received';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_mark_received ON document_uploads;
CREATE TRIGGER trigger_mark_received
  AFTER INSERT ON document_uploads
  FOR EACH ROW EXECUTE FUNCTION update_request_status();

DROP TRIGGER IF EXISTS trigger_revert_status ON document_uploads;
CREATE TRIGGER trigger_revert_status
  AFTER DELETE ON document_uploads
  FOR EACH ROW EXECUTE FUNCTION revert_request_status();

DROP TRIGGER IF EXISTS trg_requests_updated_at ON document_requests;
CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON document_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_email_templates_updated_at ON email_templates;
CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

-- ============================================================
-- BACKWARD COMPAT: add columns if upgrading from older schema
-- ============================================================

ALTER TABLE accountants ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE document_requests ADD COLUMN IF NOT EXISTS checklist_items TEXT[] DEFAULT '{}';
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'uploaded';
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'stripe';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255);
ALTER TABLE admin_audit_log ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE signature_requests ADD COLUMN IF NOT EXISTS signer_email VARCHAR(255);
ALTER TABLE signature_requests ADD COLUMN IF NOT EXISTS signature_event_id UUID;
ALTER TABLE signature_audit_log ADD COLUMN IF NOT EXISTS signature_event_id UUID;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_monthly_price_id VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_annual_price_id VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_client_emails INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_bcc_emails INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_request_templates INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_bulk_requests INTEGER DEFAULT 0;
