import { query } from './db'

/**
 * Get the list of client IDs that a team member can access.
 * - Owner/Admin: all clients for the accountant
 * - Member: clients via groups + direct assignments
 */
export async function getAccessibleClientIds(
  accountantId: number,
  teamMemberId?: number,
  role?: string
): Promise<number[] | 'all'> {
  // Owner or admin gets all
  if (!role || role === 'owner' || role === 'admin') {
    return 'all'
  }

  if (!teamMemberId) return []

  // Get clients from groups
  const groupClients = await query(
    `SELECT DISTINCT gc.client_id
     FROM group_clients gc
     JOIN group_members gm ON gm.group_id = gc.group_id
     WHERE gm.team_member_id = $1`,
    [teamMemberId]
  )

  // Get directly assigned clients
  const directClients = await query(
    `SELECT client_id FROM client_assignments WHERE team_member_id = $1`,
    [teamMemberId]
  )

  const ids = new Set<number>()
  groupClients.rows.forEach(r => ids.add(r.client_id))
  directClients.rows.forEach(r => ids.add(r.client_id))

  return Array.from(ids)
}
