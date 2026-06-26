import { NextRequest, NextResponse } from 'next/server'
import { query, getOne } from '@/lib/db'
import { exchangeCodeForTokens, qboRequest, syncCustomers, encryptToken } from '@/lib/qbo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const code = searchParams.get('code')
    const realmId = searchParams.get('realmId')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle user denial
    if (error) {
      return NextResponse.redirect(new URL('/dashboard/settings/integrations?error=access_denied', request.url))
    }

    if (!code || !realmId || !state) {
      return NextResponse.redirect(new URL('/dashboard/settings/integrations?error=missing_params', request.url))
    }

    // Verify state cookie
    const storedState = request.cookies.get('qbo_state')?.value
    if (!state || state !== storedState) {
      return NextResponse.redirect(new URL('/dashboard/settings/integrations?error=invalid_state', request.url))
    }

    const accountantId = parseInt(state.split('_')[0], 10)
    if (isNaN(accountantId)) {
      return NextResponse.redirect(new URL('/dashboard/settings/integrations?error=invalid_state', request.url))
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, realmId)
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

    // Get company name
    let companyName = 'QuickBooks Company'
    try {
      const companyInfo = await qboRequest(tokens.access_token, realmId, 'companyinfo/' + realmId)
      companyName = companyInfo?.CompanyInfo?.CompanyName || companyName
    } catch {
      // Non-critical, use default
    }

    // Store connection (upsert) — encrypt tokens at rest
    const encryptedAccessToken = encryptToken(tokens.access_token)
    const encryptedRefreshToken = encryptToken(tokens.refresh_token)
    await query(
      `INSERT INTO qbo_connections (accountant_id, realm_id, access_token, refresh_token, token_expires_at, company_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (accountant_id) DO UPDATE SET
         realm_id = $2, access_token = $3, refresh_token = $4, token_expires_at = $5, company_name = $6, is_active = true, sync_error = NULL`,
      [accountantId, realmId, encryptedAccessToken, encryptedRefreshToken, expiresAt.toISOString(), companyName]
    )

    // Get connection ID for sync
    const conn = await getOne<{ id: number }>('SELECT id FROM qbo_connections WHERE accountant_id = $1', [accountantId])

    // Trigger initial sync (non-blocking)
    if (conn) {
      void syncCustomers(accountantId, conn.id).catch((err) => {
        console.error('Initial QBO sync failed:', err instanceof Error ? err.message : 'Unknown error')
      })
    }

    const response = NextResponse.redirect(new URL('/dashboard/settings/integrations?connected=true', request.url))
    response.cookies.delete('qbo_state')
    return response
  } catch (error) {
    console.error('QBO callback error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.redirect(new URL('/dashboard/settings/integrations?error=connection_failed', request.url))
  }
}
