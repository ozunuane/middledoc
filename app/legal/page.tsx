import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal — MiddleDoc',
  description: 'MiddleDoc legal documents: Privacy Policy, Terms of Service, DPA, and more.',
}

const documents = [
  {
    title: 'Privacy Policy',
    href: '/legal/privacy',
    description: 'How we collect, use, and protect your personal data. Covers GDPR, CCPA, data retention, and third-party processors.',
    updated: 'June 30, 2026',
  },
  {
    title: 'Terms of Service',
    href: '/legal/terms',
    description: 'The binding agreement governing your use of MiddleDoc, including payment terms, IP ownership, liability limits, and dispute resolution.',
    updated: 'June 30, 2026',
  },
  {
    title: 'Cookie Policy',
    href: '/legal/cookies',
    description: 'A full disclosure of the single cookie MiddleDoc uses (your session authentication token) and what we do not track.',
    updated: 'June 30, 2026',
  },
  {
    title: 'Acceptable Use Policy',
    href: '/legal/acceptable-use',
    description: 'Rules governing permitted and prohibited use of the platform, including prohibited content, security, and account responsibility.',
    updated: 'June 30, 2026',
  },
  {
    title: 'Data Processing Agreement (DPA)',
    href: '/legal/dpa',
    description: 'GDPR Article 28 agreement for business customers. Defines MiddleDoc as processor, covers sub-processors, SCCs, and breach notification.',
    updated: 'June 30, 2026',
  },
  {
    title: 'E-Signature Disclosure',
    href: '/legal/esign',
    description: 'Consumer disclosure and consent for electronic signatures under the ESIGN Act and UETA, including how to withdraw consent.',
    updated: 'June 30, 2026',
  },
  {
    title: 'Security Policy',
    href: '/legal/security',
    description: 'How MiddleDoc secures your data: encryption, infrastructure controls, access management, incident response, and vulnerability disclosure.',
    updated: 'June 30, 2026',
  },
]

export default function LegalIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Legal Documents</h1>
      <p className="text-neutral-500 mb-8">
        MiddleDoc is committed to transparency. All our legal policies are written in plain
        English and published in full below.
      </p>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group block p-5 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition bg-neutral-50 hover:bg-white no-underline"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 group-hover:text-primary-600 transition mb-1">
                  {doc.title}
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed">{doc.description}</p>
              </div>
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 flex-shrink-0 mt-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <p className="text-xs text-neutral-400 mt-3">Last updated: {doc.updated}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-5 rounded-xl bg-neutral-50 border border-neutral-200">
        <h2 className="text-sm font-semibold text-neutral-900 mb-2">Questions about our policies?</h2>
        <p className="text-sm text-neutral-500">
          If you have any questions about our legal documents or your rights, contact us at{' '}
          <a href="mailto:hello@middledoc.com" className="text-primary-600 hover:underline">hello@middledoc.com</a>.
          We respond to all privacy and legal inquiries within 5 business days.
        </p>
      </div>
    </div>
  )
}
