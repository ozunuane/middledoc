import { SignJWT, jwtVerify } from 'jose'
import bcryptjs from 'bcryptjs'
import { query, getOne } from './db'

function getAdminSecret() {
  const rawAdminSecret = process.env.ADMIN_SECRET
  if (!rawAdminSecret || rawAdminSecret.length < 32) {
    // Skip during Next.js build phase
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return new TextEncoder().encode('build-phase-placeholder-not-used-at-runtime!')
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_SECRET must be set to a strong random value (min 32 chars)')
    }
  }
  if (process.env.NODE_ENV === 'production' && rawAdminSecret && rawAdminSecret === process.env.NEXTAUTH_SECRET) {
    throw new Error('ADMIN_SECRET must differ from NEXTAUTH_SECRET')
  }
  return new TextEncoder().encode(rawAdminSecret || 'dev-admin-secret-not-for-production-32chars!')
}

let _secret: Uint8Array | null = null
function getSecretValue(): Uint8Array {
  if (!_secret) _secret = getAdminSecret()
  return _secret
}

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
    .sign(getSecretValue())
}

export async function verifyAdminToken(token: string): Promise<{ adminId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretValue(), { audience: 'middledoc-admin' })
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
