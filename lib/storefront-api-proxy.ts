import { NextResponse } from 'next/server'

const noStoreHeaders = { 'Cache-Control': 'no-store, max-age=0' }

export async function forwardStorefrontPost(request: Request, backendPath: string) {
  const backendUrl = process.env.BAKERY_API_URL?.trim()
  if (!backendUrl) {
    console.error('BAKERY_API_URL is not configured for the storefront API proxy.')
    return NextResponse.json(
      { error: 'The bakery service is not configured.' },
      { status: 503, headers: noStoreHeaders },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'A valid JSON request body is required.' },
      { status: 400, headers: noStoreHeaders },
    )
  }

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
    const response = await fetch(new URL(backendPath, backendUrl), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
    const raw = await response.text()
    let result: unknown
    try {
      result = raw ? JSON.parse(raw) : {}
    } catch {
      console.error(`Storefront API proxy received a non-JSON response (${response.status}).`)
      return NextResponse.json(
        { error: 'The bakery service returned an invalid response.' },
        { status: 502, headers: noStoreHeaders },
      )
    }
    return NextResponse.json(result, {
      status: response.status,
      headers: noStoreHeaders,
    })
  } catch (error) {
    console.error('Unable to reach the bakery service from the storefront API proxy.', error)
    return NextResponse.json(
      { error: 'The bakery service is temporarily unavailable. Please try again.' },
      { status: 502, headers: noStoreHeaders },
    )
  }
}
