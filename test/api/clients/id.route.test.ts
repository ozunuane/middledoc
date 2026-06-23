import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

import '../../db.mock'

vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn(),
}))

import { withAuth } from '@/lib/middleware'
import { DELETE } from '@/app/api/clients/[id]/route'

const mockWithAuth = withAuth as ReturnType<typeof vi.fn>

function makeRequest(id: string): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = new NextRequest(`http://localhost/api/clients/${id}`, { method: 'DELETE' })
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

describe('DELETE /api/clients/:id', () => {
  it('deletes a client and returns 200', async () => {
    authorizedHandler(1)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 7, accountant_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('7')
    const res = await DELETE(req, ctx)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.message).toMatch(/deleted/i)
  })

  it('returns 404 when client does not exist', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const [req, ctx] = makeRequest('99')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 403 when client belongs to another accountant', async () => {
    authorizedHandler(1)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 7, accountant_id: 2 }] })

    const [req, ctx] = makeRequest('7')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(403)
  })

  it('returns 400 for non-numeric id', async () => {
    authorizedHandler(1)
    const [req, ctx] = makeRequest('abc')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const [req, ctx] = makeRequest('7')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler(1)
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const [req, ctx] = makeRequest('7')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(500)
  })
})
