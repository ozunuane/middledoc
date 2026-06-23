import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const UPLOADS_BASE = '/app/uploads'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const requestIdRaw = formData.get('request_id') as string | null

      if (!file || !requestIdRaw) {
        return NextResponse.json(
          { error: 'Missing required fields: file and request_id' },
          { status: 400 }
        )
      }

      const requestId = parseInt(requestIdRaw, 10)
      if (isNaN(requestId)) {
        return NextResponse.json({ error: 'Invalid request_id' }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File exceeds maximum size of 10MB' }, { status: 400 })
      }

      // Verify request ownership
      const requestResult = await query(
        'SELECT id, client_id, accountant_id FROM document_requests WHERE id = $1',
        [requestId]
      )

      if (requestResult.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      if (requestResult.rows[0].accountant_id !== accountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const clientId = requestResult.rows[0].client_id

      // Save file to filesystem
      const fileUuid = randomUUID()
      const safeFileName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_')
      const relativeDir = String(requestId)
      const fileName = `${fileUuid}_${safeFileName}`
      const absoluteDir = path.join(UPLOADS_BASE, relativeDir)
      const absolutePath = path.join(absoluteDir, fileName)
      const relativePath = path.join(relativeDir, fileName)

      await mkdir(absoluteDir, { recursive: true })

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(absolutePath, buffer)

      // Insert record — trigger will auto-update request status to 'received'
      const insertResult = await query(
        `INSERT INTO document_uploads (request_id, client_id, file_name, file_path, file_size)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, request_id, file_name, file_size, uploaded_at`,
        [requestId, clientId, file.name, relativePath, file.size]
      )

      return NextResponse.json(insertResult.rows[0], { status: 201 })
    } catch (error) {
      console.error('POST /api/upload error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const requestIdRaw = searchParams.get('request_id')

      if (!requestIdRaw) {
        return NextResponse.json({ error: 'Missing request_id query parameter' }, { status: 400 })
      }

      const requestId = parseInt(requestIdRaw, 10)
      if (isNaN(requestId)) {
        return NextResponse.json({ error: 'Invalid request_id' }, { status: 400 })
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
      console.error('GET /api/upload error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
