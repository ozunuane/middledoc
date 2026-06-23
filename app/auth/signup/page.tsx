'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Signup failed')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-neutral-50 rounded-lg p-12 flex flex-col justify-center min-h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-primary-500"></div>
          </div>
          <span className="text-xl font-semibold text-neutral-900">Ledgerly</span>
        </div>

        {/* Heading */}
        <h1 className="text-h3 font-serif text-neutral-900 mb-1">Welcome back</h1>
        <p className="text-body-md text-neutral-600 mb-8">Sign in to pick up where you left off.</p>

        {error && (
          <div className="mb-6 p-3 bg-danger-50 border border-danger-200 text-danger-600 rounded-button text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wide block mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white border border-neutral-300 rounded-button px-3.5 py-3 text-body-md text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wide block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white border border-neutral-300 rounded-button px-3.5 py-3 text-body-md text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wide block mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full bg-white border border-neutral-300 rounded-button px-3.5 py-3 text-body-md text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wide block mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-white border border-neutral-300 rounded-button px-3.5 py-3 text-body-md text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white text-body-md font-semibold py-3.5 rounded-button hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-300"></div>
            <span className="text-xs text-neutral-500 font-medium">or</span>
            <div className="flex-1 h-px bg-neutral-300"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full bg-white border border-neutral-300 text-neutral-900 text-body-md font-medium py-3 rounded-button hover:bg-neutral-50 transition flex items-center justify-center gap-2.5"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-amber-500"></div>
            Continue with Google
          </button>
        </form>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-neutral-300 text-center">
          <p className="text-body-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
