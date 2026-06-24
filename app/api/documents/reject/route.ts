import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { query, getOne } from '@/lib/db'
import { sendReminderEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { document_id, reason } = body

      if (!document_id || !reason?.trim()) {
        return NextResponse.json(
          { error: 'document_id and reason are required' },
          { status: 400 }
        )
      }

      // Verify the document belongs to a request owned by this accountant
      const doc = await getOne<{
        doc_id: number
        file_name: string
        request_id: number
        request_title: string
        share_token: string
        due_date: string
        client_name: string
        client_email: string
        accountant_name: string
        doc_status: string
      }>(
        `SELECT
           du.id AS doc_id,
           du.file_name,
           du.status AS doc_status,
           dr.id AS request_id,
           dr.title AS request_title,
           dr.share_token,
           dr.due_date,
           c.name AS client_name,
           c.email AS client_email,
           a.name AS accountant_name
         FROM document_uploads du
         JOIN document_requests dr ON dr.id = du.request_id
         JOIN clients c ON c.id = du.client_id
         JOIN accountants a ON a.id = dr.accountant_id
         WHERE du.id = $1 AND dr.accountant_id = $2`,
        [document_id, accountantId]
      )

      if (!doc) {
        return NextResponse.json(
          { error: 'Document not found or access denied' },
          { status: 404 }
        )
      }

      if (doc.doc_status === 'rejected') {
        return NextResponse.json(
          { error: 'Document is already rejected' },
          { status: 400 }
        )
      }

      // Update the document status
      await query(
        `UPDATE document_uploads
         SET status = 'rejected', rejection_reason = $1, rejected_at = NOW()
         WHERE id = $2`,
        [reason.trim(), document_id]
      )

      // Set the parent request status back to 'pending'
      await query(
        `UPDATE document_requests
         SET status = 'pending', updated_at = NOW()
         WHERE id = $1`,
        [doc.request_id]
      )

      // Send rejection email to the client
      await sendReminderEmail({
        clientEmail: doc.client_email,
        clientName: doc.client_name,
        accountantName: doc.accountant_name,
        requestTitle: doc.request_title,
        dueDate: doc.due_date,
        shareToken: doc.share_token,
        reminderType: 'rejection',
        fileName: doc.file_name,
        rejectionReason: reason.trim(),
      })

      return NextResponse.json({
        success: true,
        document_id,
        status: 'rejected',
      })
    } catch (error) {
      console.error('POST /api/documents/reject error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
