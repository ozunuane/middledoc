import { query } from '@/lib/db'

export async function logActivity(
  accountantId: number,
  action: string,
  entityType: string,
  entityId: number | null,
  details: Record<string, unknown> = {}
) {
  try {
    await query(
      `INSERT INTO activity_log (accountant_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [accountantId, action, entityType, entityId, JSON.stringify(details)]
    )
  } catch (error) {
    // Log but don't throw — activity logging should never break the main flow
    console.error('Failed to log activity:', error)
  }
}
