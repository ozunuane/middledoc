'use client'

import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200 px-12" style={{ padding: '22px 48px' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-neutral-900 flex items-center justify-center">
              <div className="w-[11px] h-[11px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-lg font-semibold text-neutral-900">Ledgerly</span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-[34px]">
            <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Product</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Pricing</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition">For accountants</a>
            <Link href="/auth/login" className="text-sm text-neutral-900 font-medium hover:text-primary-600 transition">Log in</Link>
            <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center mb-16">
            {/* Left: Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F3EE] border border-[#CFE6DB] rounded-full mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Built for solo & small accounting practices</span>
              </div>

              {/* Headline */}
              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                Stop chasing clients<br />
                for <span className="italic text-primary-600">paperwork.</span>
              </h1>

              {/* Subheading */}
              <p className="text-body-lg text-neutral-600 mb-8 max-w-[480px] leading-relaxed">
                Send one secure link. Your client sees exactly which documents are needed, uploads them in a couple of taps, and your checklist updates itself. Automatic reminders mean you never send another "just following up" email.
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-[14px] mb-12">
                <button className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start free — no card needed
                </button>
                <button className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  See how it works
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-7">
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">5 hrs</div>
                  <div className="text-[13px] text-neutral-500 mt-1">saved each week</div>
                </div>
                <div className="w-px bg-neutral-250"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">94%</div>
                  <div className="text-[13px] text-neutral-500 mt-1">documents in on time</div>
                </div>
                <div className="w-px bg-neutral-250"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">2 min</div>
                  <div className="text-[13px] text-neutral-500 mt-1">to upload, client side</div>
                </div>
              </div>
            </div>

            {/* Right: Card Demo */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-hero p-6 transform rotate-[0.4deg]">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Document request</div>
                  <div className="text-[17px] font-semibold text-neutral-900 mt-1">2024 Year-End Tax Prep</div>
                </div>
                <span className="text-xs font-semibold text-warning-600 bg-warning-100 border border-warning-200 px-2.5 py-1 rounded-full">3 OF 5 IN</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-neutral-150 rounded-full overflow-hidden mb-5">
                <div className="w-3/5 h-full bg-primary-600"></div>
              </div>

              {/* Checklist */}
              <div className="space-y-[10px]">
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-primary-50 border border-primary-100 rounded-button">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-neutral-900">Prior-year tax return</span>
                </div>
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-primary-50 border border-primary-100 rounded-button">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-neutral-900">Profit & loss statement</span>
                </div>
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-white border border-dashed border-neutral-300 rounded-button">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-neutral-350 flex-shrink-0"></div>
                  <span className="text-sm text-neutral-600">1099s & 1098s</span>
                  <span className="text-xs text-neutral-400 ml-auto">due in 2d</span>
                </div>
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-white border border-dashed border-neutral-300 rounded-button">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-neutral-350 flex-shrink-0"></div>
                  <span className="text-sm text-neutral-600">Bank statements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Strip */}
          <div className="border-t border-neutral-200 pt-12 pb-20">
            <div className="flex items-center gap-[36px]">
              <p className="text-xs font-medium text-neutral-400">Trusted by 1,200+ practices at tax season</p>
              <div className="flex gap-[30px] opacity-[0.55]">
                <span className="font-serif text-xl text-neutral-900">Maple & Co</span>
                <span className="font-serif text-xl text-neutral-900">Northgate CPA</span>
                <span className="font-serif text-xl text-neutral-900">Brightbooks</span>
                <span className="font-serif text-xl text-neutral-900">Faircount</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
