-- QBO OAuth connections
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

-- QBO customer to MiddleDoc client mapping
CREATE TABLE IF NOT EXISTS qbo_client_map (
  id SERIAL PRIMARY KEY,
  qbo_connection_id INTEGER NOT NULL REFERENCES qbo_connections(id) ON DELETE CASCADE,
  qbo_customer_id VARCHAR(50) NOT NULL,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  last_synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(qbo_connection_id, qbo_customer_id)
);
CREATE INDEX IF NOT EXISTS idx_qbo_client_map_client ON qbo_client_map(client_id);

-- Add source tracking to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
