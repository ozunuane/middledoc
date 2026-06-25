'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function BillingCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')

    if (!reference) {
      setStatus('error')
      setMessage('No payment reference found. Please try again.')
      return
    }

    // The callback API route handles verification and DB updates,
    // then redirects to /dashboard/settings/billing?billing=success or error.
    // If we land here directly, redirect to the API callback endpoint.
    const callbackUrl = `/api/billing/callback?reference=${encodeURIComponent(reference)}`
    window.location.href = callbackUrl
  }, [searchParams])

  // Auto-redirect fallback (in case the API redirect doesn't fire)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'verifying') {
        router.push('/dashboard/settings/billing')
      }
    }, 10000) // 10 second fallback

    return () => clearTimeout(timer)
  }, [status, router])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="bg-white border border-neutral-200 rounded-card p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <LoadingSpinner />
            <p className="text-[14px] text-neutral-600 mt-4">{message}</p>
            <p className="text-[12px] text-neutral-400 mt-2">Please wait, do not close this page.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[18px] font-semibold text-neutral-900 mb-2">Payment Successful</h2>
            <p className="text-[14px] text-neutral-600">{message}</p>
            <p className="text-[12px] text-neutral-400 mt-2">Redirecting to billing page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-danger-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-[18px] font-semibold text-neutral-900 mb-2">Payment Issue</h2>
            <p className="text-[14px] text-neutral-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/dashboard/settings/billing')}
              className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
            >
              Back to billing
            </button>
          </>
        )}
      </div>
    </div>
  )
}
