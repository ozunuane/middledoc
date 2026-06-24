import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const clientId = req.nextUrl.searchParams.get('client_id')

      if (!clientId) {
        return NextResponse.json({ error: 'client_id query parameter is required' }, { status: 400 })
      }

      // Verify client belongs to this accountant
      const client = await getOne<{ id: number }>(
        `SELECT id FROM clients WHERE id = $1 AND accountant_id = $2`,
        [parseInt(clientId, 10), accountantId]
      )

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      const result = await query(
        `SELECT id, client_id, email, label, is_primary, created_at
         FROM client_emails
         WHERE client_id = $1
         ORDER BY is_primary DESC, created_at ASC`,
        [parseInt(clientId, 10)]
      )

      return NextResponse.json({ emails: result.rows })
    } catch (error) {
      console.error('GET /api/client-emails error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { client_id, email, label } = body

      if (!client_id || !email?.trim()) {
        return NextResponse.json({ error: 'client_id and email are required' }, { status: 400 })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }

      // Verify client belongs to this accountant
      const client = await getOne<{ id: number }>(
        `SELECT id FROM clients WHERE id = $1 AND accountant_id = $2`,
        [client_id, accountantId]
      )

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      // Check if this is the first email (auto-set as primary)
      const existingCount = await getOne<{ count: string }>(
        `SELECT COUNT(*) AS count FROM client_emails WHERE client_id = $1`,
        [client_id]
      )

      const isFirst = parseInt(existingCount?.count ?? '0', 10) === 0

      const result = await getOne<{
        id: number; client_id: number; email: string; label: string; is_primary: boolean; created_at: string
      }>(
        `INSERT INTO client_emails (client_id, email, label, is_primary)
         VALUES ($1, $2, $3, $4)
         RETURNING id, client_id, email, label, is_primary, created_at`,
        [client_id, email.trim(), label?.trim() || 'Primary', isFirst]
      )

      return NextResponse.json({ email: result }, { status: 201 })
    } catch (error) {
      console.error('POST /api/client-emails error:', error)
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

      // Verify the email belongs to a client owned by this accountant
      const emailRecord = await getOne<{ id: number; client_id: number; is_primary: boolean }>(
        `SELECT ce.id, ce.client_id, ce.is_primary
         FROM client_emails ce
         JOIN clients c ON c.id = ce.client_id
         WHERE ce.id = $1 AND c.accountant_id = $2`,
        [id, accountantId]
      )

      if (!emailRecord) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 })
      }

      // Can't delete primary if it's the only one
      if (emailRecord.is_primary) {
        const otherCount = await getOne<{ count: string }>(
          `SELECT COUNT(*) AS count FROM client_emails WHERE client_id = $1 AND id != $2`,
          [emailRecord.client_id, id]
        )
        if (parseInt(otherCount?.count ?? '0', 10) === 0) {
          return NextResponse.json({ error: 'Cannot delete the only email address' }, { status: 400 })
        }
      }

      await query(`DELETE FROM client_emails WHERE id = $1`, [id])

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/client-emails error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { id, email, label, is_primary } = body

      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }

      // Verify ownership
      const emailRecord = await getOne<{ id: number; client_id: number }>(
        `SELECT ce.id, ce.client_id
         FROM client_emails ce
         JOIN clients c ON c.id = ce.client_id
         WHERE ce.id = $1 AND c.accountant_id = $2`,
        [id, accountantId]
      )

      if (!emailRecord) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 })
      }

      // If setting as primary, unset others first
      if (is_primary === true) {
        await query(
          `UPDATE client_emails SET is_primary = false WHERE client_id = $1`,
          [emailRecord.client_id]
        )
      }

      const updates: string[] = []
      const values: (string | number | boolean)[] = []

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }
        values.push(email.trim())
        updates.push(`email = $${values.length}`)
      }

      if (label !== undefined) {
        values.push(label.trim())
        updates.push(`label = $${values.length}`)
      }

      if (is_primary !== undefined) {
        values.push(is_primary)
        updates.push(`is_primary = $${values.length}`)
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
      }

      values.push(id)
      const result = await getOne<{
        id: number; client_id: number; email: string; label: string; is_primary: boolean
      }>(
        `UPDATE client_emails SET ${updates.join(', ')} WHERE id = $${values.length}
         RETURNING id, client_id, email, label, is_primary`,
        values
      )

      return NextResponse.json({ email: result })
    } catch (error) {
      console.error('PATCH /api/client-emails error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
