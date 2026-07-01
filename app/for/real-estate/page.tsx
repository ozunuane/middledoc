'use client'

import Link from 'next/link'
import { VerticalNav, VerticalFooter } from '../_components'

const benefits = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    title: 'Close Transactions 1-2 Weeks Faster',
    desc: 'Waiting for seller disclosures, inspection reports, and buyer signatures delays every closing. With MiddleDoc, send one portal link to all parties. Documents pour in within 24 hours. Signatures are instant. Closing dates stop slipping.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'E-Signature Costs Drop to Zero',
    desc: 'Real estate practices sign 20-50 documents per transaction. At DocuSign rates, that is $20-150 per deal. MiddleDoc charges zero per signature. A single agent doing 20 deals/year saves $2,000-3,000 annually just on signature fees.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
      </svg>
    ),
    title: 'Never Miss a Disclosure or Inspection Report Again',
    desc: 'All transaction documents flow into one organized folder. Inspections, appraisals, insurance quotes, title work, HOA docs—AI automatically categorizes everything. You see what is complete, what is missing, and what is signed instantly.',
  },
]

const featureDetails = [
  {
    title: 'Multi-Party Document Collection',
    desc: 'Sellers, buyers, agents, inspectors, lenders—everyone gets a portal link. Track who has uploaded what in real time. Missing signatures? Get automatic reminders.',
  },
  {
    title: 'Unlimited E-Signatures',
    desc: 'Closing statements, disclosures, HOA forms, title docs—e-sign everything without per-signature fees. Audit trail included. Recording-ready for your state.',
  },
  {
    title: 'Real Estate Document Templates',
    desc: 'Pre-built templates for disclosure forms, transaction checklists, and closing reminders. Customize with your branding and send instantly.',
  },
  {
    title: 'Mobile Document Capture',
    desc: 'Agents capture inspection photos, signatures, and documents from the field on their phone. Instant upload. No scanning. Perfect clarity.',
  },
]

export default function RealEstatePage() {
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
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">For Real Estate Professionals</span>
              </div>
              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                Streamline Closings. Collect Documents Instantly.{' '}
                <span className="italic text-primary-600">E-Sign Everything.</span>
              </h1>
              <p className="text-body-lg text-neutral-600 mb-8 max-w-[520px] leading-relaxed">
                Transaction docs, disclosure forms, inspection reports, and closing packages—organized and signed in days, not weeks.
              </p>
              <div className="flex flex-wrap gap-[14px]">
                <Link href="/auth/signup" className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start Free
                </Link>
                <Link href="/auth/signup" className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  See Real Estate Demo
                </Link>
              </div>
            </div>
          </section>

          {/* Three Key Benefits */}
          <section className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Why Real Estate Professionals Choose MiddleDoc</h2>
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
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Every Tool Your Transactions Need</h2>
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
                &ldquo;Real estate transactions are a document nightmare. MiddleDoc cut our closing delays by 10 days. Sellers and buyers upload disclosure docs instantly. We e-sign everything without paying DocuSign per signature. The template system saves our team 5 hours per transaction.&rdquo;
              </blockquote>
              <div>
                <div className="text-[14px] font-semibold text-neutral-900">David Chen</div>
                <div className="text-[13px] text-neutral-500 mt-0.5">Principal Broker, Chen Realty Group</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-h2 font-serif text-neutral-900 mb-4">Speed Up Every Closing</h2>
              <p className="text-body-lg text-neutral-600 mb-8">
                Real estate firms report 15% faster time-to-close with MiddleDoc.
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
