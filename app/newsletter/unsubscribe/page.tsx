import type { Metadata } from 'next'
import Link from 'next/link'
import { UnsubscribeForm } from './unsubscribe-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type PageProps = {
  searchParams: Promise<{ id?: string; token?: string }>
}

export default async function NewsletterUnsubscribePage({ searchParams }: PageProps) {
  const { id = '', token = '' } = await searchParams
  return (
    <main className="newsletter-lifecycle-page">
      <section className="newsletter-lifecycle-card" aria-labelledby="newsletter-unsubscribe-title">
        <span className="eyebrow">YOUR INBOX, YOUR CHOICE</span>
        <h1 id="newsletter-unsubscribe-title">Unsubscribe from bakery emails?</h1>
        <p>Confirm below to stop receiving newsletter and promotional emails. This will not affect messages about enquiries you have sent us.</p>
        <UnsubscribeForm id={id} token={token} />
        <Link className="newsletter-back-link" href="/">Return to the bakery</Link>
      </section>
    </main>
  )
}
