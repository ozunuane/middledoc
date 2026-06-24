import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware'
import { getOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAdmin(request, async (_req, adminId) => {
    try {
      const admin = await getOne<{
        id: number
        email: string
        name: string
        role: string
        last_login_at: string | null
        created_at: string
      }>(
        'SELECT id, email, name, role, last_login_at, created_at FROM super_admins WHERE id = $1',
        [adminId]
      )

      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
      }

      return NextResponse.json({ admin })
    } catch (error) {
      console.error('GET /api/admin/auth/me error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
