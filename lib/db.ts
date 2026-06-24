import { Pool, QueryResult } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    pool = new Pool({
      connectionString: databaseUrl,
      max: parseInt(process.env.DB_POOL_MAX ?? '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
        : false,
    })

    pool.on('error', (err) => {
      console.error('Unexpected idle client error:', err instanceof Error ? err.message : 'Unknown error')
    })
  }
  return pool
}

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const pool = getPool()
  try {
    return await pool.query(text, params)
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getOne<T>(text: string, params?: any[]): Promise<T | null> {
  const result = await query(text, params)
  return result.rows[0] || null
}

export async function getMany<T>(text: string, params?: any[]): Promise<T[]> {
  const result = await query(text, params)
  return result.rows
}

export async function withTransaction<T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
  const p = getPool()
  const client = await p.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
