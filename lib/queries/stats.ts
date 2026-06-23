import { query } from '@/lib/db'

export interface DashboardStats {
  total_clients: number
  total_requests: number
  pending_requests: number
  received_requests: number
  overdue_requests: number
}

/**
 * Returns aggregate statistics for a given accountant.
 * Used by the dashboard to render summary counts.
 */
export async function getDashboardStats(accountantId: number): Promise<DashboardStats> {
  const result = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM clients WHERE accountant_id = $1)                                      AS total_clients,
       (SELECT COUNT(*)::int FROM document_requests WHERE accountant_id = $1)                            AS total_requests,
       (SELECT COUNT(*)::int FROM document_requests WHERE accountant_id = $1 AND status = 'pending')     AS pending_requests,
       (SELECT COUNT(*)::int FROM document_requests WHERE accountant_id = $1 AND status = 'received')    AS received_requests,
       (SELECT COUNT(*)::int FROM document_requests WHERE accountant_id = $1 AND status = 'overdue')     AS overdue_requests`,
    [accountantId]
  )
  return result.rows[0]
}
