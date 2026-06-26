import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getAccessibleClientIds, getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'

const UPLOADS_BASE = '/app/uploads'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const formData = await req.formData()
      const requestIdStr = formData.get('request_id') as string | null
      const file = formData.get('file') as File | null

      if (!requestIdStr || !file) {
        return NextResponse.json(
          { error: 'Missing required fields: request_id, file' },
          { status: 400 }
        )
      }

      const requestId = parseInt(requestIdStr, 10)
      if (isNaN(requestId)) {
        return NextResponse.json({ error: 'Invalid request_id' }, { status: 400 })
      }

      // Verify PDF
      const ext = path.extname(file.name).toLowerCase()
      if (ext !== '.pdf') {
        return NextResponse.json(
          { error: 'Only PDF files are accepted for signing' },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File exceeds maximum size of 10MB' },
          { status: 400 }
        )
      }

      // Verify ownership of the request
      const reqResult = await query(
        'SELECT id, accountant_id, client_id FROM document_requests WHERE id = $1',
        [requestId]
      )

      if (reqResult.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      const row = reqResult.rows[0]

      // Team-based access
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      if (row.accountant_id !== ownerAccountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const accessibleIds = await getAccessibleClientIds(
        accountantId,
        teamInfo.memberId ?? undefined,
        teamInfo.role ?? undefined
      )
      if (Array.isArray(accessibleIds) && !accessibleIds.includes(row.client_id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Save the PDF to disk
      const fileUuid = randomUUID()
      const safeFileName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileName = `${fileUuid}_${safeFileName}`
      const sigDir = path.join(UPLOADS_BASE, 'signatures', String(requestId))
      const absolutePath = path.join(sigDir, fileName)
      const relativePath = path.join('signatures', String(requestId), fileName)

      await mkdir(sigDir, { recursive: true })

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(absolutePath, buffer)

      // Insert signature request record
      const insertResult = await query(
        `INSERT INTO signature_requests (request_id, original_file_name, original_file_path)
         VALUES ($1, $2, $3)
         RETURNING id, request_id, original_file_name, status, created_at`,
        [requestId, file.name, relativePath]
      )

      return NextResponse.json(insertResult.rows[0], { status: 201 })
    } catch (error) {
      console.error('POST /api/signature-requests error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const { searchParams } = new URL(req.url)
      const requestIdStr = searchParams.get('request_id')

      if (!requestIdStr) {
        return NextResponse.json(
          { error: 'Missing query parameter: request_id' },
          { status: 400 }
        )
      }

      const requestId = parseInt(requestIdStr, 10)
      if (isNaN(requestId)) {
        return NextResponse.json({ error: 'Invalid request_id' }, { status: 400 })
      }

      // Verify ownership
      const reqResult = await query(
        'SELECT id, accountant_id, client_id FROM document_requests WHERE id = $1',
        [requestId]
      )

      if (reqResult.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      const row = reqResult.rows[0]

      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      if (row.accountant_id !== ownerAccountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const accessibleIds = await getAccessibleClientIds(
        accountantId,
        teamInfo.memberId ?? undefined,
        teamInfo.role ?? undefined
      )
      if (Array.isArray(accessibleIds) && !accessibleIds.includes(row.client_id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const result = await query(
        `SELECT id, request_id, original_file_name, status, signer_name, signed_at, created_at
         FROM signature_requests
         WHERE request_id = $1
         ORDER BY created_at ASC`,
        [requestId]
      )

      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/signature-requests error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
