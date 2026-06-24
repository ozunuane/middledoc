import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { email, name } = body

      if (!email || !name) {
        return NextResponse.json({ error: 'Missing required fields: email and name' }, { status: 400 })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }

      const existing = await query(
        'SELECT id FROM clients WHERE accountant_id = $1 AND email = $2',
        [accountantId, email]
      )
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'A client with this email already exists' }, { status: 409 })
      }

      const result = await query(
        'INSERT INTO clients (accountant_id, email, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [accountantId, email, name]
      )

      return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
      console.error('POST /api/clients error:', error instanceof Error ? error.message : 'Unknown error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const pageParam = searchParams.get('page')
      const limitParam = searchParams.get('limit')
      const sortParam = searchParams.get('sort')
      const orderParam = searchParams.get('order')
      const searchTerm = searchParams.get('search')

      // Validate sort column
      const validSorts: Record<string, string> = {
        name: 'name',
        email: 'email',
        created_at: 'created_at',
      }
      const sortColumn = validSorts[sortParam ?? 'name'] ?? 'name'

      // Validate order direction
      const orderDirection = orderParam === 'desc' ? 'DESC' : 'ASC'

      // Build WHERE clause
      const conditions: string[] = ['accountant_id = $1']
      const values: (string | number)[] = [accountantId]

      if (searchTerm) {
        values.push(`%${searchTerm}%`)
        const idx = values.length
        conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`)
      }

      const whereClause = conditions.join(' AND ')

      // If page is provided, return paginated response
      if (pageParam) {
        const page = Math.max(1, parseInt(pageParam, 10) || 1)
        const limit = Math.min(200, Math.max(1, parseInt(limitParam ?? '50', 10) || 50))
        const offset = (page - 1) * limit

        const countResult = await query(
          `SELECT COUNT(*) FROM clients WHERE ${whereClause}`,
          values
        )
        const total = parseInt(countResult.rows[0].count, 10)
        const totalPages = Math.ceil(total / limit)

        const dataValues = [...values, limit, offset]
        const result = await query(
          `SELECT id, email, name, created_at FROM clients WHERE ${whereClause} ORDER BY ${sortColumn} ${orderDirection} LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
          dataValues
        )

        return NextResponse.json({
          data: result.rows,
          total,
          page,
          limit,
          totalPages,
        })
      }

      // Backward compatible: return plain array with default limit
      const dataValues = [...values, 200]
      const result = await query(
        `SELECT id, email, name, created_at FROM clients WHERE ${whereClause} ORDER BY ${sortColumn} ${orderDirection} LIMIT $${dataValues.length}`,
        dataValues
      )
      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/clients error:', error instanceof Error ? error.message : 'Unknown error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
