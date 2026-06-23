'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  userName: string
  onLogout: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

function DashboardIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ClientsIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function RequestsIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/dashboard/clients', label: 'Clients', icon: <ClientsIcon /> },
  { href: '/dashboard/requests', label: 'Requests', icon: <RequestsIcon /> },
]

function NavLinks({ pathname, onMobileClose }: { pathname: string; onMobileClose?: () => void }) {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onMobileClose}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-standard text-body-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function Sidebar({ userName, onLogout, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const SidebarContent = useCallback(() => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-neutral-200 dark:border-neutral-700">
        <span className="text-body-lg font-serif font-bold text-neutral-900 dark:text-neutral-50">Accountant Hub</span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks pathname={pathname} onMobileClose={onMobileClose} />
      </div>

      {/* User / Logout */}
      <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {userName}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-standard hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  ), [pathname, userName, onLogout, onMobileClose])

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Sidebar"
        className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-700 fixed inset-y-0 left-0 z-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-overlay" aria-modal="true" role="dialog" aria-label="Navigation menu">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative w-72 h-full bg-white dark:bg-neutral-950 shadow-dark animate-fade-in flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-body-lg font-serif font-bold text-neutral-900 dark:text-neutral-50">Accountant Hub</span>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-standard transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks pathname={pathname} onMobileClose={onMobileClose} />
            </div>
            <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{userName}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-body-sm text-danger-600 hover:text-danger-700 font-medium transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
