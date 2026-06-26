import { query, getOne } from './db'

const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID || ''
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET || ''
const QBO_REDIRECT_URI = process.env.QBO_REDIRECT_URI || ''
const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT || 'sandbox'

const AUTH_BASE = 'https://appcenter.intuit.com/connect/oauth2'
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
const API_BASE = QBO_ENVIRONMENT === 'production'
  ? 'https://quickbooks.api.intuit.com'
  : 'https://sandbox-quickbooks.api.intuit.com'

// Generate OAuth authorization URL
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: QBO_CLIENT_ID,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: QBO_REDIRECT_URI,
    state,
  })
  return `${AUTH_BASE}?${params}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string, realmId: string) {
  const basicAuth = Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString('base64')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: QBO_REDIRECT_URI,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    x_refresh_token_expires_in: number
    token_type: string
  }>
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  const basicAuth = Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString('base64')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error('Token refresh failed')
  return res.json()
}

// Get valid access token (refresh if expired)
export async function getValidToken(connectionId: number): Promise<{ accessToken: string; realmId: string }> {
  const conn = await getOne<{
    id: number
    access_token: string
    refresh_token: string
    token_expires_at: string
    realm_id: string
  }>('SELECT id, access_token, refresh_token, token_expires_at, realm_id FROM qbo_connections WHERE id = $1 AND is_active = true', [connectionId])

  if (!conn) throw new Error('QBO connection not found')

  // Check if token is expired (with 5 min buffer)
  const expiresAt = new Date(conn.token_expires_at)
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5)

  if (now >= expiresAt) {
    // Refresh the token
    const newTokens = await refreshAccessToken(conn.refresh_token)
    const newExpiry = new Date()
    newExpiry.setSeconds(newExpiry.getSeconds() + newTokens.expires_in)

    await query(
      `UPDATE qbo_connections SET access_token = $1, refresh_token = $2, token_expires_at = $3 WHERE id = $4`,
      [newTokens.access_token, newTokens.refresh_token, newExpiry.toISOString(), connectionId]
    )

    return { accessToken: newTokens.access_token, realmId: conn.realm_id }
  }

  return { accessToken: conn.access_token, realmId: conn.realm_id }
}

// QBO API request
export async function qboRequest(accessToken: string, realmId: string, endpoint: string) {
  const res = await fetch(`${API_BASE}/v3/company/${realmId}/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`QBO API error: ${res.status} ${err}`)
  }

  return res.json()
}

// Fetch all customers from QBO
export async function fetchQboCustomers(accessToken: string, realmId: string) {
  const data = await qboRequest(accessToken, realmId, "query?query=SELECT * FROM Customer WHERE Active = true MAXRESULTS 1000")
  return (data.QueryResponse?.Customer || []) as Array<{
    Id: string
    DisplayName: string
    PrimaryEmailAddr?: { Address: string }
    CompanyName?: string
    GivenName?: string
    FamilyName?: string
    Active: boolean
  }>
}

// Sync QBO customers to MiddleDoc clients
export async function syncCustomers(accountantId: number, connectionId: number): Promise<{
  imported: number
  updated: number
  skipped: number
  total: number
}> {
  // Update sync status
  await query(`UPDATE qbo_connections SET sync_status = 'syncing', sync_error = NULL WHERE id = $1`, [connectionId])

  try {
    const { accessToken, realmId } = await getValidToken(connectionId)
    const customers = await fetchQboCustomers(accessToken, realmId)

    let imported = 0
    let updated = 0
    let skipped = 0

    for (const customer of customers) {
      const email = customer.PrimaryEmailAddr?.Address
      if (!email) {
        skipped++
        continue
      }

      const name = customer.DisplayName || `${customer.GivenName || ''} ${customer.FamilyName || ''}`.trim() || 'Unknown'
      const companyName = customer.CompanyName || null

      // Check if already mapped
      const existing = await getOne<{ client_id: number }>(
        `SELECT client_id FROM qbo_client_map WHERE qbo_connection_id = $1 AND qbo_customer_id = $2`,
        [connectionId, customer.Id]
      )

      if (existing) {
        // Update existing client
        await query(
          `UPDATE clients SET name = $1, company_name = $2 WHERE id = $3`,
          [name, companyName, existing.client_id]
        )
        await query(
          `UPDATE qbo_client_map SET last_synced_at = NOW() WHERE qbo_connection_id = $1 AND qbo_customer_id = $2`,
          [connectionId, customer.Id]
        )
        updated++
        continue
      }

      // Check if client with this email already exists
      const existingClient = await getOne<{ id: number }>(
        `SELECT id FROM clients WHERE accountant_id = $1 AND email = $2`,
        [accountantId, email.toLowerCase()]
      )

      if (existingClient) {
        // Map existing client
        await query(
          `INSERT INTO qbo_client_map (qbo_connection_id, qbo_customer_id, client_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [connectionId, customer.Id, existingClient.id]
        )
        await query(
          `UPDATE clients SET company_name = $1, source = 'qbo' WHERE id = $2 AND company_name IS NULL`,
          [companyName, existingClient.id]
        )
        updated++
        continue
      }

      // Create new client
      const result = await query(
        `INSERT INTO clients (accountant_id, email, name, company_name, source) VALUES ($1, $2, $3, $4, 'qbo') RETURNING id`,
        [accountantId, email.toLowerCase(), name, companyName]
      )

      // Create mapping
      await query(
        `INSERT INTO qbo_client_map (qbo_connection_id, qbo_customer_id, client_id) VALUES ($1, $2, $3)`,
        [connectionId, customer.Id, result.rows[0].id]
      )

      imported++
    }

    // Update sync status
    await query(
      `UPDATE qbo_connections SET sync_status = 'idle', last_synced_at = NOW(), sync_error = NULL WHERE id = $1`,
      [connectionId]
    )

    return { imported, updated, skipped, total: customers.length }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    await query(`UPDATE qbo_connections SET sync_status = 'error', sync_error = $2 WHERE id = $1`, [connectionId, message])
    throw err
  }
}
