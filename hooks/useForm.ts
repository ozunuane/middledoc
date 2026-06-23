'use client'

import { useState, useCallback } from 'react'

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear field-level error on change
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setErrors({})
      try {
        await onSubmit(values)
      } catch (err) {
        setErrors({ submit: (err as Error).message })
      } finally {
        setLoading(false)
      }
    },
    [values, onSubmit]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return { values, errors, loading, handleChange, handleSubmit, reset, setErrors }
}
