import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query } from '@/lib/db'
import { getVapidPublicKey } from '@/lib/web-push-service'

// GET: Return the VAPID public key so the client can subscribe
export async function GET() {
  const vapidPublicKey = getVapidPublicKey()
  if (!vapidPublicKey) {
    return NextResponse.json({ error: 'Push notifications not configured' }, { status: 503 })
  }
  return NextResponse.json({ vapidPublicKey })
}

// POST: Save a push subscription
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { endpoint, keys } = body

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
      }

      // Upsert subscription
      await query(
        `INSERT INTO push_subscriptions (accountant_id, endpoint, p256dh, auth)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (accountant_id, endpoint) DO UPDATE SET p256dh = $3, auth = $4`,
        [accountantId, endpoint, keys.p256dh, keys.auth]
      )

      return NextResponse.json({ success: true }, { status: 201 })
    } catch (error) {
      console.error('POST /api/push-subscribe error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

// DELETE: Remove a push subscription
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { endpoint } = body

      if (!endpoint) {
        return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
      }

      await query(
        'DELETE FROM push_subscriptions WHERE accountant_id = $1 AND endpoint = $2',
        [accountantId, endpoint]
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/push-subscribe error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
