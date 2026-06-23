'use client'

import React, { useId } from 'react'

type InputType = 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'textarea' | 'select'

interface SelectOption {
  value: string
  label: string
}

interface FormFieldProps {
  label: string
  name: string
  type?: InputType
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  error?: string
  helperText?: string
  required?: boolean
  placeholder?: string
  rows?: number
  options?: SelectOption[]
  disabled?: boolean
  autoComplete?: string
  className?: string
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  required = false,
  placeholder,
  rows = 4,
  options = [],
  disabled = false,
  autoComplete,
  className = '',
}: FormFieldProps) {
  const uid = useId()
  const inputId = `${name}-${uid}`
  const descriptionId = `${inputId}-description`

  const baseInputClass = [
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
  ].join(' ')

  const sharedProps = {
    id: inputId,
    name,
    disabled,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': descriptionId,
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-500 ml-0.5">
            {' '}
            *
          </span>
        )}
      </label>

      {type === 'textarea' ? (
        <textarea
          {...sharedProps}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={placeholder}
          rows={rows}
          className={`${baseInputClass} resize-y`}
        />
      ) : type === 'select' ? (
        <select
          {...sharedProps}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
          className={baseInputClass}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...sharedProps}
          type={type}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={baseInputClass}
        />
      )}

      {error ? (
        <p
          id={descriptionId}
          role="alert"
          className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {helperText}
        </p>
      ) : (
        <span id={descriptionId} className="sr-only" />
      )}
    </div>
  )
}
