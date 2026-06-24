import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { token } = body

      if (!token?.trim()) {
        return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 })
      }

      // Find the invitation
      const invitation = await getOne<{
        id: number; team_id: number; email: string; role: string; accepted_at: string | null; expires_at: string
      }>(
        `SELECT id, team_id, email, role, accepted_at, expires_at FROM team_invitations WHERE token = $1`,
        [token.trim()]
      )

      if (!invitation) {
        return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 })
      }

      if (invitation.accepted_at) {
        return NextResponse.json({ error: 'This invitation has already been accepted' }, { status: 400 })
      }

      if (new Date(invitation.expires_at) < new Date()) {
        return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
      }

      // Check if user is already in a team
      const existingMembership = await getOne<{ id: number }>(
        `SELECT id FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (existingMembership) {
        return NextResponse.json({ error: 'You are already part of a team' }, { status: 409 })
      }

      // Add as team member
      await query(
        `INSERT INTO team_members (team_id, accountant_id, role) VALUES ($1, $2, $3)`,
        [invitation.team_id, accountantId, invitation.role]
      )

      // Mark invitation as accepted
      await query(
        `UPDATE team_invitations SET accepted_at = NOW() WHERE id = $1`,
        [invitation.id]
      )

      return NextResponse.json({
        success: true,
        team_id: invitation.team_id,
        role: invitation.role,
      })
    } catch (error) {
      console.error('POST /api/team/join error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
