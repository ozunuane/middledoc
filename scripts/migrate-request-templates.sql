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

-- Seed some global default templates (accountant_id = 0 means global)
INSERT INTO request_templates (accountant_id, name, description, checklist_items, is_default)
VALUES
  (0, 'Year-End Tax Prep', 'Standard documents for annual tax filing', ARRAY['Prior-year tax return', 'Profit & loss statement', 'Bank statements', '1099s & 1098s', 'Receipts for deductions'], true),
  (0, 'New Client Onboarding', 'Documents needed to set up a new client', ARRAY['Government-issued ID', 'Proof of address', 'Business registration certificate', 'Previous accountant contact'], true),
  (0, 'Quarterly Bookkeeping', 'Quarterly financial documents', ARRAY['Bank statements', 'Credit card statements', 'Payroll records', 'Expense receipts'], true),
  (0, 'Payroll Setup', 'Employee onboarding documents', ARRAY['Employee ID', 'Tax form (W-4/P45)', 'Direct deposit info', 'Employment contract'], true)
ON CONFLICT DO NOTHING;

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
