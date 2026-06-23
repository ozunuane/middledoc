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
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && (
            <span aria-hidden="true" className="text-red-500 ml-0.5">
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
          'w-full px-3 py-2.5 text-sm text-gray-900',
          'bg-white border rounded-standard',
          'transition-colors duration-200',
          'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30',
          'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
          error
            ? 'border-red-500 bg-red-50 focus:ring-red-500/30'
            : 'border-gray-300',
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
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
