import { SignJWT, jwtVerify } from 'jose'
import bcryptjs from 'bcryptjs'
import { query, getOne } from './db'

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || 'dev-only-secret-not-for-production-use-32chars!'
)

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export async function createAdminToken(adminId: number): Promise<string> {
  return new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<{ adminId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
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
