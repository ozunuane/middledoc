'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Something went wrong')
        return
      }

      setSent(true)
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-neutral-50 rounded-lg min-h-[680px] flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-[44px] py-[48px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-[19px] font-semibold text-neutral-900">MiddleDoc</span>
          </div>

          {sent ? (
            <>
              <h1 className="text-[36px] font-serif leading-tight tracking-[-0.01em] text-neutral-900 mb-1">
                Check your email
              </h1>
              <p className="text-[14.5px] text-neutral-500 mb-[30px]">
                If an account exists for <strong className="text-neutral-700">{email}</strong>, we sent a
                password reset link. It expires in 1 hour.
              </p>
              <Link
                href="/auth/login"
                className="w-full bg-primary-600 text-white text-[14.5px] font-semibold py-3.5 rounded-button hover:bg-primary-700 transition text-center inline-block"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-[36px] font-serif leading-tight tracking-[-0.01em] text-neutral-900 mb-1">
                Forgot password?
              </h1>
              <p className="text-[14.5px] text-neutral-500 mb-[30px]">
                Enter your email and we will send you a reset link.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-danger-50 border border-danger-200 text-danger-600 rounded-button text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[13px] font-semibold text-neutral-700 block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white border border-neutral-300 rounded-button px-[14px] py-[13px] text-[14.5px] text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white text-[14.5px] font-semibold py-3.5 rounded-button hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 text-center px-[44px] py-[20px]">
          <p className="text-[13.5px] text-neutral-500">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
