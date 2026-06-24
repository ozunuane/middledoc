import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware'
import { getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const metrics = await getOne<{
        total_accountants: string
        total_clients: string
        total_requests: string
        total_uploads: string
        total_storage_bytes: string
        signups_today: string
        signups_this_week: string
        signups_this_month: string
        active_subscriptions: string
      }>(`
        SELECT
          (SELECT COUNT(*) FROM accountants) AS total_accountants,
          (SELECT COUNT(*) FROM clients) AS total_clients,
          (SELECT COUNT(*) FROM document_requests) AS total_requests,
          (SELECT COUNT(*) FROM document_uploads) AS total_uploads,
          (SELECT COALESCE(SUM(file_size), 0) FROM document_uploads) AS total_storage_bytes,
          (SELECT COUNT(*) FROM accountants WHERE created_at >= CURRENT_DATE) AS signups_today,
          (SELECT COUNT(*) FROM accountants WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS signups_this_week,
          (SELECT COUNT(*) FROM accountants WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS signups_this_month,
          (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') AS active_subscriptions
      `)

      if (!metrics) {
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
      }

      return NextResponse.json({
        total_accountants: parseInt(metrics.total_accountants, 10),
        total_clients: parseInt(metrics.total_clients, 10),
        total_requests: parseInt(metrics.total_requests, 10),
        total_uploads: parseInt(metrics.total_uploads, 10),
        total_storage_bytes: parseInt(metrics.total_storage_bytes, 10),
        signups_today: parseInt(metrics.signups_today, 10),
        signups_this_week: parseInt(metrics.signups_this_week, 10),
        signups_this_month: parseInt(metrics.signups_this_month, 10),
        active_subscriptions: parseInt(metrics.active_subscriptions, 10),
      })
    } catch (error) {
      console.error('GET /api/admin/dashboard error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
