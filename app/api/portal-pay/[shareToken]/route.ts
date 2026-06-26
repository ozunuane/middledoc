import { NextRequest, NextResponse } from 'next/server'
import { query, getOne } from '@/lib/db'
import { initializeTransaction } from '@/lib/paystack'

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

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

    // Look up the request and associated invoice
    const invoice = await getOne<{
      id: number
      amount_cents: number
      currency: string
      description: string | null
      status: string
      payment_required: boolean
    }>(
      `SELECT i.id, i.amount_cents, i.currency, i.description, i.status, i.payment_required
       FROM invoices i
       JOIN document_requests dr ON dr.id = i.request_id
       WHERE dr.share_token = $1`,
      [shareToken]
    )

    if (!invoice) {
      return NextResponse.json({ invoice: null })
    }

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        amount_cents: invoice.amount_cents,
        currency: invoice.currency,
        description: invoice.description,
        status: invoice.status,
        payment_required: invoice.payment_required,
      },
    })
  } catch (error) {
    console.error('GET /api/portal-pay/[shareToken] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params

    if (!shareToken) {
      return NextResponse.json({ error: 'Invalid share token' }, { status: 404 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shareToken)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Get the invoice + client email for the payment
    const row = await getOne<{
      invoice_id: number
      request_id: number
      amount_cents: number
      currency: string
      status: string
      client_email: string
    }>(
      `SELECT i.id AS invoice_id, i.request_id, i.amount_cents, i.currency, i.status,
              c.email AS client_email
       FROM invoices i
       JOIN document_requests dr ON dr.id = i.request_id
       JOIN clients c ON c.id = i.client_id
       WHERE dr.share_token = $1`,
      [shareToken]
    )

    if (!row) {
      return NextResponse.json({ error: 'No invoice found for this request' }, { status: 404 })
    }

    if (row.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    if (row.status === 'cancelled') {
      return NextResponse.json({ error: 'Invoice has been cancelled' }, { status: 400 })
    }

    // Initialize Paystack transaction
    const callbackUrl = `${BASE_URL}/portal/${shareToken}?payment=callback`

    const paystackRes = await initializeTransaction({
      email: row.client_email,
      amount: row.amount_cents,
      currency: row.currency,
      callback_url: callbackUrl,
      metadata: {
        invoice_id: row.invoice_id,
        request_id: row.request_id,
      },
    })

    // Store the reference on the invoice
    await query(
      `UPDATE invoices SET paystack_reference = $1, paystack_authorization_url = $2, updated_at = NOW()
       WHERE id = $3`,
      [paystackRes.data.reference, paystackRes.data.authorization_url, row.invoice_id]
    )

    return NextResponse.json({
      authorization_url: paystackRes.data.authorization_url,
      reference: paystackRes.data.reference,
    })
  } catch (error) {
    console.error('POST /api/portal-pay/[shareToken] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
