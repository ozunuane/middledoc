'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
  fullPage?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading...',
  className = '',
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div role="status" aria-label={label} className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <svg
        aria-hidden="true"
        className={`animate-spin text-indigo-600 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
