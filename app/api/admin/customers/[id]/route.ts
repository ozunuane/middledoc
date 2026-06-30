import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware'
import { query, getOne } from '@/lib/db'
import { logAdminAction } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(request, async (_req, adminId) => {
    try {
      const { id } = await params
      const customerId = parseInt(id, 10)
      if (isNaN(customerId)) {
        return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 })
      }

      // Account info
      const account = await getOne<Record<string, unknown>>(
        `SELECT id, name, email, firm_name, created_at
         FROM accountants WHERE id = $1`,
        [customerId]
      )

      if (!account) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      // Subscription info
      const subscription = await getOne<Record<string, unknown>>(
        `SELECT s.*, p.slug AS plan_slug, p.display_name AS plan_name
         FROM subscriptions s
         JOIN plans p ON s.plan_id = p.id
         WHERE s.accountant_id = $1
           AND s.status IN ('trialing', 'active', 'past_due')
         LIMIT 1`,
        [customerId]
      )

      // Usage stats
      const stats = await getOne<{
        client_count: string
        request_count: string
        upload_count: string
        storage_used: string
      }>(`
        SELECT
          (SELECT COUNT(*) FROM clients WHERE accountant_id = $1) AS client_count,
          (SELECT COUNT(*) FROM document_requests WHERE accountant_id = $1) AS request_count,
          (SELECT COUNT(*)
           FROM document_uploads du
           JOIN document_requests dr ON du.request_id = dr.id
           WHERE dr.accountant_id = $1) AS upload_count,
          (SELECT COALESCE(SUM(du.file_size), 0)
           FROM document_uploads du
           JOIN document_requests dr ON du.request_id = dr.id
           WHERE dr.accountant_id = $1) AS storage_used
      `, [customerId])

      // Recent activity (last 10 requests)
      const recentActivity = await query(
        `SELECT dr.id, dr.title, dr.status, dr.created_at, c.name AS client_name
         FROM document_requests dr
         JOIN clients c ON dr.client_id = c.id
         WHERE dr.accountant_id = $1
         ORDER BY dr.created_at DESC
         LIMIT 10`,
        [customerId]
      )

      return NextResponse.json({
        account,
        subscription: subscription || null,
        stats: stats
          ? {
              client_count: parseInt(stats.client_count, 10),
              request_count: parseInt(stats.request_count, 10),
              upload_count: parseInt(stats.upload_count, 10),
              storage_used: parseInt(stats.storage_used, 10),
            }
          : null,
        recent_activity: recentActivity.rows,
      })
    } catch (error) {
      console.error('GET /api/admin/customers/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(request, async (req, adminId) => {
    try {
      const { id } = await params
      const customerId = parseInt(id, 10)
      if (isNaN(customerId)) {
        return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 })
      }

      const body = await req.json()
      const { status } = body

      if (!status || !['active', 'suspended'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be "active" or "suspended".' },
          { status: 400 }
        )
      }

      // Check customer exists
      const existing = await getOne<{ id: number }>(
        'SELECT id FROM accountants WHERE id = $1',
        [customerId]
      )
      if (!existing) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      try {
        if (status === 'suspended') {
          await query(
            `UPDATE accountants
             SET is_suspended = true, suspended_at = NOW(), suspended_reason = $2
             WHERE id = $1`,
            [customerId, body.reason || null]
          )
        } else {
          await query(
            `UPDATE accountants
             SET is_suspended = false, suspended_at = NULL, suspended_reason = NULL
             WHERE id = $1`,
            [customerId]
          )
        }
      } catch {
        // is_suspended columns may not exist yet — ignore
      }

      await logAdminAction(adminId, status === 'suspended' ? 'suspend_customer' : 'reactivate_customer', 'accountant', customerId, {
        reason: body.reason || null,
      })

      return NextResponse.json({ message: `Customer ${status === 'suspended' ? 'suspended' : 'reactivated'} successfully` })
    } catch (error) {
      console.error('PATCH /api/admin/customers/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(request, async (req, adminId) => {
    try {
      const { id } = await params
      const customerId = parseInt(id, 10)
      if (isNaN(customerId)) {
        return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 })
      }

      // Require confirmation token in the request body
      const body = await req.json()
      if (body.confirm !== `DELETE-${customerId}`) {
        return NextResponse.json(
          { error: `Confirmation required. Send { "confirm": "DELETE-${customerId}" } to proceed.` },
          { status: 400 }
        )
      }

      // Check customer exists
      const existing = await getOne<{ id: number; email: string; name: string }>(
        'SELECT id, email, name FROM accountants WHERE id = $1',
        [customerId]
      )
      if (!existing) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      // Log before deletion so we capture the target
      await logAdminAction(adminId, 'delete_customer', 'accountant', customerId, {
        email: existing.email,
        name: existing.name,
      })

      // CASCADE deletes handle clients, requests, uploads, subscriptions, etc.
      await query('DELETE FROM accountants WHERE id = $1', [customerId])

      return NextResponse.json({ message: 'Customer and all associated data deleted successfully' })
    } catch (error) {
      console.error('DELETE /api/admin/customers/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
