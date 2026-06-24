import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware'
import { getOne, getMany } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      // Database size
      const dbSize = await getOne<{ db_size: string }>(
        `SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size`
      )

      // Top tables by size
      const tableSizes = await getMany<{ table_name: string; size: string }>(
        `SELECT
          relname AS table_name,
          pg_size_pretty(pg_total_relation_size(c.oid)) AS size
        FROM pg_class c
        LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
        ORDER BY pg_total_relation_size(c.oid) DESC
        LIMIT 15`
      )

      // Total upload storage
      const totalStorage = await getOne<{ total_bytes: string }>(
        `SELECT COALESCE(SUM(file_size), 0)::bigint AS total_bytes FROM document_uploads`
      )

      // Signup trend (last 30 days)
      const signupTrend = await getMany<{ day: string; count: string }>(
        `SELECT
          d.day::date AS day,
          COALESCE(COUNT(a.id), 0)::int AS count
        FROM generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          '1 day'
        ) AS d(day)
        LEFT JOIN accountants a ON a.created_at::date = d.day::date
        GROUP BY d.day
        ORDER BY d.day ASC`
      )

      return NextResponse.json({
        db_size: dbSize?.db_size || 'unknown',
        table_sizes: tableSizes,
        total_storage_bytes: parseInt(totalStorage?.total_bytes || '0', 10),
        signup_trend: signupTrend.map((row) => ({
          day: row.day,
          count: parseInt(row.count, 10),
        })),
      })
    } catch (error) {
      console.error('GET /api/admin/stats error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
