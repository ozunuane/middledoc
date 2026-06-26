import { NextRequest, NextResponse } from 'next/server'
import { getOne, query } from '@/lib/db'
import { verifyTransaction } from '@/lib/paystack'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params
    const reference = request.nextUrl.searchParams.get('reference')

    if (!shareToken || !reference) {
      return NextResponse.json({ error: 'Missing share token or reference' }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shareToken)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Verify with Paystack
    const paystackRes = await verifyTransaction(reference)

    if (paystackRes.data.status !== 'success') {
      return NextResponse.json({ status: 'failed', message: 'Payment was not successful' }, { status: 400 })
    }

    // Find the invoice by the reference
    const invoice = await getOne<{ id: number; status: string }>(
      `SELECT i.id, i.status
       FROM client_invoices i
       JOIN document_requests dr ON dr.id = i.request_id
       WHERE dr.share_token = $1 AND i.paystack_reference = $2`,
      [shareToken, reference]
    )

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found for this reference' }, { status: 404 })
    }

    // Update invoice to paid if not already
    if (invoice.status !== 'paid') {
      await query(
        `UPDATE client_invoices SET status = 'paid', paid_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [invoice.id]
      )
    }

    return NextResponse.json({ status: 'paid' })
  } catch (error) {
    console.error('GET /api/portal-pay/[shareToken]/verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
