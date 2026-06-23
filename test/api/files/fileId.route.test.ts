import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

import '../../db.mock'

vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn(),
}))

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    unlink: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  }
})

import { withAuth } from '@/lib/middleware'
import { GET, DELETE } from '@/app/api/files/[fileId]/route'

const mockWithAuth = withAuth as ReturnType<typeof vi.fn>

function makeRequest(
  fileId: string,
  method = 'GET'
): [NextRequest, { params: Promise<{ fileId: string }> }] {
  const req = new NextRequest(`http://localhost/api/files/${fileId}`, { method })
  const ctx = { params: Promise.resolve({ fileId }) }
  return [req, ctx]
}

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

beforeEach(() => {
  resetDbMocks()
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// GET /api/files/:requestId — list files for a request
// ---------------------------------------------------------------------------

describe('GET /api/files/:requestId', () => {
  it('returns list of files for a request', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5, accountant_id: 1 }] }) // request ownership
      .mockResolvedValueOnce({
        rows: [
          { id: 1, file_name: 'w2.pdf', file_size: 5000, uploaded_at: '2026-01-10' },
          { id: 2, file_name: '1099.pdf', file_size: 3000, uploaded_at: '2026-01-11' },
        ],
      })

    const [req, ctx] = makeRequest('5')
    const res = await GET(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toHaveLength(2)
    expect(json[0].file_name).toBe('w2.pdf')
  })

  it('returns empty array when no files uploaded yet', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5, accountant_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('5')
    const res = await GET(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual([])
  })

  it('returns 404 when request does not exist', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('99')
    const res = await GET(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 403 when request belongs to another accountant', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 5, accountant_id: 2 }] })

    const [req, ctx] = makeRequest('5')
    const res = await GET(req, ctx)
    expect(res.status).toBe(403)
  })

  it('returns 400 for non-numeric id', async () => {
    authorizedHandler(1)
    const [req, ctx] = makeRequest('xyz')
    const res = await GET(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const [req, ctx] = makeRequest('5')
    const res = await GET(req, ctx)
    expect(res.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/files/:fileId
// ---------------------------------------------------------------------------

describe('DELETE /api/files/:fileId', () => {
  it('deletes a file and returns 200', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 42, file_path: '5/uuid_test.pdf', accountant_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('42', 'DELETE')
    const res = await DELETE(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.message).toMatch(/deleted/i)
  })

  it('returns 404 when file does not exist', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('99', 'DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 403 when file belongs to another accountant', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 42, file_path: '5/uuid_test.pdf', accountant_id: 2 }] })

    const [req, ctx] = makeRequest('42', 'DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(403)
  })

  it('returns 400 for non-numeric fileId', async () => {
    authorizedHandler(1)
    const [req, ctx] = makeRequest('xyz', 'DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 200 even if filesystem unlink fails (file already gone)', async () => {
    const { unlink } = await import('fs/promises')
    vi.mocked(unlink).mockRejectedValueOnce(new Error('ENOENT'))

    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 42, file_path: '5/uuid_test.pdf', accountant_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('42', 'DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(200)
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const [req, ctx] = makeRequest('42', 'DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler(1)
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const [req, ctx] = makeRequest('42', 'DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(500)
  })
})
