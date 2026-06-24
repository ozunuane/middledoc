import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

// File type extension mappings for the type filter
const FILE_TYPE_FILTERS: Record<string, { mode: 'include' | 'exclude'; patterns: string[] }> = {
  pdf: {
    mode: 'include',
    patterns: ['%.pdf'],
  },
  image: {
    mode: 'include',
    patterns: ['%.jpg', '%.jpeg', '%.png', '%.gif', '%.webp'],
  },
  doc: {
    mode: 'include',
    patterns: ['%.doc', '%.docx', '%.xls', '%.xlsx', '%.csv', '%.txt'],
  },
  other: {
    mode: 'exclude',
    patterns: [
      '%.pdf',
      '%.jpg', '%.jpeg', '%.png', '%.gif', '%.webp',
      '%.doc', '%.docx', '%.xls', '%.xlsx', '%.csv', '%.txt',
    ],
  },
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const clientId = searchParams.get('client_id')
      const requestId = searchParams.get('request_id')
      const sortParam = searchParams.get('sort')
      const pageParam = searchParams.get('page')
      const limitParam = searchParams.get('limit')
      const searchTerm = searchParams.get('search')
      const typeParam = searchParams.get('type')

      // Validate sort param
      const validSorts = ['newest', 'oldest', 'name', 'size']
      if (sortParam && !validSorts.includes(sortParam)) {
        return NextResponse.json(
          { error: 'Invalid sort parameter. Use "newest", "oldest", "name", or "size".' },
          { status: 400 }
        )
      }

      // Validate type param
      if (typeParam && !FILE_TYPE_FILTERS[typeParam]) {
        return NextResponse.json(
          { error: 'Invalid type parameter. Use "pdf", "image", "doc", or "other".' },
          { status: 400 }
        )
      }

      // Determine ORDER BY
      let orderClause: string
      switch (sortParam) {
        case 'oldest':
          orderClause = 'du.uploaded_at ASC'
          break
        case 'name':
          orderClause = 'du.file_name ASC'
          break
        case 'size':
          orderClause = 'du.file_size DESC'
          break
        default:
          orderClause = 'du.uploaded_at DESC'
      }

      const conditions: string[] = ['dr.accountant_id = $1']
      const values: (string | number)[] = [accountantId]

      if (clientId) {
        values.push(clientId)
        conditions.push(`du.client_id = $${values.length}`)
      }

      if (requestId) {
        values.push(requestId)
        conditions.push(`du.request_id = $${values.length}`)
      }

      if (searchTerm) {
        values.push(`%${searchTerm}%`)
        const idx = values.length
        conditions.push(
          `(du.file_name ILIKE $${idx} OR c.name ILIKE $${idx} OR dr.title ILIKE $${idx})`
        )
      }

      // File type filtering
      if (typeParam) {
        const filter = FILE_TYPE_FILTERS[typeParam]
        if (filter.mode === 'include') {
          const typePlaceholders = filter.patterns.map((pattern) => {
            values.push(pattern)
            return `$${values.length}`
          })
          conditions.push(
            `(LOWER(du.file_name) LIKE ANY(ARRAY[${typePlaceholders.join(', ')}]))`
          )
        } else {
          // 'other' -- exclude all known types
          const typePlaceholders = filter.patterns.map((pattern) => {
            values.push(pattern)
            return `$${values.length}`
          })
          conditions.push(
            `NOT (LOWER(du.file_name) LIKE ANY(ARRAY[${typePlaceholders.join(', ')}]))`
          )
        }
      }

      const whereClause = conditions.join(' AND ')

      const selectFields = `
        du.id,
        du.file_name,
        du.file_size,
        du.uploaded_at,
        du.request_id,
        dr.title AS request_title,
        c.id AS client_id,
        c.name AS client_name,
        c.email AS client_email`

      const fromClause = `
        FROM document_uploads du
        JOIN document_requests dr ON dr.id = du.request_id
        JOIN clients c ON c.id = du.client_id`

      // If page is provided, return paginated response
      if (pageParam) {
        const page = Math.max(1, parseInt(pageParam, 10) || 1)
        const limit = Math.min(200, Math.max(1, parseInt(limitParam ?? '50', 10) || 50))
        const offset = (page - 1) * limit

        const countResult = await query(
          `SELECT COUNT(*) ${fromClause} WHERE ${whereClause}`,
          values
        )
        const total = parseInt(countResult.rows[0].count, 10)
        const totalPages = Math.ceil(total / limit)

        const dataValues = [...values, limit, offset]
        const result = await query(
          `SELECT ${selectFields} ${fromClause} WHERE ${whereClause} ORDER BY ${orderClause} LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
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

      // Backward compatible: return plain array
      const result = await query(
        `SELECT ${selectFields} ${fromClause} WHERE ${whereClause} ORDER BY ${orderClause}`,
        values
      )

      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/documents error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
