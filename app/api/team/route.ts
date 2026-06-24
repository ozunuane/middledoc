import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      // Find the team where this user is a member
      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1 LIMIT 1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ team: null })
      }

      const team = await getOne<{ id: number; name: string; owner_id: number; created_at: string }>(
        `SELECT id, name, owner_id, created_at FROM teams WHERE id = $1`,
        [membership.team_id]
      )

      if (!team) {
        return NextResponse.json({ team: null })
      }

      // Get members list
      const membersResult = await query(
        `SELECT tm.id, tm.team_id, tm.accountant_id, tm.role, tm.joined_at,
                a.name, a.email
         FROM team_members tm
         JOIN accountants a ON a.id = tm.accountant_id
         WHERE tm.team_id = $1
         ORDER BY tm.joined_at ASC`,
        [team.id]
      )

      return NextResponse.json({
        team,
        members: membersResult.rows,
        current_role: membership.role,
      })
    } catch (error) {
      console.error('GET /api/team error:', error)
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
        return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
      }

      // Check if user already has a team
      const existing = await getOne<{ id: number }>(
        `SELECT tm.id FROM team_members tm WHERE tm.accountant_id = $1 LIMIT 1`,
        [accountantId]
      )

      if (existing) {
        return NextResponse.json({ error: 'You are already part of a team' }, { status: 409 })
      }

      // Create team
      const teamResult = await getOne<{ id: number; name: string; owner_id: number; created_at: string }>(
        `INSERT INTO teams (name, owner_id) VALUES ($1, $2) RETURNING id, name, owner_id, created_at`,
        [name.trim(), accountantId]
      )

      if (!teamResult) {
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
      }

      // Add creator as owner
      await query(
        `INSERT INTO team_members (team_id, accountant_id, role) VALUES ($1, $2, 'owner')`,
        [teamResult.id, accountantId]
      )

      return NextResponse.json({ team: teamResult }, { status: 201 })
    } catch (error) {
      console.error('POST /api/team error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
