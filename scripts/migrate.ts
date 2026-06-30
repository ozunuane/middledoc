// Auto-migration script — runs all SQL migrations against DATABASE_URL
// Usage: npx tsx scripts/migrate.ts

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

async function migrate() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : false,
  })

  let hasErrors = false

  try {
    await client.connect()
    console.log('Connected to database')

    // Run init.sql first (creates all tables with IF NOT EXISTS)
    const initSql = readFileSync(join(process.cwd(), 'scripts', 'init.sql'), 'utf-8')
    console.log('Running init.sql...')
    await client.query(initSql)
    console.log('  ✓ init.sql')

    // Run all migrate-*.sql files
    const scriptsDir = join(process.cwd(), 'scripts')
    const migrations = readdirSync(scriptsDir)
      .filter(f => f.startsWith('migrate-') && f.endsWith('.sql'))
      .sort()

    for (const file of migrations) {
      const sql = readFileSync(join(scriptsDir, file), 'utf-8')
      console.log(`Running ${file}...`)
      try {
        await client.query(sql)
        console.log(`  ✓ ${file}`)
      } catch (err: any) {
        // Ignore "already exists" errors — migrations are idempotent
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          console.log(`  ⚠ ${file} (already applied)`)
        } else {
          console.error(`  ✗ ${file}: ${err.message}`)
          hasErrors = true
        }
      }
    }

    if (hasErrors) {
      console.error('\nSome migrations failed')
      process.exit(1)
    }

    console.log('\nMigrations complete ✓')
  } catch (err: any) {
    console.error('Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
