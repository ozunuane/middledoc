'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface AdminInfo {
  id: number
  email: string
  name: string
  role: string
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: '\u25A0' },
  { label: 'Customers', href: '/admin/customers', icon: '\u2630' },
  { label: 'Plans', href: '/admin/plans', icon: '\u2726' },
  { label: 'System', href: '/admin/system', icon: '\u2699' },
  { label: 'Audit Log', href: '/admin/audit-log', icon: '\u2610' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Skip auth check on the login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true)
      return
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth/me')
        if (!res.ok) {
          router.push('/admin/login')
          return
        }
        const data = await res.json()
        setAdmin(data.admin)
      } catch {
        router.push('/admin/login')
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [isLoginPage, router])

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Loading...</div>
      </div>
    )
  }

  // Login page gets rendered without the sidebar shell
  if (isLoginPage) {
    return <>{children}</>
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-neutral-900 text-white flex flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-semibold tracking-tight">MiddleDoc</span>
            <span className="text-[10px] font-medium uppercase tracking-wider bg-primary-600 text-white px-1.5 py-0.5 rounded">
              Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                isActive(item.href)
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-[16px] w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          {admin && (
            <div className="mb-3">
              <p className="text-[13px] font-medium text-white truncate">{admin.name}</p>
              <p className="text-[11px] text-neutral-400 truncate">{admin.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left text-[13px] text-neutral-400 hover:text-white transition-colors px-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-60 flex-1 bg-neutral-50 min-h-screen p-8">
        {children}
      </main>
    </div>
  )
}
