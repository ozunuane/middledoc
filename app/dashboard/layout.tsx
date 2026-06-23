'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) return <LoadingSpinner fullPage />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        userName={user.name}
        onLogout={logout}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area — offset for fixed desktop sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 gap-3 sticky top-0 z-header">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-standard hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Accountant Hub</span>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
