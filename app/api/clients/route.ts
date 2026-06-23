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
      console.error('POST /api/clients error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const result = await query(
        'SELECT id, email, name, created_at FROM clients WHERE accountant_id = $1 ORDER BY created_at DESC',
        [accountantId]
      )
      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/clients error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
