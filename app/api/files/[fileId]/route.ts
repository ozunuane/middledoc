import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

const UPLOADS_BASE = '/app/uploads'

/**
 * GET /api/files/:fileId
 * List all files for the given request id (fileId param is treated as request_id here).
 * This matches the spec: GET /api/files/:requestId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { fileId } = await params
      const requestId = parseInt(fileId, 10)

      if (isNaN(requestId)) {
        return NextResponse.json({ error: 'Invalid request id' }, { status: 400 })
      }

      const requestResult = await query(
        'SELECT id, accountant_id FROM document_requests WHERE id = $1',
        [requestId]
      )

      if (requestResult.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      if (requestResult.rows[0].accountant_id !== accountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const result = await query(
        `SELECT id, file_name, file_size, uploaded_at
         FROM document_uploads
         WHERE request_id = $1
         ORDER BY uploaded_at ASC`,
        [requestId]
      )

      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/files/[fileId] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

/**
 * DELETE /api/files/:fileId
 * Delete a specific uploaded file by its record id.
 * Validates ownership via file -> document_request -> accountant chain.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { fileId } = await params
      const fileIdInt = parseInt(fileId, 10)

      if (isNaN(fileIdInt)) {
        return NextResponse.json({ error: 'Invalid file id' }, { status: 400 })
      }

      // Join through to document_requests to verify ownership
      const fileResult = await query(
        `SELECT du.id, du.file_path, dr.accountant_id
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         WHERE du.id = $1`,
        [fileIdInt]
      )

      if (fileResult.rows.length === 0) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      if (fileResult.rows[0].accountant_id !== accountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const filePath = fileResult.rows[0].file_path
      const absolutePath = path.join(UPLOADS_BASE, filePath)

      // Delete from database first
      await query('DELETE FROM document_uploads WHERE id = $1', [fileIdInt])

      // Best-effort filesystem deletion — don't fail if file is already missing
      try {
        await unlink(absolutePath)
      } catch (fsError) {
        console.warn('DELETE /api/files/[fileId]: filesystem delete failed (file may be missing):', fsError)
      }

      return NextResponse.json({ message: 'File deleted successfully' })
    } catch (error) {
      console.error('DELETE /api/files/[fileId] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
