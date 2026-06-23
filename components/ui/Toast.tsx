'use client'

import React, { useEffect } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const typeClasses: Record<ToastType, string> = {
  success:
    'bg-success-50 border border-success-100 text-success-900 dark:bg-success-900/30 dark:border-success-800 dark:text-success-200',
  error:
    'bg-danger-50 border border-danger-200 text-danger-900 dark:bg-danger-900/30 dark:border-danger-800 dark:text-danger-200',
  warning:
    'bg-warning-50 border border-warning-200 text-warning-900 dark:bg-warning-900/30 dark:border-warning-800 dark:text-warning-200',
  info:
    'bg-primary-50 border border-primary-100 text-primary-900 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-200',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-success-600 dark:text-success-400',
  error: 'text-danger-600 dark:text-danger-400',
  warning: 'text-warning-600 dark:text-warning-400',
  info: 'text-primary-600 dark:text-primary-400',
}

function DefaultIcon({ type }: { type: ToastType }) {
  const className = `w-5 h-5 flex-shrink-0 ${iconColors[type]}`

  if (type === 'success') {
    return (
      <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }
  if (type === 'error') {
    return (
      <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }
  if (type === 'warning') {
    return (
      <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  }
  // info
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  )
}

export function Toast({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  icon,
  action,
  className = '',
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return

    const timer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-card shadow-medium max-w-sm animate-slide-in',
        typeClasses[type],
        className,
      ].join(' ')}
    >
      {icon ?? <DefaultIcon type={type} />}

      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium">{message}</p>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex-shrink-0 ml-2 font-semibold text-body-sm hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="flex-shrink-0 ml-2 p-1 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>
  onRemove: (id: string) => void
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

const positionClasses: Record<string, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
}

export function ToastContainer({
  toasts,
  onRemove,
  position = 'bottom-right',
}: ToastContainerProps) {
  return (
    <div
      className={`fixed z-toast pointer-events-none ${positionClasses[position]}`}
      role="region"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}
