import { NextRequest, NextResponse } from 'next/server'
import { getOne, query } from '@/lib/db'

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Always return success to avoid revealing whether the email exists
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    })

    // Find the accountant
    const accountant = await getOne<{ id: number; name: string }>(
      'SELECT id, name FROM accountants WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (!accountant) {
      return successResponse
    }

    // Invalidate any existing unused tokens for this user
    await query(
      `UPDATE password_reset_tokens SET used_at = NOW()
       WHERE accountant_id = $1 AND used_at IS NULL`,
      [accountant.id]
    )

    // Create a new reset token
    const tokenRow = await getOne<{ token: string }>(
      `INSERT INTO password_reset_tokens (accountant_id)
       VALUES ($1) RETURNING token`,
      [accountant.id]
    )

    if (!tokenRow) {
      console.error('Failed to create password reset token')
      return successResponse
    }

    const resetUrl = `${BASE_URL}/auth/reset-password?token=${tokenRow.token}`

    // Send the email (use SendGrid if configured, otherwise log)
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@middledoc.app'

    if (SENDGRID_API_KEY) {
      const sgMail = (await import('@sendgrid/mail')).default
      sgMail.setApiKey(SENDGRID_API_KEY)

      await sgMail.send({
        to: email,
        from: { email: FROM_EMAIL, name: 'MiddleDoc' },
        subject: 'Reset your MiddleDoc password',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; padding:20px; background:#f5f5f0;">
<div style="max-width:560px; margin:0 auto; font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="background:#fff; border:1px solid #E7E1D5; border-radius:13px; overflow:hidden;">
    <div style="height:5px; background:#0F7A63;"></div>
    <div style="padding:26px 26px 28px;">
      <div style="margin-bottom:22px;">
        <div style="display:inline-flex; align-items:center; gap:9px;">
          <div style="width:24px; height:24px; border-radius:6px; background:#17191C; display:inline-flex; align-items:center; justify-content:center;">
            <div style="width:9px; height:9px; border-radius:2px; background:#10A37F;"></div>
          </div>
          <span style="font-size:14px; font-weight:600; color:#17191C;">MiddleDoc</span>
        </div>
      </div>
      <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">Hi ${accountant.name || 'there'},</p>
      <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 22px;">We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block; background:#0F7A63; color:#fff; font-size:14.5px; font-weight:600; padding:12px 24px; border-radius:9px; text-decoration:none; margin-bottom:22px;">Reset password</a>
      <p style="font-size:13px; line-height:1.6; color:#7A7468; margin:16px 0 0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
</div>
</body>
</html>`,
      })
    } else {
      console.log('[DEV] Password reset email would be sent:')
      console.log(`  To: ${email}`)
      console.log(`  Reset URL: ${resetUrl}`)
    }

    return successResponse
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
