import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { readFile } from 'fs/promises'
import path from 'path'
import { getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'

const UPLOADS_BASE = '/app/uploads'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { id } = await params
      const sigId = parseInt(id, 10)

      if (isNaN(sigId)) {
        return NextResponse.json({ error: 'Invalid signature request id' }, { status: 400 })
      }

      // Fetch signature request and verify ownership via the parent document_request
      const result = await query(
        `SELECT sr.id, sr.original_file_name, sr.original_file_path, sr.signed_file_path, sr.status,
                dr.accountant_id
         FROM signature_requests sr
         JOIN document_requests dr ON dr.id = sr.request_id
         WHERE sr.id = $1`,
        [sigId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Signature request not found' }, { status: 404 })
      }

      const row = result.rows[0]

      // Team-based access
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      if (row.accountant_id !== ownerAccountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Determine which file to serve
      const filePath = row.status === 'signed' && row.signed_file_path
        ? path.join(UPLOADS_BASE, row.signed_file_path)
        : path.join(UPLOADS_BASE, row.original_file_path)

      const fileBuffer = await readFile(filePath)
      const fileName = row.status === 'signed'
        ? `signed_${row.original_file_name}`
        : row.original_file_name

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': String(fileBuffer.byteLength),
        },
      })
    } catch (error) {
      console.error('GET /api/signature-requests/[id]/download error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
