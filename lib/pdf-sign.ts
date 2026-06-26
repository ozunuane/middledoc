import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'

export async function embedSignatureInPdf(
  originalPdfPath: string,
  signatureBase64: string,
  signerName: string,
  outputPath: string
): Promise<void> {
  const pdfBytes = await readFile(originalPdfPath)
  const originalHash = createHash('sha256').update(pdfBytes).digest('hex')
  const pdfDoc = await PDFDocument.load(pdfBytes)

  // Decode signature image
  const sigImageBytes = Buffer.from(
    signatureBase64.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  )

  let sigImage
  try {
    sigImage = await pdfDoc.embedPng(sigImageBytes)
  } catch {
    sigImage = await pdfDoc.embedJpg(sigImageBytes)
  }

  // Get the last page
  const pages = pdfDoc.getPages()
  const lastPage = pages[pages.length - 1]
  const { width, height } = lastPage.getSize()

  // Place signature at bottom of last page
  const sigWidth = 200
  const sigHeight = (sigImage.height / sigImage.width) * sigWidth
  const sigX = 50
  const sigY = 80

  lastPage.drawImage(sigImage, {
    x: sigX,
    y: sigY,
    width: sigWidth,
    height: sigHeight,
  })

  // Add signature line
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 9

  lastPage.drawLine({
    start: { x: sigX, y: sigY - 5 },
    end: { x: sigX + sigWidth, y: sigY - 5 },
    thickness: 0.5,
    color: rgb(0.4, 0.4, 0.4),
  })

  // Add signer name and date
  lastPage.drawText(signerName, {
    x: sigX,
    y: sigY - 18,
    size: fontSize,
    font,
    color: rgb(0.3, 0.3, 0.3),
  })

  lastPage.drawText(
    `Signed electronically on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    {
      x: sigX,
      y: sigY - 30,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    }
  )

  // Add audit trail page
  const auditPage = pdfDoc.addPage([width, height])
  const auditFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const auditFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = height - 60
  auditPage.drawText('Electronic Signature Certificate', {
    x: 50,
    y,
    size: 16,
    font: auditFontBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  y -= 30
  auditPage.drawText(`Document: ${path.basename(originalPdfPath)}`, {
    x: 50,
    y,
    size: 10,
    font: auditFont,
    color: rgb(0.3, 0.3, 0.3),
  })
  y -= 18
  auditPage.drawText(`Signer: ${signerName}`, {
    x: 50,
    y,
    size: 10,
    font: auditFont,
    color: rgb(0.3, 0.3, 0.3),
  })
  y -= 18
  auditPage.drawText(`Date: ${new Date().toISOString()}`, {
    x: 50,
    y,
    size: 10,
    font: auditFont,
    color: rgb(0.3, 0.3, 0.3),
  })
  y -= 18
  auditPage.drawText(`Document SHA-256: ${originalHash}`, {
    x: 50,
    y,
    size: 8,
    font: auditFont,
    color: rgb(0.3, 0.3, 0.3),
  })
  y -= 18
  auditPage.drawText(
    'This document was electronically signed via MiddleDoc.',
    { x: 50, y, size: 10, font: auditFont, color: rgb(0.3, 0.3, 0.3) }
  )
  y -= 18
  auditPage.drawText('Compliant with ESIGN Act and UETA.', {
    x: 50,
    y,
    size: 10,
    font: auditFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Save
  const outputDir = path.dirname(outputPath)
  await mkdir(outputDir, { recursive: true })
  const signedBytes = await pdfDoc.save()
  await writeFile(outputPath, signedBytes)
}
