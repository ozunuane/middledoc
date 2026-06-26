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
