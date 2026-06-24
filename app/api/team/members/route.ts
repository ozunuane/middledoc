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
        `SELECT tm.id, tm.team_id, tm.accountant_id, tm.role, tm.joined_at,
                a.name, a.email
         FROM team_members tm
         JOIN accountants a ON a.id = tm.accountant_id
         WHERE tm.team_id = $1
         ORDER BY tm.joined_at ASC`,
        [membership.team_id]
      )

      return NextResponse.json({ members: result.rows })
    } catch (error) {
      console.error('GET /api/team/members error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { member_id } = body

      if (!member_id) {
        return NextResponse.json({ error: 'member_id is required' }, { status: 400 })
      }

      // Get caller's membership
      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can remove members' }, { status: 403 })
      }

      // Get target member
      const target = await getOne<{ id: number; role: string; team_id: number }>(
        `SELECT id, role, team_id FROM team_members WHERE id = $1`,
        [member_id]
      )

      if (!target || target.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      if (target.role === 'owner') {
        return NextResponse.json({ error: 'Cannot remove the team owner' }, { status: 403 })
      }

      await query(`DELETE FROM team_members WHERE id = $1`, [member_id])

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/team/members error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { member_id, role } = body

      if (!member_id || !role) {
        return NextResponse.json({ error: 'member_id and role are required' }, { status: 400 })
      }

      const validRoles = ['admin', 'member']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be admin or member' }, { status: 400 })
      }

      // Get caller's membership — only owner can change roles
      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner') {
        return NextResponse.json({ error: 'Only the team owner can change roles' }, { status: 403 })
      }

      // Get target member
      const target = await getOne<{ id: number; role: string; team_id: number }>(
        `SELECT id, role, team_id FROM team_members WHERE id = $1`,
        [member_id]
      )

      if (!target || target.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      if (target.role === 'owner') {
        return NextResponse.json({ error: 'Cannot change the owner role' }, { status: 403 })
      }

      await query(`UPDATE team_members SET role = $1 WHERE id = $2`, [role, member_id])

      return NextResponse.json({ success: true, member_id, role })
    } catch (error) {
      console.error('PATCH /api/team/members error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
