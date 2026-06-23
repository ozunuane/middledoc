import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export async function withAuth(request: NextRequest, handler: (req: NextRequest, accountantId: number) => Promise<NextResponse>) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  return handler(request, payload.accountantId)
}

export function withoutAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  return { isAuthenticated: !!token }
}
