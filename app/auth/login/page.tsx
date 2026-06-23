'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: 'sarah@maplecpa.com',
    password: '••••••••••',
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
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login failed')
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
      <div className="w-full max-w-sm bg-neutral-50 rounded-lg min-h-[680px] flex flex-col">
        {/* Main content area */}
        <div className="flex-1 flex flex-col justify-center px-[44px] py-[48px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-[19px] font-semibold text-neutral-900">Ledgerly</span>
          </div>

          {/* Heading */}
          <h1 className="text-[36px] font-serif leading-tight tracking-[-0.01em] text-neutral-900 mb-1">Welcome back</h1>
          <p className="text-[14.5px] text-neutral-500 mb-[30px]">Sign in to pick up where you left off.</p>

          {error && (
            <div className="mb-6 p-3 bg-danger-50 border border-danger-200 text-danger-600 rounded-button text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-[13px] font-semibold text-neutral-700 block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white border border-neutral-300 rounded-button px-[14px] py-[13px] text-[14.5px] text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[13px] font-semibold text-neutral-700">Password</label>
                <a href="#" className="text-[13px] font-medium text-primary-600 hover:text-primary-700">Forgot?</a>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white border-[1.5px] border-primary-600 rounded-button px-[14px] py-[13px] text-[14.5px] text-neutral-900 shadow-[0_0_0_3px_rgba(15,122,99,0.12)]"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white text-body-md font-semibold py-3.5 rounded-button hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-250"></div>
              <span className="text-xs text-neutral-400 font-medium">or</span>
              <div className="flex-1 h-px bg-neutral-250"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full bg-white border border-neutral-300 text-neutral-900 text-[14.5px] font-medium py-[13px] rounded-button hover:bg-neutral-50 transition flex items-center justify-center gap-2.5"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-amber-500"></div>
              Continue with Google
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 text-center px-[44px] py-[20px]">
          <p className="text-[13.5px] text-neutral-500">
            New here?{' '}
            <Link href="/auth/signup" className="text-primary-600 font-semibold hover:text-primary-700">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
