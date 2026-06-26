-- Accountants table
CREATE TABLE IF NOT EXISTS accountants (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  firm_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, email)
);

-- Document Requests table
CREATE TABLE IF NOT EXISTS document_requests (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, received, overdue, cancelled
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Document Uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Email Reminders table
CREATE TABLE IF NOT EXISTS email_reminders (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50), -- initial, 1week, 3days, 1day
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_accountant_id ON clients(accountant_id);
CREATE INDEX IF NOT EXISTS idx_requests_accountant_id ON document_requests(accountant_id);
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON document_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_share_token ON document_requests(share_token);
CREATE INDEX IF NOT EXISTS idx_uploads_request_id ON document_uploads(request_id);
CREATE INDEX IF NOT EXISTS idx_reminders_request_id ON email_reminders(request_id);

-- Stored function to update request status based on file uploads
CREATE OR REPLACE FUNCTION update_request_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE document_requests
  SET status = 'received', updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.request_id AND status = 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update status when file is uploaded
DROP TRIGGER IF EXISTS trigger_mark_received ON document_uploads;
CREATE TRIGGER trigger_mark_received
AFTER INSERT ON document_uploads
FOR EACH ROW
EXECUTE FUNCTION update_request_status();

-- Document rejection fields
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'uploaded';
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Email templates table for customizable templates
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  template_type VARCHAR(50) NOT NULL,  -- 'initial', '7day', '3day', 'deadline', 'rejection'
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  cta_text VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, template_type)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_accountant_id ON email_templates(accountant_id);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, accountant_id)
);

-- Team invitations
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

-- Groups (for access control within a team)
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Group members (which team members belong to which groups)
CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  team_member_id INTEGER NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  UNIQUE(group_id, team_member_id)
);

-- Group clients (which clients a group can access)
CREATE TABLE IF NOT EXISTS group_clients (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE(group_id, client_id)
);

-- Direct client assignments (contractor access — individual member to specific client)
CREATE TABLE IF NOT EXISTS client_assignments (
  id SERIAL PRIMARY KEY,
  team_member_id INTEGER NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES accountants(id),
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_member_id, client_id)
);

-- Multiple emails per client
CREATE TABLE IF NOT EXISTS client_emails (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  label VARCHAR(100) DEFAULT 'Primary',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notification BCC emails
CREATE TABLE IF NOT EXISTS notification_emails (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, email)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);

-- Request Templates
CREATE TABLE IF NOT EXISTS request_templates (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  checklist_items TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_request_templates_accountant ON request_templates(accountant_id);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activity_log_accountant ON activity_log(accountant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- AI Document Classification
ALTER TABLE document_requests ADD COLUMN IF NOT EXISTS checklist_items TEXT[] DEFAULT '{}';

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
CREATE INDEX IF NOT EXISTS idx_doc_class_upload ON document_classifications(upload_id);
CREATE INDEX IF NOT EXISTS idx_doc_class_status ON document_classifications(processing_status);

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
