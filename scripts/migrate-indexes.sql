-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_document_uploads_client_id ON document_uploads(client_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_request_id ON document_uploads(request_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_accountant_id ON document_requests(accountant_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_client_id ON document_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_clients_accountant_id ON clients(accountant_id);
CREATE INDEX IF NOT EXISTS idx_client_emails_client_id ON client_emails(client_id);
CREATE INDEX IF NOT EXISTS idx_team_members_accountant_id ON team_members(accountant_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_groups_team_id ON groups(team_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_clients_group_id ON group_clients(group_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_team_member_id ON client_assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_client_id ON client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_emails_accountant_id ON notification_emails(accountant_id);
CREATE INDEX IF NOT EXISTS idx_email_reminders_request_id ON email_reminders(request_id);

-- Trigram indexes for ILIKE search performance (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_email_trgm ON clients USING gin (email gin_trgm_ops);

-- Status constraint
ALTER TABLE document_requests DROP CONSTRAINT IF EXISTS chk_request_status;
ALTER TABLE document_requests ADD CONSTRAINT chk_request_status
  CHECK (status IN ('pending', 'received', 'overdue', 'cancelled'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requests_updated_at ON document_requests;
CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON document_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_email_templates_updated_at ON email_templates;
CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

DROP TRIGGER IF EXISTS trigger_revert_status ON document_uploads;
CREATE TRIGGER trigger_revert_status
  AFTER DELETE ON document_uploads
  FOR EACH ROW EXECUTE FUNCTION revert_request_status();
