import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getMany } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const templates = await getMany(
        `SELECT id, accountant_id, name, description, checklist_items, is_default, created_at
         FROM request_templates
         WHERE accountant_id = 0 OR accountant_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        [accountantId]
      )
      return NextResponse.json(templates)
    } catch (error) {
      console.error('GET /api/request-templates error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { name, description, checklist_items } = body

      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
      }

      if (!Array.isArray(checklist_items)) {
        return NextResponse.json({ error: 'checklist_items must be an array' }, { status: 400 })
      }

      const result = await query(
        `INSERT INTO request_templates (accountant_id, name, description, checklist_items, is_default)
         VALUES ($1, $2, $3, $4, false)
         RETURNING id, accountant_id, name, description, checklist_items, is_default, created_at`,
        [accountantId, name.trim(), description?.trim() || null, checklist_items]
      )

      return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
      console.error('POST /api/request-templates error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: 'Template id is required' }, { status: 400 })
      }

      // Cannot delete global templates
      const result = await query(
        `DELETE FROM request_templates WHERE id = $1 AND accountant_id = $2 AND is_default = false RETURNING id`,
        [id, accountantId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Template not found, is a global default, or access denied' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, deleted_id: id })
    } catch (error) {
      console.error('DELETE /api/request-templates error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
