'use client'

import React from 'react'
import type { DocumentRequest } from '@/types/index'

type RequestStatus = DocumentRequest['status']
type Size = 'sm' | 'md'

interface StatusBadgeProps {
  status: RequestStatus
  size?: Size
  showIcon?: boolean
  className?: string
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  received: 'Received',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

const statusClasses: Record<RequestStatus, string> = {
  // Pending: Warm amber (#FBF1D4, #B5830E, #F0E0AE border)
  pending:
    'bg-warning-100 border border-warning-200 text-warning-600 dark:bg-warning-900/30 dark:border-warning-800 dark:text-warning-300',
  // Received: Fresh green (#E2F1EA, #16734F, #C4E3D5 border)
  received:
    'bg-success-50 border border-success-100 text-success-600 dark:bg-success-900/30 dark:border-success-800 dark:text-success-300',
  // Overdue: Warm coral-red (#F7E2DC, #C0492F, #EEC8BB border)
  overdue:
    'bg-danger-50 border border-danger-200 text-danger-600 dark:bg-danger-900/30 dark:border-danger-800 dark:text-danger-300',
  // Cancelled: Neutral warm gray
  cancelled:
    'bg-neutral-100 border border-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-tiny font-semibold uppercase tracking-wider px-2.5 py-1 rounded-pill',
  md: 'text-tiny font-semibold uppercase tracking-wider px-3 py-1.5 rounded-pill',
}

const iconSize: Record<Size, string> = {
  sm: 'w-3 h-3 mr-1',
  md: 'w-3.5 h-3.5 mr-1.5',
}

function PendingIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ReceivedIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function OverdueIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function CancelledIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const StatusIcons: Record<RequestStatus, (props: { className: string }) => React.ReactElement> = {
  pending: PendingIcon,
  received: ReceivedIcon,
  overdue: OverdueIcon,
  cancelled: CancelledIcon,
}

export function StatusBadge({ status, size = 'sm', showIcon = true, className = '' }: StatusBadgeProps) {
  const Icon = StatusIcons[status]
  const label = STATUS_LABELS[status]

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={[
        'inline-flex items-center hover:brightness-95 transition-all',
        statusClasses[status],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {showIcon && <Icon className={iconSize[size]} />}
      {label}
    </span>
  )
}
