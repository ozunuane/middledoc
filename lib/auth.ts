import { jwtVerify, SignJWT } from 'jose'
import bcryptjs from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'default-secret-change-this')

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export async function createToken(accountantId: number): Promise<string> {
  const token = await new SignJWT({ accountantId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
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
