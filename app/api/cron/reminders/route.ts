import { NextRequest, NextResponse } from 'next/server'
import { getMany } from '@/lib/db'
import {
  sendReminderEmail,
  hasReminderBeenSent,
  logReminderSent,
  type ReminderType,
} from '@/lib/email'

interface UpcomingRequest {
  id: number
  title: string
  due_date: string
  share_token: string
  client_email: string
  client_name: string
  accountant_name: string
  accountant_email: string
  accountant_id: number
  client_id: number
}

function getReminderType(dueDate: string): ReminderType | null {
  const due = new Date(dueDate)
  const today = new Date()
  due.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilDue = Math.round((due.getTime() - today.getTime()) / msPerDay)

  if (daysUntilDue === 0) return 'deadline'
  if (daysUntilDue >= 1 && daysUntilDue <= 3) return '3day'
  if (daysUntilDue >= 4 && daysUntilDue <= 7) return '7day'
  return null
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find requests due within 7 days that are still pending
    const upcoming = await getMany<UpcomingRequest>(
      `SELECT dr.id, dr.title, dr.due_date, dr.share_token,
              c.email AS client_email, c.name AS client_name, c.id AS client_id,
              a.name AS accountant_name, a.email AS accountant_email, a.id AS accountant_id
       FROM document_requests dr
       JOIN clients c ON c.id = dr.client_id
       JOIN accountants a ON a.id = dr.accountant_id
       WHERE dr.status = 'pending'
       AND dr.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
    )

    let sent = 0
    let skipped = 0
    const errors: string[] = []

    for (const req of upcoming) {
      const reminderType = getReminderType(req.due_date)
      if (!reminderType) {
        skipped++
        continue
      }

      // Dedup check
      const alreadySent = await hasReminderBeenSent(req.id, reminderType)
      if (alreadySent) {
        skipped++
        continue
      }

      try {
        // Fetch notification BCC emails for this accountant
        const notificationEmails = await getMany<{ email: string }>(
          `SELECT email FROM notification_emails WHERE accountant_id = $1`,
          [req.accountant_id]
        )
        const bccEmails = [req.accountant_email, ...notificationEmails.map(n => n.email)]

        const result = await sendReminderEmail({
          clientEmail: req.client_email,
          clientName: req.client_name || 'there',
          accountantName: req.accountant_name || 'Your accountant',
          bccEmails,
          requestTitle: req.title,
          dueDate: req.due_date,
          shareToken: req.share_token,
          reminderType,
        })

        if (result.success) {
          await logReminderSent(req.id, req.client_id, reminderType)
          sent++
        } else {
          errors.push(`Failed to send to ${req.client_email}: ${result.error}`)
        }
      } catch (err) {
        errors.push(`Error for request ${req.id}: ${err instanceof Error ? err.message : 'Unknown'}`)
      }
    }

    return NextResponse.json({
      success: true,
      total_checked: upcoming.length,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('GET /api/cron/reminders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
