import { query } from './db'
import { getOne } from './db'

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

/**
 * Get the current user's team membership info.
 */
export async function getUserTeamInfo(accountantId: number): Promise<{
  teamId: number | null
  memberId: number | null
  role: 'owner' | 'admin' | 'member' | null
}> {
  const member = await getOne<{ id: number; team_id: number; role: string }>(
    `SELECT id, team_id, role FROM team_members WHERE accountant_id = $1`,
    [accountantId]
  )
  if (!member) return { teamId: null, memberId: null, role: null }
  return {
    teamId: member.team_id,
    memberId: member.id,
    role: member.role as 'owner' | 'admin' | 'member',
  }
}

/**
 * Resolve the owner accountant ID for a team member.
 * If the user is not on a team or is the owner, returns their own ID.
 */
export async function resolveOwnerAccountantId(
  accountantId: number,
  teamInfo: { teamId: number | null; role: 'owner' | 'admin' | 'member' | null }
): Promise<number> {
  if (teamInfo.teamId && teamInfo.role !== 'owner') {
    const owner = await getOne<{ accountant_id: number }>(
      `SELECT accountant_id FROM team_members WHERE team_id = $1 AND role = 'owner'`,
      [teamInfo.teamId]
    )
    if (owner) return owner.accountant_id
  }
  return accountantId
}
