'use client'

import { useState } from 'react'

export function UnsubscribeForm({ id, token }: { id: string; token: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token }),
      })
      const result: unknown = await response.json()
      if (!response.ok || !result || typeof result !== 'object' || !('unsubscribed' in result)) {
        const reason = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'We could not update your subscription. Please try again.'
        throw new Error(reason)
      }
      const warning = 'warning' in result && typeof result.warning === 'string'
        ? ` ${result.warning}`
        : ''
      setMessage(`You have been unsubscribed from the bakery newsletter.${warning}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not update your subscription. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!id || !token) {
    return <p className="form-error" role="alert">This unsubscribe link is incomplete or invalid.</p>
  }

  return (
    <div className="newsletter-unsubscribe-action">
      <button className="button button-dark" disabled={busy || Boolean(message)} onClick={submit}>
        {busy ? 'Updating…' : message ? 'Unsubscribed' : 'Confirm unsubscribe'}
      </button>
      {message && <p className="form-success-message" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}
