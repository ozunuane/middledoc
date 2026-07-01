'use client'

import Link from 'next/link'
import { VerticalNav, VerticalFooter } from '../_components'

const benefits = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Collect Sensitive Patient Documents Securely',
    desc: 'Patient intake and consent forms contain PHI. MiddleDoc is HIPAA-compliant, encrypts all data in transit and at rest, and maintains detailed audit logs. No email. No unencrypted file sharing. Patient data stays secure.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
    title: 'Streamline Patient Onboarding Without Extra Friction',
    desc: 'Patients click one link and upload intake forms, insurance cards, photo ID, and medical history. No login required. No patient portal signup confusion. Your onboarding team receives organized, categorized documents automatically.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
      </svg>
    ),
    title: 'E-Sign Consent Forms and Authorizations Instantly',
    desc: 'Informed consent, HIPAA authorizations, release forms—all e-signed securely. Every signature is timestamped and audit-logged for compliance. You stay audit-ready without extra work.',
  },
]

const featureDetails = [
  {
    title: 'HIPAA-Compliant Infrastructure',
    desc: 'Encryption at rest and in transit. Detailed audit logs. Data residency options. Regular compliance reviews. Your patient data meets healthcare regulations.',
  },
  {
    title: 'Secure Patient Portal',
    desc: 'HIPAA-compliant upload flow. No unnecessary login friction. Patients authenticate via magic link—secure but frictionless.',
  },
  {
    title: 'Patient Consent E-Signatures',
    desc: 'Informed consent forms, privacy notices, release authorizations—all e-signed securely. Timestamped and audit-logged. Compliance-ready.',
  },
  {
    title: 'Document Classification for Medical Records',
    desc: 'Insurance cards, lab results, medication lists, prior authorizations—AI reads and files everything automatically. Your patient charts are organized instantly.',
  },
]

export default function HealthcarePage() {
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
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">For Healthcare & Medical Practices</span>
              </div>
              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                HIPAA-Compliant Patient Intake. Secure Document Collection.{' '}
                <span className="italic text-primary-600">Compliant E-Signatures.</span>
              </h1>
              <p className="text-body-lg text-neutral-600 mb-8 max-w-[520px] leading-relaxed">
                Patient consent forms, insurance docs, medical records authorizations—collected securely and signed without compliance headaches.
              </p>
              <div className="flex flex-wrap gap-[14px]">
                <Link href="/auth/signup" className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start Free
                </Link>
                <Link href="/auth/signup" className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  Schedule Security Review
                </Link>
              </div>
            </div>
          </section>

          {/* Trust Banner */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl px-6 py-4 mb-12 flex flex-wrap items-center gap-6">
            {['HIPAA Compliant', 'GDPR & CCPA', 'SOC 2 Type II', 'Encrypted at rest & in transit', 'Detailed audit logs'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-[13px] font-medium text-primary-700">{item}</span>
              </div>
            ))}
          </div>

          {/* Three Key Benefits */}
          <section className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Why Healthcare Practices Choose MiddleDoc</h2>
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
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Compliance Without Complexity</h2>
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
                &ldquo;We&rsquo;re a mental health practice and patient privacy is critical. MiddleDoc is HIPAA-compliant and our patients actually complete intake forms because there&rsquo;s no login confusion. Our onboarding time dropped from 30 minutes to 10 minutes per patient.&rdquo;
              </blockquote>
              <div>
                <div className="text-[14px] font-semibold text-neutral-900">Dr. Lisa Patel</div>
                <div className="text-[13px] text-neutral-500 mt-0.5">Clinical Director, Patel Mental Health Clinic</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-h2 font-serif text-neutral-900 mb-4">Secure Patient Intake. Compliant E-Signatures. Zero Friction.</h2>
              <p className="text-body-lg text-neutral-600 mb-8">
                Healthcare practices report 60% fewer patient onboarding delays with MiddleDoc.
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
