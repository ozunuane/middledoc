'use client'

import React from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  loading?: boolean
  asChild?: boolean
  'aria-label'?: string
}

const variantClasses: Record<Variant, string> = {
  // Primary: Emerald (#0F7A63)
  primary:
    'bg-primary-500 text-white border-transparent hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-400/50',
  // Secondary: White with warm border
  secondary:
    'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-primary-400/50',
  // Danger: Coral-red
  danger:
    'bg-danger-600 text-white border-transparent hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-400/50',
  // Ghost: Transparent emerald
  ghost:
    'bg-transparent text-primary-500 border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-400/50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold min-h-[2rem]',
  md: 'px-4 py-2.5 text-sm font-semibold min-h-[2.75rem]',
  lg: 'px-6 py-3 text-base font-semibold min-h-[3rem]',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  asChild = false,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  const buttonClassName = [
    'inline-flex items-center justify-center gap-2 border rounded-button',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ')

  if (asChild) {
    // Render as a wrapper for child elements (like Next.js Link)
    return (
      <span className={buttonClassName} {...rest as any}>
        {loading && (
          <svg
            aria-hidden="true"
            className="animate-spin h-4 w-4 flex-shrink-0"
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
        )}
        {children}
      </span>
    )
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={buttonClassName}
      {...rest}
    >
      {loading && (
        <svg
          aria-hidden="true"
          className="animate-spin h-4 w-4 flex-shrink-0"
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
      )}
      {children}
    </button>
  )
}
