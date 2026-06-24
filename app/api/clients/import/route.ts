import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { clients } = body

      if (!Array.isArray(clients) || clients.length === 0) {
        return NextResponse.json(
          { error: 'Request body must contain a non-empty "clients" array' },
          { status: 400 }
        )
      }

      if (clients.length > 1000) {
        return NextResponse.json(
          { error: 'Maximum 1,000 clients per import' },
          { status: 400 }
        )
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const errors: string[] = []
      const validClients: Array<{ name: string; email: string; row: number }> = []

      // Validate each entry
      for (let i = 0; i < clients.length; i++) {
        const entry = clients[i]
        const row = entry.row ?? i + 1

        if (!entry.name || typeof entry.name !== 'string' || !entry.name.trim()) {
          errors.push(`Row ${row}: missing name`)
          continue
        }

        if (!entry.email || typeof entry.email !== 'string' || !entry.email.trim()) {
          errors.push(`Row ${row}: missing email`)
          continue
        }

        if (!emailRegex.test(entry.email.trim())) {
          errors.push(`Row ${row}: invalid email format`)
          continue
        }

        validClients.push({
          name: entry.name.trim(),
          email: entry.email.trim().toLowerCase(),
          row,
        })
      }

      // Check for duplicates within the import batch itself
      const seenEmails = new Map<string, number>()
      const deduped: typeof validClients = []
      for (const c of validClients) {
        if (seenEmails.has(c.email)) {
          errors.push(`Row ${c.row}: duplicate of row ${seenEmails.get(c.email)}`)
        } else {
          seenEmails.set(c.email, c.row)
          deduped.push(c)
        }
      }

      // Fetch existing emails for this accountant to detect duplicates
      const pool = getPool()
      const dbClient = await pool.connect()
      let imported = 0
      let skipped = 0

      try {
        await dbClient.query('BEGIN')

        // Get all existing emails for this accountant in one query
        const existingResult = await dbClient.query(
          'SELECT email FROM clients WHERE accountant_id = $1',
          [accountantId]
        )
        const existingEmails = new Set(
          existingResult.rows.map((r: { email: string }) => r.email.toLowerCase())
        )

        for (const entry of deduped) {
          if (existingEmails.has(entry.email)) {
            skipped++
            continue
          }

          await dbClient.query(
            'INSERT INTO clients (accountant_id, email, name) VALUES ($1, $2, $3)',
            [accountantId, entry.email, entry.name]
          )
          // Track the email so duplicates within the batch are caught
          existingEmails.add(entry.email)
          imported++
        }

        await dbClient.query('COMMIT')
      } catch (err) {
        await dbClient.query('ROLLBACK')
        console.error('Import transaction error:', err)
        return NextResponse.json(
          { error: 'Import failed. No clients were imported.' },
          { status: 500 }
        )
      } finally {
        dbClient.release()
      }

      return NextResponse.json({
        imported,
        skipped,
        errors,
        total: clients.length,
      })
    } catch (error) {
      console.error('POST /api/clients/import error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
