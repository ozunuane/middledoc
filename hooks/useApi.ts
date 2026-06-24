'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export function useApi<T>(
  url: string,
  options?: { method?: string; body?: unknown; skip?: boolean }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable ref so `call` doesn't change identity on every render
  const optionsRef = useRef(options)
  optionsRef.current = options

  const skip = options?.skip ?? false

  const call = useCallback(async (): Promise<T> => {
    setLoading(true)
    setError(null)
    try {
      const opts = optionsRef.current
      const res = await fetch(url, {
        method: opts?.method ?? 'GET',
        body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const json: T = await res.json()
      setData(json)
      return json
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (skip) return
    void call()
  }, [url, skip, call])

  return { data, loading, error, refetch: call }
}
