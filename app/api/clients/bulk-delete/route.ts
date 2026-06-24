import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { ids } = body

      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: 'Request body must contain a non-empty array of ids' },
          { status: 400 }
        )
      }

      // Validate all ids are integers
      const parsedIds = ids.map((id: unknown) => {
        const parsed = Number(id)
        if (!Number.isInteger(parsed) || parsed < 1) return null
        return parsed
      })

      if (parsedIds.includes(null)) {
        return NextResponse.json(
          { error: 'All ids must be positive integers' },
          { status: 400 }
        )
      }

      // Verify all clients belong to the authenticated accountant
      const validIds = parsedIds.filter((id): id is number => id !== null)
      const placeholders = validIds.map((_: number, i: number) => `$${i + 2}`).join(', ')
      const ownership = await query(
        `SELECT id FROM clients WHERE accountant_id = $1 AND id IN (${placeholders})`,
        [accountantId, ...validIds]
      )

      if (ownership.rows.length !== validIds.length) {
        return NextResponse.json(
          { error: 'One or more clients not found or do not belong to you' },
          { status: 403 }
        )
      }

      // Delete clients (CASCADE handles requests/uploads)
      const result = await query(
        `DELETE FROM clients WHERE accountant_id = $1 AND id IN (${placeholders})`,
        [accountantId, ...validIds]
      )

      return NextResponse.json({ deleted: result.rowCount })
    } catch (error) {
      console.error('POST /api/clients/bulk-delete error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
