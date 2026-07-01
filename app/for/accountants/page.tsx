'use client'

import Link from 'next/link'
import { VerticalNav, VerticalFooter } from '../_components'

const benefits = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Collect Tax Documents 3x Faster',
    desc: 'Clients click one link and upload files directly. No password. No signup. No friction. Your average completion time drops from 3 weeks to 5 days. Tax season gets manageable again.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275" />
      </svg>
    ),
    title: 'AI Automatically Organizes Everything',
    desc: '1099s, W-2s, business returns, K-1s, receipts, invoices, bank statements—our AI reads them instantly and sorts them into the right categories. You open a perfectly organized folder. No manual filing. No misfiled documents.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
      </svg>
    ),
    title: 'Zero Signature Fees Forever',
    desc: 'E-sign returns, consent forms, declarations—all free. DocuSign charges $1-3 per signature. We charge zero. Most accountants save $400-600/month just by switching. Every signature is audit-trail compliant.',
  },
]

const featureDetails = [
  {
    title: 'QuickBooks Integration',
    desc: 'Sync client data and documents in one place. No manual re-entry. Your workflow from MiddleDoc to QuickBooks is seamless.',
  },
  {
    title: 'Smart Request Suggestions',
    desc: "MiddleDoc learns from your prior years' documents. Next season, it auto-suggests the checklist for each client based on what they uploaded before.",
  },
  {
    title: 'Compliance & Audit Trail',
    desc: 'Every document upload, rejection, re-upload, and signature is logged. Export reports instantly for audit purposes. GDPR and CCPA compliant.',
  },
  {
    title: 'Mobile-First for Your Clients',
    desc: 'Tax docs come from everywhere—email, photos, bank websites. Your clients use their phone camera to capture receipts and upload instantly from the field.',
  },
]

export default function AccountantsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <VerticalNav />

      <main className="px-6 md:px-12">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <section className="py-16 md:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">For Accountants & Tax Professionals</span>
              </div>
              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                The Smarter Way to Collect{' '}
                <span className="italic text-primary-600">Tax Documents</span>
              </h1>
              <p className="text-body-lg text-neutral-600 mb-8 max-w-[520px] leading-relaxed">
                No login, zero signature fees, instant AI classification. Collect tax docs faster, organize better, comply easier.
              </p>
              <div className="flex flex-wrap gap-[14px]">
                <Link href="/auth/signup" className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start Free
                </Link>
                <Link href="/auth/signup" className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  See Tax Demo
                </Link>
              </div>
            </div>
          </section>

          {/* Three Key Benefits */}
          <section className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Why Accountants Choose MiddleDoc</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {benefits.map((b) => (
                  <div key={b.title} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                      {b.icon}
                    </div>
                    <h3 className="text-[15px] font-semibold text-neutral-900 mb-2">{b.title}</h3>
                    <p className="text-[13px] text-neutral-600 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Feature Details 2x2 */}
          <section className="py-12 md:py-20 mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Everything Your Practice Needs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featureDetails.map((f) => (
                  <div key={f.title} className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mb-3"></div>
                    <h3 className="text-[15px] font-semibold text-neutral-900 mb-2">{f.title}</h3>
                    <p className="text-[13px] text-neutral-600 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-body-lg text-neutral-700 leading-relaxed mb-6">
                &ldquo;We were paying $800/month for TaxDome. Switched to MiddleDoc for $79, got 90% of the features, and our clients actually complete uploads now because they don&rsquo;t need a login. We&rsquo;re saving $8,500 a year and our tax season is less chaotic.&rdquo;
              </blockquote>
              <div>
                <div className="text-[14px] font-semibold text-neutral-900">Amanda Foster</div>
                <div className="text-[13px] text-neutral-500 mt-0.5">CPA, Foster &amp; Co. Accounting</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-h2 font-serif text-neutral-900 mb-4">Try MiddleDoc Free for 30 Days</h2>
              <p className="text-body-lg text-neutral-600 mb-8">
                No credit card. No commitment. Set up your first client portal in under 2 minutes.
              </p>
              <Link href="/auth/signup" className="inline-block bg-primary-600 text-white text-body-md font-semibold px-[30px] py-4 rounded-button hover:bg-primary-700 transition">
                Start Free
              </Link>
            </div>
          </section>

        </div>
      </main>

      <VerticalFooter />
    </div>
  )
}
