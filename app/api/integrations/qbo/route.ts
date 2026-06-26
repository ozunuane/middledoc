import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'
import { syncCustomers } from '@/lib/qbo'
import type { QboConnection } from '@/types/index'

// GET: Return connection status
export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const conn = await getOne<QboConnection>(
        `SELECT id, accountant_id, realm_id, company_name, last_synced_at, sync_status, sync_error, is_active, created_at
         FROM qbo_connections WHERE accountant_id = $1 AND is_active = true`,
        [accountantId]
      )

      if (!conn) {
        return NextResponse.json({ connected: false })
      }

      return NextResponse.json({
        connected: true,
        connection: {
          id: conn.id,
          company_name: conn.company_name,
          last_synced_at: conn.last_synced_at,
          sync_status: conn.sync_status,
          sync_error: conn.sync_error,
          created_at: conn.created_at,
        },
      })
    } catch (error) {
      console.error('GET /api/integrations/qbo error:', error instanceof Error ? error.message : 'Unknown error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

// POST: Trigger manual sync
export async function POST(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const conn = await getOne<{ id: number; sync_status: string }>(
        `SELECT id, sync_status FROM qbo_connections WHERE accountant_id = $1 AND is_active = true`,
        [accountantId]
      )

      if (!conn) {
        return NextResponse.json({ error: 'No QBO connection found' }, { status: 404 })
      }

      if (conn.sync_status === 'syncing') {
        return NextResponse.json({ error: 'Sync already in progress' }, { status: 409 })
      }

      const result = await syncCustomers(accountantId, conn.id)
      return NextResponse.json(result)
    } catch (error) {
      console.error('POST /api/integrations/qbo error:', error instanceof Error ? error.message : 'Unknown error')
      return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
  })
}

// DELETE: Disconnect QBO
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const result = await query(
        `UPDATE qbo_connections SET is_active = false WHERE accountant_id = $1 AND is_active = true`,
        [accountantId]
      )

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'No active QBO connection found' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/integrations/qbo error:', error instanceof Error ? error.message : 'Unknown error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
