'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Accountant } from '@/types/index'

interface AuthState {
  user: Accountant | null
  loading: boolean
}

export function useAuth(redirectOnFail = true) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        if (redirectOnFail) router.push('/auth/login')
        setState({ user: null, loading: false })
        return
      }
      const user: Accountant = await res.json()
      setState({ user, loading: false })
    } catch {
      if (redirectOnFail) router.push('/auth/login')
      setState({ user: null, loading: false })
    }
  }, [router, redirectOnFail])

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }, [router])

  return { ...state, logout, refetch: checkAuth }
}
