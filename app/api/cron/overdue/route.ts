import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all pending requests where due_date < NOW()
    const result = await query(
      `UPDATE document_requests
       SET status = 'overdue', updated_at = NOW()
       WHERE status = 'pending' AND due_date < CURRENT_DATE
       RETURNING id, title, client_id`
    )

    return NextResponse.json({
      updated: result.rowCount,
      requests: result.rows,
    })
  } catch (error) {
    console.error('GET /api/cron/overdue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
