'use client'

import React, { useRef, useState, useCallback, useId } from 'react'

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  showFileList?: boolean
  uploadProgress?: Record<string, number>
  uploadStatus?: Record<string, 'idle' | 'uploading' | 'complete' | 'error'>
  onFileRemove?: (fileName: string) => void
  disabled?: boolean
  helperText?: string
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024 // 50 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const isPdf = ext === 'pdf'
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)

  if (isPdf) {
    return (
      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    )
  }
  if (isImage) {
    return (
      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  )
}

export function FileUploadArea({
  onFilesSelected,
  accept,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = true,
  showFileList = true,
  uploadProgress = {},
  uploadStatus = {},
  onFileRemove,
  disabled = false,
  helperText,
}: FileUploadAreaProps) {
  const uid = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const liveRegionId = `upload-live-${uid}`
  const hintId = `upload-hint-${uid}`

  const validateAndAdd = useCallback(
    (incoming: File[]) => {
      const valid: File[] = []
      const errs: string[] = []

      for (const file of incoming) {
        if (file.size > maxSize) {
          errs.push(`"${file.name}" exceeds the ${formatBytes(maxSize)} limit.`)
          continue
        }
        valid.push(file)
      }

      setErrors(errs)

      if (valid.length > 0) {
        setFiles((prev) => {
          const combined = multiple ? [...prev, ...valid] : valid
          return combined
        })
        onFilesSelected(valid)
      }
    },
    [maxSize, multiple, onFilesSelected]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        validateAndAdd(Array.from(e.target.files))
        // Reset input so same file can be re-selected
        e.target.value = ''
      }
    },
    [validateAndAdd]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      if (e.dataTransfer.files.length > 0) {
        validateAndAdd(Array.from(e.dataTransfer.files))
      }
    },
    [disabled, validateAndAdd]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled]
  )

  const removeFile = useCallback(
    (name: string) => {
      setFiles((prev) => prev.filter((f) => f.name !== name))
      onFileRemove?.(name)
    },
    [onFileRemove]
  )

  const zoneClasses = [
    'border-2 border-dashed rounded-modal p-8 text-center cursor-pointer transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    disabled
      ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-60'
      : isDragging
      ? 'border-primary-500 bg-primary-50 cursor-copy'
      : 'border-neutral-300 bg-white hover:border-primary-400 hover:bg-primary-50/30',
  ].join(' ')

  const iconColor = isDragging ? 'text-primary-400' : 'text-neutral-300'

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files. Press Enter to browse or drag files here."
        aria-describedby={hintId}
        aria-disabled={disabled}
        className={zoneClasses}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
      >
        <svg
          aria-hidden="true"
          className={`mx-auto w-12 h-12 mb-3 ${iconColor} transition-colors`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-body-md font-medium text-neutral-700">
          {isDragging ? 'Drop files here' : 'Drag files here or click to browse'}
        </p>
        <p id={hintId} className="text-caption text-neutral-500 mt-1">
          {helperText ?? 'PDF, DOCX, XLSX, PNG, JPG up to 50 MB'}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileInput}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div role="alert" className="flex flex-col gap-1">
          {errors.map((err, i) => (
            <p key={i} className="text-caption text-danger-600 font-medium">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* File list */}
      {showFileList && files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1" aria-label="Selected files">
          {files.map((file) => {
            const status = uploadStatus[file.name] ?? 'idle'
            const progress = uploadProgress[file.name] ?? 0
            const isUploading = status === 'uploading'
            const isComplete = status === 'complete'
            const isError = status === 'error'

            return (
              <li
                key={file.name}
                className="bg-neutral-50 rounded-card border border-neutral-200 px-3 py-2 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2">
                  <FileTypeIcon name={file.name} />
                  <span className="text-body-sm text-neutral-700 truncate flex-1 min-w-0">{file.name}</span>
                  <span className="text-caption text-neutral-500 flex-shrink-0">{formatBytes(file.size)}</span>
                  {onFileRemove && (
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => removeFile(file.name)}
                      className="p-0.5 text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {(isUploading || isComplete || isError) && (
                  <div className="flex items-center gap-2">
                    <div
                      role="progressbar"
                      aria-valuenow={isComplete ? 100 : progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Uploading ${file.name}`}
                      className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden"
                    >
                      <div
                        className={[
                          'h-1.5 rounded-full transition-[width] duration-300',
                          isComplete ? 'bg-success-600' : isError ? 'bg-danger-600' : 'bg-primary-600',
                        ].join(' ')}
                        style={{ width: `${isComplete ? 100 : progress}%` }}
                      />
                    </div>
                    <span className="text-caption text-neutral-500 flex-shrink-0">
                      {isComplete ? 'Done' : isError ? 'Error' : `${progress}%`}
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Live region for screen reader announcements */}
      <div
        id={liveRegionId}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} selected` : ''}
      </div>
    </div>
  )
}
