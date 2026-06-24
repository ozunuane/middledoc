import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAdmin(request, async (req) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
      const adminIdFilter = searchParams.get('admin_id')
      const actionFilter = searchParams.get('action')
      const offset = (page - 1) * limit

      const conditions: string[] = []
      const params: (string | number)[] = []
      let paramIndex = 1

      if (adminIdFilter) {
        conditions.push(`al.admin_id = $${paramIndex++}`)
        params.push(parseInt(adminIdFilter, 10))
      }
      if (actionFilter) {
        conditions.push(`al.action = $${paramIndex++}`)
        params.push(actionFilter)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Get total count
      const countResult = await getOne<{ total: string }>(
        `SELECT COUNT(*) AS total FROM admin_audit_log al ${whereClause}`,
        params
      )
      const total = parseInt(countResult?.total || '0', 10)

      // Get paginated entries
      const dataParams = [...params, limit, offset]
      const result = await query(
        `SELECT
          al.id,
          al.admin_id,
          al.action,
          al.target_type,
          al.target_id,
          al.details,
          al.ip_address,
          al.created_at,
          sa.name AS admin_name,
          sa.email AS admin_email
        FROM admin_audit_log al
        LEFT JOIN super_admins sa ON al.admin_id = sa.id
        ${whereClause}
        ORDER BY al.created_at DESC
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
      console.error('GET /api/admin/audit-log error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
