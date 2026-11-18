import { forwardStorefrontPost } from '@/lib/storefront-api-proxy'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const token = url.searchParams.get('token')
  if (id && token) {
    const response = await forwardStorefrontPost(
      new Request(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token }),
      }),
      '/api/storefront/newsletter/unsubscribe',
    )
    if (response.ok) {
      return new Response(null, {
        status: response.status,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      })
    }
    return response
  }
  return forwardStorefrontPost(request, '/api/storefront/newsletter/unsubscribe')
}
