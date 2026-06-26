-- E-Signature tables for MiddleDoc
CREATE TABLE IF NOT EXISTS signature_requests (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  original_file_name VARCHAR(255) NOT NULL,
  original_file_path VARCHAR(500) NOT NULL,
  signed_file_path VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  signer_name VARCHAR(255),
  signed_at TIMESTAMPTZ,
  signer_ip VARCHAR(45),
  signer_user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sig_requests_request ON signature_requests(request_id);

CREATE TABLE IF NOT EXISTS signature_audit_log (
  id SERIAL PRIMARY KEY,
  signature_request_id INTEGER NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sig_audit_request ON signature_audit_log(signature_request_id);
