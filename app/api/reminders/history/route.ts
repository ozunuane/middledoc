import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const requestId = req.nextUrl.searchParams.get('request_id')

      if (!requestId) {
        return NextResponse.json(
          { error: 'Missing required query parameter: request_id' },
          { status: 400 }
        )
      }

      const parsedId = parseInt(requestId, 10)
      if (isNaN(parsedId)) {
        return NextResponse.json(
          { error: 'request_id must be a number' },
          { status: 400 }
        )
      }

      // Verify the accountant owns this request
      const result = await query(
        `SELECT er.id, er.reminder_type, er.sent_at
         FROM email_reminders er
         JOIN document_requests dr ON dr.id = er.request_id
         WHERE er.request_id = $1
           AND dr.accountant_id = $2
         ORDER BY er.sent_at DESC`,
        [parsedId, accountantId]
      )

      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/reminders/history error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
