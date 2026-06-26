import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getAuthorizationUrl } from '@/lib/qbo'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const state = `${accountantId}_${randomUUID()}`
      const url = getAuthorizationUrl(state)

      const response = NextResponse.redirect(url)
      response.cookies.set('qbo_state', state, {
        httpOnly: true,
        maxAge: 600,
        path: '/',
        sameSite: 'lax',
      })
      return response
    } catch (error) {
      console.error('QBO connect error:', error instanceof Error ? error.message : 'Unknown error')
      return NextResponse.json({ error: 'Failed to initiate QBO connection' }, { status: 500 })
    }
  })
}
