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
        'w-full px-3 py-2.5 text-sm text-gray-900',
        'bg-white border rounded-standard placeholder:text-gray-400',
        'transition-colors duration-200',
        'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30',
        'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
        'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500',
        'dark:focus:border-indigo-400 dark:focus:ring-indigo-400/30',
        error
          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/30 dark:border-red-400 dark:bg-red-900/20'
          : 'border-gray-300',
        className,
      ].join(' ')}
    />
  )
}
