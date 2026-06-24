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
        `SELECT gc.id, gc.group_id, gc.client_id,
                c.name AS client_name, c.email AS client_email
         FROM group_clients gc
         JOIN clients c ON c.id = gc.client_id
         WHERE gc.group_id = $1
         ORDER BY c.name ASC`,
        [parseInt(groupId, 10)]
      )

      return NextResponse.json({ clients: result.rows })
    } catch (error) {
      console.error('GET /api/team/groups/clients error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { group_id, client_id } = body

      if (!group_id || !client_id) {
        return NextResponse.json({ error: 'group_id and client_id are required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
      }

      if (membership.role !== 'owner' && membership.role !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can assign clients to groups' }, { status: 403 })
      }

      // Verify group belongs to team
      const group = await getOne<{ id: number; team_id: number }>(
        `SELECT id, team_id FROM groups WHERE id = $1`,
        [group_id]
      )

      if (!group || group.team_id !== membership.team_id) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      // Verify client belongs to the accountant (team owner)
      const client = await getOne<{ id: number }>(
        `SELECT id FROM clients WHERE id = $1 AND accountant_id = $2`,
        [client_id, accountantId]
      )

      if (!client) {
        // Also check if another team member owns the client
        const teamOwner = await getOne<{ owner_id: number }>(
          `SELECT owner_id FROM teams WHERE id = $1`,
          [membership.team_id]
        )
        if (teamOwner) {
          const ownerClient = await getOne<{ id: number }>(
            `SELECT id FROM clients WHERE id = $1 AND accountant_id = $2`,
            [client_id, teamOwner.owner_id]
          )
          if (!ownerClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
          }
        } else {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }
      }

      // Check for existing assignment
      const existing = await getOne<{ id: number }>(
        `SELECT id FROM group_clients WHERE group_id = $1 AND client_id = $2`,
        [group_id, client_id]
      )

      if (existing) {
        return NextResponse.json({ error: 'Client is already assigned to this group' }, { status: 409 })
      }

      const result = await getOne<{ id: number; group_id: number; client_id: number }>(
        `INSERT INTO group_clients (group_id, client_id) VALUES ($1, $2) RETURNING id, group_id, client_id`,
        [group_id, client_id]
      )

      return NextResponse.json({ group_client: result }, { status: 201 })
    } catch (error) {
      console.error('POST /api/team/groups/clients error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { group_id, client_id } = body

      if (!group_id || !client_id) {
        return NextResponse.json({ error: 'group_id and client_id are required' }, { status: 400 })
      }

      const membership = await getOne<{ team_id: number; role: string }>(
        `SELECT team_id, role FROM team_members WHERE accountant_id = $1`,
        [accountantId]
      )

      if (!membership) {
        return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 })
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
        `DELETE FROM group_clients WHERE group_id = $1 AND client_id = $2`,
        [group_id, client_id]
      )

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Client not found in this group' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/team/groups/clients error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
