import { NextRequest, NextResponse } from 'next/server'
import { query, getOne } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    // Create default admin if none exists
    const existing = await getOne<{ id: number }>(
      'SELECT id FROM super_admins WHERE email = $1',
      ['admin@middledoc.com']
    )

    if (!existing) {
      const hash = await bcryptjs.hash('AdminMiddleDoc2026!', 12)
      await query(
        `INSERT INTO super_admins (email, password_hash, name, role)
         VALUES ($1, $2, $3, 'super_admin')
         ON CONFLICT (email) DO NOTHING`,
        ['admin@middledoc.com', hash, 'Platform Admin']
      )
      results.push('admin created ✓')
    } else {
      results.push('admin already exists ✓')
    }

    // Verify plans exist
    const planCount = await getOne<{ count: string }>('SELECT COUNT(*) AS count FROM plans')
    results.push(`${planCount?.count || 0} plans exist ✓`)

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 })
  }
}
