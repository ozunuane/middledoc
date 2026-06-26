import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { getAccessibleClientIds, getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'
import { logActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { client_id, title, description, due_date, checklist_items, fee_amount, fee_currency, fee_description, fee_payment_required } = body

      if (!client_id || !title || !due_date) {
        return NextResponse.json(
          { error: 'Missing required fields: client_id, title, due_date' },
          { status: 400 }
        )
      }

      const dueDateObj = new Date(due_date)
      if (isNaN(dueDateObj.getTime())) {
        return NextResponse.json({ error: 'Invalid due_date format' }, { status: 400 })
      }
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dueDateObj < today) {
        return NextResponse.json({ error: 'due_date must be a future date' }, { status: 400 })
      }

      const clientResult = await query(
        'SELECT id FROM clients WHERE id = $1 AND accountant_id = $2',
        [client_id, accountantId]
      )
      if (clientResult.rows.length === 0) {
        return NextResponse.json({ error: 'Client not found or not owned by user' }, { status: 404 })
      }

      const sanitizedChecklist = Array.isArray(checklist_items)
        ? checklist_items.filter((item: unknown) => typeof item === 'string' && item.trim().length > 0)
        : []

      const result = await query(
        `INSERT INTO document_requests (accountant_id, client_id, title, description, due_date, checklist_items)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, client_id, title, due_date, status, share_token, created_at, checklist_items`,
        [accountantId, client_id, title, description ?? null, due_date, sanitizedChecklist]
      )

      const newRequest = result.rows[0]
      await logActivity(accountantId, 'created', 'request', newRequest.id, { title: newRequest.title })

      // Create invoice if fee is provided
      if (fee_amount && fee_amount > 0) {
        const invoiceResult = await query(
          `INSERT INTO invoices (request_id, accountant_id, client_id, amount_cents, currency, description, payment_required)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, amount_cents, status`,
          [newRequest.id, accountantId, client_id, fee_amount, fee_currency || 'USD', fee_description || '', fee_payment_required || false]
        )
        newRequest.invoice = invoiceResult.rows[0] || null
      }

      return NextResponse.json(newRequest, { status: 201 })
    } catch (error) {
      console.error('POST /api/requests error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const statusFilter = searchParams.get('status')
      const sortParam = searchParams.get('sort')

      // Resolve team-based access
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)
      const accessibleIds = await getAccessibleClientIds(accountantId, teamInfo.memberId ?? undefined, teamInfo.role ?? undefined)

      // If member has no accessible clients, return empty
      if (Array.isArray(accessibleIds) && accessibleIds.length === 0) {
        const pageParam = searchParams.get('page')
        if (pageParam) {
          return NextResponse.json({ data: [], total: 0, page: 1, limit: 50, totalPages: 0 })
        }
        return NextResponse.json([])
      }

      const validStatuses = ['pending', 'received', 'overdue', 'cancelled']
      if (statusFilter && !validStatuses.includes(statusFilter)) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
      }

      const validSorts: Record<string, string> = {
        due_date: 'dr.due_date',
        created_at: 'dr.created_at',
      }
      const orderBy = sortParam && validSorts[sortParam] ? validSorts[sortParam] : 'dr.created_at'

      const pageParam = searchParams.get('page')
      const limitParam = searchParams.get('limit')

      const conditions: string[] = ['dr.accountant_id = $1']
      const values: (string | number)[] = [ownerAccountantId]

      // Filter by accessible client IDs for members
      if (Array.isArray(accessibleIds)) {
        const placeholders = accessibleIds.map((id) => {
          values.push(id)
          return `$${values.length}`
        })
        conditions.push(`dr.client_id IN (${placeholders.join(',')})`)
      }

      if (statusFilter) {
        values.push(statusFilter)
        conditions.push(`dr.status = $${values.length}`)
      }

      const whereClause = conditions.join(' AND ')

      const selectQuery = `
        SELECT
           dr.id,
           dr.client_id,
           dr.title,
           dr.due_date,
           dr.status,
           dr.share_token,
           dr.created_at,
           COUNT(du.id)::int AS file_count
         FROM document_requests dr
         LEFT JOIN document_uploads du ON du.request_id = dr.id
         WHERE ${whereClause}
         GROUP BY dr.id
         ORDER BY ${orderBy} ASC`

      // If page is provided, return paginated response
      if (pageParam) {
        const page = Math.max(1, parseInt(pageParam, 10) || 1)
        const limit = Math.min(200, Math.max(1, parseInt(limitParam ?? '50', 10) || 50))
        const offset = (page - 1) * limit

        const countResult = await query(
          `SELECT COUNT(*) FROM document_requests dr WHERE ${whereClause}`,
          values
        )
        const total = parseInt(countResult.rows[0].count, 10)
        const totalPages = Math.ceil(total / limit)

        const dataValues = [...values, limit, offset]
        const result = await query(
          `${selectQuery} LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
          dataValues
        )

        return NextResponse.json({
          data: result.rows,
          total,
          page,
          limit,
          totalPages,
        })
      }

      // Backward compatible: return plain array with default limit
      const dataValues = [...values, 200]
      const result = await query(
        `${selectQuery} LIMIT $${dataValues.length}`,
        dataValues
      )

      return NextResponse.json(result.rows)
    } catch (error) {
      console.error('GET /api/requests error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
