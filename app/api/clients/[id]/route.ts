import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { id } = await params
      const clientId = parseInt(id, 10)

      if (isNaN(clientId)) {
        return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
      }

      const existing = await query(
        'SELECT id, accountant_id FROM clients WHERE id = $1',
        [clientId]
      )

      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      if (existing.rows[0].accountant_id !== accountantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // ON DELETE CASCADE in the schema removes all requests and uploads
      await query('DELETE FROM clients WHERE id = $1', [clientId])

      return NextResponse.json({ message: 'Client deleted successfully' })
    } catch (error) {
      console.error('DELETE /api/clients/[id] error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
