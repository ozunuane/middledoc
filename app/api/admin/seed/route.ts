import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    // Super admins
    await query(`CREATE TABLE IF NOT EXISTS super_admins (
      id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL, name VARCHAR(255),
      role VARCHAR(20) DEFAULT 'super_admin', is_active BOOLEAN DEFAULT true,
      last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('super_admins ✓')

    await query(`CREATE TABLE IF NOT EXISTS admin_audit_log (
      id SERIAL PRIMARY KEY, admin_id INTEGER NOT NULL,
      action VARCHAR(100) NOT NULL, target_type VARCHAR(50),
      target_id INTEGER, details JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('admin_audit_log ✓')

    const hash = await bcryptjs.hash('AdminMiddleDoc2026!', 12)
    await query(`INSERT INTO super_admins (email, password_hash, name, role) VALUES ($1, $2, $3, 'super_admin') ON CONFLICT (email) DO NOTHING`,
      ['admin@middledoc.com', hash, 'Platform Admin'])
    results.push('admin ✓')

    // Drop and recreate plans with full schema
    await query(`DROP TABLE IF EXISTS subscriptions CASCADE`)
    await query(`DROP TABLE IF EXISTS plans CASCADE`)
    results.push('dropped old plans ✓')

    await query(`CREATE TABLE plans (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      description TEXT,
      monthly_price_cents INTEGER NOT NULL DEFAULT 0,
      annual_price_cents INTEGER NOT NULL DEFAULT 0,
      max_clients INTEGER NOT NULL DEFAULT 0,
      max_storage_gb INTEGER NOT NULL DEFAULT 1,
      included_team_members INTEGER NOT NULL DEFAULT 1,
      max_team_members INTEGER NOT NULL DEFAULT 1,
      max_email_reminders_per_month INTEGER NOT NULL DEFAULT 20,
      feature_teams BOOLEAN NOT NULL DEFAULT false,
      feature_groups BOOLEAN NOT NULL DEFAULT false,
      feature_client_assignments BOOLEAN NOT NULL DEFAULT false,
      feature_sso BOOLEAN NOT NULL DEFAULT false,
      feature_api_full BOOLEAN NOT NULL DEFAULT false,
      feature_api_readonly BOOLEAN NOT NULL DEFAULT false,
      feature_webhooks BOOLEAN NOT NULL DEFAULT false,
      feature_activity_log BOOLEAN NOT NULL DEFAULT false,
      feature_data_export BOOLEAN NOT NULL DEFAULT false,
      feature_whitelabel_logo BOOLEAN NOT NULL DEFAULT false,
      feature_whitelabel_full BOOLEAN NOT NULL DEFAULT false,
      feature_recurring_requests BOOLEAN NOT NULL DEFAULT false,
      feature_custom_fields BOOLEAN NOT NULL DEFAULT false,
      is_active BOOLEAN NOT NULL DEFAULT true,
      is_public BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('plans table ✓')

    // Seed 4 plans
    await query(`INSERT INTO plans (slug, display_name, description, monthly_price_cents, annual_price_cents, max_clients, max_storage_gb, included_team_members, max_team_members, max_email_reminders_per_month, is_active, is_public, sort_order) VALUES
      ('free', 'Free', 'Get started with document collection', 0, 0, 5, 1, 1, 1, 20, true, true, 0),
      ('solo', 'Solo', 'For solo accountants and bookkeepers', 1900, 18000, 50, 10, 1, 1, 200, true, true, 1),
      ('team', 'Team', 'For small firms that need collaboration', 3900, 38400, 250, 50, 5, 25, 1000, true, true, 2),
      ('firm', 'Firm', 'For established firms with full control', 7900, 78000, 0, 200, 15, 0, 5000, true, true, 3)
    `)
    results.push('4 plans seeded ✓')

    // Recreate subscriptions
    await query(`CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES plans(id),
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      billing_interval VARCHAR(20) DEFAULT 'monthly',
      payment_provider VARCHAR(20) DEFAULT 'paystack',
      current_period_start TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      cancel_at_period_end BOOLEAN DEFAULT false,
      cancelled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('subscriptions table ✓')

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 })
  }
}
