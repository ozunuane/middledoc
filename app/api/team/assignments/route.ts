import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const clientId = req.nextUrl.searchParams.get('client_id')
      const memberId = req.nextUrl.searchParams.get('member_id')

      const membership = await getOne<{ team_id: number }>(
        `SELECT team_id FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      let sql = `
        SELECT ca.id, ca.team_member_id, ca.client_id, ca.assigned_by, ca.assigned_at,
               a.name AS member_name, c.name AS client_name
        FROM client_assignments ca
        JOIN team_members tm ON tm.id = ca.team_member_id
        JOIN accountants a ON a.id = tm.accountant_id
        JOIN clients c ON c.id = ca.client_id
        WHERE tm.team_id = $1
      `
      const values: (string | number)[] = [membership.team_id]

      if (clientId) {
        values.push(parseInt(clientId, 10))
        sql += ` AND ca.client_id = $${values.length}`
      }

      if (memberId) {
        values.push(parseInt(memberId, 10))
        sql += ` AND ca.team_member_id = $${values.length}`
      }

      sql += ` ORDER BY ca.assigned_at DESC`

      const result = await query(sql, values)

      return NextResponse.json({ assignments: result.rows })
    } catch (error) {
      console.error('GET /api/team/assignments error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { team_member_id, client_id } = body

      if (!team_member_id || !client_id) {
        return NextResponse.json({ error: 'team_member_id and client_id are required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can assign clients' }, { status: 403 })
      }

      // Verify team member belongs to same team
      const targetMember = await getOne<{ id: number; team_id: number }>(
        `SELECT id, team_id FROM team_members WHERE id = $1`,
        [team_member_id]
      )

      if (!targetMember || targetMember.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
      }

      // Verify client exists
      const client = await getOne<{ id: number }>(
        `SELECT id FROM clients WHERE id = $1`,
        [client_id]
      )

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      // Check for existing assignment
      const existing = await getOne<{ id: number }>(
        `SELECT id FROM client_assignments WHERE team_member_id = $1 AND client_id = $2`,
        [team_member_id, client_id]
      )

      if (existing) {
        return NextResponse.json({ error: 'This assignment already exists' }, { status: 409 })
      }

      const result = await getOne<{
        id: number; team_member_id: number; client_id: number; assigned_by: number; assigned_at: string
      }>(
        `INSERT INTO client_assignments (team_member_id, client_id, assigned_by)
         VALUES ($1, $2, $3)
         RETURNING id, team_member_id, client_id, assigned_by, assigned_at`,
        [team_member_id, client_id, accountantId]
      )

      return NextResponse.json({ assignment: result }, { status: 201 })
    } catch (error) {
      console.error('POST /api/team/assignments error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { team_member_id, client_id } = body

      if (!team_member_id || !client_id) {
        return NextResponse.json({ error: 'team_member_id and client_id are required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      const result = await query(
        `DELETE FROM client_assignments
         WHERE team_member_id = $1 AND client_id = $2
         AND team_member_id IN (SELECT id FROM team_members WHERE team_id = $3)`,
        [team_member_id, client_id, membership.team_id]
      )

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/team/assignments error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
