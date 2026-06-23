import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockQuery, resetDbMocks } from '../../db.mock'

import '../../db.mock'

vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn(),
}))

import { withAuth } from '@/lib/middleware'
import { POST, GET } from '@/app/api/requests/route'

const mockWithAuth = withAuth as ReturnType<typeof vi.fn>

function makeRequest(body?: object, method = 'GET', search = ''): NextRequest {
  const url = `http://localhost/api/requests${search}`
  return new NextRequest(url, {
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

const FUTURE_DATE = '2099-12-31'
const PAST_DATE = '2000-01-01'

beforeEach(() => {
  resetDbMocks()
  vi.clearAllMocks()
})

describe('POST /api/requests', () => {
  it('creates a request and returns 201', async () => {
    authorizedHandler()
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // client ownership check
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            client_id: 3,
            title: 'Tax docs',
            due_date: FUTURE_DATE,
            status: 'pending',
            share_token: 'uuid-abc',
            created_at: '2026-01-01',
          },
        ],
      })

    const req = makeRequest(
      { client_id: 3, title: 'Tax docs', due_date: FUTURE_DATE },
      'POST'
    )
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.title).toBe('Tax docs')
    expect(json.status).toBe('pending')
    expect(json.share_token).toBe('uuid-abc')
  })

  it('returns 400 when title is missing', async () => {
    authorizedHandler()
    const req = makeRequest({ client_id: 3, due_date: FUTURE_DATE }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when due_date is in the past', async () => {
    authorizedHandler()
    const req = makeRequest({ client_id: 3, title: 'Docs', due_date: PAST_DATE }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when due_date is invalid', async () => {
    authorizedHandler()
    const req = makeRequest({ client_id: 3, title: 'Docs', due_date: 'not-a-date' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when client does not exist or is not owned', async () => {
    authorizedHandler()
    mockQuery.mockResolvedValueOnce({ rows: [] }) // client not found

    const req = makeRequest({ client_id: 99, title: 'Docs', due_date: FUTURE_DATE }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    unauthorizedHandler()
    const req = makeRequest({ client_id: 3, title: 'Docs', due_date: FUTURE_DATE }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 500 on database error', async () => {
    authorizedHandler()
    mockQuery.mockRejectedValueOnce(new Error('DB down'))
    const req = makeRequest({ client_id: 3, title: 'Docs', due_date: FUTURE_DATE }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})

describe('GET /api/requests', () => {
  it('returns list of requests for authenticated user', async () => {
    authorizedHandler()
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          client_id: 2,
          title: 'Q1 docs',
          due_date: FUTURE_DATE,
          status: 'pending',
          share_token: 'tok',
          created_at: '2026-01-01',
          file_count: 0,
        },
      ],
    })

    const req = makeRequest()
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toHaveLength(1)
    expect(json[0].file_count).toBe(0)
  })

  it('filters by status when ?status= is provided', async () => {
    authorizedHandler()
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const req = makeRequest(undefined, 'GET', '?status=pending')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const callArgs = mockQuery.mock.calls[0][1]
    expect(callArgs).toContain('pending')
  })

  it('returns 400 for invalid status filter', async () => {
    authorizedHandler()
    const req = makeRequest(undefined, 'GET', '?status=bogus')
    const res = await GET(req)
    expect(res.status).toBe(400)
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
