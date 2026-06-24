import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyPassword, createAdminToken, logAdminAction } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const result = await query(
      'SELECT id, email, password_hash, name, role, is_active FROM super_admins WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const admin = result.rows[0]

    if (!admin.is_active) {
      return NextResponse.json({ error: 'Account is disabled' }, { status: 403 })
    }

    const isValid = await verifyPassword(password, admin.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await createAdminToken(admin.id)

    // Update last login
    await query('UPDATE super_admins SET last_login_at = NOW() WHERE id = $1', [admin.id])

    // Log the login action
    await logAdminAction(admin.id, 'login', 'super_admin', admin.id)

    const response = NextResponse.json(
      {
        message: 'Login successful',
        admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      },
      { status: 200 }
    )

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
