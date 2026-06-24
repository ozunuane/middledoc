import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { id } = await params
      const requestId = parseInt(id, 10)

      if (isNaN(requestId)) {
        return NextResponse.json({ error: 'Invalid request id' }, { status: 400 })
      }

      const requestResult = await query(
        `SELECT
           dr.id,
           dr.client_id,
           dr.title,
           dr.description,
           dr.due_date,
           dr.status,
           dr.share_token,
           dr.created_at,
           dr.accountant_id,
           c.name AS client_name,
           c.email AS client_email
         FROM document_requests dr
         JOIN clients c ON c.id = dr.client_id
         WHERE dr.id = $1`,
        [requestId]
      )

      if (requestResult.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      const row = requestResult.rows[0]

      if (row.accountant_id !== accountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const uploadsResult = await query(
        `SELECT id, file_name, file_size, uploaded_at, status, rejection_reason, rejected_at
         FROM document_uploads
         WHERE request_id = $1
         ORDER BY uploaded_at ASC`,
        [requestId]
      )

      return NextResponse.json({
        id: row.id,
        client_id: row.client_id,
        title: row.title,
        description: row.description,
        due_date: row.due_date,
        status: row.status,
        share_token: row.share_token,
        created_at: row.created_at,
        client: {
          name: row.client_name,
          email: row.client_email,
        },
        uploaded_files: uploadsResult.rows,
      })
    } catch (error) {
      console.error('GET /api/requests/[id]/details error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
