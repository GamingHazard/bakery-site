import { parseStorefrontCatalogPayload } from './storefront-catalog-schema'
import type { StorefrontProduct } from './storefront-catalog-schema'

export { parseStorefrontCatalogPayload } from './storefront-catalog-schema'
export type { StorefrontBadge, StorefrontProduct, StorefrontVariant } from './storefront-catalog-schema'

export type StorefrontCatalogResult = {
  products: StorefrontProduct[]
  error: string | null
}

export type StorefrontSettings = {
  companyName: string
  logoUrl: string
  contacts: {
    email: string
    phone: string
    address: string
  }
}

export type StorefrontSettingsResult = {
  settings: StorefrontSettings
  error: string | null
}

const emptyStorefrontSettings = (): StorefrontSettings => ({
  companyName: '',
  logoUrl: '',
  contacts: { email: '', phone: '', address: '' },
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isSafeCloudinaryLogo(value: string) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
      && url.hostname === 'res.cloudinary.com'
      && !url.username
      && !url.password
      && !url.port
      && !url.search
      && !url.hash
      && /^\/[^/]+\/image\/upload\//.test(url.pathname)
  } catch {
    return false
  }
}

function parseStorefrontSettings(value: unknown): StorefrontSettings {
  if (!isRecord(value)
    || typeof value.companyName !== 'string'
    || typeof value.logoUrl !== 'string'
    || !isRecord(value.contacts)
    || typeof value.contacts.email !== 'string'
    || typeof value.contacts.phone !== 'string'
    || typeof value.contacts.address !== 'string') {
    throw new Error('The company settings response is invalid.')
  }
  if (!isSafeCloudinaryLogo(value.logoUrl)) {
    throw new Error('The company logo response is not a trusted Cloudinary image URL.')
  }
  return {
    companyName: value.companyName,
    logoUrl: value.logoUrl,
    contacts: {
      email: value.contacts.email,
      phone: value.contacts.phone,
      address: value.contacts.address,
    },
  }
}

export async function getStorefrontCatalog(): Promise<StorefrontCatalogResult> {
  const backendUrl = process.env.BAKERY_API_URL?.trim()
  if (!backendUrl) {
    console.error('BAKERY_API_URL is not configured for the storefront.');
    return { products: [], error: 'The product catalog is not configured.' }
  }

  try {
    const response = await fetch(new URL('/api/storefront/catalog', backendUrl), {
      next: { revalidate: 60 },
    })
    if (!response.ok) {
      console.error(`Storefront catalog request failed with status ${response.status}.`)
      return { products: [], error: 'The product catalog is temporarily unavailable.' }
    }

    const payload: unknown = await response.json()
    return { products: parseStorefrontCatalogPayload(payload), error: null }
  } catch (error) {
    console.error('Unable to load the storefront product catalog.', error)
    return { products: [], error: 'The product catalog is temporarily unavailable.' }
  }
}

export async function getStorefrontSettings(): Promise<StorefrontSettingsResult> {
  const backendUrl = process.env.BAKERY_API_URL?.trim()
  if (!backendUrl) {
    console.error('BAKERY_API_URL is not configured for the storefront.')
    return {
      settings: emptyStorefrontSettings(),
      error: 'Company contact details are not configured.',
    }
  }

  try {
    const response = await fetch(new URL('/api/storefront/settings', backendUrl), {
      next: { revalidate: 60 },
    })
    if (!response.ok) {
      console.error(`Storefront settings request failed with status ${response.status}.`)
      return {
        settings: emptyStorefrontSettings(),
        error: 'Company contact details are temporarily unavailable.',
      }
    }

    return {
      settings: parseStorefrontSettings(await response.json()),
      error: null,
    }
  } catch (error) {
    console.error('Unable to load public company settings.', error)
    return {
      settings: emptyStorefrontSettings(),
      error: 'Company contact details are temporarily unavailable.',
    }
  }
}
