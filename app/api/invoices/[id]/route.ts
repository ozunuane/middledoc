import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { id } = await params
      const invoiceId = parseInt(id, 10)

      if (isNaN(invoiceId)) {
        return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 })
      }

      const invoice = await getOne<Record<string, unknown>>(
        `SELECT i.id, i.request_id, i.accountant_id, i.client_id, i.amount_cents, i.currency,
                i.description, i.status, i.payment_required, i.paid_at, i.created_at,
                dr.title AS request_title, dr.due_date AS request_due_date,
                c.name AS client_name, c.email AS client_email
         FROM invoices i
         JOIN document_requests dr ON dr.id = i.request_id
         JOIN clients c ON c.id = i.client_id
         WHERE i.id = $1 AND i.accountant_id = $2`,
        [invoiceId, accountantId]
      )

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      return NextResponse.json(invoice)
    } catch (error) {
      console.error('GET /api/invoices/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const { id } = await params
      const invoiceId = parseInt(id, 10)

      if (isNaN(invoiceId)) {
        return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 })
      }

      // Check invoice exists and is not paid
      const existing = await getOne<{ id: number; status: string }>(
        'SELECT id, status FROM invoices WHERE id = $1 AND accountant_id = $2',
        [invoiceId, accountantId]
      )

      if (!existing) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      if (existing.status === 'paid') {
        return NextResponse.json({ error: 'Cannot update a paid invoice' }, { status: 400 })
      }

      const body = await req.json()
      const updates: string[] = []
      const values: (string | number | boolean)[] = []

      if (body.amount_cents !== undefined) {
        if (body.amount_cents <= 0) {
          return NextResponse.json({ error: 'amount_cents must be positive' }, { status: 400 })
        }
        values.push(body.amount_cents)
        updates.push(`amount_cents = $${values.length}`)
      }

      if (body.description !== undefined) {
        values.push(body.description || '')
        updates.push(`description = $${values.length}`)
      }

      if (body.payment_required !== undefined) {
        values.push(body.payment_required)
        updates.push(`payment_required = $${values.length}`)
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
      }

      updates.push('updated_at = NOW()')
      values.push(invoiceId)
      values.push(accountantId)

      const result = await query(
        `UPDATE invoices SET ${updates.join(', ')} WHERE id = $${values.length - 1} AND accountant_id = $${values.length}
         RETURNING id, request_id, accountant_id, client_id, amount_cents, currency, description, status, payment_required, paid_at, created_at`,
        values
      )

      return NextResponse.json(result.rows[0])
    } catch (error) {
      console.error('PATCH /api/invoices/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { id } = await params
      const invoiceId = parseInt(id, 10)

      if (isNaN(invoiceId)) {
        return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 })
      }

      const result = await query(
        `UPDATE invoices SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND accountant_id = $2 AND status != 'paid'
         RETURNING id, status`,
        [invoiceId, accountantId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invoice not found or already paid' }, { status: 404 })
      }

      return NextResponse.json({ success: true, invoice: result.rows[0] })
    } catch (error) {
      console.error('DELETE /api/invoices/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
