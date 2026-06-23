'use client'

import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-300 px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-neutral-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-lg font-semibold text-neutral-900">Ledgerly</span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-8">
            <a href="#" className="text-body-md text-neutral-600 hover:text-neutral-900 transition">Product</a>
            <a href="#" className="text-body-md text-neutral-600 hover:text-neutral-900 transition">Pricing</a>
            <a href="#" className="text-body-md text-neutral-600 hover:text-neutral-900 transition">For accountants</a>
            <Link href="/auth/login" className="text-body-md text-neutral-900 font-medium hover:text-primary-600 transition">Log in</Link>
            <Link href="/auth/signup" className="bg-neutral-900 text-white text-body-md font-medium px-4 py-2 rounded-button hover:bg-neutral-800 transition">Start free</Link>
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Built for solo & small accounting practices</span>
              </div>

              {/* Headline */}
              <h1 className="text-h1 font-serif text-neutral-900 mb-6 leading-tight">
                Stop chasing clients<br />
                for <span className="italic text-primary-600">paperwork.</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg text-neutral-600 mb-8 max-w-md leading-relaxed">
                Send one secure link. Your client sees exactly which documents are needed, uploads them in a couple of taps, and your checklist updates itself. Automatic reminders mean you never send another "just following up" email.
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-3 mb-12">
                <button className="bg-primary-600 text-white text-body-md font-semibold px-7 py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start free — no card needed
                </button>
                <button className="bg-white text-neutral-900 text-body-md font-medium px-5 py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  See how it works
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-7">
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">5 hrs</div>
                  <div className="text-xs text-neutral-600 mt-1">saved each week</div>
                </div>
                <div className="w-px bg-neutral-300"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">94%</div>
                  <div className="text-xs text-neutral-600 mt-1">documents in on time</div>
                </div>
                <div className="w-px bg-neutral-300"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">2 min</div>
                  <div className="text-xs text-neutral-600 mt-1">to upload, client side</div>
                </div>
              </div>
            </div>

            {/* Right: Card Demo */}
            <div className="bg-white rounded-2xl border border-neutral-300 shadow-lg p-6 transform rotate-1">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Document request</div>
                  <div className="text-lg font-semibold text-neutral-900 mt-1">2024 Year-End Tax Prep</div>
                </div>
                <span className="text-xs font-semibold text-warning-700 bg-warning-100 border border-warning-200 px-2.5 py-1 rounded-full">3 OF 5 IN</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-5">
                <div className="w-3/5 h-full bg-primary-600"></div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 rounded-button">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-neutral-900">Prior-year tax return</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 rounded-button">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-neutral-900">Profit & loss statement</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-dashed border-neutral-300 rounded-button">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex-shrink-0"></div>
                  <span className="text-sm text-neutral-600">1099s & 1098s</span>
                  <span className="text-xs text-neutral-500 ml-auto">due in 2d</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-dashed border-neutral-300 rounded-button">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex-shrink-0"></div>
                  <span className="text-sm text-neutral-600">Bank statements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Strip */}
          <div className="border-t border-neutral-300 pt-12 pb-20">
            <p className="text-xs font-medium text-neutral-500 mb-6">Trusted by 1,200+ practices at tax season</p>
            <div className="flex gap-12 opacity-50">
              <span className="font-serif text-xl text-neutral-900">Maple & Co</span>
              <span className="font-serif text-xl text-neutral-900">Northgate CPA</span>
              <span className="font-serif text-xl text-neutral-900">Brightbooks</span>
              <span className="font-serif text-xl text-neutral-900">Faircount</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-50 px-12 py-16 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-sm bg-neutral-900"></div>
                </div>
                <span className="text-lg font-semibold">Ledgerly</span>
              </div>
              <p className="text-xs text-neutral-400">
                Document collection made simple. Free up time for what matters.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Features</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Pricing</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Security</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">API</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">About</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Blog</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Careers</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Privacy</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Terms</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Security</a></li>
                <li><a href="#" className="text-xs text-neutral-400 hover:text-neutral-200 transition">Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-neutral-800 pt-8 flex justify-between items-center">
            <p className="text-xs text-neutral-500">© 2024 Ledgerly. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-neutral-400 hover:text-neutral-200 text-sm">Twitter</a>
              <a href="#" className="text-neutral-400 hover:text-neutral-200 text-sm">LinkedIn</a>
              <a href="#" className="text-neutral-400 hover:text-neutral-200 text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
