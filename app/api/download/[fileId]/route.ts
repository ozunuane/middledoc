import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne } from '@/lib/db'
import { getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    const { fileId } = await params
    const id = parseInt(fileId, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })

    // Get file with ownership check
    const teamInfo = await getUserTeamInfo(accountantId)
    const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

    const file = await getOne<{ id: number; file_name: string; file_path: string; file_size: number }>(
      `SELECT du.id, du.file_name, du.file_path, du.file_size
       FROM document_uploads du
       JOIN document_requests dr ON dr.id = du.request_id
       WHERE du.id = $1 AND dr.accountant_id = $2`,
      [id, ownerAccountantId]
    )

    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })

    try {
      const UPLOADS_BASE = process.env.FILE_UPLOAD_DIR || '/app/uploads'
      const filePath = path.resolve(file.file_path)
      const uploadsBase = path.resolve(UPLOADS_BASE)
      if (!filePath.startsWith(uploadsBase)) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
      }
      const buffer = await readFile(filePath)

      const ext = path.extname(file.file_name).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.csv': 'text/csv', '.txt': 'text/plain',
      }

      const safeName = file.file_name.replace(/["\r\n\\]/g, '_')
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${safeName}"`,
          'Content-Length': String(buffer.length),
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }
  })
}
