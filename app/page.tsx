'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"

const plans = [
  { name: 'Free', price: 0, description: 'For trying out MiddleDoc', featured: false, features: ['5 clients', '500 MB storage', 'Basic reminders'] },
  { name: 'Solo', price: 19, description: 'For solo practitioners', featured: false, features: ['50 clients', '5 GB storage', 'All templates', 'CSV import'] },
  { name: 'Team', price: 39, description: 'For small firms', featured: true, features: ['250 clients', '25 GB storage', '5 team members', 'Groups & roles'] },
  { name: 'Firm', price: 79, description: 'For established firms', featured: false, features: ['Unlimited clients', '100 GB storage', '15 team members', 'SSO & API access'] },
]

export default function Home() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) router.push('/dashboard')
        else setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [router])

  if (!checked) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200" style={{ padding: '22px 48px' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-neutral-900 flex items-center justify-center">
              <div className="w-[11px] h-[11px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-lg font-semibold text-neutral-900">MiddleDoc</span>
          </div>

          {/* Nav Links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-[34px]">
            <a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Product</a>
            <a href="#pricing" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Pricing</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition">For accountants</a>
            <Link href="/auth/login" className="text-sm text-neutral-900 font-medium hover:text-primary-600 transition">Log in</Link>
            <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
          </div>

          {/* Mobile: just show Start free */}
          <div className="md:hidden">
            <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left: Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full mb-6">
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
                Send one secure link. Your client sees exactly which documents are needed, uploads them in a couple of taps, and your checklist updates itself. Automatic reminders mean you never send another &quot;just following up&quot; email.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-[14px] mb-12">
                <button className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start free — no card needed
                </button>
                <button className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  See how it works
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-7">
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">5 hrs</div>
                  <div className="text-[13px] text-neutral-500 mt-1">saved each week</div>
                </div>
                <div className="w-px bg-neutral-250 hidden sm:block"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">94%</div>
                  <div className="text-[13px] text-neutral-500 mt-1">documents in on time</div>
                </div>
                <div className="w-px bg-neutral-250 hidden sm:block"></div>
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
                    <span className="text-white text-xs font-bold">&#10003;</span>
                  </div>
                  <span className="text-sm text-neutral-900">Prior-year tax return</span>
                </div>
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-primary-50 border border-primary-100 rounded-button">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">&#10003;</span>
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

          {/* Features Section */}
          <section id="features" className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">How MiddleDoc works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { step: '01', title: 'Create a request', desc: 'Add your client, set a deadline, and list the documents you need. Pick from templates or build your own.' },
                  { step: '02', title: 'Share a link', desc: 'Send your client a secure upload link. No account or password needed — they just click and upload.' },
                  { step: '03', title: 'Track & collect', desc: 'See what\'s been uploaded in real time. Automatic reminders keep things moving without the awkward follow-ups.' },
                ].map(f => (
                  <div key={f.step}>
                    <div className="text-mono-lg text-primary-600 font-semibold mb-3">{f.step}</div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{f.title}</h3>
                    <p className="text-body-md text-neutral-600 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Logo Strip */}
          <div className="border-t border-neutral-200 pt-12 pb-12 md:pb-20">
            <div className="flex flex-wrap items-center gap-[36px]">
              <p className="text-xs font-medium text-neutral-400">Trusted by 1,200+ practices at tax season</p>
              <div className="flex flex-wrap gap-[30px] opacity-[0.55]">
                <span className="font-serif text-xl text-neutral-900">Maple & Co</span>
                <span className="font-serif text-xl text-neutral-900">Northgate CPA</span>
                <span className="font-serif text-xl text-neutral-900">Brightbooks</span>
                <span className="font-serif text-xl text-neutral-900">Faircount</span>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <section id="pricing" className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-3">Simple, transparent pricing</h2>
              <p className="text-body-lg text-neutral-600 text-center mb-12 max-w-lg mx-auto">Start free, upgrade when you need more.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map(plan => (
                  <div key={plan.name} className={`bg-white border ${plan.featured ? 'border-primary-600 ring-2 ring-primary-600/20' : 'border-neutral-200'} rounded-2xl p-6`}>
                    <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-semibold text-neutral-900 font-mono">${plan.price}</span>
                      {plan.price > 0 && <span className="text-neutral-500 text-sm">/month</span>}
                    </div>
                    <p className="text-[13px] text-neutral-500 mb-6">{plan.description}</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="text-[13px] text-neutral-700 flex items-center gap-2">
                          <span className="text-primary-600">&#10003;</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup" className={`block text-center py-2.5 rounded-[9px] text-[13px] font-semibold ${plan.featured ? 'bg-primary-600 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}>
                      {plan.price === 0 ? 'Start free' : 'Start trial'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
