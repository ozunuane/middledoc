'use client'

import React from 'react'

interface NavbarProps {
  title: string
  onMenuToggle: () => void
  action?: React.ReactNode
}

export function Navbar({ title, onMenuToggle, action }: NavbarProps) {
  return (
    <header className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-700 h-16 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-header">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-standard hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title */}
      <h1 className="flex-1 text-h4 font-serif text-neutral-900 dark:text-neutral-50 truncate">
        {title}
      </h1>

      {/* Optional primary action */}
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  )
}
