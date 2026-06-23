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
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
