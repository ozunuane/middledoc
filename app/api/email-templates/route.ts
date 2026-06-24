import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getMany, query, getOne } from '@/lib/db'
import { DEFAULT_TEMPLATES } from '@/lib/email'

interface DbTemplate {
  id: number
  template_type: string
  subject: string
  body_text: string
  cta_text: string | null
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, accountantId) => {
    try {
      // Fetch the accountant's custom templates
      const customTemplates = await getMany<DbTemplate>(
        `SELECT id, template_type, subject, body_text, cta_text
         FROM email_templates
         WHERE accountant_id = $1`,
        [accountantId]
      )

      const customMap = new Map(
        customTemplates.map((t) => [t.template_type, t])
      )

      // Merge defaults with custom overrides
      const merged = Object.entries(DEFAULT_TEMPLATES).map(
        ([type, defaults]) => {
          const custom = customMap.get(type)
          if (custom) {
            return {
              type,
              subject: custom.subject,
              body: custom.body_text,
              cta: custom.cta_text ?? defaults.cta,
              isCustom: true,
            }
          }
          return {
            type,
            subject: defaults.subject,
            body: defaults.body,
            cta: defaults.cta,
            isCustom: false,
          }
        }
      )

      return NextResponse.json(merged)
    } catch (error) {
      console.error('GET /api/email-templates error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { type, subject, body: bodyText, cta } = body

      if (!type || !subject?.trim() || !bodyText?.trim()) {
        return NextResponse.json(
          { error: 'type, subject, and body are required' },
          { status: 400 }
        )
      }

      // Validate template type
      if (!DEFAULT_TEMPLATES[type]) {
        return NextResponse.json(
          { error: `Invalid template type: ${type}` },
          { status: 400 }
        )
      }

      // Upsert
      await query(
        `INSERT INTO email_templates (accountant_id, template_type, subject, body_text, cta_text, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (accountant_id, template_type)
         DO UPDATE SET subject = $3, body_text = $4, cta_text = $5, updated_at = NOW()`,
        [accountantId, type, subject.trim(), bodyText.trim(), cta?.trim() || null]
      )

      return NextResponse.json({ success: true, type })
    } catch (error) {
      console.error('PUT /api/email-templates error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, accountantId) => {
    try {
      const body = await req.json()
      const { type } = body

      if (!type) {
        return NextResponse.json(
          { error: 'type is required' },
          { status: 400 }
        )
      }

      const result = await query(
        `DELETE FROM email_templates
         WHERE accountant_id = $1 AND template_type = $2`,
        [accountantId, type]
      )

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'No custom template found for this type' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, type, reverted: true })
    } catch (error) {
      console.error('DELETE /api/email-templates error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
