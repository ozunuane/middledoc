import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import path from 'path'
import { query, getOne } from './db'

// PRIVACY NOTE: Document content is sent to OpenAI/Anthropic for classification.
// Both providers' API terms prohibit using API inputs for training.
// Consider on-premise models for highest sensitivity requirements.

// Provider selection: set AI_PROVIDER=anthropic or AI_PROVIDER=openai in .env.local
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null

const CATEGORY_TAXONOMY = `
w2: W-2 (Wage and Tax Statement)
1099_nec: 1099-NEC (Nonemployee Compensation)
1099_int: 1099-INT (Interest Income)
1099_div: 1099-DIV (Dividends)
1099_b: 1099-B (Broker Transactions)
1099_r: 1099-R (Retirement Distributions)
1099_misc: 1099-MISC (Miscellaneous Income)
k1: K-1 (Partner/Shareholder Income)
w9: W-9 (Request for Taxpayer ID)
bank_statement: Bank Statement
credit_card_statement: Credit Card Statement
mortgage_statement: Mortgage Statement (1098)
property_tax: Property Tax Statement
profit_loss: Profit & Loss Statement
balance_sheet: Balance Sheet
payroll_record: Payroll Record
invoice: Invoice
charity_receipt: Charitable Donation Receipt
medical_receipt: Medical Expense Receipt/Statement
business_expense: Business Expense Receipt
tax_return_prior: Prior Year Tax Return
id_document: Government ID / Passport / License
insurance: Insurance Document
contract: Contract / Agreement
other: Other / Unrecognized Document
`

const SYSTEM_PROMPT = `You are a financial document classifier. Analyze the uploaded document and classify it into one of these categories:

${CATEGORY_TAXONOMY}

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "category": "slug_from_taxonomy",
  "year": 2024,
  "confidence": 0.95,
  "issues": [],
  "matched_checklist_item": null,
  "match_confidence": null
}

Rules:
- "category" must be one of the slugs from the taxonomy above
- "year" is the tax/fiscal year the document pertains to (null if unclear)
- "confidence" is 0.0-1.0 for how certain you are of the category
- "issues" is an array of strings noting any problems (e.g., ["Appears to be from 2023, not 2024", "Document is partially obscured"])
- Only extract category/year — do NOT extract or store any personal information`

function getMimeType(ext: string): string {
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

function getAnthropicMediaType(ext: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  if (ext === '.png') return 'image/png'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

async function classifyWithOpenAI(
  base64: string,
  mimeType: string,
  fileName: string,
  systemPrompt: string,
): Promise<string> {
  if (!openai) throw new Error('OpenAI API key not configured')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Classify this document: ${fileName}` },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
        ],
      },
    ],
    max_tokens: 300,
    temperature: 0.1,
  })

  return response.choices[0]?.message?.content?.trim() || '{}'
}

async function classifyWithAnthropic(
  base64: string,
  ext: string,
  fileName: string,
  systemPrompt: string,
): Promise<string> {
  if (!anthropic) throw new Error('Anthropic API key not configured')

  // Anthropic doesn't support PDF via vision — for PDFs, extract text description
  if (ext === '.pdf') {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            { type: 'text', text: `Classify this document: ${fileName}` },
          ],
        },
      ],
    })
    const block = response.content[0]
    return block.type === 'text' ? block.text.trim() : '{}'
  }

  // Images work directly
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: getAnthropicMediaType(ext), data: base64 },
          },
          { type: 'text', text: `Classify this document: ${fileName}` },
        ],
      },
    ],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text.trim() : '{}'
}

export async function classifyDocument(
  uploadId: number,
  filePath: string,
  fileName: string,
  checklistItems: string[] = []
): Promise<void> {
  // Mark as processing
  await query(
    `INSERT INTO document_classifications (upload_id, processing_status)
     VALUES ($1, 'processing')
     ON CONFLICT (upload_id) DO UPDATE SET processing_status = 'processing', processing_error = NULL`,
    [uploadId]
  )

  try {
    const ext = path.extname(fileName).toLowerCase()
    const supportedFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']

    if (!supportedFormats.includes(ext)) {
      await query(
        `UPDATE document_classifications SET processing_status = 'completed',
         document_category = 'other', confidence = 0.5, completed_at = NOW()
         WHERE upload_id = $1`,
        [uploadId]
      )
      return
    }

    const fileBuffer = await readFile(filePath)
    const base64 = fileBuffer.toString('base64')
    const mimeType = getMimeType(ext)

    // Build prompt with checklist context
    const checklistContext = checklistItems.length > 0
      ? `\n\nThe accountant requested these specific documents:\n${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nIf this document matches one of the requested items, include "matched_checklist_item" with the exact text of the matching item and a "match_confidence" score.`
      : ''

    const fullPrompt = SYSTEM_PROMPT + checklistContext

    // Call the configured AI provider
    let rawContent: string
    const provider = AI_PROVIDER.toLowerCase()

    if (provider === 'anthropic' && anthropic) {
      rawContent = await classifyWithAnthropic(base64, ext, fileName, fullPrompt)
    } else if (openai) {
      rawContent = await classifyWithOpenAI(base64, mimeType, fileName, fullPrompt)
    } else {
      throw new Error(`No API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local`)
    }

    // Parse response — strip markdown code blocks if present
    const jsonStr = rawContent.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
    const result = JSON.parse(jsonStr)

    await query(
      `UPDATE document_classifications SET
         document_category = $2,
         document_year = $3,
         confidence = $4,
         issues = $5,
         matched_checklist_item = $6,
         match_confidence = $7,
         raw_response = $8,
         processing_status = 'completed',
         completed_at = NOW()
       WHERE upload_id = $1`,
      [
        uploadId,
        result.category || 'other',
        result.year || null,
        result.confidence || 0.5,
        result.issues || [],
        result.matched_checklist_item || null,
        result.match_confidence || null,
        JSON.stringify({ category: result.category, year: result.year, provider: provider === 'anthropic' ? 'anthropic' : 'openai' }),
      ]
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Classification failed'
    await query(
      `UPDATE document_classifications SET processing_status = 'failed', processing_error = $2 WHERE upload_id = $1`,
      [uploadId, message]
    )
    console.error('AI classification error:', message)
  }
}
