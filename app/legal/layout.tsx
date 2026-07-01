'use client'

import Link from 'next/link'
import { useState } from 'react'

const legalLinks = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Acceptable Use', href: '/legal/acceptable-use' },
  { label: 'Data Processing Agreement', href: '/legal/dpa' },
  { label: 'E-Signature Disclosure', href: '/legal/esign' },
  { label: 'Security Policy', href: '/legal/security' },
]

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-neutral-200" style={{ padding: '22px 48px' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-neutral-900 flex items-center justify-center">
              <div className="w-[11px] h-[11px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-lg font-semibold text-neutral-900">MiddleDoc</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Log in</Link>
            <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="md:w-56 flex-shrink-0">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Legal Documents</p>
          <nav className="flex flex-col gap-1">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-neutral-600 hover:text-neutral-900 hover:bg-white px-3 py-2 rounded-lg transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl border border-neutral-200 px-8 md:px-12 py-10">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 px-6 md:px-12 py-10 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-[26px] h-[26px] rounded-[6px] bg-neutral-900 flex items-center justify-center">
              <div className="w-[9px] h-[9px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-sm font-semibold text-neutral-900">MiddleDoc</span>
          </div>
          <div className="flex flex-wrap gap-6">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-[12px] text-neutral-400">
            &copy; {new Date().getFullYear()} MiddleDoc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
