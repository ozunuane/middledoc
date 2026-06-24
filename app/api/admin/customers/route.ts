import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAdmin(request, async (req) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
      const search = searchParams.get('search') || ''
      const sort = searchParams.get('sort') || 'created_at'
      const order = searchParams.get('order') === 'asc' ? 'ASC' : 'DESC'
      const offset = (page - 1) * limit

      // Validate sort column to prevent SQL injection
      const allowedSorts: Record<string, string> = {
        name: 'a.name',
        email: 'a.email',
        created_at: 'a.created_at',
        client_count: 'client_count',
        storage_used: 'storage_used',
      }
      const sortColumn = allowedSorts[sort] || 'a.created_at'

      const conditions: string[] = []
      const params: (string | number)[] = []
      let paramIndex = 1

      if (search) {
        conditions.push(
          `(a.name ILIKE $${paramIndex} OR a.email ILIKE $${paramIndex} OR a.firm_name ILIKE $${paramIndex})`
        )
        params.push(`%${search}%`)
        paramIndex++
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Get total count
      const countResult = await getOne<{ total: string }>(
        `SELECT COUNT(*) AS total FROM accountants a ${whereClause}`,
        params
      )
      const total = parseInt(countResult?.total || '0', 10)

      // Get paginated customers with aggregated stats
      const dataParams = [...params, limit, offset]
      const result = await query(
        `SELECT
          a.id,
          a.name,
          a.email,
          a.firm_name,
          a.created_at,
          a.is_suspended,
          COALESCE(c.client_count, 0)::int AS client_count,
          COALESCE(r.request_count, 0)::int AS request_count,
          COALESCE(u.storage_used, 0)::bigint AS storage_used
        FROM accountants a
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS client_count FROM clients WHERE accountant_id = a.id
        ) c ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS request_count FROM document_requests WHERE accountant_id = a.id
        ) r ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(du.file_size), 0) AS storage_used
          FROM document_uploads du
          JOIN document_requests dr ON du.request_id = dr.id
          WHERE dr.accountant_id = a.id
        ) u ON true
        ${whereClause}
        ORDER BY ${sortColumn} ${order}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        dataParams
      )

      return NextResponse.json({
        data: result.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    } catch (error) {
      console.error('GET /api/admin/customers error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
