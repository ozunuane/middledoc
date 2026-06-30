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
    // Create super_admins
    await query(`CREATE TABLE IF NOT EXISTS super_admins (
      id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL, name VARCHAR(255),
      role VARCHAR(20) DEFAULT 'super_admin', is_active BOOLEAN DEFAULT true,
      last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('super_admins table ✓')

    // Create audit log
    await query(`CREATE TABLE IF NOT EXISTS admin_audit_log (
      id SERIAL PRIMARY KEY, admin_id INTEGER NOT NULL,
      action VARCHAR(100) NOT NULL, target_type VARCHAR(50),
      target_id INTEGER, details JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('admin_audit_log table ✓')

    // Seed admin
    const hash = await bcryptjs.hash('AdminMiddleDoc2026!', 12)
    await query(
      `INSERT INTO super_admins (email, password_hash, name, role) VALUES ($1, $2, $3, 'super_admin') ON CONFLICT (email) DO NOTHING`,
      ['admin@middledoc.com', hash, 'Platform Admin']
    )
    results.push('admin account ✓')

    // Seed plans (check what columns exist)
    const cols = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'plans' ORDER BY ordinal_position`)
    results.push(`plans columns: ${cols.rows.map((r: any) => r.column_name).join(', ')}`)

    // Insert plans using only columns that exist
    const planCols = cols.rows.map((r: any) => r.column_name)

    // Solo
    if (planCols.includes('slug')) {
      await query(`INSERT INTO plans (slug, display_name, description, monthly_price_cents, annual_price_cents, max_clients, max_storage_gb, included_team_members, max_team_members, max_email_reminders_per_month, is_active, is_public, sort_order)
        VALUES ('solo', 'Solo', 'For solo accountants and bookkeepers', 1900, 18000, 50, 10, 1, 1, 200, true, true, 1)
        ON CONFLICT (slug) DO NOTHING`)
      results.push('solo plan ✓')

      await query(`INSERT INTO plans (slug, display_name, description, monthly_price_cents, annual_price_cents, max_clients, max_storage_gb, included_team_members, max_team_members, max_email_reminders_per_month, is_active, is_public, sort_order)
        VALUES ('team', 'Team', 'For small firms that need collaboration', 3900, 38400, 250, 50, 5, 25, 1000, true, true, 2)
        ON CONFLICT (slug) DO NOTHING`)
      results.push('team plan ✓')

      await query(`INSERT INTO plans (slug, display_name, description, monthly_price_cents, annual_price_cents, max_clients, max_storage_gb, included_team_members, max_team_members, max_email_reminders_per_month, is_active, is_public, sort_order)
        VALUES ('firm', 'Firm', 'For established firms with full control', 7900, 78000, 0, 200, 15, 0, 5000, true, true, 3)
        ON CONFLICT (slug) DO NOTHING`)
      results.push('firm plan ✓')
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 })
  }
}
