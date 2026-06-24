import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { ids } = body

      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: 'Request body must contain a non-empty array of ids' },
          { status: 400 }
        )
      }

      // Validate all ids are integers
      const parsedIds = ids.map((id: unknown) => {
        const parsed = Number(id)
        if (!Number.isInteger(parsed) || parsed < 1) return null
        return parsed
      })

      if (parsedIds.includes(null)) {
        return NextResponse.json(
          { error: 'All ids must be positive integers' },
          { status: 400 }
        )
      }

      // Fetch uploads and verify ownership through the request -> accountant chain
      const validIds = parsedIds.filter((id): id is number => id !== null)
      const placeholders = validIds.map((_: number, i: number) => `$${i + 2}`).join(', ')
      const uploads = await query(
        `SELECT du.id, du.file_path
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         WHERE dr.accountant_id = $1 AND du.id IN (${placeholders})`,
        [accountantId, ...validIds]
      )

      if (uploads.rows.length !== validIds.length) {
        return NextResponse.json(
          { error: 'One or more documents not found or do not belong to you' },
          { status: 403 }
        )
      }

      // Delete files from filesystem (best effort -- log failures but continue)
      for (const row of uploads.rows) {
        try {
          const filePath = path.resolve(row.file_path)
          await unlink(filePath)
        } catch (fsError) {
          // File may already be missing; log and continue
          console.warn(`Failed to delete file ${row.file_path}:`, fsError)
        }
      }

      // Delete records from database
      const result = await query(
        `DELETE FROM document_uploads WHERE id IN (${placeholders})`,
        [...parsedIds]
      )

      return NextResponse.json({ deleted: result.rowCount })
    } catch (error) {
      console.error('POST /api/documents/bulk-delete error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
