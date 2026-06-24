import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const groupId = req.nextUrl.searchParams.get('group_id')

      if (!groupId) {
        return NextResponse.json({ error: 'group_id query parameter is required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number }>(
        `SELECT team_id FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      // Verify group belongs to team
      const group = await getOne<{ id: number; team_id: number }>(
        `SELECT id, team_id FROM groups WHERE id = $1`,
        [parseInt(groupId, 10)]
      )

      if (!group || group.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      const result = await query(
        `SELECT gm.id, gm.group_id, gm.team_member_id,
                tm.role, a.name, a.email
         FROM group_members gm
         JOIN team_members tm ON tm.id = gm.team_member_id
         JOIN accountants a ON a.id = tm.accountant_id
         WHERE gm.group_id = $1
         ORDER BY a.name ASC`,
        [parseInt(groupId, 10)]
      )

      return NextResponse.json({ members: result.rows })
    } catch (error) {
      console.error('GET /api/team/groups/members error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { group_id, team_member_id } = body

      if (!group_id || !team_member_id) {
        return NextResponse.json({ error: 'group_id and team_member_id are required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can manage group members' }, { status: 403 })
      }

      // Verify group belongs to team
      const group = await getOne<{ id: number; team_id: number }>(
        `SELECT id, team_id FROM groups WHERE id = $1`,
        [group_id]
      )

      if (!group || group.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      // Verify team member belongs to same team
      const targetMember = await getOne<{ id: number; team_id: number }>(
        `SELECT id, team_id FROM team_members WHERE id = $1`,
        [team_member_id]
      )

      if (!targetMember || targetMember.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
      }

      // Check for existing membership
      const existing = await getOne<{ id: number }>(
        `SELECT id FROM group_members WHERE group_id = $1 AND team_member_id = $2`,
        [group_id, team_member_id]
      )

      if (existing) {
        return NextResponse.json({ error: 'Member is already in this group' }, { status: 409 })
      }

      const result = await getOne<{ id: number; group_id: number; team_member_id: number }>(
        `INSERT INTO group_members (group_id, team_member_id) VALUES ($1, $2) RETURNING id, group_id, team_member_id`,
        [group_id, team_member_id]
      )

      return NextResponse.json({ group_member: result }, { status: 201 })
    } catch (error) {
      console.error('POST /api/team/groups/members error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { group_id, team_member_id } = body

      if (!group_id || !team_member_id) {
        return NextResponse.json({ error: 'group_id and team_member_id are required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can manage groups' }, { status: 403 })
      }

      // Verify group belongs to team
      const group = await getOne<{ id: number; team_id: number }>(
        `SELECT id, team_id FROM groups WHERE id = $1`,
        [group_id]
      )

      if (!group || group.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      const result = await query(
        `DELETE FROM group_members WHERE group_id = $1 AND team_member_id = $2`,
        [group_id, team_member_id]
      )

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Member not found in this group' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/team/groups/members error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
