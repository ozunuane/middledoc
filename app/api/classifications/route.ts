import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getMany } from '@/lib/db'
import { getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const requestId = req.nextUrl.searchParams.get('request_id')

      if (!requestId) {
        return NextResponse.json({ error: 'Missing request_id parameter' }, { status: 400 })
      }

      const reqId = parseInt(requestId, 10)
      if (isNaN(reqId)) {
        return NextResponse.json({ error: 'Invalid request_id' }, { status: 400 })
      }

      // Verify ownership
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      const ownerCheck = await query(
        'SELECT id FROM document_requests WHERE id = $1 AND accountant_id = $2',
        [reqId, ownerAccountantId]
      )
      if (ownerCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      const classifications = await getMany(
        `SELECT
           du.id AS upload_id,
           du.file_name,
           du.file_size,
           du.uploaded_at,
           dc.id AS classification_id,
           dc.document_category,
           dc.document_year,
           dc.confidence,
           dc.issues,
           dc.matched_checklist_item,
           dc.match_confidence,
           dc.processing_status,
           dc.processing_error,
           dc.accountant_override,
           dc.confirmed_at,
           dcl.display_name AS category_display_name
         FROM document_uploads du
         LEFT JOIN document_classifications dc ON dc.upload_id = du.id
         LEFT JOIN document_category_labels dcl ON dcl.slug = COALESCE(dc.accountant_override, dc.document_category)
         WHERE du.request_id = $1
         ORDER BY du.uploaded_at ASC`,
        [reqId]
      )

      return NextResponse.json(classifications)
    } catch (error) {
      console.error('GET /api/classifications error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { upload_id, override_category } = body

      if (!upload_id) {
        return NextResponse.json({ error: 'Missing upload_id' }, { status: 400 })
      }

      // Verify the upload belongs to an accountant-owned request
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      const ownerCheck = await query(
        `SELECT du.id FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         WHERE du.id = $1 AND dr.accountant_id = $2`,
        [upload_id, ownerAccountantId]
      )
      if (ownerCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
      }

      if (override_category) {
        // Override category
        await query(
          `UPDATE document_classifications
           SET accountant_override = $2, confirmed_at = NOW()
           WHERE upload_id = $1`,
          [upload_id, override_category]
        )
      } else {
        // Confirm existing classification
        await query(
          `UPDATE document_classifications
           SET confirmed_at = NOW()
           WHERE upload_id = $1`,
          [upload_id]
        )
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('PATCH /api/classifications error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
