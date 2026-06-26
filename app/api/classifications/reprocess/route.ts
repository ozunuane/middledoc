import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'
import { getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'
import { classifyDocument } from '@/lib/ai-classify'
import path from 'path'

const UPLOADS_BASE = '/app/uploads'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { upload_id } = body

      if (!upload_id) {
        return NextResponse.json({ error: 'Missing upload_id' }, { status: 400 })
      }

      // Verify ownership
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      const upload = await getOne<{
        id: number
        file_name: string
        file_path: string
        request_id: number
      }>(
        `SELECT du.id, du.file_name, du.file_path, du.request_id
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         WHERE du.id = $1 AND dr.accountant_id = $2`,
        [upload_id, ownerAccountantId]
      )

      if (!upload) {
        return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
      }

      // Get checklist items for context
      const requestData = await getOne<{ checklist_items: string[] }>(
        'SELECT checklist_items FROM document_requests WHERE id = $1',
        [upload.request_id]
      )

      const absolutePath = path.join(UPLOADS_BASE, upload.file_path)

      // Trigger re-classification (non-blocking)
      void classifyDocument(
        upload.id,
        absolutePath,
        upload.file_name,
        requestData?.checklist_items || []
      )

      return NextResponse.json({ success: true, message: 'Reprocessing started' })
    } catch (error) {
      console.error('POST /api/classifications/reprocess error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
