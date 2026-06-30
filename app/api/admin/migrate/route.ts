import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

export async function POST(request: NextRequest) {
  // Protect with CRON_SECRET (same as cron endpoints)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('render.com') ? { rejectUnauthorized: false } : false,
  })

  const results: { file: string; status: string; error?: string }[] = []

  try {
    await client.connect()

    // Run init.sql
    try {
      const initSql = readFileSync(join(process.cwd(), 'scripts', 'init.sql'), 'utf-8')
      await client.query(initSql)
      results.push({ file: 'init.sql', status: 'ok' })
    } catch (err: any) {
      results.push({ file: 'init.sql', status: 'error', error: err.message?.slice(0, 200) })
    }

    // Run all migrate-*.sql files
    const scriptsDir = join(process.cwd(), 'scripts')
    let migrations: string[] = []
    try {
      migrations = readdirSync(scriptsDir)
        .filter(f => f.startsWith('migrate-') && f.endsWith('.sql'))
        .sort()
    } catch {
      // Scripts dir might not exist in standalone build
      results.push({ file: 'scripts/', status: 'error', error: 'Scripts directory not found' })
    }

    for (const file of migrations) {
      try {
        const sql = readFileSync(join(scriptsDir, file), 'utf-8')
        await client.query(sql)
        results.push({ file, status: 'ok' })
      } catch (err: any) {
        const msg = err.message || ''
        if (msg.includes('already exists') || msg.includes('duplicate')) {
          results.push({ file, status: 'already_applied' })
        } else {
          results.push({ file, status: 'error', error: msg.slice(0, 200) })
        }
      }
    }

    const ok = results.filter(r => r.status === 'ok').length
    const applied = results.filter(r => r.status === 'already_applied').length
    const errors = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      success: true,
      summary: { ok, already_applied: applied, errors },
      results,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Connection failed: ' + err.message }, { status: 500 })
  } finally {
    await client.end()
  }
}
