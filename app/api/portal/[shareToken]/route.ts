import { NextRequest, NextResponse } from 'next/server'
import { query, getOne } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params

    if (!shareToken) {
      return NextResponse.json({ error: 'Invalid share token' }, { status: 404 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shareToken)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const requestResult = await query(
      `SELECT
         dr.id,
         dr.title,
         dr.description,
         dr.due_date,
         dr.status,
         dr.created_at,
         dr.checklist_items,
         c.email AS client_email,
         a.name AS accountant_name,
         a.firm_name AS accountant_firm
       FROM document_requests dr
       JOIN clients c ON c.id = dr.client_id
       JOIN accountants a ON a.id = dr.accountant_id
       WHERE dr.share_token = $1`,
      [shareToken]
    )

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const row = requestResult.rows[0]

    const countResult = await query(
      'SELECT COUNT(*)::int AS file_count FROM document_uploads WHERE request_id = $1',
      [row.id]
    )

    // Fetch invoice if one exists
    const invoice = await getOne<{
      id: number
      amount_cents: number
      currency: string
      description: string | null
      status: string
      payment_required: boolean
    }>(
      `SELECT id, amount_cents, currency, description, status, payment_required
       FROM client_invoices WHERE request_id = $1`,
      [row.id]
    )

    return NextResponse.json({
      id: row.id,
      title: row.title,
      description: row.description,
      due_date: row.due_date,
      status: row.status,
      created_at: row.created_at,
      uploaded_file_count: countResult.rows[0].file_count,
      client_email: row.client_email,
      checklist_items: row.checklist_items || [],
      accountant_name: row.accountant_name,
      accountant_firm: row.accountant_firm,
      invoice: invoice || null,
    })
  } catch (error) {
    console.error('GET /api/portal/[shareToken] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
