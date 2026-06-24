import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { email, role } = body

      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      const validRoles = ['admin', 'member']
      const inviteRole = validRoles.includes(role) ? role : 'member'

      // Get user's team membership
      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      // Only owner/admin can invite
      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can invite members' }, { status: 403 })
      }

      // Check if already a member
      const existingMember = await getOne<{ id: number }>(
        `SELECT tm.id FROM team_members tm
         JOIN accountants a ON a.id = tm.accountant_id
         WHERE tm.team_id = $1 AND a.email = $2`,
        [membership.team_id, email.trim()]
      )

      if (existingMember) {
        return NextResponse.json({ error: 'This user is already a team member' }, { status: 409 })
      }

      // Check for existing pending invitation
      const existingInvite = await getOne<{ id: number }>(
        `SELECT id FROM team_invitations
         WHERE team_id = $1 AND email = $2 AND accepted_at IS NULL AND expires_at > NOW()`,
        [membership.team_id, email.trim()]
      )

      if (existingInvite) {
        return NextResponse.json({ error: 'A pending invitation already exists for this email' }, { status: 409 })
      }

      // Create invitation
      const invitation = await getOne<{
        id: number; team_id: number; email: string; role: string; token: string; expires_at: string
      }>(
        `INSERT INTO team_invitations (team_id, email, role, invited_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, team_id, email, role, token, expires_at`,
        [membership.team_id, email.trim(), inviteRole, accountantId]
      )

      return NextResponse.json({ invitation }, { status: 201 })
    } catch (error) {
      console.error('POST /api/team/invite error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

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
        `SELECT ti.id, ti.team_id, ti.email, ti.role, ti.token, ti.expires_at, ti.accepted_at, ti.created_at,
                a.name AS invited_by_name
         FROM team_invitations ti
         JOIN accountants a ON a.id = ti.invited_by
         WHERE ti.team_id = $1 AND ti.accepted_at IS NULL AND ti.expires_at > NOW()
         ORDER BY ti.created_at DESC`,
        [membership.team_id]
      )

      return NextResponse.json({ invitations: result.rows })
    } catch (error) {
      console.error('GET /api/team/invite error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
