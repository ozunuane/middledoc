'use client'

import Link from 'next/link'
import { VerticalNav, VerticalFooter } from '../_components'

const benefits = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
    title: 'Scale Without Scaling Your Costs',
    desc: 'Unlimited clients, unlimited documents, unlimited team members. No per-signature fees. No per-user overages. Your cost stays flat as you grow. Large firms save $5,000-15,000/month versus enterprise competitors.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
    title: 'Full Control Over Branding and Compliance',
    desc: 'White-label client portals carry your brand, not ours. Custom domains, custom styling, your logo everywhere. SSO/SAML integration for enterprise security. Data residency options for global firms. We adapt to your compliance requirements.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: 'Dedicated Support and Custom Workflows',
    desc: 'Enterprise customers get a dedicated account manager, custom onboarding, priority support, and integration help. Zapier, API access, webhook support—build custom workflows that fit your business exactly.',
  },
]

const featureDetails = [
  {
    title: 'White-Label Client Portal',
    desc: 'Your brand on every page. Custom domain. Custom styling. Your logo and colors throughout. Clients never see "MiddleDoc."',
  },
  {
    title: 'SSO/SAML Integration',
    desc: 'Enterprise single sign-on. Your team logs in via your identity provider. Full audit trail. One place to manage access.',
  },
  {
    title: 'Unlimited Team Members and Clients',
    desc: 'No per-user overages. Add as many team members and clients as you need. Pricing stays flat.',
  },
  {
    title: 'Zapier and API Access',
    desc: 'Connect MiddleDoc to your entire tech stack. Zapier automation for common workflows. Full REST API for custom integrations.',
  },
  {
    title: 'Custom SLA and Support',
    desc: 'Dedicated account manager. Priority response times. Custom integrations. Your team gets white-glove onboarding.',
  },
  {
    title: 'Advanced Analytics and Reporting',
    desc: 'Real-time dashboards. Conversion rates, upload completion, signature velocity. Export reports for stakeholders.',
  },
]

export default function EnterprisePage() {
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
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">For Enterprise Organizations</span>
              </div>
              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                Enterprise Document Management Built for{' '}
                <span className="italic text-primary-600">Professional Services at Startup Pricing</span>
              </h1>
              <p className="text-body-lg text-neutral-600 mb-8 max-w-[520px] leading-relaxed">
                White-label client portals, SSO/SAML, unlimited documents, dedicated support. The platform built to scale.
              </p>
              <div className="flex flex-wrap gap-[14px]">
                <Link href="/auth/signup" className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Request Demo
                </Link>
                <Link href="/auth/signup" className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  Talk to Sales
                </Link>
              </div>
            </div>
          </section>

          {/* Three Key Benefits */}
          <section className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Enterprise Power Without Enterprise Pricing</h2>
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

          {/* Feature Details 3x2 */}
          <section className="py-12 md:py-20 mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Everything Enterprise Teams Require</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                &ldquo;We evaluated Liscio, TaxDome, and Canopy for our 200-person firm. MiddleDoc&rsquo;s enterprise plan is 70% cheaper, the white-label portal means clients never see a competitor&rsquo;s brand, and the API flexibility lets us connect it to our entire tech stack. We&rsquo;re saving $12,000 per month and our custom workflows are finally possible.&rdquo;
              </blockquote>
              <div>
                <div className="text-[14px] font-semibold text-neutral-900">Susan Martinez</div>
                <div className="text-[13px] text-neutral-500 mt-0.5">VP Operations, Martinez Professional Services</div>
              </div>
            </div>
          </section>

          {/* Pricing CTA */}
          <section className="py-12 md:py-16 mb-12">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
                <h3 className="text-h3 font-serif text-neutral-900 mb-2">Enterprise Pricing</h3>
                <p className="text-body-md text-neutral-600 mb-6">
                  Custom pricing based on your firm size, document volume, and integration requirements. Most enterprise customers pay a fraction of what they spent with legacy vendors.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {['Unlimited everything', 'White-label portal', 'SSO/SAML', 'Dedicated support', 'Custom SLA', 'API access'].map((item) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span className="text-[13px] font-medium text-neutral-700">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup" className="inline-block bg-primary-600 text-white text-body-md font-semibold px-[30px] py-4 rounded-button hover:bg-primary-700 transition">
                  Request Enterprise Demo
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-h2 font-serif text-neutral-900 mb-4">Transform Your Document Operations at Enterprise Scale</h2>
              <p className="text-body-lg text-neutral-600 mb-8">
                Large firms trust MiddleDoc for unlimited documents, custom workflows, and dedicated support.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/signup" className="inline-block bg-primary-600 text-white text-body-md font-semibold px-[30px] py-4 rounded-button hover:bg-primary-700 transition">
                  Request Enterprise Demo
                </Link>
                <Link href="/auth/signup" className="inline-block bg-white text-neutral-900 text-body-md font-medium px-[26px] py-4 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  Talk to Sales
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      <VerticalFooter />
    </div>
  )
}
