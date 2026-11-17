import { NextResponse } from 'next/server'

import { parseStorefrontCatalogPayload } from '../../../../lib/storefront-catalog-schema'

export const dynamic = 'force-dynamic'

const noStoreHeaders = { 'Cache-Control': 'no-store, max-age=0' }

export async function GET() {
  const backendUrl = process.env.BAKERY_API_URL?.trim()
  if (!backendUrl) {
    console.error('BAKERY_API_URL is not configured for the storefront catalog proxy.')
    return NextResponse.json(
      { error: 'The product catalog is not configured.' },
      { status: 500, headers: noStoreHeaders },
    )
  }

  try {
    const response = await fetch(new URL('/api/storefront/catalog', backendUrl), {
      cache: 'no-store',
    })
    if (!response.ok) {
      console.error(`Storefront catalog proxy request failed with status ${response.status}.`)
      return NextResponse.json(
        { error: 'The product catalog is temporarily unavailable.' },
        { status: 502, headers: noStoreHeaders },
      )
    }

    const products = parseStorefrontCatalogPayload(await response.json())
    return NextResponse.json({ products }, { headers: noStoreHeaders })
  } catch (error) {
    console.error('Unable to load the storefront catalog through its proxy.', error)
    return NextResponse.json(
      { error: 'The product catalog is temporarily unavailable.' },
      { status: 502, headers: noStoreHeaders },
    )
  }
}
