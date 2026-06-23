import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const UPLOADS_BASE = '/app/uploads'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params

    if (!shareToken) {
      return NextResponse.json({ error: 'Invalid share token' }, { status: 404 })
    }

    // Resolve request via share token (no auth required)
    const requestResult = await query(
      'SELECT id, client_id FROM document_requests WHERE share_token = $1',
      [shareToken]
    )

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const { id: requestId, client_id: clientId } = requestResult.rows[0]

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Missing required field: file' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum size of 10MB' }, { status: 400 })
    }

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

    // Insert record — trigger auto-updates request status to 'received'
    const insertResult = await query(
      `INSERT INTO document_uploads (request_id, client_id, file_name, file_path, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, file_name, file_size, uploaded_at`,
      [requestId, clientId, file.name, relativePath, file.size]
    )

    return NextResponse.json(
      {
        ...insertResult.rows[0],
        message: 'File uploaded successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/portal/[shareToken]/upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
