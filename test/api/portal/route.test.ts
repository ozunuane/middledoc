import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

import '../../db.mock'

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  }
})

import { GET } from '@/app/api/portal/[shareToken]/route'
import { POST } from '@/app/api/portal/[shareToken]/upload/route'

const SHARE_TOKEN = 'abc123-uuid-token'

function makeGetRequest(token: string): [NextRequest, { params: Promise<{ shareToken: string }> }] {
  const req = new NextRequest(`http://localhost/api/portal/${token}`)
  const ctx = { params: Promise.resolve({ shareToken: token }) }
  return [req, ctx]
}

function makeUploadRequest(
  token: string,
  fields: Record<string, string | File>
): [NextRequest, { params: Promise<{ shareToken: string }> }] {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value)
  }
  const req = new NextRequest(`http://localhost/api/portal/${token}/upload`, {
    method: 'POST',
    body: formData,
  })
  const ctx = { params: Promise.resolve({ shareToken: token }) }
  return [req, ctx]
}

function makeTestFile(name = 'receipt.pdf', size = 512): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type: 'application/pdf' })
}

beforeEach(() => {
  resetDbMocks()
  vi.clearAllMocks()
})

describe('GET /api/portal/:shareToken', () => {
  it('returns request details and file count for valid token', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            title: 'Tax docs',
            description: 'Upload W2s',
            due_date: '2099-12-31',
            status: 'pending',
            created_at: '2026-01-01',
            client_email: 'client@example.com',
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ file_count: 2 }] })

    const [req, ctx] = makeGetRequest(SHARE_TOKEN)
    const res = await GET(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.title).toBe('Tax docs')
    expect(json.uploaded_file_count).toBe(2)
    expect(json.client_email).toBe('client@example.com')
    // Should NOT expose client name
    expect(json.client_name).toBeUndefined()
  })

  it('returns 404 for invalid share token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeGetRequest('invalid-token')
    const res = await GET(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const [req, ctx] = makeGetRequest(SHARE_TOKEN)
    const res = await GET(req, ctx)
    expect(res.status).toBe(500)
  })
})

describe('POST /api/portal/:shareToken/upload', () => {
  it('uploads file via share token and returns 201 with message', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 10, client_id: 3 }] }) // resolve share token
      .mockResolvedValueOnce({
        rows: [{ id: 55, file_name: 'receipt.pdf', file_size: 512, uploaded_at: '2026-01-15' }],
      })

    const [req, ctx] = makeUploadRequest(SHARE_TOKEN, { file: makeTestFile() })
    const res = await POST(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.file_name).toBe('receipt.pdf')
    expect(json.message).toBe('File uploaded successfully')
  })

  it('returns 404 for invalid share token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeUploadRequest('bad-token', { file: makeTestFile() })
    const res = await POST(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 400 when file is missing', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 10, client_id: 3 }] })

    const [req, ctx] = makeUploadRequest(SHARE_TOKEN, {})
    const res = await POST(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 400 when file exceeds 10MB', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 10, client_id: 3 }] })

    const bigFile = makeTestFile('huge.pdf', 11 * 1024 * 1024)
    const [req, ctx] = makeUploadRequest(SHARE_TOKEN, { file: bigFile })
    const res = await POST(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 500 on database error during token lookup', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const [req, ctx] = makeUploadRequest(SHARE_TOKEN, { file: makeTestFile() })
    const res = await POST(req, ctx)
    expect(res.status).toBe(500)
  })
})
