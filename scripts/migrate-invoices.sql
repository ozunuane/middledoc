-- Invoice table for client invoicing (Phase 2)
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description VARCHAR(500),
  status VARCHAR(20) DEFAULT 'sent',
  payment_required BOOLEAN DEFAULT false,
  paystack_reference VARCHAR(100),
  paystack_authorization_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(request_id)
);
CREATE INDEX IF NOT EXISTS idx_invoices_accountant ON invoices(accountant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_paystack_ref ON invoices(paystack_reference);
