'use client'

import Link from 'next/link'
import { VerticalNav, VerticalFooter } from '../_components'

const benefits = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Cut Client Onboarding Time from Weeks to Days',
    desc: 'Stop sending engagement letters through email. Create a secure client portal link, share it once, and watch intake forms, agreements, and signatures flow back automatically. No follow-up calls. No lost emails.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
      </svg>
    ),
    title: "E-Signatures That Don't Break the Bank",
    desc: "DocuSign is expensive when you're signing 50+ documents per month. MiddleDoc charges nothing per signature. You can e-sign retainer agreements, engagement letters, conflict waivers, and declarations—unlimited—for $79/month.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
      </svg>
    ),
    title: 'Never Lose a Document Again',
    desc: 'AI reads every PDF, image, and scan your clients upload and files them into categories automatically. Contracts, intake forms, ID copies, insurance docs—everything is instantly organized and searchable.',
  },
]

const featureDetails = [
  {
    title: 'Secure Client Portal',
    desc: 'Zero login friction. Clients get a link, click it, upload. Your practice portal is password-protected; their upload experience is frictionless.',
  },
  {
    title: 'Unlimited E-Signatures',
    desc: 'Retainer agreements, engagement letters, conflict waivers, declarations. E-sign everything. Audit trail and timestamp included. ESIGN Act compliant.',
  },
  {
    title: 'Role-Based Team Access',
    desc: 'Associates see only assigned clients. Partners see everything. Document access and actions are fully audited. No one touches files they should not.',
  },
  {
    title: 'Mobile Document Capture',
    desc: 'Clients photograph ID, insurance cards, and documents directly from their phone. Instant upload. Perfect clarity. No scanning needed.',
  },
]

export default function LawFirmsPage() {
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
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">For Law Firms</span>
              </div>
              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                Client Intake, E-Signatures, and Document Management{' '}
                <span className="italic text-primary-600">in One Place</span>
              </h1>
              <p className="text-body-lg text-neutral-600 mb-8 max-w-[520px] leading-relaxed">
                Collect engagement letters, intake forms, and client agreements without the complexity of enterprise software.
              </p>
              <div className="flex flex-wrap gap-[14px]">
                <Link href="/auth/signup" className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start Free
                </Link>
                <Link href="/auth/signup" className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </section>

          {/* Three Key Benefits */}
          <section className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Why Law Firms Choose MiddleDoc</h2>
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
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Built for How Law Firms Actually Work</h2>
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
                &ldquo;Our intake process went from 10 days to 2 days. We&rsquo;re using MiddleDoc for engagement letters, client agreements, and document management. At $79/month, we replaced a $300/month contract management tool and saved money.&rdquo;
              </blockquote>
              <div>
                <div className="text-[14px] font-semibold text-neutral-900">Michael Torres</div>
                <div className="text-[13px] text-neutral-500 mt-0.5">Partner, Torres Legal Group</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-h2 font-serif text-neutral-900 mb-4">Ready to Streamline Client Onboarding?</h2>
              <p className="text-body-lg text-neutral-600 mb-8">
                Law firms are saving 15+ hours per month with MiddleDoc.
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
