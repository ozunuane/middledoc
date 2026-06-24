'use client'

import React, { useState, useEffect, useRef } from 'react'

interface ImportClientModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ParsedClient {
  name: string
  email: string
  row: number
}

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  total: number
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseCSV(text: string): ParsedClient[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const results: ParsedClient[] = []

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/[,\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''))

    // Skip header row
    if (
      i === 0 &&
      (parts[0]?.toLowerCase() === 'name' || parts[1]?.toLowerCase() === 'email')
    ) {
      continue
    }

    if (parts.length >= 2) {
      results.push({ name: parts[0], email: parts[1], row: i + 1 })
    }
  }
  return results
}

function validateRow(client: ParsedClient): 'valid' | 'invalid' {
  if (!client.name || !client.name.trim()) return 'invalid'
  if (!client.email || !EMAIL_REGEX.test(client.email.trim())) return 'invalid'
  return 'valid'
}

type ModalStep = 'upload' | 'preview' | 'result'

export function ImportClientModal({ isOpen, onClose, onImportComplete }: ImportClientModalProps) {
  const [step, setStep] = useState<ModalStep>('upload')
  const [pasteText, setPasteText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedClients, setParsedClients] = useState<ParsedClient[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('upload')
      setPasteText('')
      setFileName(null)
      setParsedClients([])
      setImporting(false)
      setResult(null)
      setImportError(null)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    // Handle xlsx files
    if (file.name.endsWith('.xlsx')) {
      // For xlsx we'd need a library; for now inform the user
      setPasteText('')
      setImportError('XLSX support requires copy-pasting the data. Please open the file in Excel and copy the Name/Email columns, then paste below.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setPasteText(text)
      setImportError(null)
    }
    reader.readAsText(file)

    // Reset file input so the same file can be re-selected
    e.target.value = ''
  }

  const handlePreview = () => {
    const text = pasteText.trim()
    if (!text) return

    const parsed = parseCSV(text)
    if (parsed.length === 0) {
      setImportError('No valid rows found. Make sure each row has a name and email separated by a comma or tab.')
      return
    }

    setParsedClients(parsed)
    setImportError(null)
    setStep('preview')
  }

  const validClients = parsedClients.filter((c) => validateRow(c) === 'valid')
  const invalidCount = parsedClients.length - validClients.length

  const handleImport = async () => {
    if (validClients.length === 0) return

    setImporting(true)
    setImportError(null)

    try {
      const res = await fetch('/api/clients/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clients: validClients.map((c) => ({
            name: c.name.trim(),
            email: c.email.trim(),
            row: c.row,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? `Import failed (${res.status})`)
      }

      const data: ImportResult = await res.json()
      setResult(data)
      setStep('result')
    } catch (err) {
      setImportError((err as Error).message)
    } finally {
      setImporting(false)
    }
  }

  const handleDone = () => {
    onImportComplete()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-neutral-50 rounded-[16px] shadow-hero max-w-[560px] w-full mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-[28px] py-[24px] shrink-0">
          <h2 className="font-serif text-[26px] text-neutral-900">Import clients</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none cursor-pointer transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-[28px] py-[24px] overflow-y-auto">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Info box */}
              <div className="bg-primary-50 border border-primary-100 rounded-[9px] p-4 text-[13px] text-neutral-700">
                <p className="mb-2">Prepare your CSV or text file with two columns:</p>
                <div className="font-mono text-[12px] bg-white/60 rounded-md p-3 mb-3">
                  <div className="text-neutral-500">Name, Email</div>
                  <div>John Smith, john@company.com</div>
                  <div>Jane Doe, jane@example.com</div>
                </div>
                <ul className="space-y-1 text-[12px] text-neutral-600">
                  <li>&#x2022; First row can be a header (Name, Email) &mdash; it will be auto-detected and skipped</li>
                  <li>&#x2022; Supported formats: .csv, .txt</li>
                  <li>&#x2022; One client per row</li>
                  <li>&#x2022; Duplicates will be skipped automatically</li>
                </ul>
              </div>

              {/* File upload area */}
              <label className="block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-[1.5px] border-dashed border-neutral-300 rounded-[13px] p-8 text-center cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition">
                  {fileName ? (
                    <>
                      <div className="text-body-md font-semibold text-neutral-900 mb-1">
                        {fileName}
                      </div>
                      <div className="text-xs text-neutral-400">Click to choose a different file</div>
                    </>
                  ) : (
                    <>
                      <div className="text-body-md font-semibold text-neutral-900 mb-1">
                        Drop your file here, or <span className="text-primary-600">browse</span>
                      </div>
                      <div className="text-xs text-neutral-400">CSV or TXT, up to 1,000 rows</div>
                    </>
                  )}
                </div>
              </label>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs text-neutral-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Paste area */}
              <textarea
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value)
                  setImportError(null)
                }}
                placeholder={"Or paste your data here...\nJohn Smith, john@company.com\nJane Doe, jane@example.com"}
                className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[13px] text-neutral-900 font-mono h-32 resize-none placeholder:text-neutral-400 focus:outline-none focus:border-primary-600"
              />

              {importError && (
                <div className="bg-danger-50 text-danger-600 text-[13px] rounded-[9px] p-3">
                  {importError}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-[13px] text-neutral-600">
                {parsedClients.length} row{parsedClients.length !== 1 ? 's' : ''} found.{' '}
                {validClients.length} valid{invalidCount > 0 ? `, ${invalidCount} invalid` : ''}.
              </p>

              {importError && (
                <div className="bg-danger-50 text-danger-600 text-[13px] rounded-[9px] p-3">
                  {importError}
                </div>
              )}

              {/* Preview table */}
              <div className="border border-neutral-200 rounded-[9px] overflow-hidden max-h-[340px] overflow-y-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-neutral-100 text-left">
                      <th className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-12">Row</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Name</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Email</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-16 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedClients.map((client, idx) => {
                      const status = validateRow(client)
                      return (
                        <tr
                          key={idx}
                          className={`border-t border-neutral-100 ${status === 'invalid' ? 'bg-danger-50/50' : ''}`}
                        >
                          <td className="px-3 py-2 text-neutral-400">{client.row}</td>
                          <td className="px-3 py-2 text-neutral-900">
                            {client.name || <span className="text-danger-500 italic">missing</span>}
                          </td>
                          <td className="px-3 py-2 text-neutral-600 font-mono text-[12px]">
                            {client.email || <span className="text-danger-500 italic">missing</span>}
                            {client.email && !EMAIL_REGEX.test(client.email.trim()) && (
                              <span className="text-danger-500 ml-1 text-[11px]">(invalid)</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {status === 'valid' ? (
                              <span className="text-success-600 text-sm" title="Valid">&#x2713;</span>
                            ) : (
                              <span className="text-danger-500 text-sm" title="Invalid">&#x2717;</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && result && (
            <div className="space-y-4">
              {/* Imported count */}
              {result.imported > 0 && (
                <div className="flex items-center gap-3 bg-success-50 text-success-700 rounded-[9px] px-4 py-3 text-[14px]">
                  <span className="text-success-600 text-lg">&#x2713;</span>
                  <span>
                    <strong>{result.imported}</strong> client{result.imported !== 1 ? 's' : ''} imported
                  </span>
                </div>
              )}

              {/* Skipped count */}
              {result.skipped > 0 && (
                <div className="flex items-center gap-3 bg-warning-50 text-warning-700 rounded-[9px] px-4 py-3 text-[14px]">
                  <span className="text-warning-500 text-lg">&#x26A0;</span>
                  <span>
                    <strong>{result.skipped}</strong> duplicate{result.skipped !== 1 ? 's' : ''} skipped
                  </span>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="bg-danger-50 text-danger-700 rounded-[9px] px-4 py-3 text-[14px]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-danger-500 text-lg">&#x2717;</span>
                    <span>
                      <strong>{result.errors.length}</strong> row{result.errors.length !== 1 ? 's' : ''} had errors
                    </span>
                  </div>
                  <ul className="text-[12px] text-danger-600 space-y-0.5 ml-7">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Zero imported edge case */}
              {result.imported === 0 && result.errors.length === 0 && result.skipped > 0 && (
                <p className="text-[13px] text-neutral-500">
                  All clients in this file already exist in your account.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-[28px] py-[18px] shrink-0">
          {step === 'upload' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-[10px] rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePreview}
                disabled={!pasteText.trim()}
                className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Preview import
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep('upload')
                  setImportError(null)
                }}
                className="bg-white border border-neutral-300 text-neutral-900 text-[13px] font-medium px-4 py-[10px] rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={validClients.length === 0 || importing}
                className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {importing && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {importing ? 'Importing...' : `Import ${validClients.length} client${validClients.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}

          {step === 'result' && (
            <button
              type="button"
              onClick={handleDone}
              className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
