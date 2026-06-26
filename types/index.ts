export interface Accountant {
  id: number
  email: string
  name: string
  firm_name?: string
}

export interface Client {
  id: number
  accountant_id: number
  email: string
  name: string
  created_at: string
}

export interface DocumentRequest {
  id: number
  accountant_id: number
  client_id: number
  title: string
  description?: string
  due_date: string
  status: 'pending' | 'received' | 'overdue' | 'cancelled'
  share_token: string
  created_at: string
  updated_at: string
}

export interface DocumentUpload {
  id: number
  request_id: number
  client_id: number
  file_name: string
  file_path: string
  file_size: number
  uploaded_at: string
  status: 'uploaded' | 'rejected'
  rejection_reason?: string
  rejected_at?: string
}

export interface EmailReminder {
  id: number
  request_id: number
  client_id: number
  reminder_type: 'initial' | '7day' | '3day' | 'deadline' | 'rejection'
  sent_at: string
}

export interface EmailTemplate {
  id?: number
  accountant_id?: number
  template_type: string
  subject: string
  body_text: string
  cta_text?: string
  is_custom?: boolean
  created_at?: string
  updated_at?: string
}

export interface Document {
  id: number
  file_name: string
  file_size: number
  uploaded_at: string
  request_id: number
  request_title: string
  client_id: number
  client_name: string
  client_email: string
}

export interface Team {
  id: number
  name: string
  owner_id: number
  created_at: string
}

export interface TeamMember {
  id: number
  team_id: number
  accountant_id: number
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  name?: string
  email?: string
}

export interface TeamInvitation {
  id: number
  team_id: number
  email: string
  role: string
  token: string
  expires_at: string
  accepted_at?: string
}

export interface Group {
  id: number
  team_id: number
  name: string
  created_at: string
  member_count?: number
  client_count?: number
}

export interface ClientEmail {
  id: number
  client_id: number
  email: string
  label: string
  is_primary: boolean
}

export interface NotificationEmail {
  id: number
  email: string
  label?: string
}

export interface ClientAssignment {
  id: number
  team_member_id: number
  client_id: number
  assigned_by: number
  assigned_at: string
  member_name?: string
  client_name?: string
}

export interface RequestTemplate {
  id: number
  accountant_id: number
  name: string
  description?: string
  checklist_items: string[]
  is_default: boolean
}

export interface DocumentClassification {
  id: number
  upload_id: number
  document_category: string
  document_year?: number
  confidence: number
  issues: string[]
  matched_checklist_item?: string
  match_confidence?: number
  processing_status: 'queued' | 'processing' | 'completed' | 'failed'
  processing_error?: string
  accountant_override?: string
  category_display_name?: string
}

export interface ActivityLogEntry {
  id: number
  accountant_id: number
  action: string
  entity_type: string
  entity_id?: number
  details: Record<string, unknown>
  created_at: string
}

// ============================================================
// INVOICE TYPES
// ============================================================

export interface Invoice {
  id: number
  request_id: number
  accountant_id: number
  client_id: number
  amount_cents: number
  currency: string
  description?: string
  status: 'sent' | 'paid' | 'cancelled'
  payment_required: boolean
  paid_at?: string
  created_at: string
}

// ============================================================
// ADMIN & SUBSCRIPTION TYPES
// ============================================================

export interface Plan {
  id: number
  slug: string
  display_name: string
  description?: string
  monthly_price_cents: number
  annual_price_cents: number
  extra_seat_price_cents: number
  storage_overage_price_cents: number
  max_clients: number
  max_storage_gb: number
  included_team_members: number
  max_team_members: number
  max_email_reminders_per_month: number
  max_client_emails: number
  max_bcc_emails: number
  max_request_templates: number
  max_bulk_requests: number
  feature_teams: boolean
  feature_groups: boolean
  feature_client_assignments: boolean
  feature_whitelabel_logo: boolean
  feature_whitelabel_full: boolean
  feature_api_readonly: boolean
  feature_api_full: boolean
  feature_sso: boolean
  feature_webhooks: boolean
  feature_activity_log: boolean
  feature_custom_fields: boolean
  feature_recurring_requests: boolean
  feature_data_export: boolean
  is_active: boolean
  is_public: boolean
  sort_order: number
}

export interface Subscription {
  id: number
  accountant_id: number
  plan_id: number
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  billing_interval: 'monthly' | 'annual'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  paystack_subscription_code?: string
  paystack_customer_code?: string
  paystack_authorization_code?: string
  paystack_email_token?: string
  paystack_transaction_ref?: string
}

export interface BillingSubscription {
  id: number
  plan_id: number
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  billing_interval: 'monthly' | 'annual'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  paystack_subscription_code?: string
  paystack_customer_code?: string
  // Joined plan fields
  slug?: string
  display_name?: string
  monthly_price_cents?: number
  annual_price_cents?: number
  max_clients?: number
  max_storage_gb?: number
  included_team_members?: number
  max_team_members?: number
  max_email_reminders_per_month?: number
}

export interface SuperAdmin {
  id: number
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'support'
}

export interface AdminAuditEntry {
  id: number
  admin_id: number
  action: string
  target_type: string
  target_id?: number
  details: Record<string, unknown>
  created_at: string
}

export interface SignatureRequest {
  id: number
  request_id: number
  original_file_name: string
  status: 'pending' | 'signed'
  signer_name?: string
  signed_at?: string
  created_at: string
}
