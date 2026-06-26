import { NextRequest, NextResponse } from 'next/server'
import { query, getOne } from '@/lib/db'
import { embedSignatureInPdf } from '@/lib/pdf-sign'
import { randomUUID } from 'crypto'
import path from 'path'
import { readFile } from 'fs/promises'

const UPLOADS_BASE = '/app/uploads'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params

    if (!shareToken) {
      return NextResponse.json({ error: 'Invalid share token' }, { status: 404 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shareToken)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Look up the document request by share token
    const requestResult = await query(
      'SELECT id FROM document_requests WHERE share_token = $1',
      [shareToken]
    )

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const requestId = requestResult.rows[0].id

    // Check if this is a preview request for a specific signature request
    const { searchParams } = new URL(request.url)
    const previewId = searchParams.get('preview')

    if (previewId) {
      const sigId = parseInt(previewId, 10)
      if (isNaN(sigId)) {
        return NextResponse.json({ error: 'Invalid preview id' }, { status: 400 })
      }

      const sigResult = await query(
        `SELECT original_file_path FROM signature_requests
         WHERE id = $1 AND request_id = $2`,
        [sigId, requestId]
      )

      if (sigResult.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      const filePath = path.join(UPLOADS_BASE, sigResult.rows[0].original_file_path)
      const fileBuffer = await readFile(filePath)

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Cache-Control': 'no-store',
        },
      })
    }

    // Return list of signature requests for this document request
    const sigResult = await query(
      `SELECT id, original_file_name, status, signer_name, signed_at, created_at
       FROM signature_requests
       WHERE request_id = $1
       ORDER BY created_at ASC`,
      [requestId]
    )

    return NextResponse.json(sigResult.rows)
  } catch (error) {
    console.error('GET /api/portal-sign/[shareToken] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params

    if (!shareToken) {
      return NextResponse.json({ error: 'Invalid share token' }, { status: 404 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shareToken)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Resolve request
    const requestResult = await query(
      'SELECT id FROM document_requests WHERE share_token = $1',
      [shareToken]
    )

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const requestId = requestResult.rows[0].id

    // Parse body
    const body = await request.json()
    const { signature_request_id, signature_data, signer_name } = body

    if (!signature_request_id || !signature_data || !signer_name) {
      return NextResponse.json(
        { error: 'Missing required fields: signature_request_id, signature_data, signer_name' },
        { status: 400 }
      )
    }

    // Validate the signature request belongs to this document request and is pending
    const sigResult = await query(
      `SELECT id, original_file_path, original_file_name, status
       FROM signature_requests
       WHERE id = $1 AND request_id = $2`,
      [signature_request_id, requestId]
    )

    if (sigResult.rows.length === 0) {
      return NextResponse.json({ error: 'Signature request not found' }, { status: 404 })
    }

    const sigReq = sigResult.rows[0]

    if (sigReq.status === 'signed') {
      return NextResponse.json({ error: 'Document has already been signed' }, { status: 400 })
    }

    // Build paths
    const originalPath = path.join(UPLOADS_BASE, sigReq.original_file_path)
    const signedFileName = `signed_${randomUUID()}.pdf`
    const signedRelDir = path.join('signatures', String(requestId), 'signed')
    const signedRelPath = path.join(signedRelDir, signedFileName)
    const signedAbsPath = path.join(UPLOADS_BASE, signedRelPath)

    // Capture IP and user agent
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Look up signer email from client associated with the document request
    const clientInfo = await getOne<{ email: string }>(
      `SELECT c.email FROM clients c
       JOIN document_requests dr ON dr.client_id = c.id
       WHERE dr.id = $1`,
      [requestId]
    )
    const signerEmail = clientInfo?.email || 'unknown'

    // Generate unique signature event ID
    const signatureEventId = randomUUID()

    // Embed signature into PDF
    await embedSignatureInPdf(originalPath, signature_data, signer_name.trim(), signedAbsPath)

    // Update signature request record
    await query(
      `UPDATE signature_requests
       SET status = 'signed',
           signed_file_path = $1,
           signer_name = $2,
           signed_at = CURRENT_TIMESTAMP,
           signer_ip = $3,
           signer_user_agent = $4,
           signer_email = $5,
           signature_event_id = $6
       WHERE id = $7`,
      [signedRelPath, signer_name.trim(), ip, userAgent, signerEmail, signatureEventId, signature_request_id]
    )

    // Insert audit log entry
    await query(
      `INSERT INTO signature_audit_log (signature_request_id, event, ip_address, user_agent, signature_event_id)
       VALUES ($1, 'signed', $2, $3, $4)`,
      [signature_request_id, ip, userAgent, signatureEventId]
    )

    return NextResponse.json({ success: true, status: 'signed' })
  } catch (error) {
    console.error('POST /api/portal-sign/[shareToken] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
