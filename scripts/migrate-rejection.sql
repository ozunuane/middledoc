-- Migration: Document rejection workflow and email templates
-- Run this against an existing database to add rejection support

-- Add rejection fields to document_uploads
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'uploaded';
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Add email_templates table for customizable templates
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

-- Index for fast lookup by accountant
CREATE INDEX IF NOT EXISTS idx_email_templates_accountant_id ON email_templates(accountant_id);
