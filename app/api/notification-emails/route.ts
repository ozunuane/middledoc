import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const result = await query(
        `SELECT id, email, label, created_at
         FROM notification_emails
         WHERE accountant_id = $1
         ORDER BY created_at ASC`,
        [accountantId]
      )

      return NextResponse.json({ emails: result.rows })
    } catch (error) {
      console.error('GET /api/notification-emails error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { email, label } = body

      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }

      // Check for duplicate
      const existing = await getOne<{ id: number }>(
        `SELECT id FROM notification_emails WHERE accountant_id = $1 AND email = $2`,
        [accountantId, email.trim()]
      )

      if (existing) {
        return NextResponse.json({ error: 'This email is already added' }, { status: 409 })
      }

      const result = await getOne<{ id: number; email: string; label: string | null; created_at: string }>(
        `INSERT INTO notification_emails (accountant_id, email, label)
         VALUES ($1, $2, $3)
         RETURNING id, email, label, created_at`,
        [accountantId, email.trim(), label?.trim() || null]
      )

      return NextResponse.json({ email: result }, { status: 201 })
    } catch (error) {
      console.error('POST /api/notification-emails error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }

      const result = await query(
        `DELETE FROM notification_emails WHERE id = $1 AND accountant_id = $2`,
        [id, accountantId]
      )

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/notification-emails error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
