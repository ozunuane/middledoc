'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: 0,
    tagline: 'Perfect to get started',
    featured: false,
    features: ['Up to 3 clients', '50 documents/month', 'Basic AI classification', 'Email reminders', 'Client portal'],
    cta: 'Start Free',
  },
  {
    name: 'Solo',
    price: 19,
    tagline: 'For independent professionals',
    featured: false,
    features: ['Up to 50 clients', '2,000 documents/month', 'Advanced AI classification (25 categories)', 'Unlimited e-signatures', 'Custom email templates', 'Mobile PWA', '1-year data retention'],
    cta: 'Try Solo',
  },
  {
    name: 'Team',
    price: 39,
    tagline: 'For small teams',
    featured: true,
    features: ['Up to 200 clients', '10,000 documents/month', 'All Solo features', 'Team roles & permissions', 'Groups for access control', 'Audit log', 'Analytics dashboard', 'Priority email support'],
    cta: 'Try Team',
  },
  {
    name: 'Firm',
    price: 79,
    tagline: 'For established firms',
    featured: false,
    features: ['Unlimited clients', 'Unlimited documents', 'All Team features', 'Client invoicing (via Stripe/Paystack)', 'QuickBooks integration', 'Advanced analytics', 'Phone + email support', 'Custom onboarding'],
    cta: 'Try Firm',
  },
]

const features = [
  {
    icon: 'check-circle',
    title: 'Zero Signature Fees',
    desc: 'Send unlimited e-signatures for $0. No per-signature charges. No hidden costs.',
  },
  {
    icon: 'link',
    title: 'No Client Login Required',
    desc: "Clients don't need another password. One link. One click. Done. Your completion rates skyrocket.",
  },
  {
    icon: 'brain',
    title: 'AI Document Classification',
    desc: 'Powered by GPT-4 and Claude. Automatically sorts documents into 25 categories. 99% accuracy.',
  },
  {
    icon: 'phone',
    title: 'Mobile-First PWA',
    desc: 'Camera upload, push notifications, offline mode. Your clients upload on their phone. Period.',
  },
  {
    icon: 'bell',
    title: 'Email Reminders That Work',
    desc: 'Customizable reminders at 7 days, 3 days, and deadline. Automated or manual. SendGrid-powered delivery.',
  },
  {
    icon: 'team',
    title: 'Role-Based Teams',
    desc: 'Add team members with granular permissions. Groups, roles, full audit trail. Enterprise control at startup pricing.',
  },
]

const segments = [
  {
    icon: 'calculator',
    title: 'Accounting & Tax',
    desc: 'Collect tax docs, e-sign returns, integrate QuickBooks. 30% faster compliance.',
    href: '/for/accountants',
  },
  {
    icon: 'briefcase',
    title: 'Law Firms',
    desc: 'Intake forms, client agreements, e-signatures. Streamline onboarding by weeks.',
    href: '/for/law-firms',
  },
  {
    icon: 'people',
    title: 'HR & Recruiting',
    desc: 'Employment docs, offer letters, background check uploads. Hire faster, collect smarter.',
    href: '/for/hr-teams',
  },
  {
    icon: 'house',
    title: 'Real Estate',
    desc: 'Disclosure forms, inspection reports, e-sign closings. Zero signature fees. Big savings.',
    href: '/for/real-estate',
  },
  {
    icon: 'medical',
    title: 'Healthcare & Medical',
    desc: 'Patient intake, consent forms, insurance docs. HIPAA-compliant portal. Client data secure.',
    href: '/for/healthcare',
  },
  {
    icon: 'lightbulb',
    title: 'Consulting & Professional Services',
    desc: 'Proposals, contracts, SOWs. Collect client signatures and feedback in minutes, not days.',
    href: '/for/enterprise',
  },
]

const testimonials = [
  {
    quote:
      'We switched from DocuSign and cut costs by 75%. No per-signature fees meant we could finally offer unlimited e-signatures to clients. Game changer.',
    author: 'Marcus Chen',
    title: 'Partner, Chen & Associates (Law Firm)',
  },
  {
    quote:
      'The no-login portal increased our completion rates from 62% to 89% in the first month. Clients actually finish uploads now instead of giving up.',
    author: 'Sarah Patel',
    title: 'Managing Director, Patel Tax & Accounting',
  },
  {
    quote:
      'Compared to TaxDome and Canopy, MiddleDoc costs 1/5 the price and our team prefers the interface. AI classification saves us 6 hours a week on file organization.',
    author: 'James Rodriguez',
    title: 'Operations Lead, Rodriguez HR Solutions',
  },
]

const faqs = [
  {
    q: "How do clients upload documents if they don't have a login?",
    a: "Clients get a unique share link via email. They click the link and upload documents directly—no signup, no password, no account creation. Completion rates jump an average of 27% compared to requiring a login. If you need your clients to have an account for follow-ups, we can enable that, but it's optional.",
  },
  {
    q: 'How much does it cost to send e-signatures?',
    a: 'Zero. Completely free. Unlike DocuSign (which charges $1-3 per signature), every signature on MiddleDoc costs nothing. Send as many signatures as you want, to as many clients as you want. Your cost stays the same.',
  },
  {
    q: 'How does the AI document classification work?',
    a: 'Upload a document. Our AI (powered by GPT-4 or Claude) reads it and automatically assigns it to one of 25 categories—tax return, invoice, contract, insurance form, ID, etc. Accuracy is 99% across document types. You can manually override any classification, and we learn from corrections.',
  },
  {
    q: 'Is MiddleDoc HIPAA compliant?',
    a: "Yes. We're HIPAA-compliant and encrypt all data in transit and at rest. Healthcare firms, mental health practices, and clinics use MiddleDoc for patient intake and consent forms. We maintain detailed audit logs for compliance.",
  },
  {
    q: 'Can I integrate MiddleDoc with QuickBooks?',
    a: 'Yes. Firm plan and above includes one-way QuickBooks integration via OAuth. Sync client data automatically. Available for QuickBooks Online; desktop integration coming in Q3 2026.',
  },
  {
    q: 'What if my team needs different access levels?',
    a: 'Team and Firm plans include role-based access control. Create roles (owner, admin, member), assign team members, and use groups to control which clients each member sees. Audit log captures all actions.',
  },
  {
    q: 'Can I customize the email reminders?',
    a: 'Yes. Every plan includes 5 customizable email templates. Set reminders at 7 days, 3 days, and deadline. Choose between automated (fires automatically) or manual (you send when ready). All emails are branded with your logo.',
  },
  {
    q: 'How do you compare to TaxDome, Canopy, or Liscio?',
    a: "MiddleDoc is 60-80% cheaper than competitors while offering similar core features (client portal, e-signatures, document management). We don't charge per signature. Clients don't need a login. And AI classification is included on every plan. Most firms switch and immediately cut costs by $300-500/month.",
  },
]

const iconMap: Record<string, React.ReactNode> = {
  'check-circle': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  brain: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
  team: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  calculator: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.615 4.5 4.705V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.705c0-1.09-.707-2.006-1.657-2.133A48.205 48.205 0 0 0 12 2.25Z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  ),
  people: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  house: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  medical: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  lightbulb: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  send: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
  ),
}

function NavDropdown() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition">
        Solutions
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-medium py-1.5 z-50">
          {[
            { label: 'For Accountants', href: '/for/accountants' },
            { label: 'For Law Firms', href: '/for/law-firms' },
            { label: 'For HR Teams', href: '/for/hr-teams' },
            { label: 'For Real Estate', href: '/for/real-estate' },
            { label: 'For Healthcare', href: '/for/healthcare' },
            { label: 'For Enterprise', href: '/for/enterprise' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-neutral-900 pr-4">{q}</span>
        <span className="flex-shrink-0 w-5 h-5 text-neutral-500">
          {open ? (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          ) : (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </span>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-[14px] text-neutral-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
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
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-neutral-900 flex items-center justify-center">
              <div className="w-[11px] h-[11px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-lg font-semibold text-neutral-900">MiddleDoc</span>
          </Link>

          <div className="hidden md:flex items-center gap-[34px]">
            <NavDropdown />
            <a href="#how-it-works" className="text-sm text-neutral-600 hover:text-neutral-900 transition">How it works</a>
            <a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Features</a>
            <a href="#pricing" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Pricing</a>
            <Link href="/auth/login" className="text-sm text-neutral-900 font-medium hover:text-primary-600 transition">Log in</Link>
            <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
          </div>

          <div className="md:hidden">
            <Link href="/auth/signup" className="bg-neutral-900 text-neutral-50 text-sm font-medium px-[18px] py-[9px] rounded-lg hover:bg-neutral-800 transition">Start free</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Trusted by 2,000+ professional service firms</span>
              </div>

              <h1 className="text-h1-display font-serif text-neutral-900 mb-6 leading-tight">
                Stop Wasting Time on{' '}
                <span className="italic text-primary-600">Document Chaos</span>
              </h1>

              <p className="text-body-lg text-neutral-600 mb-8 max-w-[480px] leading-relaxed">
                Collect documents from clients in 30 seconds. No login, no forms, no fees. AI organizes everything automatically.
              </p>

              <div className="flex flex-wrap gap-[14px] mb-12">
                <Link href="/auth/signup" className="bg-primary-600 text-white text-body-md font-semibold px-[26px] py-3.5 rounded-button hover:bg-primary-700 transition">
                  Start Free
                </Link>
                <a href="#how-it-works" className="bg-white text-neutral-900 text-body-md font-medium px-[18px] py-3.5 border border-neutral-300 rounded-button hover:bg-neutral-50 transition">
                  See Demo
                </a>
              </div>

              <div className="flex flex-wrap gap-7">
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">500K+</div>
                  <div className="text-[13px] text-neutral-500 mt-1">documents processed</div>
                </div>
                <div className="w-px bg-neutral-250 hidden sm:block"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">99.2%</div>
                  <div className="text-[13px] text-neutral-500 mt-1">uptime</div>
                </div>
                <div className="w-px bg-neutral-250 hidden sm:block"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">$0</div>
                  <div className="text-[13px] text-neutral-500 mt-1">per e-signature, forever</div>
                </div>
                <div className="w-px bg-neutral-250 hidden sm:block"></div>
                <div>
                  <div className="text-mono-lg font-semibold text-neutral-900">80%</div>
                  <div className="text-[13px] text-neutral-500 mt-1">cost savings vs competitors</div>
                </div>
              </div>
            </div>

            {/* Right: Card Demo */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-hero p-6 transform rotate-[0.4deg]">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Document request</div>
                  <div className="text-[17px] font-semibold text-neutral-900 mt-1">2025 Year-End Tax Prep</div>
                </div>
                <span className="text-xs font-semibold text-warning-600 bg-warning-100 border border-warning-200 px-2.5 py-1 rounded-full">3 OF 5 IN</span>
              </div>

              <div className="w-full h-1.5 bg-neutral-150 rounded-full overflow-hidden mb-5">
                <div className="w-3/5 h-full bg-primary-600"></div>
              </div>

              <div className="space-y-[10px]">
                {[
                  { done: true, label: 'Prior-year tax return', meta: '' },
                  { done: true, label: 'Profit & loss statement', meta: '' },
                  { done: true, label: 'Engagement letter (e-signed)', meta: 'signed 2h ago' },
                  { done: false, label: '1099s & 1098s', meta: 'reminder sent 1h ago' },
                  { done: false, label: 'Bank statements', meta: 'due in 2d' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-[13px] py-[11px] rounded-button ${
                      item.done
                        ? 'bg-primary-50 border border-primary-100'
                        : 'bg-white border border-dashed border-neutral-300'
                    }`}
                  >
                    {item.done ? (
                      <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">&#10003;</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-[1.5px] border-neutral-350 flex-shrink-0"></div>
                    )}
                    <span className={`text-sm ${item.done ? 'text-neutral-900' : 'text-neutral-600'}`}>{item.label}</span>
                    {item.meta && (
                      <span className={`text-xs ml-auto ${item.done ? 'text-primary-600 font-medium' : 'text-neutral-400'}`}>{item.meta}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="border-t border-b border-neutral-200 py-8 mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <p className="text-xs font-medium text-neutral-400 flex-shrink-0">Trusted by 2,000+ professional service firms</p>
              <div className="flex flex-wrap gap-[30px] opacity-[0.55]">
                <span className="font-serif text-xl text-neutral-900">Aldrich & Fry CPA</span>
                <span className="font-serif text-xl text-neutral-900">Torres Legal Group</span>
                <span className="font-serif text-xl text-neutral-900">Summit HR Partners</span>
                <span className="font-serif text-xl text-neutral-900">Chen Realty Group</span>
                <span className="font-serif text-xl text-neutral-900">Patel Medical Clinic</span>
                <span className="font-serif text-xl text-neutral-900">Clearpath Advisors</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <section id="how-it-works" className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Three Steps to Perfect Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  {
                    step: '01',
                    icon: 'send',
                    title: 'Send',
                    sub: 'Share a link (no signup required)',
                    desc: 'Copy your client portal link. Paste it in email. Done. Your clients upload documents directly—no login walls, no friction.',
                  },
                  {
                    step: '02',
                    icon: 'upload',
                    title: 'Upload',
                    sub: 'Clients upload anywhere, anytime',
                    desc: 'Desktop, mobile, phone camera. Your clients send documents from wherever they are. MiddleDoc accepts all file types and creates a complete audit trail.',
                  },
                  {
                    step: '03',
                    icon: 'brain',
                    title: 'Organize',
                    sub: 'AI classifies everything instantly',
                    desc: 'Our AI reads, categorizes, and organizes 500+ documents per second across 25 document types. You spend time on client work, not file management.',
                  },
                ].map((f) => (
                  <div key={f.step}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-mono-lg text-primary-600 font-semibold">{f.step}</div>
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                        {iconMap[f.icon]}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{f.title}</h3>
                    <p className="text-[13px] font-semibold text-primary-600 mb-2">{f.sub}</p>
                    <p className="text-body-md text-neutral-600 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-3">Everything You Need, Nothing You Don&apos;t</h2>
              <p className="text-body-lg text-neutral-600 text-center mb-12 max-w-xl mx-auto">
                The 6 things that actually move the needle for professional service firms collecting documents from clients.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((f) => (
                  <div key={f.title} className="bg-white border border-neutral-200 rounded-2xl p-6">
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

          {/* Segment Showcase */}
          <section className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-3">Built for All Professional Services</h2>
              <p className="text-body-lg text-neutral-600 text-center mb-12 max-w-lg mx-auto">
                From accounting to law to healthcare — MiddleDoc adapts to how your firm collects documents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {segments.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="group bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-primary-300 hover:bg-primary-50 transition"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-3 group-hover:bg-white transition">
                      {iconMap[s.icon]}
                    </div>
                    <h3 className="text-[15px] font-semibold text-neutral-900 mb-1.5">{s.title}</h3>
                    <p className="text-[13px] text-neutral-600 leading-relaxed mb-3">{s.desc}</p>
                    <span className="text-[13px] font-semibold text-primary-600 group-hover:underline">Learn more &rarr;</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">See What Our Users Are Saying</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <div key={t.author} className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-[14px] text-neutral-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                    <div>
                      <div className="text-[13px] font-semibold text-neutral-900">{t.author}</div>
                      <div className="text-[12px] text-neutral-500 mt-0.5">{t.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-12 md:py-20 bg-white -mx-6 md:-mx-12 px-6 md:px-12 rounded-2xl mb-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-3">Pricing That Scales With You</h2>
              <p className="text-body-lg text-neutral-600 text-center mb-12 max-w-lg mx-auto">
                All plans include client portal, AI classification, e-signatures, and email reminders. No setup fees. No per-signature charges.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`bg-white border ${plan.featured ? 'border-primary-600 ring-2 ring-primary-600/20' : 'border-neutral-200'} rounded-2xl p-6`}
                  >
                    {plan.featured && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-600 rounded-full mb-3">
                        <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Most popular</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
                    <div className="mt-2 mb-1">
                      <span className="text-3xl font-semibold text-neutral-900 font-mono">${plan.price}</span>
                      {plan.price > 0 && <span className="text-neutral-500 text-sm">/month</span>}
                    </div>
                    <p className="text-[13px] text-neutral-500 mb-6">{plan.tagline}</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="text-[13px] text-neutral-700 flex items-start gap-2">
                          <span className="text-primary-600 mt-0.5 flex-shrink-0">&#10003;</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/auth/signup"
                      className={`block text-center py-2.5 rounded-[9px] text-[13px] font-semibold transition ${
                        plan.featured ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-[13px] text-neutral-500">
                  Need more? <Link href="/for/enterprise" className="text-primary-600 font-medium hover:underline">View Enterprise pricing</Link> — white-label, SSO, custom SLA, dedicated support.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 md:py-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-h2 font-serif text-neutral-900 text-center mb-12">Questions? We Have Answers.</h2>
              <div className="bg-white border border-neutral-200 rounded-2xl px-6">
                {faqs.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-h2 font-serif text-neutral-900 mb-4">Ready to Stop Wasting Time on Documents?</h2>
              <p className="text-body-lg text-neutral-600 mb-3 max-w-lg mx-auto">
                Join 2,000+ professional service firms saving time and money.
              </p>
              <p className="text-[13px] text-neutral-500 mb-8">
                No credit card required. Takes 2 minutes to set up. Your first client portal link is ready in 30 seconds.
              </p>
              <Link href="/auth/signup" className="inline-block bg-primary-600 text-white text-body-md font-semibold px-[30px] py-4 rounded-button hover:bg-primary-700 transition">
                Start Your Free Account
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-[26px] h-[26px] rounded-[6px] bg-neutral-900 flex items-center justify-center">
              <div className="w-[9px] h-[9px] rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-sm font-semibold text-neutral-900">MiddleDoc</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/for/accountants" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Accountants</Link>
            <Link href="/for/law-firms" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Law Firms</Link>
            <Link href="/for/hr-teams" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For HR Teams</Link>
            <Link href="/for/real-estate" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Real Estate</Link>
            <Link href="/for/healthcare" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">For Healthcare</Link>
            <Link href="/for/enterprise" className="text-[13px] text-neutral-500 hover:text-neutral-700 transition">Enterprise</Link>
          </div>
          <p className="text-[12px] text-neutral-400">
            &copy; {new Date().getFullYear()} MiddleDoc. HIPAA compliant. SOC 2 Type II.
          </p>
        </div>
      </footer>
    </div>
  )
}
