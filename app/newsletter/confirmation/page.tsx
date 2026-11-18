import Link from 'next/link'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ status?: string }>
}

export default async function NewsletterConfirmationPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const confirmed = status === 'confirmed'
  const syncPending = status === 'confirmed_sync_pending'
  const expired = status === 'expired'
  const title = confirmed
    ? 'You are on the list.'
    : syncPending
      ? 'Your email is verified.'
    : expired
      ? 'This link has expired.'
      : 'We could not confirm just yet.'
  const message = confirmed
    ? 'Your email is verified. We will send the occasional note about fresh bakes, bakery news, and special offers.'
    : syncPending
      ? 'Your address is verified. There is a temporary issue synchronizing your subscription with the mailing service; the bakery team will resolve it.'
    : expired
      ? 'The confirmation link may already have been used or has expired. Submit your email again to receive a fresh link.'
      : 'There was a temporary issue confirming your address. Please try the link again or contact the bakery for help.'

  return (
    <main className="newsletter-lifecycle-page">
      <section className="newsletter-lifecycle-card" aria-labelledby="newsletter-confirmation-title">
        <span className="eyebrow">A NOTE FROM THE BAKERY</span>
        <h1 id="newsletter-confirmation-title">{title}</h1>
        <p>{message}</p>
        <Link className="button button-dark" href="/">Back to the bakery</Link>
      </section>
    </main>
  )
}
