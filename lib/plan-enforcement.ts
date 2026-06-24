import { getOne } from './db'

interface PlanLimits {
  max_clients: number
  max_storage_gb: number
  max_team_members: number
  max_email_reminders_per_month: number
  feature_teams: boolean
  feature_groups: boolean
}

export async function getPlanLimits(accountantId: number): Promise<PlanLimits> {
  // Check if they have an active subscription
  const sub = await getOne<PlanLimits>(
    `SELECT p.max_clients, p.max_storage_gb, p.max_team_members,
            p.max_email_reminders_per_month, p.feature_teams, p.feature_groups
     FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.accountant_id = $1 AND s.status IN ('active', 'trialing')`,
    [accountantId]
  )

  if (sub) return sub

  // Default to free plan limits
  const freePlan = await getOne<PlanLimits>(
    `SELECT max_clients, max_storage_gb, max_team_members,
            max_email_reminders_per_month, feature_teams, feature_groups
     FROM plans WHERE slug = 'free'`
  )

  return freePlan || {
    max_clients: 5, max_storage_gb: 1, max_team_members: 1,
    max_email_reminders_per_month: 20, feature_teams: false, feature_groups: false,
  }
}

export async function checkClientLimit(accountantId: number): Promise<{ allowed: boolean; current: number; max: number }> {
  const limits = await getPlanLimits(accountantId)
  if (limits.max_clients === 0) return { allowed: true, current: 0, max: 0 } // unlimited

  const count = await getOne<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM clients WHERE accountant_id = $1',
    [accountantId]
  )
  const current = parseInt(count?.count ?? '0', 10)
  return { allowed: current < limits.max_clients, current, max: limits.max_clients }
}

export async function checkStorageLimit(accountantId: number): Promise<{ allowed: boolean; used_bytes: number; max_bytes: number }> {
  const limits = await getPlanLimits(accountantId)
  const maxBytes = limits.max_storage_gb * 1024 * 1024 * 1024

  const usage = await getOne<{ total: string }>(
    `SELECT COALESCE(SUM(du.file_size), 0)::text AS total
     FROM document_uploads du
     JOIN document_requests dr ON dr.id = du.request_id
     WHERE dr.accountant_id = $1`,
    [accountantId]
  )
  const used = parseInt(usage?.total ?? '0', 10)
  return { allowed: used < maxBytes, used_bytes: used, max_bytes: maxBytes }
}

export async function checkReminderLimit(accountantId: number): Promise<{ allowed: boolean; sent: number; max: number }> {
  const limits = await getPlanLimits(accountantId)
  if (limits.max_email_reminders_per_month === 0) return { allowed: true, sent: 0, max: 0 }

  const count = await getOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM email_reminders
     WHERE client_id IN (SELECT id FROM clients WHERE accountant_id = $1)
     AND sent_at >= DATE_TRUNC('month', CURRENT_DATE)`,
    [accountantId]
  )
  const sent = parseInt(count?.count ?? '0', 10)
  return { allowed: sent < limits.max_email_reminders_per_month, sent, max: limits.max_email_reminders_per_month }
}
