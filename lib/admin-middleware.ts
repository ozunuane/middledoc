import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from './admin-auth'

export async function withAdmin(
  request: NextRequest,
  handler: (req: NextRequest, adminId: number) => Promise<NextResponse>
) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
  }
  const payload = await verifyAdminToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid admin session' }, { status: 401 })
  }
  return handler(request, payload.adminId)
}
