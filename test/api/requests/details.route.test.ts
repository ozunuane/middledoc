import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

import '../../db.mock'

vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn(),
}))

import { withAuth } from '@/lib/middleware'
import { GET } from '@/app/api/requests/[id]/details/route'

const mockWithAuth = withAuth as ReturnType<typeof vi.fn>

function makeRequest(id: string): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = new NextRequest(`http://localhost/api/requests/${id}/details`)
  const ctx = { params: Promise.resolve({ id }) }
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

const MOCK_ROW = {
  id: 10,
  client_id: 3,
  title: 'Tax docs',
  description: 'Please upload W2s',
  due_date: '2099-12-31',
  status: 'pending',
  share_token: 'uuid-abc',
  created_at: '2026-01-01',
  accountant_id: 1,
  client_name: 'Alice',
  client_email: 'alice@example.com',
}

beforeEach(() => {
  resetDbMocks()
  vi.clearAllMocks()
})

describe('GET /api/requests/:id/details', () => {
  it('returns full request with client and uploaded files', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [MOCK_ROW] })
      .mockResolvedValueOnce({
        rows: [{ id: 1, file_name: 'w2.pdf', file_size: 12345, uploaded_at: '2026-01-10' }],
      })

    const [req, ctx] = makeRequest('10')
    const res = await GET(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.id).toBe(10)
    expect(json.client.name).toBe('Alice')
    expect(json.client.email).toBe('alice@example.com')
    expect(json.uploaded_files).toHaveLength(1)
    expect(json.uploaded_files[0].file_name).toBe('w2.pdf')
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
    mockQuery.mockResolvedValueOnce({ rows: [{ ...MOCK_ROW, accountant_id: 2 }] })

    const [req, ctx] = makeRequest('10')
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
    const [req, ctx] = makeRequest('10')
    const res = await GET(req, ctx)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler(1)
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const [req, ctx] = makeRequest('10')
    const res = await GET(req, ctx)
    expect(res.status).toBe(500)
  })
})
