import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getMany } from '@/lib/db'
import { deleteFile, filePathToKey } from '@/lib/storage'

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

      // 1. Find all uploaded files to delete from storage
      const files = await getMany<{ file_path: string }>(
        `SELECT du.file_path
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         WHERE dr.accountant_id = $1`,
        [accountantId]
      )

      // 2. Also find signature files
      const sigFiles = await getMany<{ original_file_path: string; signed_file_path: string | null }>(
        `SELECT sr.original_file_path, sr.signed_file_path
         FROM signature_requests sr
         JOIN document_requests dr ON dr.id = sr.request_id
         WHERE dr.accountant_id = $1`,
        [accountantId]
      )

      // 3. Best-effort deletion of files from storage
      for (const file of files) {
        try {
          const key = filePathToKey(file.file_path)
          await deleteFile(key)
        } catch {
          // File may already be missing — continue
        }
      }

      for (const sig of sigFiles) {
        try {
          await deleteFile(filePathToKey(sig.original_file_path))
          if (sig.signed_file_path) {
            await deleteFile(filePathToKey(sig.signed_file_path))
          }
        } catch {
          // Continue
        }
      }

      // 4. Delete the accountant record (CASCADE handles clients, requests, uploads, etc.)
      await query('DELETE FROM accountants WHERE id = $1', [accountantId])

      // 5. Clear the auth cookie
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
