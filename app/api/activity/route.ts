import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getMany, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
      const offset = (page - 1) * limit

      const countResult = await getOne<{ count: string }>(
        `SELECT COUNT(*) AS count FROM activity_log WHERE accountant_id = $1`,
        [accountantId]
      )
      const total = parseInt(countResult?.count ?? '0', 10)

      const activities = await getMany(
        `SELECT id, accountant_id, action, entity_type, entity_id, details, created_at
         FROM activity_log
         WHERE accountant_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [accountantId, limit, offset]
      )

      return NextResponse.json({
        data: activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    } catch (error) {
      console.error('GET /api/activity error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
