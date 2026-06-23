-- Accountants table
CREATE TABLE IF NOT EXISTS accountants (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
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
