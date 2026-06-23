'use client'

import React, { useEffect, useRef, useId, useCallback } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  disableBackdropClose?: boolean
}

const sizeClasses = {
  sm: 'max-w-modal-sm',
  md: 'max-w-modal-md',
  lg: 'max-w-modal-lg',
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  disableBackdropClose = false,
}: ModalProps) {
  const uid = useId()
  const titleId = `modal-title-${uid}`
  const bodyId = `modal-body-${uid}`
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll and capture trigger element
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      // Move focus to first focusable element in modal
      const frame = requestAnimationFrame(() => {
        const firstFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
        firstFocusable?.focus()
      })
      return () => {
        cancelAnimationFrame(frame)
        document.body.style.overflow = ''
        previousFocusRef.current?.focus()
      }
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  const handleKeyDownPanel = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    []
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={disableBackdropClose ? undefined : onClose}
      aria-hidden="false"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownPanel}
        className={[
          'relative bg-white dark:bg-gray-900 rounded-modal shadow-dark',
          'w-full max-h-[90vh] flex flex-col',
          'animate-scale-in',
          sizeClasses[size],
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2
            id={titleId}
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div id={bodyId} className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
