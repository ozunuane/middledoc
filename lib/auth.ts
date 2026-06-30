import { jwtVerify, SignJWT } from 'jose'
import bcryptjs from 'bcryptjs'

function getSecret() {
  const rawSecret = process.env.NEXTAUTH_SECRET
  if (!rawSecret || rawSecret.length < 32) {
    // Skip during Next.js build phase
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return new TextEncoder().encode('build-phase-placeholder-not-used-at-runtime!')
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET must be set to a strong random value (min 32 chars)')
    }
  }
  return new TextEncoder().encode(rawSecret || 'dev-only-secret-not-for-production-use-32chars!')
}

let _secret: Uint8Array | null = null
function getSecretValue(): Uint8Array {
  if (!_secret) _secret = getSecret()
  return _secret
}

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
    .sign(getSecretValue())
  return token
}

export async function verifyToken(token: string): Promise<{ accountantId: number } | null> {
  try {
    const verified = await jwtVerify(token, getSecretValue())
    return verified.payload as { accountantId: number }
  } catch {
    return null
  }
}
