import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      const result = await query(
        `SELECT g.id, g.team_id, g.name, g.created_at,
                COUNT(DISTINCT gm.id) AS member_count,
                COUNT(DISTINCT gc.id) AS client_count
         FROM groups g
         LEFT JOIN group_members gm ON gm.group_id = g.id
         LEFT JOIN group_clients gc ON gc.group_id = g.id
         WHERE g.team_id = $1
         GROUP BY g.id
         ORDER BY g.name ASC`,
        [membership.team_id]
      )

      // Parse counts to numbers
      const groups = result.rows.map(row => ({
        ...row,
        member_count: parseInt(row.member_count, 10),
        client_count: parseInt(row.client_count, 10),
      }))

      return NextResponse.json({ groups })
    } catch (error) {
      console.error('GET /api/team/groups error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { name } = body

      if (!name?.trim()) {
        return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can create groups' }, { status: 403 })
      }

      const group = await getOne<{ id: number; team_id: number; name: string; created_at: string }>(
        `INSERT INTO groups (team_id, name) VALUES ($1, $2) RETURNING id, team_id, name, created_at`,
        [membership.team_id, name.trim()]
      )

      return NextResponse.json({ group }, { status: 201 })
    } catch (error) {
      console.error('POST /api/team/groups error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { group_id } = body

      if (!group_id) {
        return NextResponse.json({ error: 'group_id is required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can delete groups' }, { status: 403 })
      }

      // Verify group belongs to team
      const group = await getOne<{ id: number; team_id: number }>(
        `SELECT id, team_id FROM groups WHERE id = $1`,
        [group_id]
      )

      if (!group || group.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      await query(`DELETE FROM groups WHERE id = $1`, [group_id])

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/team/groups error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
