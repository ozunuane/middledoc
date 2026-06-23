import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

import '../../db.mock'

vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn(),
}))

// Mock fs/promises so tests don't touch the filesystem
vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  }
})

import { withAuth } from '@/lib/middleware'
import { POST } from '@/app/api/upload/route'

const mockWithAuth = withAuth as ReturnType<typeof vi.fn>

function authorizedHandler(accountantId = 1) {
  mockWithAuth.mockImplementation((_req: NextRequest, handler: (r: NextRequest, id: number) => Promise<Response>) =>
    handler(_req, accountantId)
  )
}

function unauthorizedHandler() {
  mockWithAuth.mockResolvedValue(
    new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  )
}

function makeFileRequest(fields: Record<string, string | File>): NextRequest {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value)
  }
  return new NextRequest('http://localhost/api/upload', { method: 'POST', body: formData })
}

function makeTestFile(name = 'test.pdf', size = 1024): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type: 'application/pdf' })
}

beforeEach(() => {
  resetDbMocks()
  vi.clearAllMocks()
})

describe('POST /api/upload', () => {
  it('uploads a file and returns 201', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5, client_id: 3, accountant_id: 1 }] }) // request lookup
      .mockResolvedValueOnce({
        rows: [{ id: 42, request_id: 5, file_name: 'test.pdf', file_size: 1024, uploaded_at: '2026-01-10' }],
      })

    const req = makeFileRequest({ file: makeTestFile(), request_id: '5' })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.file_name).toBe('test.pdf')
    expect(json.file_size).toBe(1024)
  })

  it('returns 400 when file is missing', async () => {
    authorizedHandler(1)
    const req = makeFileRequest({ request_id: '5' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when request_id is missing', async () => {
    authorizedHandler(1)
    const req = makeFileRequest({ file: makeTestFile() })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when request_id is not a number', async () => {
    authorizedHandler(1)
    const req = makeFileRequest({ file: makeTestFile(), request_id: 'abc' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when file exceeds 10MB', async () => {
    authorizedHandler(1)
    const bigFile = makeTestFile('big.pdf', 11 * 1024 * 1024)
    const req = makeFileRequest({ file: bigFile, request_id: '5' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when request does not exist', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const req = makeFileRequest({ file: makeTestFile(), request_id: '99' })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns 403 when request belongs to another accountant', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 5, client_id: 3, accountant_id: 2 }] })

    const req = makeFileRequest({ file: makeTestFile(), request_id: '5' })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const req = makeFileRequest({ file: makeTestFile(), request_id: '5' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler(1)
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const req = makeFileRequest({ file: makeTestFile(), request_id: '5' })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
