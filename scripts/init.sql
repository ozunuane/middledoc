-- Accountants table
CREATE TABLE IF NOT EXISTS accountants (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  firm_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Reminders table
CREATE TABLE IF NOT EXISTS email_reminders (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50), -- initial, 1week, 3days, 1day
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Seed data for development/testing
-- Password: password123 for both test accounts
INSERT INTO accountants (email, password_hash, name)
VALUES
  ('test@example.com', '$2a$10$tAdfnTiqzGOg6LcHCmSzuuK/ejac47KA/i8uKd6LbpEkC3OoagHNq', 'Test Accountant'),
  ('demo@accountant.com', '$2a$10$tAdfnTiqzGOg6LcHCmSzuuK/ejac47KA/i8uKd6LbpEkC3OoagHNq', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Seed clients for the test accountant
INSERT INTO clients (accountant_id, email, name)
VALUES
  (1, 'john@business.com', 'John Smith'),
  (1, 'sarah@company.co', 'Sarah Johnson'),
  (1, 'mike@startup.io', 'Mike Chen')
ON CONFLICT (accountant_id, email) DO NOTHING;

-- Seed document requests
INSERT INTO document_requests (accountant_id, client_id, title, description, due_date, status)
VALUES
  (1, 1, '2025 Tax Returns', 'Please provide all tax documents for 2025', '2026-03-31', 'pending'),
  (1, 2, 'Quarterly Income Statement', 'Q1 2026 financial statements needed', '2026-02-28', 'received'),
  (1, 3, 'Expense Receipts', 'All receipts from January 2026', '2026-02-15', 'overdue')
ON CONFLICT DO NOTHING;

-- Document rejection fields
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'uploaded';
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Email templates table for customizable templates
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  template_type VARCHAR(50) NOT NULL,  -- 'initial', '7day', '3day', 'deadline', 'rejection'
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  cta_text VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, template_type)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_accountant_id ON email_templates(accountant_id);
