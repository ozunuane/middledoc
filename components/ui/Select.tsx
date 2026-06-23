'use client'

import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  label?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
  className?: string
  'aria-describedby'?: string
}

export function Select({
  options,
  value,
  onChange,
  label,
  error,
  placeholder = 'Select an option',
  disabled = false,
  id,
  name,
  required,
  className = '',
  'aria-describedby': ariaDescribedby,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-label text-neutral-900 dark:text-neutral-100">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger-600 ml-0.5">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-describedby={ariaDescribedby}
        aria-invalid={!!error}
        aria-required={required}
        className={[
          'w-full px-3 py-2.5 text-sm text-neutral-900',
          'bg-white border rounded-input',
          'transition-colors duration-200',
          'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30',
          'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
          'dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-50',
          error
            ? 'border-danger-600 bg-danger-50 focus:ring-danger-600/30'
            : 'border-neutral-300',
          className,
        ].join(' ')}
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
      {error && (
        <p role="alert" className="text-caption text-danger-600 dark:text-danger-400 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
