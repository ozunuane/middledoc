import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    const body = await req.json()
    const { name, firm_name } = body

    // Build dynamic update query for only provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`)
      values.push(name)
      paramIndex++
    }

    if (firm_name !== undefined) {
      updates.push(`firm_name = $${paramIndex}`)
      values.push(firm_name)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(accountantId)

    const result = await query(
      `UPDATE accountants SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, firm_name`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  })
}
