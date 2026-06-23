import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

const VALID_STATUSES = ['pending', 'received', 'overdue', 'cancelled'] as const
type RequestStatus = (typeof VALID_STATUSES)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const { id } = await params
      const requestId = parseInt(id, 10)

      if (isNaN(requestId)) {
        return NextResponse.json({ error: 'Invalid request id' }, { status: 400 })
      }

      const body = await req.json()
      const { status } = body as { status: RequestStatus }

      if (!status || !VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        )
      }

      const existing = await query(
        'SELECT id, accountant_id FROM document_requests WHERE id = $1',
        [requestId]
      )

      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      if (existing.rows[0].accountant_id !== accountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const result = await query(
        `UPDATE document_requests
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, status, updated_at`,
        [status, requestId]
      )

      return NextResponse.json(result.rows[0])
    } catch (error) {
      console.error('PATCH /api/requests/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
