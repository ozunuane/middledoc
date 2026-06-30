import { SignJWT, jwtVerify } from 'jose'
import bcryptjs from 'bcryptjs'
import { query, getOne } from './db'

function getAdminSecret() {
  const rawAdminSecret = process.env.ADMIN_SECRET
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.NEXT_PHASE) {
    if (!rawAdminSecret || rawAdminSecret.length < 32) {
      console.error('WARNING: ADMIN_SECRET should be set (min 32 chars)')
    }
    if (rawAdminSecret && rawAdminSecret === process.env.NEXTAUTH_SECRET) {
      console.error('WARNING: ADMIN_SECRET should differ from NEXTAUTH_SECRET')
    }
  }
  return new TextEncoder().encode(rawAdminSecret || 'dev-admin-secret-not-for-production-32chars!')
}
const secret = getAdminSecret()

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export async function createAdminToken(adminId: number): Promise<string> {
  return new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('middledoc-admin')
    .setExpirationTime('8h')
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<{ adminId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { audience: 'middledoc-admin' })
    return { adminId: payload.adminId as number }
  } catch {
    return null
  }
}

export async function logAdminAction(
  adminId: number,
  action: string,
  targetType: string,
  targetId: number | null,
  details: Record<string, unknown> = {}
) {
  await query(
    `INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminId, action, targetType, targetId, JSON.stringify(details)]
  )
}
