import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-200 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-neutral-300 px-6 py-4 shadow-light">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-h3 font-serif text-neutral-900">Accountant Hub</h1>
          <Link href="/auth/login" className="text-primary-500 font-semibold text-body-sm hover:text-primary-600 transition">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">
          {/* Hero Card */}
          <div className="bg-white rounded-card border border-neutral-300 shadow-light p-12 text-center mb-12">
            <h2 className="text-h1 font-serif text-neutral-900 mb-4">
              Document Management, Simplified
            </h2>
            <p className="text-body-lg text-neutral-600 mb-8 max-w-xl mx-auto">
              Streamline your client document collection with Accountant Hub. Secure, simple, and built for accountants.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild variant="primary" size="lg">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <p className="text-caption text-neutral-500">
              No credit card required. Free 14-day trial.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-card border border-neutral-300 p-8 text-center shadow-light hover:shadow-medium transition">
              <div className="text-mono-lg font-semibold text-primary-500 mb-2">5 hrs</div>
              <p className="text-body-md text-neutral-700 font-medium">Saved per client</p>
              <p className="text-caption text-neutral-500 mt-2">Average time saved with automated document collection</p>
            </div>

            <div className="bg-white rounded-card border border-neutral-300 p-8 text-center shadow-light hover:shadow-medium transition">
              <div className="text-mono-lg font-semibold text-success-600 mb-2">94%</div>
              <p className="text-body-md text-neutral-700 font-medium">Faster processing</p>
              <p className="text-caption text-neutral-500 mt-2">Reduce manual follow-ups and delays</p>
            </div>

            <div className="bg-white rounded-card border border-neutral-300 p-8 text-center shadow-light hover:shadow-medium transition">
              <div className="text-mono-lg font-semibold text-warning-600 mb-2">2 min</div>
              <p className="text-body-md text-neutral-700 font-medium">Client setup</p>
              <p className="text-caption text-neutral-500 mt-2">Secure shareable links in seconds</p>
            </div>
          </div>

          {/* Client Portal Info */}
          <div className="bg-white rounded-card border border-neutral-300 p-8 shadow-light">
            <h3 className="text-h4 font-serif text-neutral-900 mb-4">For Clients</h3>
            <p className="text-body-md text-neutral-700 mb-4">
              Use the secure link provided by your accountant to upload documents directly. No account creation needed.
            </p>
            <p className="text-caption text-neutral-500">
              Your documents are encrypted and stored securely.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-300 px-6 py-8 mt-auto">
        <div className="max-w-6xl mx-auto text-center text-caption text-neutral-500">
          <p>&copy; 2024 Accountant Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
