import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM accountants WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const result = await query(
      'INSERT INTO accountants (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, name]
    )

    const accountantId = result.rows[0].id
    const token = await createToken(accountantId)

    // Set auth cookie
    const response = NextResponse.json(
      { message: 'Account created successfully', accountantId },
      { status: 201 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
