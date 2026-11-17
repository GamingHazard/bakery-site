'use client'

import { useEffect } from 'react'

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    const cleanup = async () => {
      const registrations = 'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistrations()
        : []
      const rootRegistrations = registrations.filter((registration) => {
        const scope = new URL(registration.scope)
        return scope.origin === window.location.origin && scope.pathname === '/'
      })
      const controller = 'serviceWorker' in navigator
        ? navigator.serviceWorker.controller
        : null
      const hasController = controller !== null
        && new URL(controller.scriptURL).origin === window.location.origin
      const cacheNames = 'caches' in window ? await window.caches.keys() : []

      if (rootRegistrations.length === 0 && !hasController && cacheNames.length === 0) return

      const unregistered = await Promise.all(
        rootRegistrations.map((registration) => registration.unregister()),
      )

      if (cacheNames.length > 0) {
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)))
      }

      if (unregistered.some(Boolean) || hasController) window.location.reload()
    }

    void cleanup().catch((error: unknown) => {
      console.error('Unable to remove a stale service worker and its cached assets.', error)
    })
  }, [])

  return null
}
