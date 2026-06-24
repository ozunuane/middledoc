import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getUserTeamInfo } from '@/lib/access'

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      const teamInfo = await getUserTeamInfo(accountantId)
      return NextResponse.json({
        role: teamInfo.role,
        teamId: teamInfo.teamId,
      })
    } catch (error) {
      console.error('GET /api/auth/team-role error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
