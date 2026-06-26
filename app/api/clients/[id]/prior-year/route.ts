import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getMany, getOne } from '@/lib/db'
import { getUserTeamInfo, resolveOwnerAccountantId } from '@/lib/access'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const { id } = await params
      const clientId = parseInt(id, 10)

      if (isNaN(clientId)) {
        return NextResponse.json({ error: 'Invalid client id' }, { status: 400 })
      }

      // Resolve team-based access
      const teamInfo = await getUserTeamInfo(accountantId)
      const ownerAccountantId = await resolveOwnerAccountantId(accountantId, teamInfo)

      // Verify client belongs to the accountant
      const clientCheck = await getOne(
        'SELECT id FROM clients WHERE id = $1 AND accountant_id = $2',
        [clientId, ownerAccountantId]
      )
      if (!clientCheck) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      // Get aggregated document categories from prior requests
      const categories = await getMany<{
        category: string
        display_name: string
        count: number
      }>(
        `SELECT
           COALESCE(dc.accountant_override, dc.document_category) AS category,
           dcl.display_name,
           COUNT(*)::int AS count
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         LEFT JOIN document_classifications dc ON dc.upload_id = du.id
         LEFT JOIN document_category_labels dcl ON dcl.slug = COALESCE(dc.accountant_override, dc.document_category)
         WHERE dr.client_id = $1
           AND dr.accountant_id = $2
           AND dc.document_category IS NOT NULL
           AND dc.processing_status = 'completed'
         GROUP BY category, dcl.display_name
         ORDER BY count DESC`,
        [clientId, ownerAccountantId]
      )

      // Get totals
      const totals = await getOne<{ request_count: number; total_documents: number }>(
        `SELECT
           COUNT(DISTINCT dr.id)::int AS request_count,
           COUNT(du.id)::int AS total_documents
         FROM document_requests dr
         LEFT JOIN document_uploads du ON du.request_id = dr.id
         WHERE dr.client_id = $1 AND dr.accountant_id = $2`,
        [clientId, ownerAccountantId]
      )

      return NextResponse.json({
        categories: categories.map((c) => ({
          slug: c.category,
          display_name: c.display_name || c.category,
          count: c.count,
        })),
        request_count: totals?.request_count || 0,
        total_documents: totals?.total_documents || 0,
      })
    } catch (error) {
      console.error('GET /api/clients/[id]/prior-year error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
