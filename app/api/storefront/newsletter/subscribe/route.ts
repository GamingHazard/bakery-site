import { forwardStorefrontPost } from '@/lib/storefront-api-proxy'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return forwardStorefrontPost(request, '/api/storefront/newsletter/subscribe')
}
