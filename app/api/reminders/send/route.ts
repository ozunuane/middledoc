import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getOne, getMany } from '@/lib/db'
import {
  sendReminderEmail,
  hasReminderBeenSent,
  logReminderSent,
  type ReminderType,
} from '@/lib/email'

interface RequestWithDetails {
  id: number
  title: string
  description: string | null
  due_date: string
  status: string
  share_token: string
  client_id: number
  client_email: string
  client_name: string
  accountant_id: number
  accountant_name: string
  accountant_email: string
}

function determineReminderType(dueDate: string): ReminderType {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / msPerDay)

  if (daysUntilDue <= 0) return 'deadline'
  if (daysUntilDue <= 2) return '3day'
  if (daysUntilDue <= 5) return '7day'
  return 'initial'
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { request_id } = body

      if (!request_id) {
        return NextResponse.json(
          { error: 'Missing required field: request_id' },
          { status: 400 }
        )
      }

      // Get request details with client and accountant info
      const requestData = await getOne<RequestWithDetails>(
        `SELECT
           dr.id,
           dr.title,
           dr.description,
           dr.due_date,
           dr.status,
           dr.share_token,
           dr.client_id,
           c.email AS client_email,
           c.name AS client_name,
           dr.accountant_id,
           a.name AS accountant_name,
           a.email AS accountant_email
         FROM document_requests dr
         JOIN clients c ON c.id = dr.client_id
         JOIN accountants a ON a.id = dr.accountant_id
         WHERE dr.id = $1`,
        [request_id]
      )

      if (!requestData) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      }

      // Verify ownership
      if (requestData.accountant_id !== accountantId) {
        return NextResponse.json(
          { error: 'Not authorized to send reminders for this request' },
          { status: 403 }
        )
      }

      // Only send for pending or overdue requests
      if (!['pending', 'overdue'].includes(requestData.status)) {
        return NextResponse.json(
          { error: `Cannot send reminder for request with status "${requestData.status}"` },
          { status: 400 }
        )
      }

      // Determine reminder type
      const reminderType = determineReminderType(requestData.due_date)

      // Dedup: check if same type sent in last 24 hours
      const alreadySent = await hasReminderBeenSent(requestData.id, reminderType)
      if (alreadySent) {
        return NextResponse.json(
          { error: 'A reminder of this type was already sent in the last 24 hours' },
          { status: 429 }
        )
      }

      // Fetch notification BCC emails
      const notificationEmails = await getMany<{ email: string }>(
        `SELECT email FROM notification_emails WHERE accountant_id = $1`,
        [accountantId]
      )

      const bccEmails = [requestData.accountant_email, ...notificationEmails.map(n => n.email)]

      // Send the email
      const result = await sendReminderEmail({
        clientEmail: requestData.client_email,
        clientName: requestData.client_name || 'there',
        accountantName: requestData.accountant_name || 'Your accountant',
        bccEmails,
        requestTitle: requestData.title,
        dueDate: requestData.due_date,
        shareToken: requestData.share_token,
        reminderType,
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to send email' },
          { status: 500 }
        )
      }

      // Log the reminder
      await logReminderSent(requestData.id, requestData.client_id, reminderType)

      return NextResponse.json({
        success: true,
        message: `Reminder sent to ${requestData.client_email}`,
        reminder_type: reminderType,
      })
    } catch (error) {
      console.error('POST /api/reminders/send error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}
