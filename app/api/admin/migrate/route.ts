import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { timingSafeEqual } from 'crypto'
import pg from 'pg'

export async function POST(request: NextRequest) {
  // Protect with CRON_SECRET — timing-safe comparison
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || cronSecret.length < 16) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const expected = `Bearer ${cronSecret}`
  const authHeader = request.headers.get('authorization') || ''
  if (
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : (dbUrl.includes('.render.com') ? { rejectUnauthorized: false } : false),
  })

  const results: { file: string; status: string; detail?: string }[] = []

  try {
    await client.connect()

    // Acquire advisory lock to prevent concurrent migrations
    const lockResult = await client.query('SELECT pg_try_advisory_lock(42424242)')
    if (!lockResult.rows[0].pg_try_advisory_lock) {
      await client.end()
      return NextResponse.json({ error: 'Migration already in progress' }, { status: 409 })
    }

    // Run init.sql
    try {
      await client.query('BEGIN')
      const initSql = readFileSync(join(process.cwd(), 'scripts', 'init.sql'), 'utf-8')
      await client.query(initSql)
      await client.query('COMMIT')
      results.push({ file: 'init.sql', status: 'ok' })
    } catch (err: any) {
      await client.query('ROLLBACK')
      console.error('Migration init.sql failed:', err.message)
      results.push({ file: 'init.sql', status: 'error', detail: err.message })
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
      results.push({ file: 'scripts/', status: 'error' })
    }

    for (const file of migrations) {
      try {
        await client.query('BEGIN')
        const sql = readFileSync(join(scriptsDir, file), 'utf-8')
        await client.query(sql)
        await client.query('COMMIT')
        results.push({ file, status: 'ok' })
      } catch (err: any) {
        await client.query('ROLLBACK')
        const msg = err.message || ''
        if (msg.includes('already exists') || msg.includes('duplicate')) {
          results.push({ file, status: 'already_applied' })
        } else {
          console.error(`Migration ${file} failed:`, err.message)
          results.push({ file, status: 'error', detail: err.message })
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
    console.error('Migration connection failed:', err.message)
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  } finally {
    await client.query('SELECT pg_advisory_unlock(42424242)').catch(() => {})
    await client.end()
  }
}
