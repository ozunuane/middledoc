'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Accountant } from '@/types/index'

interface AuthState {
  user: Accountant | null
  loading: boolean
  teamRole: 'owner' | 'admin' | 'member' | null
}

export function useAuth(redirectOnFail = true) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({ user: null, loading: true, teamRole: null })

  const checkAuth = useCallback(async () => {
    try {
      const [meRes, roleRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/auth/team-role'),
      ])
      if (!meRes.ok) {
        if (redirectOnFail) router.push('/auth/login')
        setState({ user: null, loading: false, teamRole: null })
        return
      }
      const user: Accountant = await meRes.json()
      let teamRole: 'owner' | 'admin' | 'member' | null = null
      if (roleRes.ok) {
        const roleData = await roleRes.json()
        teamRole = roleData.role ?? null
      }
      setState({ user, loading: false, teamRole })
    } catch {
      if (redirectOnFail) router.push('/auth/login')
      setState({ user: null, loading: false, teamRole: null })
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
