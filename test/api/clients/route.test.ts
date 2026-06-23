import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

// db mock must be imported before the route modules
import '../../db.mock'

// Mock middleware so withAuth can be controlled per-test
vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn(),
}))

import { withAuth } from '@/lib/middleware'
import { POST, GET } from '@/app/api/clients/route'

const mockWithAuth = withAuth as ReturnType<typeof vi.fn>

function makeRequest(body?: object, method = 'GET'): NextRequest {
  return new NextRequest('http://localhost/api/clients', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
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

describe('POST /api/clients', () => {
  it('creates a client and returns 201', async () => {
    authorizedHandler()
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // no existing client
      .mockResolvedValueOnce({
        rows: [{ id: 1, email: 'client@example.com', name: 'Alice', created_at: '2026-01-01' }],
      })

    const req = makeRequest({ email: 'client@example.com', name: 'Alice' }, 'POST')
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.email).toBe('client@example.com')
    expect(json.name).toBe('Alice')
  })

  it('returns 400 when email is missing', async () => {
    authorizedHandler()
    const req = makeRequest({ name: 'Alice' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when name is missing', async () => {
    authorizedHandler()
    const req = makeRequest({ email: 'client@example.com' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email format', async () => {
    authorizedHandler()
    const req = makeRequest({ email: 'not-an-email', name: 'Alice' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 409 when email already exists for this accountant', async () => {
    authorizedHandler()
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 5 }] }) // existing client found

    const req = makeRequest({ email: 'client@example.com', name: 'Alice' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const req = makeRequest({ email: 'client@example.com', name: 'Alice' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler()
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const req = makeRequest({ email: 'client@example.com', name: 'Alice' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})

describe('GET /api/clients', () => {
  it('returns list of clients for authenticated user', async () => {
    authorizedHandler()
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 1, email: 'a@example.com', name: 'A', created_at: '2026-01-01' },
        { id: 2, email: 'b@example.com', name: 'B', created_at: '2026-01-02' },
      ],
    })

    const req = makeRequest()
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toHaveLength(2)
    expect(json[0].email).toBe('a@example.com')
  })

  it('returns empty array when no clients exist', async () => {
    authorizedHandler()
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const req = makeRequest()
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual([])
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler()
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
