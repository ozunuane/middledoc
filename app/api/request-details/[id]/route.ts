import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { getAccessibleClientIds, getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'

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
           dr.checklist_items,
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

      // Resolve team-based access
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      // Verify the request belongs to the owner's account
      if (row.accountant_id !== ownerAccountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // For members, verify they have access to this client
      const accessibleIds = await getAccessibleClientIds(accountantId, teamInfo.memberId ?? undefined, teamInfo.role ?? undefined)
      if (Array.isArray(accessibleIds) && !accessibleIds.includes(row.client_id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const uploadsResult = await query(
        `SELECT du.id, du.file_name, du.file_size, du.uploaded_at, du.status, du.rejection_reason, du.rejected_at,
           dc.document_category, dc.document_year, dc.confidence,
           dc.issues, dc.matched_checklist_item, dc.match_confidence,
           dc.processing_status AS classification_status,
           dc.accountant_override,
           dcl.display_name AS category_display_name
         FROM document_uploads du
         LEFT JOIN document_classifications dc ON dc.upload_id = du.id
         LEFT JOIN document_category_labels dcl ON dcl.slug = COALESCE(dc.accountant_override, dc.document_category)
         WHERE du.request_id = $1
         ORDER BY du.uploaded_at ASC`,
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
        checklist_items: row.checklist_items || [],
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
