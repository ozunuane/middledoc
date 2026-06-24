import sgMail from '@sendgrid/mail'
import { query, getOne } from '@/lib/db'

// Initialize
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@middledoc.app'
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

export type ReminderType = 'initial' | '7day' | '3day' | 'deadline' | 'rejection'

interface SendReminderParams {
  clientEmail: string
  clientName: string
  accountantName: string
  accountantFirm?: string
  requestTitle: string
  dueDate: string
  shareToken: string
  pendingItems?: string[]
  reminderType: ReminderType
  /** Only used for rejection emails */
  fileName?: string
  rejectionReason?: string
}

// ---------------------------------------------------------------------------
// Default email templates
// ---------------------------------------------------------------------------

export interface DefaultTemplate {
  subject: string
  body: string
  cta: string
}

export const DEFAULT_TEMPLATES: Record<string, DefaultTemplate> = {
  initial: {
    subject: 'Documents needed for {requestTitle}',
    body: "I've put together a list of documents I'll need for {requestTitle}. There's no rush yet — everything is due by {dueDate}, but I wanted to send this early so you can gather things at your own pace.\n\nEverything's listed on one page. You can upload as you go — no account or password needed.",
    cta: "See what's needed",
  },
  '7day': {
    subject: 'Reminder: {requestTitle} due {dueDate}',
    body: "Just a friendly reminder that I'll need the documents for {requestTitle} by {dueDate}. You can upload them anytime — no account or login required.\n\nIf you have any questions, just reply to this email.",
    cta: "View & upload",
  },
  '3day': {
    subject: 'Due soon: {requestTitle}',
    body: "Quick heads up — {requestTitle} is due in a few days ({dueDate}). If you haven't had a chance to upload everything yet, there's still time.\n\nClick below to see what's still needed.",
    cta: 'Upload remaining',
  },
  deadline: {
    subject: "Today's the deadline for {requestTitle}",
    body: "Today is the deadline for {requestTitle}. If you can get the remaining documents to me by end of day, we'll stay on track.\n\nIf you need more time or have any questions, just reply to this email and we'll work it out.",
    cta: 'Upload now',
  },
  rejection: {
    subject: 'Action needed: {fileName} requires re-upload',
    body: 'I reviewed {fileName} and unfortunately need a different version. Here\'s why:\n\n{rejectionReason}\n\nPlease upload a corrected file through the link below.',
    cta: 'Re-upload document',
  },
}

export function getDefaultTemplates(): Record<string, DefaultTemplate> {
  return { ...DEFAULT_TEMPLATES }
}

interface BatchReminderParams {
  clientEmail: string
  clientName: string
  accountantName: string
  requests: Array<{ title: string; dueDate: string; shareToken: string }>
}

// ---------------------------------------------------------------------------
// Email template helpers
// ---------------------------------------------------------------------------

function getBarColor(reminderType: ReminderType): string {
  switch (reminderType) {
    case 'initial':
    case '7day':
      return '#0F7A63'
    case '3day':
      return '#E6A23C'
    case 'deadline':
    case 'rejection':
      return '#C0492F'
  }
}

function getSubject(reminderType: ReminderType, requestTitle: string, pendingItems?: string[], fileName?: string): string {
  switch (reminderType) {
    case 'initial':
      return `A few documents for your ${requestTitle}`
    case '7day':
      return `A few documents for your ${requestTitle}`
    case '3day': {
      const count = pendingItems?.length ?? 0
      return count > 0
        ? `${count} document${count === 1 ? '' : 's'} left before the deadline`
        : `Documents still needed for ${requestTitle}`
    }
    case 'deadline':
      return `Today's the deadline -- but we have options`
    case 'rejection':
      return `Action needed: ${fileName ?? 'your document'} was not accepted`
  }
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function getBodyHtml(params: SendReminderParams): string {
  const formattedDue = formatDueDate(params.dueDate)

  switch (params.reminderType) {
    case 'initial':
    case '7day':
      return `
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">Hi ${params.clientName},</p>
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">I've put together everything I'll need for <strong style="color:#17191C;">${params.requestTitle}</strong>. There's no rush yet &mdash; the documents are due <strong style="color:#17191C;">${formattedDue}</strong>, but I wanted to get this to you early so you can gather things at your own pace.</p>
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 22px;">Everything's listed on one page. You can upload as you go &mdash; no account or password needed.</p>
      `

    case '3day': {
      let pendingBlock = ''
      if (params.pendingItems && params.pendingItems.length > 0) {
        const items = params.pendingItems
          .map(
            (item) =>
              `<div style="display:flex; align-items:center; gap:9px; margin-bottom:9px;"><div style="width:16px;height:16px;border-radius:50%;border:1.5px solid #C9A24A;"></div><span style="font-size:14px; color:#17191C;">${item}</span></div>`
          )
          .join('')
        pendingBlock = `<div style="background:#FEFAEE; border:1px solid #F0E0AE; border-radius:10px; padding:14px 16px; margin-bottom:20px;">${items}</div>`
      }

      return `
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">Hi ${params.clientName},</p>
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 16px;">You're almost done. To wrap up <strong style="color:#17191C;">${params.requestTitle}</strong> by <strong style="color:#17191C;">${formattedDue}</strong>, I still need:</p>
        ${pendingBlock}
      `
    }

    case 'deadline':
      return `
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">Hi ${params.clientName},</p>
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">Today is the deadline for <strong style="color:#17191C;">${params.requestTitle}</strong>. If you can get the remaining documents to me by end of day, we'll stay on track.</p>
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 22px;">If you're stuck on anything or need an extension, just reply to this email and we'll sort it out together.</p>
      `

    case 'rejection':
      return `
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">Hi ${params.clientName},</p>
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">I reviewed <strong style="color:#17191C;">${params.fileName ?? 'your document'}</strong> and unfortunately need a different version.</p>
        <div style="background:#FEF2F0; border:1px solid #F0C0B8; border-radius:10px; padding:14px 16px; margin-bottom:20px;">
          <p style="font-size:14px; color:#8B2517; margin:0; font-weight:600;">Reason</p>
          <p style="font-size:14px; color:#3A3D42; margin:6px 0 0;">${params.rejectionReason ?? ''}</p>
        </div>
        <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 22px;">Please re-upload through the link below.</p>
      `
  }
}

function getCtaText(reminderType: ReminderType, pendingCount?: number): string {
  switch (reminderType) {
    case 'initial':
    case '7day':
      return 'See what\'s needed'
    case '3day':
      return pendingCount ? `Upload the last ${pendingCount}` : 'Upload remaining'
    case 'deadline':
      return 'Upload now'
    case 'rejection':
      return 'Re-upload document'
  }
}

function buildEmailHtml(params: SendReminderParams): string {
  const barColor = getBarColor(params.reminderType)
  const portalUrl = `${BASE_URL}/portal/${params.shareToken}`
  const body = getBodyHtml(params)
  const ctaText = getCtaText(params.reminderType, params.pendingItems?.length)
  const signature = params.accountantFirm
    ? `${params.accountantName} &middot; ${params.accountantFirm}`
    : params.accountantName

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; padding:20px; background:#f5f5f0;">
<div style="max-width:560px; margin:0 auto; font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="background:#fff; border:1px solid #E7E1D5; border-radius:13px; overflow:hidden;">
    <div style="height:5px; background:${barColor};"></div>
    <div style="padding:26px 26px 28px;">
      <div style="margin-bottom:22px;">
        <!--[if mso]>
        <table cellpadding="0" cellspacing="0"><tr><td style="width:24px;height:24px;border-radius:6px;background:#17191C;text-align:center;vertical-align:middle;"><span style="color:#10A37F;font-size:9px;">&#9632;</span></td><td style="padding-left:9px;"><span style="font-size:14px;font-weight:600;color:#17191C;">MiddleDoc</span></td></tr></table>
        <![endif]-->
        <!--[if !mso]><!-->
        <div style="display:inline-flex; align-items:center; gap:9px;">
          <div style="width:24px; height:24px; border-radius:6px; background:#17191C; display:inline-flex; align-items:center; justify-content:center;">
            <div style="width:9px; height:9px; border-radius:2px; background:#10A37F;"></div>
          </div>
          <span style="font-size:14px; font-weight:600; color:#17191C;">MiddleDoc</span>
        </div>
        <!--<![endif]-->
      </div>
      ${body}
      <a href="${portalUrl}" style="display:inline-block; background:#0F7A63; color:#fff; font-size:14.5px; font-weight:600; padding:12px 24px; border-radius:9px; text-decoration:none; margin-bottom:22px;">${ctaText}</a>
      <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0;">${signature}</p>
    </div>
  </div>
</div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Batch email template
// ---------------------------------------------------------------------------

function buildBatchEmailHtml(params: BatchReminderParams): string {
  const requestRows = params.requests
    .map((r) => {
      const url = `${BASE_URL}/portal/${r.shareToken}`
      const due = formatDueDate(r.dueDate)
      return `<tr>
        <td style="padding:10px 0; border-bottom:1px solid #EFEAE0;">
          <a href="${url}" style="font-size:14px; color:#0F7A63; font-weight:600; text-decoration:none;">${r.title}</a>
          <div style="font-size:12px; color:#7A7468; margin-top:2px;">Due ${due}</div>
        </td>
      </tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; padding:20px; background:#f5f5f0;">
<div style="max-width:560px; margin:0 auto; font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="background:#fff; border:1px solid #E7E1D5; border-radius:13px; overflow:hidden;">
    <div style="height:5px; background:#0F7A63;"></div>
    <div style="padding:26px 26px 28px;">
      <div style="margin-bottom:22px;">
        <div style="display:inline-flex; align-items:center; gap:9px;">
          <div style="width:24px; height:24px; border-radius:6px; background:#17191C; display:inline-flex; align-items:center; justify-content:center;">
            <div style="width:9px; height:9px; border-radius:2px; background:#10A37F;"></div>
          </div>
          <span style="font-size:14px; font-weight:600; color:#17191C;">MiddleDoc</span>
        </div>
      </div>
      <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 14px;">Hi ${params.clientName},</p>
      <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0 0 18px;">You have ${params.requests.length} pending request${params.requests.length === 1 ? '' : 's'} that still need your documents:</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:22px;">${requestRows}</table>
      <a href="${BASE_URL}/portal/${params.requests[0].shareToken}" style="display:inline-block; background:#0F7A63; color:#fff; font-size:14.5px; font-weight:600; padding:12px 24px; border-radius:9px; text-decoration:none; margin-bottom:22px;">View your requests</a>
      <p style="font-size:14.5px; line-height:1.6; color:#3A3D42; margin:0;">${params.accountantName}</p>
    </div>
  </div>
</div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendReminderEmail(
  params: SendReminderParams
): Promise<{ success: boolean; error?: string }> {
  const subject = getSubject(params.reminderType, params.requestTitle, params.pendingItems, params.fileName)
  const html = buildEmailHtml(params)

  if (!SENDGRID_API_KEY) {
    console.log('[DEV] Email would be sent:')
    console.log(`  To: ${params.clientEmail}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Type: ${params.reminderType}`)
    console.log(`  Portal: ${BASE_URL}/portal/${params.shareToken}`)
    return { success: true }
  }

  try {
    await sgMail.send({
      to: params.clientEmail,
      from: { email: FROM_EMAIL, name: params.accountantName },
      subject,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email'
    console.error('SendGrid error:', err)
    return { success: false, error: message }
  }
}

export async function sendBatchReminder(
  params: BatchReminderParams
): Promise<{ success: boolean; error?: string }> {
  const subject = `You have ${params.requests.length} pending document request${params.requests.length === 1 ? '' : 's'}`
  const html = buildBatchEmailHtml(params)

  if (!SENDGRID_API_KEY) {
    console.log('[DEV] Batch email would be sent:')
    console.log(`  To: ${params.clientEmail}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Requests: ${params.requests.length}`)
    return { success: true }
  }

  try {
    await sgMail.send({
      to: params.clientEmail,
      from: { email: FROM_EMAIL, name: params.accountantName },
      subject,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send batch email'
    console.error('SendGrid batch error:', err)
    return { success: false, error: message }
  }
}

export async function hasReminderBeenSent(
  requestId: number,
  reminderType: ReminderType
): Promise<boolean> {
  const row = await getOne<{ id: number }>(
    `SELECT id FROM email_reminders
     WHERE request_id = $1
       AND reminder_type = $2
       AND sent_at > NOW() - INTERVAL '24 hours'
     LIMIT 1`,
    [requestId, reminderType]
  )
  return row !== null
}

export async function logReminderSent(
  requestId: number,
  clientId: number,
  reminderType: ReminderType
): Promise<void> {
  await query(
    `INSERT INTO email_reminders (request_id, client_id, reminder_type)
     VALUES ($1, $2, $3)`,
    [requestId, clientId, reminderType]
  )
}
