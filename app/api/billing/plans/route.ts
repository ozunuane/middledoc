import { NextResponse } from 'next/server'
import { getMany } from '@/lib/db'

export async function GET() {
  try {
    const plans = await getMany<Record<string, unknown>>(
      `SELECT id, slug, display_name, description,
              monthly_price_cents, annual_price_cents,
              max_clients, max_storage_gb, included_team_members, max_team_members,
              max_email_reminders_per_month, max_client_emails, max_bcc_emails,
              max_request_templates, max_bulk_requests,
              feature_teams, feature_groups, feature_client_assignments,
              feature_whitelabel_logo, feature_whitelabel_full,
              feature_api_readonly, feature_api_full, feature_sso,
              feature_webhooks, feature_activity_log, feature_custom_fields,
              feature_recurring_requests, feature_data_export,
              stripe_monthly_price_id, stripe_annual_price_id,
              sort_order
       FROM plans
       WHERE is_active = true AND is_public = true
       ORDER BY sort_order ASC`
    )
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('GET /api/billing/plans error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
