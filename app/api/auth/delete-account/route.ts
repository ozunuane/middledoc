import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getMany } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

const UPLOADS_BASE = '/app/uploads'

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()

      if (body.confirm !== 'DELETE') {
        return NextResponse.json(
          { error: 'You must confirm deletion by sending { "confirm": "DELETE" }' },
          { status: 400 }
        )
      }

      // 1. Find all uploaded files to delete from disk
      const files = await getMany<{ file_path: string }>(
        `SELECT du.file_path
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         WHERE dr.accountant_id = $1`,
        [accountantId]
      )

      // 2. Best-effort deletion of files from disk
      for (const file of files) {
        try {
          const absolutePath = path.join(UPLOADS_BASE, file.file_path)
          await unlink(absolutePath)
        } catch {
          // File may already be missing — continue
        }
      }

      // 3. Delete the accountant record (CASCADE handles clients, requests, uploads, etc.)
      await query('DELETE FROM accountants WHERE id = $1', [accountantId])

      // 4. Clear the auth cookie
      const response = NextResponse.json({ success: true, message: 'Account deleted permanently.' })
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })

      return response
    } catch (error) {
      console.error('DELETE /api/auth/delete-account error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
