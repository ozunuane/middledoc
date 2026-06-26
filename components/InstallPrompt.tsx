'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('pwa-dismissed')) return

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window)
    setIsIOS(ios)

    // Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show iOS instructions after delay
    if (ios) {
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    }
    setShowBanner(false)
  }

  const dismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-neutral-900 text-white rounded-[12px] p-4 z-50 shadow-2xl max-w-md mx-auto">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <div className="w-3 h-3 rounded-sm bg-white"></div>
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold mb-1">Add MiddleDoc to home screen</p>
          {isIOS ? (
            <p className="text-[12px] text-neutral-400">
              Tap the Share button, then &quot;Add to Home Screen&quot;
            </p>
          ) : (
            <p className="text-[12px] text-neutral-400">Quick access to upload documents anytime</p>
          )}
        </div>
        <button onClick={dismiss} className="text-neutral-400 hover:text-white text-lg cursor-pointer">
          &times;
        </button>
      </div>
      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="w-full mt-3 bg-primary-600 text-white text-[13px] font-semibold py-2.5 rounded-[9px] cursor-pointer"
        >
          Install
        </button>
      )}
    </div>
  )
}
