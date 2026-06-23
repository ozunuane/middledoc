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
  pending:
    'bg-warning-100 text-warning-600',
  received:
    'bg-success-50 text-success-600',
  overdue:
    'bg-danger-100 text-danger-600',
  cancelled:
    'bg-neutral-100 text-neutral-600',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-tiny font-semibold uppercase tracking-wider px-[10px] py-1 rounded-full',
  md: 'text-tiny font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full',
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

export function StatusBadge({ status, size = 'sm', showIcon = false, className = '' }: StatusBadgeProps) {
  const Icon = StatusIcons[status]
  const label = STATUS_LABELS[status]

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={[
        'inline-flex items-center',
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
