'use client'

import React from 'react'

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'search'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
  autoComplete?: string
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  error = false,
  disabled = false,
  id,
  name,
  required,
  autoComplete,
  className = '',
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid ?? error}
      aria-required={ariaRequired ?? required}
      className={[
        'w-full px-3 py-2.5 text-sm text-neutral-900',
        'bg-white border rounded-input placeholder:text-neutral-400',
        'transition-colors duration-200',
        'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30',
        'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
        'dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-50 dark:placeholder:text-neutral-500',
        'dark:focus:border-primary-400 dark:focus:ring-primary-400/30',
        error
          ? 'border-danger-600 bg-danger-50 focus:border-danger-600 focus:ring-danger-600/30 dark:border-danger-400 dark:bg-danger-900/20'
          : 'border-neutral-300',
        className,
      ].join(' ')}
    />
  )
}
