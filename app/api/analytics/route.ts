import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne, getMany } from '@/lib/db'
import { getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      // 1. Completion rate over last 6 months
      const completionByMonth = await getMany<{ month: string; total: string; received: string; rate: string }>(
        `SELECT
          TO_CHAR(DATE_TRUNC('month', dr.created_at), 'Mon YYYY') AS month,
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE dr.status = 'received')::text AS received,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE dr.status = 'received')::numeric / COUNT(*) * 100, 1)::text
            ELSE '0'
          END AS rate
        FROM document_requests dr
        WHERE dr.accountant_id = $1
          AND dr.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', dr.created_at)
        ORDER BY DATE_TRUNC('month', dr.created_at) ASC`,
        [ownerAccountantId]
      )

      // 2. Average response time (days from request creation to first upload)
      const responseTime = await getOne<{ avg_days: string; min_days: string; max_days: string }>(
        `SELECT
          COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (first_upload - dr.created_at)) / 86400)::numeric, 1), 0)::text AS avg_days,
          COALESCE(ROUND(MIN(EXTRACT(EPOCH FROM (first_upload - dr.created_at)) / 86400)::numeric, 1), 0)::text AS min_days,
          COALESCE(ROUND(MAX(EXTRACT(EPOCH FROM (first_upload - dr.created_at)) / 86400)::numeric, 1), 0)::text AS max_days
        FROM document_requests dr
        LEFT JOIN LATERAL (
          SELECT MIN(uploaded_at) AS first_upload
          FROM document_uploads du
          WHERE du.request_id = dr.id
        ) fu ON TRUE
        WHERE dr.accountant_id = $1 AND fu.first_upload IS NOT NULL`,
        [ownerAccountantId]
      )

      // 3. Requests by status (current)
      const statusBreakdown = await getMany<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text AS count
        FROM document_requests
        WHERE accountant_id = $1
        GROUP BY status
        ORDER BY status`,
        [ownerAccountantId]
      )

      // 4. Upload activity last 30 days (for sparkline chart)
      const uploadActivity = await getMany<{ day: string; count: string }>(
        `SELECT
          TO_CHAR(d.day, 'Mon DD') AS day,
          COALESCE(c.count, 0)::text AS count
        FROM generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          '1 day'
        ) d(day)
        LEFT JOIN (
          SELECT DATE_TRUNC('day', du.uploaded_at) AS upload_day, COUNT(*) AS count
          FROM document_uploads du
          JOIN document_requests dr ON dr.id = du.request_id
          WHERE dr.accountant_id = $1
            AND du.uploaded_at >= CURRENT_DATE - INTERVAL '29 days'
          GROUP BY DATE_TRUNC('day', du.uploaded_at)
        ) c ON c.upload_day = d.day
        ORDER BY d.day ASC`,
        [ownerAccountantId]
      )

      // 5. Top clients by documents uploaded
      const topClients = await getMany<{ name: string; uploads: string; requests: string }>(
        `SELECT c.name,
          COUNT(DISTINCT du.id)::text AS uploads,
          COUNT(DISTINCT dr.id)::text AS requests
        FROM clients c
        LEFT JOIN document_requests dr ON dr.client_id = c.id
        LEFT JOIN document_uploads du ON du.request_id = dr.id
        WHERE c.accountant_id = $1
        GROUP BY c.id, c.name
        ORDER BY COUNT(DISTINCT du.id) DESC
        LIMIT 5`,
        [ownerAccountantId]
      )

      // 6. Overall stats
      const overall = await getOne<{
        total_requests: string
        completed_requests: string
        total_uploads: string
        avg_uploads_per_request: string
      }>(
        `SELECT
          COUNT(*)::text AS total_requests,
          COUNT(*) FILTER (WHERE status = 'received')::text AS completed_requests,
          (SELECT COUNT(*) FROM document_uploads du JOIN document_requests dr2 ON dr2.id = du.request_id WHERE dr2.accountant_id = $1)::text AS total_uploads,
          CASE WHEN COUNT(*) > 0
            THEN ROUND((SELECT COUNT(*) FROM document_uploads du JOIN document_requests dr2 ON dr2.id = du.request_id WHERE dr2.accountant_id = $1)::numeric / COUNT(*)::numeric, 1)::text
            ELSE '0'
          END AS avg_uploads_per_request
        FROM document_requests WHERE accountant_id = $1`,
        [ownerAccountantId]
      )

      return NextResponse.json({
        completion_by_month: completionByMonth.map(m => ({
          month: m.month,
          total: parseInt(m.total),
          received: parseInt(m.received),
          rate: parseFloat(m.rate),
        })),
        response_time: {
          avg_days: parseFloat(responseTime?.avg_days ?? '0'),
          min_days: parseFloat(responseTime?.min_days ?? '0'),
          max_days: parseFloat(responseTime?.max_days ?? '0'),
        },
        status_breakdown: statusBreakdown.map(s => ({
          status: s.status,
          count: parseInt(s.count),
        })),
        upload_activity: uploadActivity.map(u => ({
          day: u.day,
          count: parseInt(u.count),
        })),
        top_clients: topClients.map(c => ({
          name: c.name,
          uploads: parseInt(c.uploads),
          requests: parseInt(c.requests),
        })),
        overall: {
          total_requests: parseInt(overall?.total_requests ?? '0'),
          completed_requests: parseInt(overall?.completed_requests ?? '0'),
          total_uploads: parseInt(overall?.total_uploads ?? '0'),
          avg_uploads_per_request: parseFloat(overall?.avg_uploads_per_request ?? '0'),
          completion_rate: overall && parseInt(overall.total_requests) > 0
            ? Math.round(parseInt(overall.completed_requests) / parseInt(overall.total_requests) * 100)
            : 0,
        },
      })
    } catch (error) {
      console.error('GET /api/analytics error:', error instanceof Error ? error.message : error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
