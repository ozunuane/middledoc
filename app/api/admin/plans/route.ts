import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware'
import { query, getMany } from '@/lib/db'
import { logAdminAction } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const plans = await getMany<Record<string, unknown>>(
        'SELECT * FROM plans ORDER BY sort_order ASC, id ASC'
      )
      return NextResponse.json({ plans })
    } catch (error) {
      console.error('GET /api/admin/plans error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async (req, adminId) => {
    try {
      const body = await req.json()
      const {
        slug,
        display_name,
        description,
        monthly_price_cents,
        annual_price_cents,
        max_clients,
        max_storage_gb,
        included_team_members,
        max_team_members,
        max_email_reminders_per_month,
        feature_teams,
        feature_groups,
        is_active,
        is_public,
        sort_order,
      } = body

      if (!slug || !display_name) {
        return NextResponse.json({ error: 'slug and display_name are required' }, { status: 400 })
      }

      const result = await query(
        `INSERT INTO plans (
          slug, display_name, description,
          monthly_price_cents, annual_price_cents,
          max_clients, max_storage_gb,
          included_team_members, max_team_members,
          max_email_reminders_per_month,
          feature_teams, feature_groups,
          is_active, is_public, sort_order
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *`,
        [
          slug,
          display_name,
          description || null,
          monthly_price_cents ?? 0,
          annual_price_cents ?? 0,
          max_clients ?? 0,
          max_storage_gb ?? 1,
          included_team_members ?? 1,
          max_team_members ?? 1,
          max_email_reminders_per_month ?? 20,
          feature_teams ?? false,
          feature_groups ?? false,
          is_active ?? true,
          is_public ?? true,
          sort_order ?? 0,
        ]
      )

      await logAdminAction(adminId, 'create_plan', 'plan', result.rows[0].id, { slug })

      return NextResponse.json({ plan: result.rows[0] }, { status: 201 })
    } catch (error) {
      console.error('POST /api/admin/plans error:', error)
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return NextResponse.json({ error: 'A plan with that slug already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PATCH(request: NextRequest) {
  return withAdmin(request, async (req, adminId) => {
    try {
      const body = await req.json()
      const { id, ...updates } = body

      if (!id) {
        return NextResponse.json({ error: 'Plan id is required' }, { status: 400 })
      }

      // Build dynamic update query
      const allowedFields = [
        'slug', 'display_name', 'description',
        'monthly_price_cents', 'annual_price_cents',
        'max_clients', 'max_storage_gb',
        'included_team_members', 'max_team_members',
        'max_email_reminders_per_month',
        'feature_teams', 'feature_groups',
        'is_active', 'is_public', 'sort_order',
      ]

      const fields: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          fields.push(`${field} = $${paramIndex++}`)
          values.push(updates[field])
        }
      }

      if (fields.length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
      }

      values.push(id)
      const result = await query(
        `UPDATE plans SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values as any[]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      await logAdminAction(adminId, 'update_plan', 'plan', id, { updated_fields: Object.keys(updates) })

      return NextResponse.json({ plan: result.rows[0] })
    } catch (error) {
      console.error('PATCH /api/admin/plans error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
