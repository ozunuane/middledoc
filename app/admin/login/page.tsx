'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      router.push('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-[16px] w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-neutral-900">MiddleDoc Admin</h1>
          <p className="text-[13px] text-neutral-400 mt-1">Platform operations console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger-50 text-danger-700 text-[13px] px-3 py-2 rounded-lg border border-danger-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-neutral-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-[15px] border border-neutral-300 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-neutral-400"
              placeholder="admin@middledoc.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 text-[15px] border border-neutral-300 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-neutral-400"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-[9px] transition disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
