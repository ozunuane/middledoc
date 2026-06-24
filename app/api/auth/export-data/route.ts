import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne, getMany } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const account = await getOne(
        `SELECT id, email, name, firm_name, created_at FROM accountants WHERE id = $1`,
        [accountantId]
      )

      const clients = await getMany(
        `SELECT * FROM clients WHERE accountant_id = $1`,
        [accountantId]
      )

      const requests = await getMany(
        `SELECT * FROM document_requests WHERE accountant_id = $1`,
        [accountantId]
      )

      const uploads = await getMany(
        `SELECT du.* FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         WHERE dr.accountant_id = $1`,
        [accountantId]
      )

      const reminders = await getMany(
        `SELECT er.* FROM email_reminders er
         JOIN clients c ON c.id = er.client_id
         WHERE c.accountant_id = $1`,
        [accountantId]
      )

      const teams = await getMany(
        `SELECT t.* FROM teams t WHERE t.owner_id = $1`,
        [accountantId]
      )

      const teamMembers = await getMany(
        `SELECT tm.* FROM team_members tm
         JOIN teams t ON t.id = tm.team_id
         WHERE t.owner_id = $1`,
        [accountantId]
      )

      const data = {
        account,
        clients,
        requests,
        uploads,
        reminders,
        teams,
        team_members: teamMembers,
        exported_at: new Date().toISOString(),
      }

      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="middledoc-export-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      })
    } catch (error) {
      console.error('GET /api/auth/export-data error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
