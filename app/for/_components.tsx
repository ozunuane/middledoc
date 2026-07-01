'use client'

import { useState } from 'react'
import Link from 'next/link'

export function VerticalNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-neutral-200" style={{ padding: '22px 48px' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="w-[30px] h-[30px] rounded-[7px] bg-neutral-900 flex items-center justify-center">
            <div className="w-[11px] h-[11px] rounded-sm bg-primary-500"></div>
          </div>
          <span className="text-lg font-semibold text-neutral-900">MiddleDoc</span>
        </Link>

        <div className="hidden md:flex items-center gap-[34px]">
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition">
              Solutions
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {open && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-medium py-1.5 z-50">
                {[
                  { label: 'For Accountants', href: '/for/accountants' },
                  { label: 'For Law Firms', href: '/for/law-firms' },
                  { label: 'For HR Teams', href: '/for/hr-teams' },
                  { label: 'For Real Estate', href: '/for/real-estate' },
                  { label: 'For Healthcare', href: '/for/healthcare' },
                  { label: 'For Enterprise', href: '/for/enterprise' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <a href="/#how-it-works" className="text-sm text-neutral-600 hover:text-neutral-900 transition">How it works</a>
          <a href="/#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Features</a>
          <a href="/#pricing" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Pricing</a>
          <Link href="/auth/login" className="text-sm text-neutral-900 font-medium hover:text-primary-600 transition">Log in</Link>
          <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
        </div>

        <div className="md:hidden">
          <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
        </div>
      </div>
    </nav>
  )
}

export function VerticalFooter() {
  return (
    <footer className="bg-white border-t border-neutral-200 px-6 md:px-12 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-[26px] h-[26px] rounded-[6px] bg-neutral-900 flex items-center justify-center">
            <div className="w-[9px] h-[9px] rounded-sm bg-primary-500"></div>
          </div>
          <span className="text-sm font-semibold text-neutral-900">MiddleDoc</span>
        </div>
        <div className="flex flex-wrap gap-6">
          <Link href="/for/accountants" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Accountants</Link>
          <Link href="/for/law-firms" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Law Firms</Link>
          <Link href="/for/hr-teams" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For HR Teams</Link>
          <Link href="/for/real-estate" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Real Estate</Link>
          <Link href="/for/healthcare" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Healthcare</Link>
          <Link href="/for/enterprise" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">Enterprise</Link>
        </div>
        <p className="text-[12px] text-neutral-400">
          &copy; {new Date().getFullYear()} MiddleDoc. HIPAA compliant. SOC 2 Type II.
        </p>
      </div>
    </footer>
  )
}
