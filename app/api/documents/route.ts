import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const clientId = searchParams.get('client_id')
      const requestId = searchParams.get('request_id')
      const sortParam = searchParams.get('sort')

      const validSorts = ['newest', 'oldest']
      if (sortParam && !validSorts.includes(sortParam)) {
        return NextResponse.json({ error: 'Invalid sort parameter. Use "newest" or "oldest".' }, { status: 400 })
      }

      const orderDirection = sortParam === 'oldest' ? 'ASC' : 'DESC'

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

      const whereClause = conditions.join(' AND ')

      const result = await query(
        `SELECT
           du.id,
           du.file_name,
           du.file_size,
           du.uploaded_at,
           du.request_id,
           dr.title AS request_title,
           c.id AS client_id,
           c.name AS client_name,
           c.email AS client_email
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         JOIN clients c ON c.id = du.client_id
         WHERE ${whereClause}
         ORDER BY du.uploaded_at ${orderDirection}`,
        values
      )

      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/documents error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
