import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { request_id, amount_cents, currency, description, payment_required } = body

      if (!request_id || !amount_cents || amount_cents <= 0) {
        return NextResponse.json(
          { error: 'Missing required fields: request_id, amount_cents (positive integer)' },
          { status: 400 }
        )
      }

      if (!Number.isInteger(amount_cents) || amount_cents <= 0 || amount_cents > 10000000) {
        return NextResponse.json({ error: 'Amount must be between $0.01 and $100,000' }, { status: 400 })
      }

      // Verify the accountant owns the request
      const docRequest = await getOne<{ id: number; client_id: number }>(
        'SELECT id, client_id FROM document_requests WHERE id = $1 AND accountant_id = $2',
        [request_id, accountantId]
      )

      if (!docRequest) {
        return NextResponse.json({ error: 'Request not found or not owned by user' }, { status: 404 })
      }

      // Check if an invoice already exists for this request
      const existing = await getOne<{ id: number }>(
        'SELECT id FROM client_invoices WHERE request_id = $1',
        [request_id]
      )

      if (existing) {
        return NextResponse.json({ error: 'An invoice already exists for this request' }, { status: 409 })
      }

      const result = await query(
        `INSERT INTO client_invoices (request_id, accountant_id, client_id, amount_cents, currency, description, payment_required)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, request_id, accountant_id, client_id, amount_cents, currency, description, status, payment_required, created_at`,
        [
          request_id,
          accountantId,
          docRequest.client_id,
          amount_cents,
          currency || 'USD',
          description || null,
          payment_required || false,
        ]
      )

      return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
      console.error('POST /api/invoices error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const requestIdFilter = searchParams.get('request_id')

      let sql = `SELECT id, request_id, accountant_id, client_id, amount_cents, currency, description, status, payment_required, paid_at, created_at
                 FROM client_invoices WHERE accountant_id = $1`
      const params: (string | number)[] = [accountantId]

      if (requestIdFilter) {
        params.push(parseInt(requestIdFilter, 10))
        sql += ` AND request_id = $${params.length}`
      }

      sql += ' ORDER BY created_at DESC'

      const result = await query(sql, params)
      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/invoices error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
