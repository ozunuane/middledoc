'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"

const plans = [
  { name: 'Free', price: 0, tagline: 'See if it fits. No credit card, no pitch call.', featured: false, features: ['5 clients', '500 MB storage', 'Basic reminders'], cta: 'Start free' },
  { name: 'Solo', price: 19, tagline: 'Everything one accountant needs. Nothing you don\'t.', featured: false, features: ['50 clients', '5 GB storage', 'All templates', 'CSV import'], cta: 'Try Solo free for 14 days' },
  { name: 'Team', price: 39, tagline: 'Your whole firm, one flat price. Not $39 per person — $39 total.', featured: true, features: ['250 clients', '25 GB storage', '5 team members', 'Groups & roles'], cta: 'Try Team free for 14 days' },
  { name: 'Firm', price: 79, tagline: 'For firms that have outgrown duct-taped workflows.', featured: false, features: ['Unlimited clients', '100 GB storage', '15 team members', 'SSO & API access'], cta: 'Try Firm free for 14 days' },
]

const features = [
  { icon: 'brain', title: 'AI document recognition', desc: 'Uploads are auto-classified. A W-2 goes in the W-2 slot, not "Untitled_scan_final_v3."' },
  { icon: 'link', title: 'No-login client portal', desc: 'Your client clicks a link and uploads. No account, no password, no "I forgot my login" emails.' },
  { icon: 'pen', title: 'E-signatures built in', desc: 'Clients sign engagement letters and 8879s right in the portal. $0 per signature, always.' },
  { icon: 'bell', title: 'Automatic reminders', desc: 'MiddleDoc nudges at 7 days, 3 days, and deadline. You stay out of it entirely.' },
  { icon: 'sync', title: 'QuickBooks sync', desc: 'Client list stays in sync. Add a client in QBO, they show up in MiddleDoc. No double entry.' },
  { icon: 'shield', title: 'Team roles & access', desc: 'Staff sees their clients. Admins see everything. Interns see what you let them.' },
]

const iconMap: Record<string, React.ReactNode> = {
  brain: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275" /></svg>,
  link: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>,
  pen: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" /></svg>,
  bell: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>,
  sync: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>,
  shield: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
}

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
            <a href="#how-it-works" className="text-sm text-neutral-600 hover:text-neutral-900 transition">How it works</a>
            <a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Features</a>
            <a href="#pricing" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Pricing</a>
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
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">60-85% less than TaxDome or Canopy</span>
              </div>

              {/* Headline */}
              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                You became an accountant,<br />
                not a <span className="italic text-primary-600">document chaser.</span>
              </h1>

              {/* Subheading */}
              <p className="text-body-lg text-neutral-600 mb-8 max-w-[480px] leading-relaxed">
                You&apos;re spending 5-10 hours every week emailing clients for W-2s, bank statements, and receipts they swore they already sent. MiddleDoc replaces all of that with one secure link — your client uploads everything in under 2 minutes, no account required, and automatic reminders do the nagging for you.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-[14px] mb-12">
                <Link href="/auth/signup" className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Get your first 5 clients free
                </Link>
                <a href="#how-it-works" className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  Watch the 90-second demo
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-7">
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">5-10 hrs</div>
                  <div className="text-[13px] text-neutral-500 mt-1">back in your week</div>
                </div>
                <div className="w-px bg-neutral-250 hidden sm:block"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">94%</div>
                  <div className="text-[13px] text-neutral-500 mt-1">of docs in before deadline</div>
                </div>
                <div className="w-px bg-neutral-250 hidden sm:block"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">$0</div>
                  <div className="text-[13px] text-neutral-500 mt-1">per e-signature, forever</div>
                </div>
              </div>
            </div>

            {/* Right: Card Demo */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-hero p-6 transform rotate-[0.4deg]">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Document request</div>
                  <div className="text-[17px] font-semibold text-neutral-900 mt-1">2025 Year-End Tax Prep</div>
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
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-primary-50 border border-primary-100 rounded-button">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">&#10003;</span>
                  </div>
                  <span className="text-sm text-neutral-900">Engagement letter (e-signed)</span>
                  <span className="text-xs text-primary-600 ml-auto font-medium">signed 2h ago</span>
                </div>
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-white border border-dashed border-neutral-300 rounded-button">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-neutral-350 flex-shrink-0"></div>
                  <span className="text-sm text-neutral-600">1099s & 1098s</span>
                  <span className="text-xs text-neutral-400 ml-auto">reminder sent 1h ago</span>
                </div>
                <div className="flex items-center gap-3 px-[13px] py-[11px] bg-white border border-dashed border-neutral-300 rounded-button">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-neutral-350 flex-shrink-0"></div>
                  <span className="text-sm text-neutral-600">Bank statements</span>
                  <span className="text-xs text-neutral-400 ml-auto">due in 2d</span>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <section id="how-it-works" className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Collect every document in 3 steps</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { step: '01', title: 'Build your checklist in 60 seconds', desc: 'Pick a template (1040, 1120, 990 — we have dozens) or create your own. Set the deadline. Add the client\'s email. Done.' },
                  { step: '02', title: 'Client clicks one link and uploads', desc: 'No app to download. No account to create. No password to forget. Your client opens the link on their phone and drags in files. That\'s it.' },
                  { step: '03', title: 'You watch the checklist fill itself', desc: 'Documents show up in real time. AI sorts them into the right slots. If something\'s missing, MiddleDoc sends the reminder — not you.' },
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

          {/* Logo Strip / Social Proof */}
          <div className="border-t border-neutral-200 pt-12 pb-12 md:pb-20">
            <div className="flex flex-wrap items-center gap-[36px]">
              <p className="text-xs font-medium text-neutral-400">1,200+ practices collected docs through MiddleDoc last tax season</p>
              <div className="flex flex-wrap gap-[30px] opacity-[0.55]">
                <span className="font-serif text-xl text-neutral-900">Aldrich & Fry CPA</span>
                <span className="font-serif text-xl text-neutral-900">Northgate Tax Group</span>
                <span className="font-serif text-xl text-neutral-900">Summit Bookkeeping</span>
                <span className="font-serif text-xl text-neutral-900">Clearpath Advisors</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section id="features" className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-3">Everything you need. Nothing you&apos;ll never use.</h2>
              <p className="text-body-lg text-neutral-600 text-center mb-12 max-w-xl mx-auto">Other platforms charge $67-150/user/month and bury you in features built for 200-person firms. MiddleDoc does the 6 things that actually matter.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(f => (
                  <div key={f.title} className="border border-neutral-200 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                      {iconMap[f.icon]}
                    </div>
                    <h3 className="text-[15px] font-semibold text-neutral-900 mb-1.5">{f.title}</h3>
                    <p className="text-[13px] text-neutral-600 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-3">Flat pricing. Not per-user, not per-client.</h2>
              <p className="text-body-lg text-neutral-600 text-center mb-12 max-w-lg mx-auto">TaxDome charges $67-100 per user per month. Canopy starts at $22 and climbs to $150. MiddleDoc is $19-79/month flat, for your whole team.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map(plan => (
                  <div key={plan.name} className={`bg-white border ${plan.featured ? 'border-primary-600 ring-2 ring-primary-600/20' : 'border-neutral-200'} rounded-2xl p-6`}>
                    <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-semibold text-neutral-900 font-mono">${plan.price}</span>
                      {plan.price > 0 && <span className="text-neutral-500 text-sm">/month</span>}
                    </div>
                    <p className="text-[13px] text-neutral-500 mb-6">{plan.tagline}</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="text-[13px] text-neutral-700 flex items-center gap-2">
                          <span className="text-primary-600">&#10003;</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup" className={`block text-center py-2.5 rounded-[9px] text-[13px] font-semibold ${plan.featured ? 'bg-primary-600 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}>
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-h2 font-serif text-neutral-900 mb-4">Tax season is 97 days away.<br />How many &quot;just following up&quot; emails is that?</h2>
              <p className="text-body-lg text-neutral-600 mb-8 max-w-lg mx-auto">Set up your first document request in under 2 minutes. Free plan, no credit card, cancel whenever.</p>
              <Link href="/auth/signup" className="inline-block bg-primary-600 text-white text-body-md font-semibold px-[30px] py-4 rounded-button hover:bg-primary-700 transition">
                Get your first 5 clients free
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
