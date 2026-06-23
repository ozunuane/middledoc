'use client'

import React from 'react'

interface NavbarProps {
  title: string
  onMenuToggle: () => void
  action?: React.ReactNode
}

export function Navbar({ title, onMenuToggle, action }: NavbarProps) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-header">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-standard hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title */}
      <h1 className="flex-1 text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
        {title}
      </h1>

      {/* Optional primary action */}
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  )
}
