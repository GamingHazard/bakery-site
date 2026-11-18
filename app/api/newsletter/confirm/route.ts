import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BAKERY_API_URL?.trim()
  const token = request.nextUrl.searchParams.get('token') || ''
  let status = 'error'

  if (!backendUrl || !token) {
    if (!backendUrl) console.error('BAKERY_API_URL is not configured for newsletter confirmation.')
    status = token ? 'error' : 'expired'
  } else {
    try {
      const backendPath = new URL('/api/storefront/newsletter/confirm', backendUrl)
      backendPath.searchParams.set('token', token)
      const response = await fetch(backendPath, { cache: 'no-store' })
      const result: unknown = await response.json()
      if (response.ok && result && typeof result === 'object' && 'confirmed' in result && result.confirmed === true) {
        status = 'warning' in result && result.warning ? 'confirmed_sync_pending' : 'confirmed'
      } else if (response.status === 400) {
        status = 'expired'
      } else {
        console.error(`Newsletter confirmation proxy failed with status ${response.status}.`)
      }
    } catch (error) {
      console.error('Unable to confirm the newsletter subscription through the storefront proxy.', error)
    }
  }

  const destination = new URL('/newsletter/confirmation', request.url)
  destination.searchParams.set('status', status)
  return NextResponse.redirect(destination, 303)
}
