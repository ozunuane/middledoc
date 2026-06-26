import webpush from 'web-push'
import { getMany, query } from './db'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_EMAIL = process.env.FROM_EMAIL || 'noreply@middledoc.app'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE)
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC
}

export async function sendPushToAccountant(
  accountantId: number,
  payload: { title: string; body: string; url?: string }
) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return

  const subs = await getMany<{ endpoint: string; p256dh: string; auth: string }>(
    'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE accountant_id = $1',
    [accountantId]
  )

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    } catch (err) {
      // If subscription is invalid (410 Gone), remove it
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
        await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint])
      }
    }
  }
}
