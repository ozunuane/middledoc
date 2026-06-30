import { jwtVerify, SignJWT } from 'jose'
import bcryptjs from 'bcryptjs'

function getSecret() {
  const rawSecret = process.env.NEXTAUTH_SECRET
  if (!rawSecret || rawSecret.includes('change') || rawSecret.length < 32) {
    // Don't throw during build — only at runtime when actually used
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.NEXT_PHASE) {
      console.error('WARNING: NEXTAUTH_SECRET should be set to a strong random value (min 32 chars)')
    }
  }
  return new TextEncoder().encode(rawSecret || 'dev-only-secret-not-for-production-use-32chars!')
}
const secret = getSecret()

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export async function createToken(accountantId: number): Promise<string> {
  const token = await new SignJWT({ accountantId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)
  return token
}

export async function verifyToken(token: string): Promise<{ accountantId: number } | null> {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as { accountantId: number }
  } catch {
    return null
  }
}
