import { NextRequest, NextResponse } from 'next/server'
import { getOne, query } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Find the token - must be valid, not expired, and not used
    const resetToken = await getOne<{ id: number; accountant_id: number }>(
      `SELECT id, accountant_id FROM password_reset_tokens
       WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    )

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await hashPassword(password)

    // Update the password
    await query(
      'UPDATE accountants SET password_hash = $1 WHERE id = $2',
      [passwordHash, resetToken.accountant_id]
    )

    // Mark the token as used
    await query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
      [resetToken.id]
    )

    return NextResponse.json({ message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
