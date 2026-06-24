'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-neutral-50 rounded-lg min-h-[680px] flex flex-col">
          <div className="flex-1 flex flex-col justify-center px-[44px] py-[48px]">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-primary-500"></div>
              </div>
              <span className="text-[19px] font-semibold text-neutral-900">MiddleDoc</span>
            </div>
            <h1 className="text-[36px] font-serif leading-tight tracking-[-0.01em] text-neutral-900 mb-1">
              Invalid link
            </h1>
            <p className="text-[14.5px] text-neutral-500 mb-[30px]">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/auth/forgot-password"
              className="w-full bg-primary-600 text-white text-[14.5px] font-semibold py-3.5 rounded-button hover:bg-primary-700 transition text-center inline-block"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 2000)
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

          {success ? (
            <>
              <h1 className="text-[36px] font-serif leading-tight tracking-[-0.01em] text-neutral-900 mb-1">
                Password reset
              </h1>
              <p className="text-[14.5px] text-neutral-500 mb-[30px]">
                Your password has been updated. Redirecting to sign in...
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[36px] font-serif leading-tight tracking-[-0.01em] text-neutral-900 mb-1">
                Set new password
              </h1>
              <p className="text-[14.5px] text-neutral-500 mb-[30px]">
                Choose a strong password for your account.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-danger-50 border border-danger-200 text-danger-600 rounded-button text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[13px] font-semibold text-neutral-700 block mb-2">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white border border-neutral-300 rounded-button px-[14px] py-[13px] text-[14.5px] text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-neutral-700 block mb-2">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    className="w-full bg-white border border-neutral-300 rounded-button px-[14px] py-[13px] text-[14.5px] text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white text-[14.5px] font-semibold py-3.5 rounded-button hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
