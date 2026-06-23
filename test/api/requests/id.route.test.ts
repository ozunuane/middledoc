import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

import '../../db.mock'

vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn(),
}))

import { withAuth } from '@/lib/middleware'
import { PATCH } from '@/app/api/requests/[id]/route'

const mockWithAuth = withAuth as ReturnType<typeof vi.fn>

function makeRequest(id: string, body?: object): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = new NextRequest(`http://localhost/api/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
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

beforeEach(() => {
  resetDbMocks()
  vi.clearAllMocks()
})

describe('PATCH /api/requests/:id', () => {
  it('updates request status to received and returns 200', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5, accountant_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ id: 5, status: 'received', updated_at: '2026-01-02T00:00:00Z' }],
      })

    const [req, ctx] = makeRequest('5', { status: 'received' })
    const res = await PATCH(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('received')
  })

  it('updates status to cancelled', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5, accountant_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ id: 5, status: 'cancelled', updated_at: '2026-01-02T00:00:00Z' }],
      })

    const [req, ctx] = makeRequest('5', { status: 'cancelled' })
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(200)
  })

  it('returns 400 for invalid status value', async () => {
    authorizedHandler(1)
    const [req, ctx] = makeRequest('5', { status: 'unknown' })
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing status', async () => {
    authorizedHandler(1)
    const [req, ctx] = makeRequest('5', {})
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-numeric id', async () => {
    authorizedHandler(1)
    const [req, ctx] = makeRequest('abc', { status: 'pending' })
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 404 when request does not exist', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('99', { status: 'pending' })
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 403 when request belongs to another accountant', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 5, accountant_id: 2 }] })

    const [req, ctx] = makeRequest('5', { status: 'pending' })
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(403)
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const [req, ctx] = makeRequest('5', { status: 'pending' })
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler(1)
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const [req, ctx] = makeRequest('5', { status: 'pending' })
    const res = await PATCH(req, ctx)
    expect(res.status).toBe(500)
  })
})
